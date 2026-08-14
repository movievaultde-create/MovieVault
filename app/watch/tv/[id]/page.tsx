"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "../../../context/LanguageContext";
import VideoPlayer from "../../../components/VideoPlayer";
import FollowNotificationButton from "../../../components/FollowNotificationButton";
import MediaCard from "../../../components/MediaCard";
import WatchHeroCard from "../../../components/WatchHeroCard";
import WatchDetailTabs from "../../../components/WatchDetailTabs";
import TvEpisodeBrowser from "../../../components/TvEpisodeBrowser";
import WatchStreamTabs from "../../../components/WatchStreamTabs";
import { WatchPlayerAds } from "../../../components/ads/WatchPlayerAds";
import { SiteAdsterraRail } from "../../../components/ads/SiteAdsterraRail";
import { PlayerAdCorner } from "../../../components/ads/PlayerCornerAds";
import { WatchAdLocker } from "../../../components/ads/WatchAdLocker";
import { WatchServerLoadingAd } from "../../../components/ads/WatchServerLoadingAd";
import { InPlayerVastGate } from "../../../components/ads/VastPreroll";
import { type WatchServer, resolveDirectTvUrl } from "../../../lib/directStreamMap";
import ErrorLottie from "../../../components/ErrorLottie";
import { parseWatchParam } from "../../../lib/watchUrl";
import { WatchLangSlug } from "../../../components/WatchLangSlug";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  poster: string | null;
  year?: string | null;
}

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still: string | null;
  runtime: number | null;
  vote_average: number;
}

interface RelatedShow {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "tv";
}

interface ShowData {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: string[];
  number_of_seasons: number;
  seasons: Season[];
  cast: { name: string; character: string; photo: string | null }[];
  trailerYoutubeKey: string | null;
  relatedShows: RelatedShow[];
}


const SUB_LANG_MAP: Record<string, string> = {
  EN: "en", AR: "ar", DE: "de", FR: "fr", ES: "es", TR: "tr",
};

function withLangParams(baseUrl: string, subLang: string): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}sub=${subLang}&sub_lang=${subLang}&ds_lang=${subLang}&lang=${subLang}&audio_lang=${subLang}`;
}

/** Primary server on play: MovieVault (no "recommended" badge). */
const PRIMARY_SERVER_LABEL = "MovieVault Server";

function primaryServerIndex(servers: WatchServer[]): number {
  const byName = servers.findIndex((s) => s.name === PRIMARY_SERVER_LABEL);
  if (byName >= 0) return byName;
  const premium = servers.findIndex((s) => s.premium);
  return premium >= 0 ? premium : 0;
}

function buildServers(id: string, season: number, episode: number, subLang: string): WatchServer[] {
  const directUrl = resolveDirectTvUrl(id, season, episode);
  // Same path as watch-clashanime (`/embedtv/{id}&s=&e=`), written with `?` so withLangParams stays valid.
  const twoEmbedTv = withLangParams(
    `https://www.2embed.cc/embedtv/${id}?s=${season}&e=${episode}`,
    subLang
  );
  return [
    {
      name: "MovieVault Server",
      label: "Fast 4K",
      premium: true,
      playerType: directUrl ? "direct" : "iframe",
      directUrl,
      url: twoEmbedTv,
    },
    {
      name: "Vidعربي",
      label: "Vidعربي",
      premium: false,
      recommended: true,
      playerType: "iframe",
      url: withLangParams(
        `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=2563eb&secondaryColor=111111&autoplay=true`,
        "ar"
      ),
      mirrors: [withLangParams(`https://www.2embed.cc/embedtv/${id}?s=${season}&e=${episode}`, "ar")],
    },
    {
      name: "Server 1",
      label: "VidLink",
      premium: false,
      playerType: "iframe",
      url: withLangParams(
        `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=2563eb&secondaryColor=111111&autoplay=true`,
        subLang
      ),
    },
    {
      name: "Server 2",
      label: "Vcr",
      premium: false,
      playerType: "iframe",
      url: twoEmbedTv,
    },
    {
      name: "Server 3",
      label: "VidCore",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://vidcore.org/embed/tv/${id}/${season}/${episode}`, subLang),
    },
    {
      name: "Server 4",
      label: "MultiEmbed",
      premium: false,
      playerType: "iframe",
      url: withLangParams(
        `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
        subLang
      ),
    },
    {
      name: "Server 5",
      label: "AutoEmbed",
      premium: false,
      playerType: "iframe",
      url: withLangParams(
        `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
        subLang
      ),
    },
    {
      name: "Server 6",
      label: "Videasy",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://player.videasy.to/tv/${id}/${season}/${episode}`, subLang),
    },
  ];
}

export default function WatchTVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const id = parseWatchParam(rawId);
  const { lang, t, isAr, isRtl, tmdbLang } = useLang();
  const subLang = SUB_LANG_MAP[lang] ?? "en";

  const [show, setShow] = useState<ShowData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeMirror, setActiveMirror] = useState(0);
  const [loading, setLoading] = useState(true);
  const [epLoading, setEpLoading] = useState(false);
  const [busyMsg, setBusyMsg] = useState(false);
  const [switching, setSwitching] = useState(false);
  const episodeSelectAfterSeasonFetchRef = useRef<number | "last" | null>(null);

  const servers = useMemo(
    () => buildServers(id, selectedSeason, selectedEpisode, subLang),
    [id, selectedSeason, selectedEpisode, subLang]
  );
  const defaultServer = useMemo(() => primaryServerIndex(servers), [servers]);
  const [activeServer, setActiveServer] = useState(defaultServer);

  useEffect(() => {
    setActiveServer(defaultServer);
  }, [id, defaultServer]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tv/${id}?lang=${tmdbLang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setShow(data);
          if (data.seasons?.length > 0) {
            setSelectedSeason(data.seasons[0].season_number);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id, tmdbLang]);

  useEffect(() => {
    if (!show) return;
    setEpLoading(true);
    fetch(`/api/tv/${id}/season/${selectedSeason}?lang=${tmdbLang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          const list: Episode[] = data.episodes ?? [];
          setEpisodes(list);
          const pending = episodeSelectAfterSeasonFetchRef.current;
          episodeSelectAfterSeasonFetchRef.current = null;
          if (pending === "last" && list.length > 0) {
            const maxNum = Math.max(...list.map((e) => e.episode_number));
            setSelectedEpisode(maxNum);
          } else if (
            typeof pending === "number" &&
            list.some((e) => e.episode_number === pending)
          ) {
            setSelectedEpisode(pending);
          } else {
            setSelectedEpisode(1);
          }
        }
      })
      .finally(() => setEpLoading(false));
  }, [id, show, selectedSeason, tmdbLang]);

  const currentServer = servers[activeServer];
  const currentServerUrls = useMemo(
    () => [currentServer.url, ...(currentServer.mirrors ?? [])],
    [currentServer]
  );
  const currentServerUrl = currentServerUrls[Math.min(activeMirror, currentServerUrls.length - 1)] ?? currentServer.url;

  useEffect(() => {
    setActiveMirror(0);
    setBusyMsg(false);
  }, [activeServer, id, selectedSeason, selectedEpisode, subLang]);

  const handleIframeError = () => {
    if (activeMirror < currentServerUrls.length - 1) {
      setActiveMirror((v) => v + 1);
      setBusyMsg(false);
      return;
    }
    setBusyMsg(true);
    setTimeout(() => setBusyMsg(false), 3500);
  };

  const playEpisode = (epNum: number) => {
    setSelectedEpisode(epNum);
    document.getElementById("watch-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sortedEpisodes = useMemo(
    () => [...episodes].sort((a, b) => a.episode_number - b.episode_number),
    [episodes]
  );

  const sortedSeasons = useMemo(
    () => (show ? [...show.seasons].sort((a, b) => a.season_number - b.season_number) : []),
    [show]
  );

  const episodeNav = useMemo(() => {
    if (!show || sortedEpisodes.length === 0) {
      return { prev: null as null | { s: number; e: number | "last" }, next: null as null | { s: number; e: number } };
    }
    const idx = sortedEpisodes.findIndex((e) => e.episode_number === selectedEpisode);
    if (idx < 0) {
      return { prev: null, next: null };
    }
    let prev: { s: number; e: number | "last" } | null = null;
    let next: { s: number; e: number } | null = null;
    if (idx > 0) {
      prev = { s: selectedSeason, e: sortedEpisodes[idx - 1].episode_number };
    } else {
      const si = sortedSeasons.findIndex((s) => s.season_number === selectedSeason);
      if (si > 0) {
        prev = { s: sortedSeasons[si - 1].season_number, e: "last" };
      }
    }
    if (idx < sortedEpisodes.length - 1) {
      next = { s: selectedSeason, e: sortedEpisodes[idx + 1].episode_number };
    } else {
      const si = sortedSeasons.findIndex((s) => s.season_number === selectedSeason);
      if (si >= 0 && si < sortedSeasons.length - 1) {
        next = { s: sortedSeasons[si + 1].season_number, e: 1 };
      }
    }
    return { prev, next };
  }, [show, sortedEpisodes, sortedSeasons, selectedSeason, selectedEpisode]);

  const navigateToEpisode = (seasonNum: number, episodeNum: number | "last") => {
    if (seasonNum === selectedSeason && typeof episodeNum === "number") {
      playEpisode(episodeNum);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (seasonNum === selectedSeason && episodeNum === "last") {
      if (sortedEpisodes.length > 0) {
        setSelectedEpisode(sortedEpisodes[sortedEpisodes.length - 1].episode_number);
      }
      return;
    }
    episodeSelectAfterSeasonFetchRef.current = episodeNum;
    setSelectedSeason(seasonNum);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] pt-24 pb-16">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="mb-4 h-4 w-32 rounded skeleton" />
          <div className="aspect-video w-full rounded-xl skeleton" />
          <div className="mt-6 h-8 w-64 rounded skeleton" />
          <div className="mt-4 flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-28 rounded-lg skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg-base)] px-4 pt-24 text-center">
        <ErrorLottie />
        <p className="text-lg text-[var(--text-muted)]">{t("errorLoading")}</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-24 pb-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <svg
            width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            className={isRtl ? "" : "rotate-180"}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t("backToHome")}
        </Link>

        <SiteAdsterraRail embedded />

        {show && <WatchLangSlug type="tv" id={show.id} title={show.name} />}

        {show && (
          <WatchHeroCard
            data={{
              id: show.id,
              title: show.name,
              year: show.first_air_date?.slice(0, 4) ?? "",
              poster: show.poster_path,
              backdrop: show.backdrop_path,
              rating: show.vote_average.toFixed(1),
              type: "tv",
              meta: [
                t("tvShow"),
                show.number_of_seasons
                  ? `${show.number_of_seasons} ${t("seasons")}`
                  : null,
                episodes.length
                  ? `${episodes.length} ${t("episodes")}`
                  : null,
                show.genres.slice(0, 2).join("، ") || null,
              ]
                .filter(Boolean)
                .join(" | "),
            }}
            onStartWatching={() => {
              document.getElementById("watch-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
              window.dispatchEvent(new Event("mv-vast-start"));
            }}
          />
        )}

        {show && (
          <WatchDetailTabs
            defaultTab="details"
            tabs={[
              { id: "details", label: t("detailsTab") },
              { id: "info", label: t("infoTab") },
              { id: "cast", label: t("castTab") },
            ]}
            panels={{
              details: (
                <div>
                  <h2 className="mb-3 text-base font-black text-[var(--text-primary)]">{t("movieStory")}</h2>
                  <p className="text-sm leading-7 font-medium text-[var(--text-primary)]">
                    {show.overview || (isAr ? "لا توجد قصة متاحة." : "No synopsis available.")}
                  </p>
                  {show.genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {show.genres.map((g) => (
                        <span
                          key={g}
                          className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ),
              info: (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5">
                    <p className="text-[11px] font-medium text-[var(--text-dim)]">{t("releaseDate")}</p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{show.first_air_date || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5">
                    <p className="text-[11px] font-medium text-[var(--text-dim)]">{t("genre")}</p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{show.genres.join("، ") || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5">
                    <p className="text-[11px] font-medium text-[var(--text-dim)]">{t("seasons")}</p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{show.number_of_seasons}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5">
                    <p className="text-[11px] font-medium text-[var(--text-dim)]">{t("rating")}</p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                      {show.vote_average.toFixed(1)}/10 · {show.vote_count.toLocaleString()} {t("votes")}
                    </p>
                  </div>
                </div>
              ),
              cast:
                show.cast.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {show.cast.map((person, index) => (
                      <div
                        key={person.name}
                        className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-center"
                      >
                        <div className="relative aspect-square w-full bg-[var(--bg-elevated)]">
                          {person.photo ? (
                            <Image src={person.photo} alt={person.name} fill className="object-cover" sizes="160px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
                              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="truncate text-xs font-bold text-[var(--text-primary)]">{person.name}</p>
                          <p className="mt-0.5 truncate text-[10px] text-[var(--text-dim)]">
                            {person.character || (index < 3 ? t("roleMain") : t("roleSupporting"))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{isAr ? "لا يوجد طاقم متاح." : "No cast available."}</p>
                ),
            }}
          />
        )}

        {show && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="font-bold text-[var(--text-primary)]">{show.name}</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span>
              {t("season")} {selectedSeason} · {t("episode")} {selectedEpisode}
              {episodes.length > 0 ? ` / ${episodes.length}` : ""}
            </span>
          </div>
        )}

        {/* Player, then seasons/episodes below */}
        <div id="watch-player" className="scroll-mt-24">
          <WatchStreamTabs
            servers={servers}
            activeServer={activeServer}
            onSelectServer={(i) => {
              if (i === activeServer) return;
              setBusyMsg(false);
              setSwitching(true);
              setTimeout(() => {
                setActiveServer(i);
                setActiveMirror(0);
                setSwitching(false);
              }, 3500);
            }}
            serversLabel={t("servers")}
            recommendedLabel={t("recommended")}
          />
          <div className="player-shell" data-mv-player="1">
            <WatchAdLocker
              lockKey={`tv-${id}-${selectedSeason}-${selectedEpisode}-${activeServer}`}
            >
              <InPlayerVastGate
                sessionKey={`tv-${id}-${selectedSeason}-${selectedEpisode}`}
                prerollKey={`tv-${id}-${selectedSeason}-${selectedEpisode}-${activeServer}`}
                poster={show?.poster_path ?? undefined}
              >
                {switching ? (
                  <WatchServerLoadingAd
                    lockKey={`tv-load-${id}-${selectedSeason}-${selectedEpisode}-${activeServer}`}
                  />
                ) : currentServer.playerType === "direct" && currentServer.directUrl ? (
                  <VideoPlayer src={currentServer.directUrl} />
                ) : (
                  <iframe
                    key={`${activeServer}-${activeMirror}-${selectedSeason}-${selectedEpisode}-${subLang}`}
                    src={currentServerUrl}
                    onError={handleIframeError}
                    className="absolute inset-0 h-full w-full border-0"
                    title="TV player"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </InPlayerVastGate>
            </WatchAdLocker>
            <PlayerAdCorner />
          </div>
          <WatchPlayerAds />
        </div>

        {/* Server busy toast */}
        {busyMsg && (
          <div className="mt-3 animate-fade-in-up rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5 text-sm text-yellow-700">
            <span className="me-2">⏳</span>{t("serverBusy")}
          </div>
        )}

        {show && show.seasons.length > 0 && (
          <div
            className="mt-4 mb-4 flex items-stretch gap-2 sm:gap-3"
            dir={isRtl ? "rtl" : "ltr"}
            role="navigation"
            aria-label={t("episodes")}
          >
            <button
              type="button"
              disabled={epLoading || !episodeNav.prev}
              onClick={() => episodeNav.prev && navigateToEpisode(episodeNav.prev.s, episodeNav.prev.e)}
              className={`episode-nav-btn flex flex-1 items-center justify-center gap-2 ${
                !epLoading && episodeNav.prev ? "" : "episode-nav-btn-disabled"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={isRtl ? "rotate-180" : ""}
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="hidden truncate sm:inline">{t("prevEpisode")}</span>
            </button>

            <div className="flex min-w-[5.5rem] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-center shadow-sm">
              <span className="text-[10px] font-semibold text-[var(--text-dim)]">{t("episode")}</span>
              <span className="text-sm font-black text-[var(--text-primary)]">
                {selectedEpisode}
                {episodes.length > 0 ? ` / ${Math.max(...episodes.map((e) => e.episode_number))}` : ""}
              </span>
            </div>

            <button
              type="button"
              disabled={epLoading || !episodeNav.next}
              onClick={() => episodeNav.next && navigateToEpisode(episodeNav.next.s, episodeNav.next.e)}
              className={`episode-nav-btn flex flex-1 items-center justify-center gap-2 ${
                !epLoading && episodeNav.next ? "episode-nav-btn-primary" : "episode-nav-btn-disabled"
              }`}
            >
              <span className="hidden truncate sm:inline">{t("nextEpisode")}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={isRtl ? "rotate-180" : ""}
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {show && (
          <div className="mb-4 flex items-center justify-end">
            <FollowNotificationButton
              type="tv"
              itemId={show.id}
              title={show.name}
              isAr={isAr}
            />
          </div>
        )}

        {show && (
          <TvEpisodeBrowser
            seasons={sortedSeasons}
            episodes={sortedEpisodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
            loading={epLoading}
            onSelectSeason={(season) => {
              episodeSelectAfterSeasonFetchRef.current = null;
              setSelectedSeason(season);
            }}
            onSelectEpisode={playEpisode}
          />
        )}

        <RelatedShowsSection show={show} isAr={isAr} />
      </div>
    </div>
  );
}

function RelatedShowsSection({
  show,
  isAr,
}: {
  show: ShowData | null;
  isAr: boolean;
}) {
  const related = show?.relatedShows ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const max = el.scrollWidth - el.clientWidth;
      setAtStart(el.scrollLeft <= 8);
      setAtEnd(el.scrollLeft >= max - 8);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [related.length]);

  if (!show || related.length === 0) return null;

  const scrollByAmount = (direction: "next" | "prev") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 300);
    el.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)] sm:text-lg">
          <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
          {isAr ? "مسلسلات مشابهة" : "More Like This"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByAmount("prev")}
            disabled={atStart}
            className="btn-ghost !h-9 !w-9 !rounded-full !p-0 disabled:opacity-35"
            aria-label={isAr ? "السابق" : "Previous"}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scrollByAmount("next")}
            disabled={atEnd}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:opacity-35"
            aria-label={isAr ? "التالي" : "Next"}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {related.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            tvLabel={isAr ? "مسلسل" : "TV"}
            className="w-[165px] shrink-0 sm:w-[180px]"
          />
        ))}
      </div>
    </section>
  );
}
