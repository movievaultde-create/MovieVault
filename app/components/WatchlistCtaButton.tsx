"use client";

import type { MouseEvent } from "react";
import { useWatchlist } from "../context/WatchlistContext";
import { useLang } from "../context/LanguageContext";

interface WatchlistItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
}

/** ClashAnime-style “Add to my list” CTA — no login required. */
export default function WatchlistCtaButton({
  item,
  className = "",
}: {
  item: WatchlistItem;
  className?: string;
}) {
  const { t } = useLang();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleWatchlist(item);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
        saved
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
      } ${className}`}
    >
      <span className="text-base leading-none">{saved ? "✓" : "+"}</span>
      {saved ? t("inMyList") : t("addToMyList")}
    </button>
  );
}
