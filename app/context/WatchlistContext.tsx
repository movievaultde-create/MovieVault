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
  toggleWatchlist: (item: Omit<WatchlistItem, "addedAt">) => Promise<{ ok: boolean; added: boolean }>;
  removeFromWatchlist: (id: number, type: "movie" | "tv") => Promise<void>;
  clearWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const email = useMemo(() => user?.email?.trim().toLowerCase() ?? "", [user?.email]);

  useEffect(() => {
    if (authLoading) return;
    if (!email) {
      setItems([]);
      setReady(true);
      return;
    }

    let active = true;
    setReady(false);
    fetch(`/api/watchlist?email=${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok?: boolean; items?: WatchlistItem[] } | null) => {
        if (!active) return;
        if (data?.ok && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [authLoading, email]);

  const isInWatchlist = useCallback(
    (id: number, type: "movie" | "tv") => items.some((item) => item.id === id && item.type === type),
    [items]
  );

  const toggleWatchlist = useCallback(
    async (item: Omit<WatchlistItem, "addedAt">) => {
      if (!email || busy) return { ok: false, added: false };
      const exists = items.some((entry) => entry.id === item.id && entry.type === item.type);

      try {
        setBusy(true);
        if (exists) {
          const res = await fetch("/api/watchlist", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, id: item.id, type: item.type }),
          });
          if (!res.ok) return { ok: false, added: false };
          setItems((prev) => prev.filter((entry) => !(entry.id === item.id && entry.type === item.type)));
          return { ok: true, added: false };
        }

        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, item }),
        });
        if (!res.ok) return { ok: false, added: false };
        setItems((prev) => [
          { ...item, addedAt: new Date().toISOString() },
          ...prev.filter((entry) => !(entry.id === item.id && entry.type === item.type)),
        ]);
        return { ok: true, added: true };
      } catch {
        return { ok: false, added: false };
      } finally {
        setBusy(false);
      }
    },
    [busy, email, items]
  );

  const removeFromWatchlist = useCallback(
    async (id: number, type: "movie" | "tv") => {
      if (!email) return;
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, id, type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((entry) => !(entry.id === id && entry.type === type)));
      }
    },
    [email]
  );

  const clearWatchlist = useCallback(async () => {
    if (!email) return;
    const res = await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setItems([]);
    }
  }, [email]);

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
