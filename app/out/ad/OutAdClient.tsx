"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HilltopAdsBanner } from "../../components/ads/HilltopAdsBanner";
import { HilltopAdsPopunder } from "../../components/ads/HilltopAdsPopunder";
import {
  getHilltopAdsBannerUrl,
  getHilltopAdsDirectUrl,
  getHilltopAdsPopunderUrl,
  isHilltopAdsEnabled,
} from "../../lib/hilltopads";

const PASS_PREFIX = "watch_ad_pass:";

function injectPopunder(scriptUrl: string) {
  const url = scriptUrl.trim();
  if (!url) return;
  document.querySelectorAll('script[data-hilltop-popunder="out-ad"]').forEach((node) => node.remove());
  const script = document.createElement("script");
  script.src = url.startsWith("//") ? `https:${url}` : url;
  script.async = true;
  script.dataset.hilltopPopunder = "out-ad";
  script.referrerPolicy = "no-referrer-when-downgrade";
  document.body.appendChild(script);
}

/**
 * Opened by «اضغط لمشاهدة»: banner in front + popunder behind.
 */
export default function OutAdClient() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return");
  const lockKey = searchParams.get("k") ?? "";
  const enabled = isHilltopAdsEnabled();
  const bannerUrl = getHilltopAdsBannerUrl();
  const popunderUrl = getHilltopAdsPopunderUrl();
  const directUrl = getHilltopAdsDirectUrl();
  const [ready, setReady] = useState(false);

  const safeReturn = useMemo(() => {
    if (!returnTo || typeof window === "undefined") return "";
    try {
      const url = new URL(returnTo, window.location.origin);
      if (url.origin !== window.location.origin) return "";
      return url.pathname + url.search + url.hash;
    } catch {
      return "";
    }
  }, [returnTo]);

  useEffect(() => {
    if (lockKey) {
      try {
        sessionStorage.setItem(`${PASS_PREFIX}${lockKey}`, "1");
      } catch {
        /* private mode */
      }
    }
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, [lockKey]);

  function finishAndReturn() {
    if (lockKey) {
      try {
        sessionStorage.setItem(`${PASS_PREFIX}${lockKey}`, "1");
      } catch {
        /* private mode */
      }
      try {
        window.opener?.postMessage(
          { type: "WATCH_AD_DONE", lockKey },
          window.location.origin,
        );
      } catch {
        /* ignore */
      }
    }

    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus();
      } catch {
        /* ignore */
      }
      window.close();
    }

    if (safeReturn) {
      window.location.href = safeReturn;
      return;
    }
    window.close();
  }

  function onTapToWatch() {
    if (!ready) return;

    if (enabled && popunderUrl) injectPopunder(popunderUrl);

    if (directUrl) {
      window.open(directUrl, "_blank");
    }

    window.setTimeout(finishAndReturn, 400);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07070c] px-4 py-10 text-white">
      {enabled && popunderUrl ? <HilltopAdsPopunder scriptUrl={popunderUrl} /> : null}

      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(234,88,12,0.45), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(249,115,22,0.2), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-orange-300">
          MovieVault
        </p>
        <h1 className="mt-3 text-center text-2xl font-black tracking-tight sm:text-3xl">
          إعلان مموّل
        </h1>
        <p className="mt-2 text-center text-sm text-white/65">
          اضغط «اضغط لمشاهدة» لفتح الإعلان، ثم تُعاد تلقائياً للمشاهدة.
        </p>

        <div className="mx-auto mt-6 flex min-h-[250px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
          {enabled && bannerUrl ? (
            <HilltopAdsBanner scriptUrl={bannerUrl} collapseIfEmpty={false} />
          ) : (
            <p className="px-4 text-center text-sm text-white/50">جاري تحميل الإعلان…</p>
          )}
        </div>

        <button
          type="button"
          onClick={onTapToWatch}
          disabled={!ready}
          className="btn-primary mt-6 w-full !rounded-2xl !py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          اضغط لمشاهدة
        </button>
        <p className="mt-3 text-center text-[11px] text-white/40">
          يفتح الإعلان (بانر + Popunder) ثم يعيدك للمشاهدة
        </p>
      </div>
    </div>
  );
}
