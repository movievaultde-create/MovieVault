"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { HilltopAdsBannerFrame } from "./HilltopAdsBannerFrame";
import {
  getWatchAdLockerActive,
  subscribeWatchAdLockerActive,
} from "../../lib/adLockerActive";
import {
  getHilltopAdsBannerUrl,
  getHilltopAdsDirectUrl,
  isHilltopAdsEnabled,
} from "../../lib/hilltopads";
import { fireHilltopOfferClick } from "../../lib/hilltopOfferClick";

const INTERVAL_MS = 20_000;
const FIRST_DELAY_MS = 3_000;

/**
 * Light interstitial on navigation. Portaled to document.body above site chrome.
 */
export function InterstitialAdModal() {
  const pathname = usePathname();
  const enabled = isHilltopAdsEnabled();
  const bannerUrl = getHilltopAdsBannerUrl();
  const hasOffer = Boolean(getHilltopAdsDirectUrl() || bannerUrl);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [gateKey, setGateKey] = useState(0);
  const [lockerActive, setLockerActive] = useState(false);
  const resumeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLockerActive(getWatchAdLockerActive());
    return subscribeWatchAdLockerActive(() => setLockerActive(getWatchAdLockerActive()));
  }, []);

  useEffect(() => {
    if (!enabled || !hasOffer) return;
    if (pathname.startsWith("/watch") || pathname.startsWith("/out/") || pathname.startsWith("/vip")) {
      setOpen(false);
      return;
    }

    let cancelled = false;
    let showTimer: number | undefined;

    const scheduleShow = (delay: number) => {
      window.clearTimeout(showTimer);
      window.clearTimeout(resumeTimerRef.current);
      showTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (getWatchAdLockerActive()) {
          scheduleShow(5_000);
          return;
        }
        setGateKey((k) => k + 1);
        setOpen(true);
      }, delay);
    };

    setOpen(false);
    scheduleShow(FIRST_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(showTimer);
      window.clearTimeout(resumeTimerRef.current);
    };
  }, [enabled, hasOffer, pathname]);

  useEffect(() => {
    if (!open || !lockerActive) return;
    setOpen(false);
  }, [open, lockerActive]);

  function scheduleNext() {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      if (getWatchAdLockerActive()) {
        scheduleNext();
        return;
      }
      setGateKey((k) => k + 1);
      setOpen(true);
    }, INTERVAL_MS);
  }

  function dismiss() {
    setOpen(false);
    scheduleNext();
  }

  function onAnyAction(marker: string) {
    fireHilltopOfferClick(marker);
    dismiss();
  }

  if (!mounted || !enabled || !hasOffer || !open || lockerActive) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
      data-site-ui="1"
      data-interstitial-ad="1"
    >
      <div className="relative w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
        <span className="absolute start-3 top-3 z-10 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Ad
        </span>
        <button
          type="button"
          onClick={() => onAnyAction("interstitial-x")}
          className="absolute end-2 top-2 z-10 rounded-md px-2 py-1 text-sm font-semibold text-black/55 hover:bg-black/5"
          aria-label="إغلاق"
        >
          ✕
        </button>

        <button
          type="button"
          onClick={() => onAnyAction("interstitial-banner")}
          className="mx-auto mt-8 block w-full max-w-[300px] cursor-pointer overflow-hidden rounded-xl border border-black/5 bg-[#0a0a10] p-1 text-start"
        >
          {bannerUrl ? (
            <div className="pointer-events-none flex min-h-[250px] items-center justify-center">
              <HilltopAdsBannerFrame
                key={`interstitial-banner-${gateKey}`}
                scriptUrl={bannerUrl}
              />
            </div>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <span className="text-3xl" aria-hidden>
                ▶
              </span>
              <p className="text-sm font-bold text-white">اضغط للمتابعة</p>
            </div>
          )}
        </button>

        <div className="flex gap-2 p-3 pt-3">
          <button
            type="button"
            onClick={() => onAnyAction("interstitial-close")}
            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-bold text-black/80 hover:bg-black/5"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={() => onAnyAction("interstitial-continue")}
            className="flex-[1.4] rounded-xl bg-[var(--accent)] px-3 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110"
          >
            استمر
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
