import type { Metadata } from "next";
import Link from "next/link";
import {
  getCombinedBlogPosts,
  getCombinedBlogTags,
  humanizeBlogTag,
} from "@/app/lib/blog";
import BlogCard from "@/app/components/blog/BlogCard";

const BASE_URL = "https://movie-vault-eosin.vercel.app";

export const metadata: Metadata = {
  title: "MovieVault Blog | Movie Reviews, Lists & Streaming Guides",
  description:
    "Explore MovieVault Blog for movie reviews, best-of lists, and streaming guides designed for movie lovers and SEO-friendly discovery.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "MovieVault Blog",
    description:
      "Movie reviews, watch lists, and practical streaming guides to help you find what to watch next.",
    url: `${BASE_URL}/blog`,
    type: "website",
  },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getCombinedBlogPosts();
  const featured = posts.slice(0, 2);
  const rest = posts.slice(2);
  const tags = await getCombinedBlogTags();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MovieVault Blog",
    description:
      "Movie reviews, curated watch lists, and streaming guides for better movie nights.",
    url: `${BASE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "MovieVault",
      url: BASE_URL,
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-30 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/40 via-zinc-950 to-black p-6 sm:p-8">
        <p className="mb-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          MovieVault Blog
        </p>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          Reviews, curated watchlists, and auto-daily release posts that rank and convert.
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-gray-300 sm:text-base">
          This content hub is designed for long-term organic growth: internal linking, topic clusters,
          and intent-driven content optimized for both readers and search engines.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Featured Articles</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {featured.map((post) => (
            <BlogCard key={post.slug} post={post} featured />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Latest Posts</h2>
          <Link
            href="/blog/tag/reviews"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Explore reviews
          </Link>
        </div>
        <div className="grid gap-3">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-surface/50 p-5">
        <h2 className="text-lg font-bold text-white sm:text-xl">Browse by Topic</h2>
        <p className="mt-1 text-sm text-gray-400">
          Topic pages improve discoverability and help Google understand your content clusters.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-gray-200 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {humanizeBlogTag(tag)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
