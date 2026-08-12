import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Action Movies to Watch in 2026 | MovieVault Guide",
  description:
    "A simple, practical action movie guide for 2026 with quick pick logic by mood, pace, and runtime.",
  alternates: {
    canonical: "/guides/best-action-movies-2026",
  },
};

const picks = [
  "High-intensity pick: fast pacing, short runtime, immediate action.",
  "Balanced pick: action + story, suitable for mixed groups.",
  "Epic pick: long runtime, cinematic scale, weekend session.",
  "Classic pick: crowd-pleasing title with broad appeal.",
  "Late-night pick: darker tone and heavier atmosphere.",
];

export default function BestActionMoviesGuidePage() {
  return (
    <main className="mx-auto max-w-4xl bg-[var(--bg-base)] px-4 pb-20 pt-24 sm:px-6">
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
          Best Action Movies to Watch in 2026
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          Use this list when you want fast selection without scrolling forever. Start from your
          energy level and available time, then choose a lane that matches your mood.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">Quick Selection Lanes</h2>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
          {picks.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>

        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">How to pick in 30 seconds</h2>
        <ol className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
          <li>1. Choose your runtime window: under 110 min or over 130 min.</li>
          <li>2. Choose tone: fun action or serious action.</li>
          <li>3. Open the action category and start with top-rated fresh entries.</li>
        </ol>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/movies" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            Browse Movies
          </Link>
          <Link href="/guides" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            All Guides
          </Link>
        </div>
      </article>
    </main>
  );
}
