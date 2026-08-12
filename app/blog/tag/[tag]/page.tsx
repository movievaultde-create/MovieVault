import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCombinedBlogTags,
  getCombinedBlogPostsByTag,
  formatBlogDate,
  humanizeBlogTag,
} from "@/app/lib/blog";
import { SITE_URL } from "@/app/lib/siteUrl";

const BASE_URL = SITE_URL;

type BlogTagPageProps = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: BlogTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const label = humanizeBlogTag(tag);
  const allTags = await getCombinedBlogTags();
  if (!allTags.includes(tag)) {
    return {
      title: "Tag Not Found | MovieVault Blog",
      description: "This blog tag does not exist.",
    };
  }
  const posts = await getCombinedBlogPostsByTag(tag);

  return {
    title: `${label} Articles | MovieVault Blog`,
    description: `Read ${label} articles on MovieVault Blog with reviews, lists, and streaming tips.`,
    alternates: {
      canonical: `/blog/tag/${tag}`,
    },
    openGraph: {
      title: `${label} Articles | MovieVault Blog`,
      description: `Explore all ${label} articles and find your next watch faster.`,
      url: `${BASE_URL}/blog/tag/${tag}`,
      type: "website",
    },
  };
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const { tag } = await params;
  const posts = await getCombinedBlogPostsByTag(tag);

  if (!posts.length) {
    notFound();
  }

  const label = humanizeBlogTag(tag);

  return (
    <div className="mx-auto w-full max-w-5xl bg-[var(--bg-base)] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Topic Cluster</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">{label}</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
          Articles under this topic are internally linked to strengthen SEO relevance and user navigation.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--accent)]/40"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--accent)]">{post.category}</p>
            <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
              <Link href={`/blog/${post.slug}`} className="hover:text-[var(--accent)]">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-dim)]">
              <span>{formatBlogDate(post.publishedAt)}</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
