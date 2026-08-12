"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface WatchlistItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
  addedAt: string;
}

interface WatchlistContextType {
  items: WatchlistItem[];
  ready: boolean;
  isInWatchlist: (id: number, type: "movie" | "tv") => boolean;
  toggleWatchlist: (item: Omit<WatchlistItem, "addedAt">) => Promise<{ ok: boolean; added: boolean }>;
  removeFromWatchlist: (id: number, type: "movie" | "tv") => Promise<void>;
  clearWatchlist: () => Promise<void>;
}

const STORAGE_KEY = "movievault_favorites";

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function readLocal(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: WatchlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

/** Favorites / My List — localStorage only, no login required. */
export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readLocal());
    setReady(true);
  }, []);

  const isInWatchlist = useCallback(
    (id: number, type: "movie" | "tv") => items.some((item) => item.id === id && item.type === type),
    [items]
  );

  const toggleWatchlist = useCallback(async (item: Omit<WatchlistItem, "addedAt">) => {
    const prev = readLocal();
    const exists = prev.some((entry) => entry.id === item.id && entry.type === item.type);
    const next = exists
      ? prev.filter((entry) => !(entry.id === item.id && entry.type === item.type))
      : [{ ...item, addedAt: new Date().toISOString() }, ...prev];
    writeLocal(next);
    setItems(next);
    return { ok: true, added: !exists };
  }, []);

  const removeFromWatchlist = useCallback(async (id: number, type: "movie" | "tv") => {
    setItems((prev) => {
      const next = prev.filter((entry) => !(entry.id === id && entry.type === type));
      writeLocal(next);
      return next;
    });
  }, []);

  const clearWatchlist = useCallback(async () => {
    writeLocal([]);
    setItems([]);
  }, []);

  const value = useMemo<WatchlistContextType>(
    () => ({
      items,
      ready,
      isInWatchlist,
      toggleWatchlist,
      removeFromWatchlist,
      clearWatchlist,
    }),
    [clearWatchlist, isInWatchlist, items, ready, removeFromWatchlist, toggleWatchlist]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
