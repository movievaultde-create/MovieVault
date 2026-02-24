import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCombinedBlogPostBySlug,
  getCombinedBlogPosts,
  formatBlogDate,
  getRelatedBlogPostsFromPool,
  humanizeBlogTag,
} from "@/app/lib/blog";

const BASE_URL = "https://movie-vault-eosin.vercel.app";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCombinedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | MovieVault Blog",
      description: "The article you are looking for does not exist.",
    };
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      type: "article",
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: "MovieVault",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getCombinedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const combinedPosts = await getCombinedBlogPosts();
  const relatedByTags = getRelatedBlogPostsFromPool(post, combinedPosts, 3);
  const fallbackRelated = combinedPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);
  const relatedPosts = relatedByTags.length > 0 ? relatedByTags : fallbackRelated;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "MovieVault",
      url: BASE_URL,
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="mx-auto w-full max-w-4xl px-4 pb-20 pt-30 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-6 sm:p-8">
        <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {post.category}
        </p>
        <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base text-gray-300">{post.excerpt}</p>
        {post.featuredImage ? (
          <div className="relative mt-6 aspect-[16/8] w-full overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>{formatBlogDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{post.readingMinutes} min read</span>
          <span>•</span>
          <span>{post.author}</span>
          {post.updatedAt ? (
            <>
              <span>•</span>
              <span>Updated {formatBlogDate(post.updatedAt)}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="prose prose-invert mt-8 max-w-none">
        {post.sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="text-2xl font-bold text-white">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-8 text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {post.affiliate ? (
        <section className="mt-10 rounded-2xl border border-primary/30 bg-primary/10 p-5">
          <h2 className="text-lg font-bold text-white">{post.affiliate.title}</h2>
          <p className="mt-2 text-sm leading-7 text-gray-200">{post.affiliate.description}</p>
          <Link
            href={post.affiliate.href}
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {post.affiliate.ctaLabel}
          </Link>
          <p className="mt-3 text-xs leading-6 text-gray-300">{post.affiliate.disclaimer}</p>
        </section>
      ) : null}

      {post.watchHref ? (
        <section className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
          <h2 className="text-lg font-bold text-white">Ready to continue?</h2>
          <p className="mt-2 text-sm text-gray-200">
            This article is connected to the watch page so users can move from discovery to viewing in one click.
          </p>
          <Link
            href={post.watchHref}
            className="mt-4 inline-flex rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            Watch now
          </Link>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Tags</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-gray-200 transition-colors hover:border-primary/40 hover:text-primary"
            >
              #{humanizeBlogTag(tag)}
            </Link>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-white">Related Articles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.slug}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 transition-colors hover:border-white/20"
              >
                <h3 className="text-base font-semibold text-white">
                  <Link href={`/blog/${relatedPost.slug}`} className="hover:text-primary">
                    {relatedPost.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-300">{relatedPost.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
