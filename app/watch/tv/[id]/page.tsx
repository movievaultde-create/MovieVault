"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang, LANGUAGES, type TranslationKey } from "../../../context/LanguageContext";
import VideoPlayer from "../../../components/VideoPlayer";
import FollowNotificationButton from "../../../components/FollowNotificationButton";
import MediaCard from "../../../components/MediaCard";
import { type WatchServer, resolveDirectTvUrl } from "../../../lib/directStreamMap";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  poster: string | null;
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

function buildServers(id: string, season: number, episode: number, subLang: string): WatchServer[] {
  const directUrl = resolveDirectTvUrl(id, season, episode);
  return [
    {
      name: "MovieVault Server",
      label: "Fast 4K",
      premium: true,
      playerType: directUrl ? "direct" : "iframe",
      directUrl,
      url: withLangParams(`https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`, subLang),
      mirrors: [
        withLangParams(`https://autoembed.cc/tv/tmdb/${id}-${season}-${episode}`, subLang),
        withLangParams(`https://2embed.cc/embedtv/${id}?s=${season}&e=${episode}`, subLang),
      ],
    },
    {
      name: "Server 1",
      label: "VidSrc",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, subLang),
      mirrors: [
        withLangParams(`https://vidsrc.su/embed/tv/${id}/${season}/${episode}`, subLang),
        withLangParams(`https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`, subLang),
      ],
    },
    {
      name: "Server 2",
      label: "VidSrc Pro",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`, subLang),
      mirrors: [
        withLangParams(`https://vidsrc.net/embed/tv/${id}/${season}/${episode}`, subLang),
        withLangParams(`https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`, subLang),
      ],
    },
    {
      name: "Server 3",
      label: "Embed",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://embed.su/embed/tv/${id}/${season}/${episode}`, subLang),
      mirrors: [
        withLangParams(`https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`, subLang),
      ],
    },
    {
      name: "Server 4",
      label: "Multi",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`, subLang),
      mirrors: [
        withLangParams(`https://multiembed.stream/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`, subLang),
      ],
    },
    {
      name: "Server 5",
      label: "Videasy",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://player.videasy.net/tv/${id}/${season}/${episode}`, subLang),
      mirrors: [
        withLangParams(`https://player.autoembed.cc/tv/${id}/${season}/${episode}`, subLang),
      ],
    },
    {
      name: "Server 6",
      label: "NonTongo",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://nontongo.win/embed/tv/${id}/${season}/${episode}`, subLang),
      mirrors: [
        withLangParams(`https://nontongo.me/embed/tv/${id}/${season}/${episode}`, subLang),
      ],
    },
  ];
}

export default function WatchTVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang, t, isAr, isRtl, tmdbLang } = useLang();
  const subLang = SUB_LANG_MAP[lang] ?? "en";
  const subLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? "English";

  const [show, setShow] = useState<ShowData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeServer, setActiveServer] = useState(0);
  const [activeMirror, setActiveMirror] = useState(0);
  const [loading, setLoading] = useState(true);
  const [epLoading, setEpLoading] = useState(false);
  const [busyMsg, setBusyMsg] = useState(false);
  const [switching, setSwitching] = useState(false);
  const episodeSelectAfterSeasonFetchRef = useRef<number | "last" | null>(null);

  useEffect(() => {
    setActiveServer(0);
  }, [id]);

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

  const servers = useMemo(
    () => buildServers(id, selectedSeason, selectedEpisode, subLang),
    [id, selectedSeason, selectedEpisode, subLang]
  );
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-24 pb-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        {/* Back */}
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

        {/* Now Playing Badge */}
        {show && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="font-bold text-[var(--text-primary)]">{show.name}</span>
            <span className="text-[var(--text-dim)]">—</span>
            <span className="text-[var(--accent)]">
              {t("season")} {selectedSeason} · {t("episode")} {selectedEpisode}
            </span>
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

        {/* Player */}
        <div className="player-shell">
          <div className="relative aspect-video w-full">
            {currentServer.playerType === "direct" && currentServer.directUrl ? (
              <VideoPlayer src={currentServer.directUrl} />
            ) : (
              <iframe
                key={`${activeServer}-${activeMirror}-${selectedSeason}-${selectedEpisode}-${subLang}`}
                src={currentServerUrl}
                onError={handleIframeError}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
                loading="lazy"
              />
            )}
            {/* Cover embed tracker badges (e.g. histats) without blocking center controls */}
            <div aria-hidden className="pointer-events-auto absolute bottom-0 start-0 z-[2] h-10 w-36 bg-black" />
            <div aria-hidden className="pointer-events-auto absolute bottom-0 end-0 z-[2] h-10 w-36 bg-black" />
          </div>
        </div>

        {/* Prev / Next episode — outside player so it stays visible (not lost in black frame) */}
        {show && show.seasons.length > 0 && (
          <div
            className="mt-4 flex flex-wrap items-stretch justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-3 shadow-sm sm:px-4"
            dir={isRtl ? "rtl" : "ltr"}
            role="navigation"
            aria-label={t("episodes")}
          >
            <button
              type="button"
              disabled={epLoading || !episodeNav.prev}
              onClick={() => episodeNav.prev && navigateToEpisode(episodeNav.prev.s, episodeNav.prev.e)}
              className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all sm:max-w-[calc(50%-6px)] ${
                !epLoading && episodeNav.prev
                  ? "btn-ghost !rounded-xl"
                  : "cursor-not-allowed border-[var(--border)] text-[var(--text-dim)] opacity-40"
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
              <span className="truncate">{t("prevEpisode")}</span>
            </button>
            <button
              type="button"
              disabled={epLoading || !episodeNav.next}
              onClick={() => episodeNav.next && navigateToEpisode(episodeNav.next.s, episodeNav.next.e)}
              className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all sm:max-w-[calc(50%-6px)] ${
                !epLoading && episodeNav.next
                  ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  : "cursor-not-allowed border-[var(--border)] text-[var(--text-dim)] opacity-40"
              }`}
            >
              <span className="truncate">{t("nextEpisode")}</span>
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

        {/* Subtitle language indicator */}
        <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>{t("animeTranslation")}:</span>
          <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 font-medium text-[var(--text-primary)]">{subLabel}</span>
        </div>

        {/* Servers */}
        <div className="mt-5">
          <span className="mb-3 block text-sm font-medium text-[var(--text-muted)]">{t("servers")}</span>
          <div className="flex flex-wrap gap-2">
            {servers.map((server, i) => {
              const isActive = activeServer === i;
              const handleServerClick = () => {
                if (isActive) return;
                setBusyMsg(false);
                setSwitching(true);
                setTimeout(() => {
                  setActiveServer(i);
                  setActiveMirror(0);
                  setSwitching(false);
                }, 2000);
              };

              if (server.premium) {
                return (
                  <button
                    key={i}
                    onClick={handleServerClick}
                    className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                      isActive ? "server-btn-adfree" : "server-btn-default border-[var(--accent)]/40 text-[var(--accent)]"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent)]">
                      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                    </svg>
                    {server.name}
                    <span className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      {server.label}
                    </span>
                    {!isActive && (
                      <span className="absolute -end-1 -top-1 flex h-4 items-center rounded-full bg-[var(--accent)] px-1.5 text-[8px] font-bold text-white">
                        {t("recommended")}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={i}
                  onClick={handleServerClick}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive ? "server-btn-active" : "server-btn-default"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  {server.name}
                  <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]">{server.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Checking server status */}
        {switching && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            {t("checkingServer")}
          </div>
        )}

        {/* Server busy toast */}
        {busyMsg && (
          <div className="mt-3 animate-fade-in-up rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5 text-sm text-yellow-700">
            <span className="me-2">⏳</span>{t("serverBusy")}
          </div>
        )}

        {/* Netflix-style Seasons & Episodes */}
        {show && show.seasons.length > 0 && (
          <div className="mt-8">
            {/* Header with season dropdown */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                <div className="h-6 w-1 rounded-full bg-[var(--accent)]" />
                {t("episodes")}
              </h2>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    episodeSelectAfterSeasonFetchRef.current = null;
                    setSelectedSeason(Number(e.target.value));
                  }}
                  className="input-field appearance-none pe-10 text-sm font-medium"
                >
                  {show.seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number}>
                      {t("season")} {s.season_number} ({s.episode_count} {t("episodes")})
                    </option>
                  ))}
                </select>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Season pill tabs (quick switch) */}
            <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {show.seasons.map((s) => (
                <button
                  key={s.season_number}
                  onClick={() => {
                    episodeSelectAfterSeasonFetchRef.current = null;
                    setSelectedSeason(s.season_number);
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedSeason === s.season_number
                      ? "bg-[var(--accent)] text-white shadow-md"
                      : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  S{s.season_number}
                </button>
              ))}
            </div>

            {/* Episodes grid */}
            {epLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-28 w-full rounded-xl skeleton" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {episodes.map((ep) => {
                  const isActive = selectedEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.episode_number}
                      onClick={() => playEpisode(ep.episode_number)}
                      className={`group flex w-full items-start gap-3 overflow-hidden rounded-xl border p-0 text-start transition-all active:scale-[0.98] ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30"
                          : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-surface)]"
                      }`}
                    >
                      <div className="relative h-24 w-40 shrink-0 overflow-hidden bg-[var(--bg-elevated)] sm:h-28 sm:w-48">
                        {ep.still ? (
                          <Image src={ep.still} alt={ep.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 160px, 192px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface)] text-[var(--text-dim)]">
                            <span className="text-2xl font-black opacity-20">{ep.episode_number}</span>
                          </div>
                        )}
                        <div className={`absolute inset-0 flex items-center justify-center transition-all ${isActive ? "bg-[var(--accent)]/30" : "bg-black/0 group-hover:bg-black/20"}`}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isActive ? "scale-100 bg-[var(--accent)] text-white" : "scale-0 bg-white/90 text-[var(--text-primary)] group-hover:scale-100"}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5,3 19,12 5,21" />
                            </svg>
                          </div>
                        </div>
                        <span className={`absolute start-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold ${isActive ? "bg-[var(--accent)] text-white" : "bg-black/55 text-white/90"}`}>
                          {ep.episode_number}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center py-2.5 pe-3">
                        <p className={`truncate text-sm font-semibold ${isActive ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                          {ep.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-dim)]">
                          {ep.runtime && <span>{ep.runtime} {t("minuteShort")}</span>}
                          {ep.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-[var(--rating)]">★ {ep.vote_average.toFixed(1)}</span>
                          )}
                        </div>
                        {ep.overview && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
                            {ep.overview}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Show Info */}
        {show && (
          <ShowInfo show={show} t={t} isAr={isAr} />
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

function ShowInfo({
  show,
  t,
  isAr,
}: {
  show: ShowData;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}) {
  return (
    <div className="mt-8 space-y-6">
      {/* Title + Rating */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{show.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {show.genres.slice(0, 3).map((g) => (
              <span key={g} className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--rating)" className="shrink-0">
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
          </svg>
          <div>
            <p className="text-lg font-bold leading-none text-[var(--rating)]">{show.vote_average.toFixed(1)}</p>
            <p className="text-[10px] text-[var(--text-dim)]">{show.vote_count.toLocaleString()} {t("votes")}</p>
          </div>
        </div>
      </div>

      {/* Poster + Synopsis */}
      <div className="flex gap-6">
        {show.poster_path && (
          <div className="hidden shrink-0 sm:block">
            <div className="relative h-72 w-48 overflow-hidden rounded-lg border border-[var(--border)] shadow-lg">
              <Image src={show.poster_path} alt={show.name} fill className="object-cover" sizes="192px" />
            </div>
          </div>
        )}
        <div className="flex-1">
          {show.overview && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
                {t("movieStory")}
              </h2>
              <p className="text-sm leading-7 text-[var(--text-muted)]">{show.overview}</p>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoItem label={t("releaseDate")} value={show.first_air_date} />
            <InfoItem label={t("genre")} value={show.genres.join("، ")} />
            <InfoItem label={t("seasons")} value={String(show.number_of_seasons)} />
          </div>
        </div>
      </div>

      {/* Cast */}
      {show.cast.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
            {t("cast")}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {show.cast.map((person) => (
              <div key={person.name} className="flex w-24 shrink-0 flex-col items-center gap-2">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--bg-surface)]">
                  {person.photo ? (
                    <Image src={person.photo} alt={person.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium leading-tight text-[var(--text-primary)]">{person.name}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-[var(--text-dim)]">{person.character}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[var(--text-dim)]">{label}</p>
        <p className="truncate text-sm text-[var(--text-primary)]">{value || "—"}</p>
      </div>
    </div>
  );
}
