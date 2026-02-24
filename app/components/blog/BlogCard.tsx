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
      className={`group overflow-hidden rounded-2xl border border-white/10 bg-surface/70 transition-colors hover:border-primary/40 ${
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
            <div className="h-full w-full bg-gradient-to-r from-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {post.category}
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-gray-200">{post.excerpt}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {post.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            <Link href={`/blog/${post.slug}`} className="hover:text-primary">
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-gray-300">{post.excerpt}</p>
        </>
      )}

      <div className={`${featured ? "p-5 pt-4" : "mt-3"} flex flex-wrap items-center gap-2 text-xs text-gray-400`}>
        <span>{formatBlogDate(post.publishedAt)}</span>
        <span>•</span>
        <span>{post.readingMinutes} min read</span>
        {post.source === "auto" ? (
          <>
            <span>•</span>
            <span className="rounded-full border border-primary/30 px-2 py-0.5 text-primary">
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
            className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-200 transition-colors hover:border-primary/40 hover:text-primary"
          >
            #{humanizeBlogTag(tag)}
          </Link>
        ))}
      </div>
    </article>
  );
}
