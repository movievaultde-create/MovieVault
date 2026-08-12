"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";

interface WatchlistButtonItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
}

export default function WatchlistButton({
  item,
  className = "",
}: {
  item: WatchlistButtonItem;
  className?: string;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    void toggleWatchlist(item);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      title={saved ? "Remove from watchlist" : "Add to watchlist"}
      className={`absolute start-2 bottom-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition ${
        saved
          ? "border-red-400/60 bg-red-500/85 text-white"
          : "border-[var(--border)] bg-[var(--bg-card)]/90 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
      } ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7.5-4.35-10-9A6 6 0 0 1 12 5a6 6 0 0 1 10 7c-2.5 4.65-10 9-10 9z" />
      </svg>
    </button>
  );
}
