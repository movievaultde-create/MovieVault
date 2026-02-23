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

  // Reset on every page change so next interaction triggers again
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      firedRef.current = false;
      return;
    }
    firedRef.current = false;
  }, [pathname]);

  useEffect(() => {
    if (isVip) return;

    const trigger = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      triggerPopunder();
      // Re-arm after 30 seconds so user gets another ad on prolonged interaction
      setTimeout(() => { firedRef.current = false; }, 30000);
    };

    const events = ["click", "touchstart"] as const;
    const addListeners = () => {
      events.forEach((e) =>
        document.addEventListener(e, trigger, { passive: true })
      );
    };
    addListeners();

    return () => {
      events.forEach((e) => document.removeEventListener(e, trigger));
    };
  }, [pathname, isVip]);

  return null;
}
