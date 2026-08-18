"use client";

import type { AgeCode } from "./ageRatingMap";

const malCache = new Map<number, AgeCode>();
const anilistCache = new Map<number, AgeCode>();
const malWaiters = new Map<number, Set<() => void>>();
const anilistWaiters = new Map<number, Set<() => void>>();
const malQueue = new Set<number>();
const anilistQueue = new Set<number>();
let flushTimer: number | null = null;

function notify(map: Map<number, Set<() => void>>, id: number) {
  map.get(id)?.forEach((fn) => fn());
}

async function flushQueue() {
  flushTimer = null;
  const malIds = [...malQueue].filter((id) => !malCache.has(id));
  const anilistIds = [...anilistQueue].filter((id) => !anilistCache.has(id));
  malQueue.clear();
  anilistQueue.clear();
  if (!malIds.length && !anilistIds.length) return;

  const params = new URLSearchParams();
  if (malIds.length) params.set("ids", malIds.slice(0, 64).join(","));
  if (anilistIds.length) params.set("anilistIds", anilistIds.slice(0, 64).join(","));
  try {
    const response = await fetch(`/api/mal/ages?${params.toString()}`);
    const payload = (await response.json()) as {
      ages?: Record<string, AgeCode>;
      anilist?: Record<string, AgeCode>;
    };
    for (const [key, code] of Object.entries(payload.ages ?? {})) {
      const id = Number(key);
      if (Number.isFinite(id) && id > 0 && code) {
        malCache.set(id, code);
        notify(malWaiters, id);
      }
    }
    for (const [key, code] of Object.entries(payload.anilist ?? {})) {
      const id = Number(key);
      if (Number.isFinite(id) && id > 0 && code) {
        anilistCache.set(id, code);
        notify(anilistWaiters, id);
      }
    }
  } catch {
    /* retry on next mount */
  }
}

function scheduleFlush() {
  if (flushTimer == null) {
    flushTimer = window.setTimeout(() => {
      void flushQueue();
    }, 60);
  }
}

export function primeMalAge(malId: number, code: AgeCode) {
  if (!malCache.has(malId)) malCache.set(malId, code);
}

export function peekMalAge(malId: number): AgeCode | undefined {
  return malCache.get(malId);
}

export function peekAnilistAge(anilistId: number): AgeCode | undefined {
  return anilistCache.get(anilistId);
}

export function subscribeMalAge(malId: number, listener: () => void): () => void {
  const set = malWaiters.get(malId) ?? new Set<() => void>();
  set.add(listener);
  malWaiters.set(malId, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) malWaiters.delete(malId);
  };
}

export function subscribeAnilistAge(anilistId: number, listener: () => void): () => void {
  const set = anilistWaiters.get(anilistId) ?? new Set<() => void>();
  set.add(listener);
  anilistWaiters.set(anilistId, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) anilistWaiters.delete(anilistId);
  };
}

export function enqueueMalAge(malId: number) {
  if (malCache.has(malId) || malQueue.has(malId)) return;
  malQueue.add(malId);
  scheduleFlush();
}

export function enqueueAnilistAge(anilistId: number) {
  if (anilistCache.has(anilistId) || anilistQueue.has(anilistId)) return;
  anilistQueue.add(anilistId);
  scheduleFlush();
}
