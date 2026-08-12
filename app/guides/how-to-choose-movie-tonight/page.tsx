import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Choose a Movie Tonight | MovieVault Guide",
  description:
    "Use this quick framework to choose the right movie by mood, time, and group preference in under 2 minutes.",
  alternates: {
    canonical: "/guides/how-to-choose-movie-tonight",
  },
};

export default function ChooseMovieTonightGuidePage() {
  return (
    <main className="mx-auto max-w-4xl bg-[var(--bg-base)] px-4 pb-20 pt-24 sm:px-6">
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
          How to Choose a Movie Tonight
        </h1>

        <p className="mt-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          A practical decision framework for fast movie picks. No endless scrolling, no random
          choices, and better match quality for your mood.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">Step-by-step framework</h2>
        <ol className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
          <li>1. Define time budget: 90, 120, or 150 minutes.</li>
          <li>2. Pick mood: exciting, dark, funny, chill, or mind-blowing.</li>
          <li>3. Pick format: movie for speed, series if you want continuity.</li>
          <li>4. Start with recent high-rating options, then fallback to classics.</li>
        </ol>

        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">When watching with others</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          Use majority mood voting first, then choose the shortest title that still matches the
          group. This improves completion and lowers drop-off.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/movies" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            Browse Movies
          </Link>
          <Link href="/tv-series" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            Browse Series
          </Link>
          <Link href="/guides" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            All Guides
          </Link>
        </div>
      </article>
    </main>
  );
}
