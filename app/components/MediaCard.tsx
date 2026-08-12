"use client";

import Link from "next/link";
import Image from "next/image";
import WatchlistButton from "./WatchlistButton";

export interface MediaCardItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
  studio?: string | null;
}

export default function MediaCard({
  item,
  tvLabel,
  showStudio = false,
  rank,
  className = "",
}: {
  item: MediaCardItem;
  tvLabel: string;
  showStudio?: boolean;
  rank?: number;
  className?: string;
}) {
  const href = item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`;

  return (
    <Link href={href} className={`group block ${className}`}>
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-hover)] group-hover:shadow-md">
        <div className="relative aspect-[2/3] w-full bg-[var(--bg-elevated)]">
          {item.poster ? (
            <Image
              src={item.poster}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
          )}

          {typeof rank === "number" && (
            <span className="absolute start-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[11px] font-black text-white shadow">
              {rank}
            </span>
          )}

          {item.type === "tv" && (
            <span className="absolute end-2 top-2 rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">
              {tvLabel}
            </span>
          )}

          {parseFloat(item.rating) > 0 && (
            <span className="absolute end-2 bottom-2 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-[var(--rating)]">
              ★ {item.rating}
            </span>
          )}

          <WatchlistButton item={item} />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
      {showStudio && item.studio && (
        <p className="truncate text-[11px] font-medium text-[var(--accent)]" title={item.studio}>
          {item.studio}
        </p>
      )}
      <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">{item.year}</p>
    </Link>
  );
}
