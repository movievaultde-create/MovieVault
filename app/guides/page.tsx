import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Movie Guides 2026 | MovieVault",
  description:
    "Browse practical movie guides, curated watch lists, and simple recommendations for action, family nights, and faster movie discovery.",
  alternates: {
    canonical: "/guides",
  },
};

const guides = [
  {
    href: "/guides/best-action-movies-2026",
    title: "Best Action Movies to Watch in 2026",
    description:
      "A practical action watchlist with quick reasons for each pick and who it is best for.",
  },
  {
    href: "/guides/family-movies-weekend",
    title: "Family Movies for Weekend Night",
    description:
      "A balanced family-friendly selection with genre mix and simple age-safe guidance.",
  },
  {
    href: "/guides/how-to-choose-movie-tonight",
    title: "How to Choose a Movie Tonight",
    description:
      "A short framework to pick the right movie in minutes based on mood, time, and pace.",
  },
];

export default function GuidesIndexPage() {
  return (
    <main className="mx-auto max-w-5xl bg-[var(--bg-base)] px-4 pb-20 pt-24 sm:px-6">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h1 className="text-3xl font-black text-[var(--text-primary)] sm:text-4xl">MovieVault Guides</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
          Evergreen guides that help users discover what to watch faster.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <article
            key={guide.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--accent)]/40"
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              <Link href={guide.href} className="hover:text-[var(--accent)]">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{guide.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Quick Browse</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/movies" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            Movies
          </Link>
          <Link href="/tv-series" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            Series
          </Link>
          <Link href="/blog" className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            Blog
          </Link>
        </div>
      </section>
    </main>
  );
}
