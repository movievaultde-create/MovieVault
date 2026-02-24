import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCombinedBlogTags,
  getCombinedBlogPostsByTag,
  formatBlogDate,
  humanizeBlogTag,
} from "@/app/lib/blog";

const BASE_URL = "https://movie-vault-eosin.vercel.app";

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
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-30 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Topic Cluster</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{label}</h1>
        <p className="mt-3 text-sm text-gray-300 sm:text-base">
          Articles under this topic are internally linked to strengthen SEO relevance and user navigation.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-white/10 bg-black/30 p-5 transition-colors hover:border-primary/40"
          >
            <p className="text-xs uppercase tracking-wide text-primary">{post.category}</p>
            <h2 className="mt-2 text-xl font-bold text-white">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-gray-300">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span>{formatBlogDate(post.publishedAt)}</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
