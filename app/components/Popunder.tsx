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
      cleanup();
    };

    const events = ["click", "touchstart"] as const;
    events.forEach((e) =>
      document.addEventListener(e, trigger, { once: true, passive: true })
    );

    function cleanup() {
      events.forEach((e) => document.removeEventListener(e, trigger));
    }

    return cleanup;
  }, [pathname, isVip]);

  return null;
}
