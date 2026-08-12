import Image from "next/image";
import Link from "next/link";
import { BlogPost, formatBlogDate, humanizeBlogTag } from "@/app/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-colors hover:border-[var(--accent)]/40 ${
        featured ? "p-0" : "p-4"
      }`}
    >
      {featured ? (
        <div className="relative aspect-[16/8] w-full overflow-hidden">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-[var(--bg-elevated)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {post.category}
            </p>
            <h3 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
              <Link href={`/blog/${post.slug}`} className="hover:text-[var(--accent)]">
                {post.title}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{post.excerpt}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {post.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            <Link href={`/blog/${post.slug}`} className="hover:text-[var(--accent)]">
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{post.excerpt}</p>
        </>
      )}

      <div className={`${featured ? "p-5 pt-4" : "mt-3"} flex flex-wrap items-center gap-2 text-xs text-[var(--text-dim)]`}>
        <span>{formatBlogDate(post.publishedAt)}</span>
        <span>•</span>
        <span>{post.readingMinutes} min read</span>
        {post.source === "auto" ? (
          <>
            <span>•</span>
            <span className="rounded-full border border-[var(--accent)]/30 px-2 py-0.5 text-[var(--accent)]">
              Auto Daily
            </span>
          </>
        ) : null}
      </div>

      <div className={`${featured ? "px-5 pb-5" : "mt-3"} flex flex-wrap gap-2`}>
        {post.tags.slice(0, 3).map((tag) => (
          <Link
            key={`${post.slug}-${tag}`}
            href={`/blog/tag/${tag}`}
            className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            #{humanizeBlogTag(tag)}
          </Link>
        ))}
      </div>
    </article>
  );
}
