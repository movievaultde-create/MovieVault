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
import { SITE_URL } from "@/app/lib/siteUrl";

const BASE_URL = SITE_URL;

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
    <article className="mx-auto w-full max-w-4xl bg-[var(--bg-base)] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <p className="inline-flex rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          {post.category}
        </p>
        <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--text-primary)] sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base text-[var(--text-muted)]">{post.excerpt}</p>
        {post.featuredImage ? (
          <div className="relative mt-6 aspect-[16/8] w-full overflow-hidden rounded-2xl border border-[var(--border)]">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-dim)]">
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

      <div className="prose mt-8 max-w-none">
        {post.sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-8 text-[var(--text-muted)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {post.affiliate ? (
        <section className="mt-10 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{post.affiliate.title}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{post.affiliate.description}</p>
          <Link
            href={post.affiliate.href}
            className="btn-primary mt-4 inline-flex text-sm"
          >
            {post.affiliate.ctaLabel}
          </Link>
          <p className="mt-3 text-xs leading-6 text-[var(--text-dim)]">{post.affiliate.disclaimer}</p>
        </section>
      ) : null}

      {post.watchHref ? (
        <section className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Ready to continue?</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
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
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tags</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
            >
              #{humanizeBlogTag(tag)}
            </Link>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Related Articles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.slug}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-colors hover:border-[var(--accent)]/40"
              >
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  <Link href={`/blog/${relatedPost.slug}`} className="hover:text-[var(--accent)]">
                    {relatedPost.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{relatedPost.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
