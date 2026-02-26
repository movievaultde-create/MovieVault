"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

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
  toggleWatchlist: (item: Omit<WatchlistItem, "addedAt">) => { ok: boolean; added: boolean };
  removeFromWatchlist: (id: number, type: "movie" | "tv") => void;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getStorageKey(email: string | null): string | null {
  if (!email) return null;
  return `mv_watchlist_${normalizeEmail(email)}`;
}

function parseItems(raw: string | null): WatchlistItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WatchlistItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item?.id === "number" &&
        (item?.type === "movie" || item?.type === "tv") &&
        typeof item?.title === "string"
    );
  } catch {
    return [];
  }
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ready, setReady] = useState(false);

  const key = useMemo(() => getStorageKey(user?.email ?? null), [user?.email]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const applyState = (nextItems: WatchlistItem[]) => {
      Promise.resolve().then(() => {
        if (!active) return;
        setItems(nextItems);
        setReady(true);
      });
    };

    if (!key) {
      applyState([]);
    } else {
      applyState(parseItems(localStorage.getItem(key)));
    }
    return () => {
      active = false;
    };
  }, [authLoading, key]);

  const persist = useCallback(
    (nextItems: WatchlistItem[]) => {
      setItems(nextItems);
      if (key) {
        localStorage.setItem(key, JSON.stringify(nextItems));
      }
    },
    [key]
  );

  const isInWatchlist = useCallback(
    (id: number, type: "movie" | "tv") => items.some((item) => item.id === id && item.type === type),
    [items]
  );

  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => {
      if (!key) return { ok: false, added: false };
      const exists = items.some((entry) => entry.id === item.id && entry.type === item.type);
      if (exists) {
        persist(items.filter((entry) => !(entry.id === item.id && entry.type === item.type)));
        return { ok: true, added: false };
      }
      persist([{ ...item, addedAt: new Date().toISOString() }, ...items]);
      return { ok: true, added: true };
    },
    [items, key, persist]
  );

  const removeFromWatchlist = useCallback(
    (id: number, type: "movie" | "tv") => {
      persist(items.filter((entry) => !(entry.id === id && entry.type === type)));
    },
    [items, persist]
  );

  const clearWatchlist = useCallback(() => {
    persist([]);
  }, [persist]);

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
