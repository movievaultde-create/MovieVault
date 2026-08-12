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
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={FEATURED_MOVIE.backdrop}
          alt={FEATURED_MOVIE.title}
          fill
          className="object-cover object-top opacity-90"
          priority
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
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
                {FEATURED_MOVIE.year}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-bold text-[var(--rating)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                </svg>
                {FEATURED_MOVIE.rating}
              </span>
            </div>

            <h1 className="mb-2 text-4xl font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mb-4 text-lg font-medium text-[var(--text-muted)]">{subtitle}</p>
            )}

            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-[var(--text-dim)]">
              <span>{FEATURED_MOVIE.duration}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--text-dim)]" />
              <span>{genre}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--text-dim)]" />
              <span>HD</span>
            </div>

            <p className="mb-8 max-w-lg text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href={`/watch/${FEATURED_MOVIE.id}`} className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                {t("watchNow")}
              </Link>
              <Link href={`/watch/${FEATURED_MOVIE.id}`} className="btn-ghost">
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
