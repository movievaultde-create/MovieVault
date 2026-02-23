"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { triggerPopunder } from "../lib/ads";
import { useVip } from "../context/VipContext";

export default function Popunder() {
  const { isVip } = useVip();
  const firedRef = useRef(false);
  const pathname = usePathname();
  const isFirstMount = useRef(true);
  const isWatchPage = pathname.startsWith("/watch");

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      firedRef.current = false;
      return;
    }
    firedRef.current = false;
  }, [pathname]);

  // Click-based popunder on all pages — re-arms every 20s
  useEffect(() => {
    if (isVip) return;

    const trigger = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      triggerPopunder();
      setTimeout(() => { firedRef.current = false; }, 20000);
    };

    const events = ["click", "touchstart"] as const;
    events.forEach((e) =>
      document.addEventListener(e, trigger, { passive: true })
    );

    return () => {
      events.forEach((e) => document.removeEventListener(e, trigger));
    };
  }, [pathname, isVip]);

  // Auto popunder on watch pages — every 2 minutes, no click needed
  useEffect(() => {
    if (isVip || !isWatchPage) return;

    // First auto-popunder after 30 seconds of watching
    const firstTimer = setTimeout(() => {
      triggerPopunder();
    }, 30000);

    // Then every 2 minutes
    const interval = setInterval(() => {
      triggerPopunder();
    }, 120000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [isVip, isWatchPage]);

  return null;
}
