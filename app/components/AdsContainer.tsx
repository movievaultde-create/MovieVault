"use client";

import { useEffect, useState, useRef } from "react";
import { useVip } from "../context/VipContext";

// ─── Placeholder URLs — replace with your real HilltopAds codes ───
const HILLTOP_BANNER_SCRIPT = "YOUR_HILLTOP_728x90_BANNER_SCRIPT_URL";
const HILLTOP_SOCIAL_BAR_SCRIPT = "YOUR_HILLTOP_SOCIAL_BAR_SCRIPT_URL";
const HILLTOP_POPUNDER_SCRIPT = "YOUR_HILLTOP_POPUNDER_SCRIPT_URL";
// ──────────────────────────────────────────────────────────────────

const AD_LOAD_DELAY = 3000;

function isPlaceholder(url: string) {
  return url.startsWith("YOUR_");
}

export default function AdsContainer() {
  const { isVip } = useVip();
  const [loaded, setLoaded] = useState(false);
  const popunderFiredRef = useRef(false);

  useEffect(() => {
    if (isVip) return;

    const timer = setTimeout(() => {
      setLoaded(true);

      // Banner Ad (728x90)
      if (!isPlaceholder(HILLTOP_BANNER_SCRIPT)) {
        injectScript(HILLTOP_BANNER_SCRIPT, "hilltop-banner-script");
      }

      // Social Bar
      if (!isPlaceholder(HILLTOP_SOCIAL_BAR_SCRIPT)) {
        injectScript(HILLTOP_SOCIAL_BAR_SCRIPT, "hilltop-social-bar-script");
      }

      // Popunder (trigger on first click)
      if (!isPlaceholder(HILLTOP_POPUNDER_SCRIPT)) {
        injectScript(HILLTOP_POPUNDER_SCRIPT, "hilltop-popunder-script");
      }
    }, AD_LOAD_DELAY);

    return () => clearTimeout(timer);
  }, [isVip]);

  // Popunder first-click trigger
  useEffect(() => {
    if (isVip || isPlaceholder(HILLTOP_POPUNDER_SCRIPT)) return;

    const handleClick = () => {
      if (popunderFiredRef.current) return;
      popunderFiredRef.current = true;
    };

    document.addEventListener("click", handleClick, { once: true, passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [isVip, loaded]);

  if (isVip) return null;

  return (
    <>
      {/* 728x90 Banner — Top of page, below navbar */}
      {loaded && !isPlaceholder(HILLTOP_BANNER_SCRIPT) && (
        <div className="mx-auto flex max-w-[1400px] items-center justify-center px-4 pt-2">
          <div
            id="hilltop-banner-container"
            className="flex items-center justify-center overflow-hidden rounded-lg"
            style={{ minHeight: 90, minWidth: 320 }}
          />
        </div>
      )}

      {/* Social Bar — Floating bottom right */}
      {loaded && !isPlaceholder(HILLTOP_SOCIAL_BAR_SCRIPT) && (
        <div id="hilltop-social-bar-container" />
      )}
    </>
  );
}

function injectScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
}
