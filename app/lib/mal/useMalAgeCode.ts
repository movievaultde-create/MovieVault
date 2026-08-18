"use client";

import { useEffect, useState } from "react";
import {
  enqueueAnilistAge,
  enqueueMalAge,
  peekAnilistAge,
  peekMalAge,
  primeMalAge,
  subscribeAnilistAge,
  subscribeMalAge,
} from "./malAgeClientCache";
import type { AgeCode } from "./ageRatingMap";

export function useMalAgeCode(
  malId: number | null | undefined,
  initialCode?: AgeCode | null,
  anilistId?: number | null,
): AgeCode | null {
  const id = Math.floor(Number(malId));
  const aid = Math.floor(Number(anilistId));
  if (Number.isFinite(id) && id > 0 && initialCode && !peekMalAge(id)) {
    primeMalAge(id, initialCode);
  }

  const [, setTick] = useState(0);
  useEffect(() => {
    const ping = () => setTick((value) => value + 1);
    const unsubs: Array<() => void> = [];
    if (Number.isFinite(id) && id > 0 && !peekMalAge(id)) {
      unsubs.push(subscribeMalAge(id, ping));
      enqueueMalAge(id);
    } else if ((!Number.isFinite(id) || id <= 0) && Number.isFinite(aid) && aid > 0 && !peekAnilistAge(aid)) {
      unsubs.push(subscribeAnilistAge(aid, ping));
      enqueueAnilistAge(aid);
    }
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [id, aid]);

  if (Number.isFinite(id) && id > 0) return peekMalAge(id) ?? initialCode ?? null;
  if (Number.isFinite(aid) && aid > 0) return peekAnilistAge(aid) ?? initialCode ?? null;
  return initialCode ?? null;
}
