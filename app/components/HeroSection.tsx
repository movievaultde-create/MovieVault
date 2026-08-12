"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "../context/LanguageContext";

interface HeroItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  year: string;
  rating: string;
  runtime: string | null;
  genre: string;
  backdrop: string;
  poster: string | null;
}

const FALLBACK: HeroItem = {
  id: 693134,
  type: "movie",
  title: "Dune: Part Two",
  overview:
    "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  year: "2024",
  rating: "8.6",
  runtime: "166 min",
  genre: "Sci-Fi, Adventure",
  backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
  poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
};

export default function HeroSection() {
  const { t, tmdbLang } = useLang();
  const [hero, setHero] = useState<HeroItem>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/hero?lang=${encodeURIComponent(tmdbLang)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.backdrop || !data?.id) return;
        setHero({
          id: data.id,
          type: data.type === "tv" ? "tv" : "movie",
          title: data.title || FALLBACK.title,
          overview: data.overview || FALLBACK.overview,
          year: data.year || FALLBACK.year,
          rating: data.rating || FALLBACK.rating,
          runtime: data.runtime ?? null,
          genre: data.genre || "",
          backdrop: data.backdrop,
          poster: data.poster ?? null,
        });
      })
      .catch(() => {
        /* keep fallback */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tmdbLang]);

  const href = hero.type === "tv" ? `/watch/tv/${hero.id}` : `/watch/${hero.id}`;

  const metaParts = [hero.runtime, hero.genre, "HD"].filter(Boolean);

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          key={hero.backdrop}
          src={hero.backdrop}
          alt={hero.title}
          fill
          className={`object-cover object-top transition-opacity duration-500 ${loaded ? "opacity-90" : "opacity-70"}`}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/85 via-[var(--bg-base)]/25 to-transparent rtl:bg-gradient-to-l" />
      </div>

      <div className="relative z-10 flex h-full items-end pb-16 sm:pb-20">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {t("featured")}
              </span>
              {hero.year && (
                <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
                  {hero.year}
                </span>
              )}
              {parseFloat(hero.rating) > 0 && (
                <span className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-bold text-[var(--rating)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                  </svg>
                  {hero.rating}
                </span>
              )}
            </div>

            <h1 className="mb-2 text-4xl font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              {hero.title}
            </h1>

            {metaParts.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-[var(--text-dim)]">
                {metaParts.map((part, i) => (
                  <span key={`${part}-${i}`} className="contents">
                    {i > 0 && <span className="h-1 w-1 rounded-full bg-[var(--text-dim)]" />}
                    <span>{part}</span>
                  </span>
                ))}
              </div>
            )}

            {hero.overview && (
              <p className="mb-8 max-w-lg line-clamp-3 text-sm font-medium leading-relaxed text-[var(--text-primary)] sm:text-base">
                {hero.overview}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href={href} className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                {t("watchNow")}
              </Link>
              <Link href={href} className="btn-ghost">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                {t("movieDetails")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
