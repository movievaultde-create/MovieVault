"use client";

import Image from "next/image";
import { useLang } from "../context/LanguageContext";

export interface TvSeason {
  season_number: number;
  name: string;
  episode_count: number;
  poster: string | null;
  year?: string | null;
}

export interface TvEpisode {
  episode_number: number;
  name: string;
  overview: string;
  still: string | null;
  runtime: number | null;
  vote_average: number;
}

export default function TvEpisodeBrowser({
  seasons,
  episodes,
  selectedSeason,
  selectedEpisode,
  loading,
  onSelectSeason,
  onSelectEpisode,
}: {
  seasons: TvSeason[];
  episodes: TvEpisode[];
  selectedSeason: number;
  selectedEpisode: number;
  loading: boolean;
  onSelectSeason: (season: number) => void;
  onSelectEpisode: (episode: number) => void;
}) {
  const { t, isAr } = useLang();
  const currentSeason = seasons.find((s) => s.season_number === selectedSeason) ?? seasons[0];
  const sortedEpisodes = [...episodes].sort((a, b) => a.episode_number - b.episode_number);

  if (seasons.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        {isAr ? "لا توجد حلقات." : "No episodes."}
      </p>
    );
  }

  return (
    <section id="tv-episodes" className="mb-6 space-y-3">
      <div className="season-rail">
        <div className="season-rail-head">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>{t("allSeasons")}</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {seasons.map((season) => {
            const active = season.season_number === selectedSeason;
            return (
              <button
                key={season.season_number}
                type="button"
                onClick={() => onSelectSeason(season.season_number)}
                className={`season-card ${active ? "season-card-active" : ""}`}
                aria-pressed={active}
              >
                <span className="text-[10px] font-semibold tracking-wide text-white/70">
                  {t("season")} {season.season_number}
                </span>
                <span className="my-0.5 text-3xl font-black leading-none text-white">
                  {season.season_number}
                </span>
                <span className="text-[11px] font-medium text-white/65">
                  {season.year || "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="episode-rail">
        <div className="episode-rail-head">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <polygon points="5,3 19,12 5,21" />
          </svg>
          <span>{t("allEpisodes")}</span>
        </div>

        {currentSeason && (
          <div className="episode-rail-summary">
            <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-black/25">
              {currentSeason.poster ? (
                <Image
                  src={currentSeason.poster}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {currentSeason.name || `${t("season")} ${currentSeason.season_number}`}
              </p>
              <p className="text-xs text-white/80">
                {[currentSeason.year, `${currentSeason.episode_count} ${t("episodes")}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 w-full rounded-xl bg-black/20 skeleton" />
            ))}
          </div>
        ) : (
          <>
            {sortedEpisodes.length > 0 && (
              <div className="mb-4 flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {sortedEpisodes.map((ep) => {
                  const active = selectedEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.episode_number}
                      type="button"
                      onClick={() => onSelectEpisode(ep.episode_number)}
                      className={`episode-num-card ${active ? "episode-num-card-active" : ""}`}
                      aria-pressed={active}
                      aria-label={`${t("episode")} ${ep.episode_number}`}
                    >
                      <span className="episode-num-card-label">{t("episode")}</span>
                      <span className="episode-num-card-value">{ep.episode_number}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sortedEpisodes.map((ep) => {
                const isActive = selectedEpisode === ep.episode_number;
                return (
                  <button
                    key={ep.episode_number}
                    type="button"
                    onClick={() => onSelectEpisode(ep.episode_number)}
                    className={`ep-card-pro group items-stretch ${isActive ? "ep-card-pro-active" : ""}`}
                  >
                    <div className="relative h-24 w-36 shrink-0 overflow-hidden bg-[var(--bg-elevated)] sm:h-28 sm:w-44">
                      {ep.still ? (
                        <Image
                          src={ep.still}
                          alt={ep.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 144px, 176px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface)] text-[var(--text-dim)]">
                          <span className="text-2xl font-black opacity-20">{ep.episode_number}</span>
                        </div>
                      )}
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all ${
                          isActive ? "bg-[var(--accent)]/35" : "bg-black/0 group-hover:bg-black/25"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all ${
                            isActive
                              ? "scale-100 bg-[var(--accent)] text-white"
                              : "scale-0 bg-white text-[var(--accent)] group-hover:scale-100"
                          }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                      <span
                        className={`absolute start-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold ${
                          isActive ? "bg-[var(--accent)] text-white" : "bg-black/60 text-white"
                        }`}
                      >
                        {ep.episode_number}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center py-2.5 pe-3 ps-3">
                      <p
                        className={`line-clamp-1 text-sm font-bold ${
                          isActive ? "text-[var(--accent-bright)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {ep.name || `${t("episode")} ${ep.episode_number}`}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-dim)]">
                        {ep.runtime ? (
                          <span>{ep.runtime} {t("minuteShort")}</span>
                        ) : null}
                        {ep.vote_average > 0 ? (
                          <span className="flex items-center gap-0.5 text-[var(--rating)]">
                            ★ {ep.vote_average.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      {ep.overview ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
                          {ep.overview}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
