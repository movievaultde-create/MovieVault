"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "../context/LanguageContext";

const FEATURED_MOVIE = {
  id: 693134,
  title: "Dune: Part Two",
  titleAr: "كثبان رملية: الجزء الثاني",
  year: 2024,
  rating: "8.6",
  duration: "166 min",
  genre: "Sci-Fi, Adventure",
  genreAr: "خيال علمي، مغامرة",
  description:
    "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  descriptionAr:
    "يتحد بول أتريدس مع الفريمن في مسار حرب انتقامية ضد المتآمرين الذين دمروا عائلته.",
  backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
  poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
};

export default function HeroSection() {
  const { t, isAr } = useLang();

  const title = isAr ? FEATURED_MOVIE.titleAr : FEATURED_MOVIE.title;
  const subtitle = isAr ? FEATURED_MOVIE.title : "";
  const genre = isAr ? FEATURED_MOVIE.genreAr : FEATURED_MOVIE.genre;
  const description = isAr ? FEATURED_MOVIE.descriptionAr : FEATURED_MOVIE.description;

  return (
    <section className="relative h-[85vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={FEATURED_MOVIE.backdrop}
          alt={FEATURED_MOVIE.title}
          fill
          className="object-cover object-top"
          priority
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent rtl:bg-gradient-to-l" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end pb-20 sm:pb-28">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
          <div className="max-w-2xl animate-fade-in-up">
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {t("featured")}
              </span>
              <span className="rounded border border-surface-border bg-surface/80 px-2.5 py-1 text-xs font-medium text-text-secondary">
                {FEATURED_MOVIE.year}
              </span>
              <span className="flex items-center gap-1 rounded border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs font-bold text-yellow-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                </svg>
                {FEATURED_MOVIE.rating}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-2 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mb-4 text-lg font-medium text-text-secondary">{subtitle}</p>
            )}

            {/* Meta */}
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>{FEATURED_MOVIE.duration}</span>
              <span className="h-1 w-1 rounded-full bg-text-muted" />
              <span>{genre}</span>
              <span className="h-1 w-1 rounded-full bg-text-muted" />
              <span>HD</span>
            </div>

            {/* Description */}
            <p className="mb-8 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
              {description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/watch/${FEATURED_MOVIE.id}`}
                className="flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/40 active:scale-[0.97]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                {t("watchNow")}
              </Link>
              <Link
                href={`/watch/${FEATURED_MOVIE.id}`}
                className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface/60 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-surface-light"
              >
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
              <Link
                href="/blog"
                onClick={(event) => {
                  event.preventDefault();
                  window.location.assign("/blog");
                }}
                className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-6 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                {isAr ? "المدونة" : "Blog"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
