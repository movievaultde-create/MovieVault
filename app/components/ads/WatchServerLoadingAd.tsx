"use client";

import { useLayoutEffect } from "react";
import { HilltopAdsBannerFrame } from "./HilltopAdsBannerFrame";
import { HilltopAdsPopunder } from "./HilltopAdsPopunder";
import { setWatchAdLockerActive } from "../../lib/adLockerActive";
import {
  getHilltopAdsBannerUrl,
  getHilltopAdsPopunderUrl,
  isHilltopAdsEnabled,
} from "../../lib/hilltopads";
import { useLang } from "../../context/LanguageContext";

type WatchServerLoadingAdProps = {
  /** Stable key so banner remounts per episode resolve. */
  lockKey: string;
};

/**
 * Ad shell shown while servers switch — same look as the unlock modal,
 * without the two-tap gate (that appears after servers are ready).
 */
export function WatchServerLoadingAd({ lockKey }: WatchServerLoadingAdProps) {
  const { isAr } = useLang();
  const enabled = isHilltopAdsEnabled();
  const bannerUrl = getHilltopAdsBannerUrl();
  const popunderUrl = getHilltopAdsPopunderUrl();

  useLayoutEffect(() => {
    if (!enabled) return;
    setWatchAdLockerActive(true);
    return () => setWatchAdLockerActive(false);
  }, [enabled]);

  if (!enabled) {
    return (
      <div className="player-shell flex aspect-video items-center justify-center rounded-xl bg-black/90">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-2xl font-black tracking-wide text-white sm:text-3xl">
            {isAr ? "جاري التحميل" : "Loading"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-3" data-site-ui="1">
      {popunderUrl ? (
        <HilltopAdsPopunder key={`loading-pop-${lockKey}`} scriptUrl={popunderUrl} />
      ) : null}

      <div className="player-shell relative z-10 aspect-video overflow-hidden rounded-xl bg-[#050508]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(234,88,12,0.22), transparent 65%)",
          }}
        />

        <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-[#12131a] to-[#0a0a10] p-4 text-center shadow-[0_25px_80px_rgba(0,0,0,0.65)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-white/5">
              <div className="h-full w-1/3 animate-pulse bg-gradient-to-l from-orange-400 to-orange-600" />
            </div>

            <h2 className="mt-2 text-lg font-black text-white sm:text-xl">
              {isAr ? "جاري التحميل" : "Loading"}
            </h2>
            <p className="mt-1 text-sm text-white/55">
              {isAr ? "جاري بحث عن سيرفر" : "Looking for a server"}
            </p>

            {bannerUrl ? (
              <div className="mx-auto mt-3 flex min-h-[250px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a10] p-1">
                <HilltopAdsBannerFrame
                  key={`loading-banner-${lockKey}`}
                  scriptUrl={bannerUrl}
                />
              </div>
            ) : (
              <div className="mx-auto mt-3 flex h-[250px] max-w-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a10]">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              <p className="text-sm font-semibold text-white/70">
                {isAr ? "جاري بحث عن سيرفر…" : "Searching for a server…"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
