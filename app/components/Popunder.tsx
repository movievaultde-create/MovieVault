"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { triggerPopunder } from "../lib/ads";

export default function Popunder() {
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
  }, [pathname]);

  return null;
}
