import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family Movies for Weekend Night | MovieVault Guide",
  description:
    "Weekend family movie guide with easy selection rules for age mix, energy level, and watch time.",
  alternates: {
    canonical: "/guides/family-movies-weekend",
  },
};

const checklist = [
  "Pick one familiar title and one new title to keep everyone engaged.",
  "Prefer light pacing for mixed age groups.",
  "Keep runtime between 90 and 120 minutes for better completion.",
  "Use subtitles only when needed to reduce screen fatigue for kids.",
];

export default function FamilyMoviesWeekendGuidePage() {
  return (
    <main className="mx-auto max-w-4xl bg-[var(--bg-base)] px-4 pb-20 pt-24 sm:px-6">
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
          Family Movies for Weekend Night
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          This guide helps you reduce decision time and avoid mismatched picks. Use the checklist
          below to find a title everyone can enjoy in one sitting.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">Family Selection Checklist</h2>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
          {checklist.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>

        <h2 className="mt-8 text-xl font-bold text-[var(--text-primary)]">Fallback strategy</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          If your first movie fails in the first 15 minutes, switch immediately to a shorter
          high-confidence option. This keeps movie night positive and increases completion rates.
        </p>

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
