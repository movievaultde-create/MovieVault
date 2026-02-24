"use client";

import { useEffect, useState } from "react";
import { useVip } from "../context/VipContext";

const FIRST_CHECK_MS = 1200;
const SCRIPT_TIMEOUT_MS = 3000;
const MAX_CHECK_WINDOW_MS = 9000;
const CHECK_INTERVAL_MS = 1200;

export default function AntiAdblock() {
  const { isVip } = useVip();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Keep VIP bypass behavior as requested previously.
    if (isVip) return;

    let cancelled = false;
    let loadedProbeCount = 0;
    let fetchBlocked = false;
    const cleanupTimers: Array<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>> = [];
    const baits: HTMLDivElement[] = [];
    const scripts: HTMLScriptElement[] = [];

    const markBlocked = () => {
      if (!cancelled) {
        setBlocked(true);
      }
    };

    const createBait = (id: string, className: string) => {
      const bait = document.createElement("div");
      bait.id = id;
      bait.className = className;
      bait.setAttribute("aria-hidden", "true");
      bait.style.position = "absolute";
      bait.style.left = "-9999px";
      bait.style.top = "-9999px";
      bait.style.width = "1px";
      bait.style.height = "1px";
      document.body.appendChild(bait);
      baits.push(bait);
    };

    createBait("adsbox", "adsbox ad-banner ad adsbygoogle pub_300x250");
    createBait("google_ads_iframe_test", "google-ad ad-unit ad-placement");

    const hasHiddenBait = () => {
      return baits.some((bait) => {
        const style = window.getComputedStyle(bait);
        return (
          bait.offsetHeight === 0 ||
          bait.offsetWidth === 0 ||
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        );
      });
    };

    const inspectBaits = () => {
      if (hasHiddenBait()) {
        markBlocked();
      }
    };

    const probeScript = (src: string) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        loadedProbeCount += 1;
      };
      script.onerror = markBlocked;
      scripts.push(script);
      document.body.appendChild(script);
    };

    // Network probes: if these ad scripts are blocked, onerror fires.
    probeScript("https://a.pemsrv.com/popunder1000.js");
    probeScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");

    // Fallback: some blockers fail silently (no onerror).
    cleanupTimers.push(
      setTimeout(() => {
        if (loadedProbeCount === 0 && (fetchBlocked || hasHiddenBait())) {
          markBlocked();
        }
      }, SCRIPT_TIMEOUT_MS)
    );
    cleanupTimers.push(setTimeout(inspectBaits, FIRST_CHECK_MS));
    const intervalId = setInterval(inspectBaits, CHECK_INTERVAL_MS);
    cleanupTimers.push(intervalId);
    cleanupTimers.push(
      setTimeout(() => {
        clearInterval(intervalId);
      }, MAX_CHECK_WINDOW_MS)
    );

    // Additional fetch probe for blockers that block request APIs.
    fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      mode: "no-cors",
      cache: "no-store",
    }).catch(() => {
      fetchBlocked = true;
      if (hasHiddenBait()) {
        markBlocked();
      }
    });

    return () => {
      cancelled = true;
      cleanupTimers.forEach((t) => {
        clearTimeout(t as ReturnType<typeof setTimeout>);
        clearInterval(t as ReturnType<typeof setInterval>);
      });
      baits.forEach((b) => b.remove());
      scripts.forEach((s) => s.remove());
    };
  }, [isVip]);

  if (isVip || !blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-red-700/60 bg-white p-6 text-center shadow-2xl">
        <div className="mb-3 text-4xl">🛑</div>
        <h2 className="mb-2 text-2xl font-extrabold text-zinc-900">
          يبدو أنك تستخدم مانع إعلانات
        </h2>
        <p className="mb-2 text-sm text-zinc-700">
          الرجاء تعطيل مانع الإعلانات لمتابعة مشاهدة المحتوى على MovieVault.
        </p>
        <p className="text-xs text-zinc-500">
          Please disable AdBlock to continue using MovieVault.
        </p>
      </div>
    </div>
  );
}
