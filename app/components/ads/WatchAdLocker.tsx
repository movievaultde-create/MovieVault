"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { HilltopAdsBannerFrame } from "./HilltopAdsBannerFrame";
import { HilltopAdsPopunder } from "./HilltopAdsPopunder";
import { setWatchAdLockerActive } from "../../lib/adLockerActive";
import {
  getHilltopAdsBannerUrl,
  getHilltopAdsPopunderUrl,
  isHilltopAdsEnabled,
} from "../../lib/hilltopads";
import { fireHilltopOfferClick } from "../../lib/hilltopOfferClick";
import { useLang } from "../../context/LanguageContext";

export const WATCH_AD_LOCKER_EVENT = "watch-ad-locker-unlocked";

const AD_SECONDS = 4;
const PASS_PREFIX = "watch_ad_pass:";

export function isWatchAdLockerUnlocked(_lockKey?: string) {
  return false;
}

type WatchAdLockerProps = {
  children: ReactNode;
  lockKey: string;
};

type Phase = "ad" | "open";

function clearAllPasses() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PASS_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    /* private mode */
  }
}

/**
 * 4s wait → banner above CTA → two taps → unlock.
 * Re-rolls on every server / episode lockKey change.
 */
export function WatchAdLocker({ children, lockKey }: WatchAdLockerProps) {
  const { isAr } = useLang();
  const enabled = isHilltopAdsEnabled();
  const bannerUrl = getHilltopAdsBannerUrl();
  const popunderUrl = getHilltopAdsPopunderUrl();
  const [phase, setPhase] = useState<Phase>("ad");
  const [secondsLeft, setSecondsLeft] = useState(AD_SECONDS);
  const [timerDone, setTimerDone] = useState(false);
  const [tapStep, setTapStep] = useState(0);

  function startAd() {
    setPhase("ad");
    setSecondsLeft(AD_SECONDS);
    setTimerDone(false);
    setTapStep(0);
  }

  useEffect(() => {
    clearAllPasses();

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      clearAllPasses();
      if (enabled) startAd();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setPhase("open");
      return;
    }
    startAd();
  }, [enabled, lockKey]);

  useLayoutEffect(() => {
    const locking = Boolean(enabled && phase === "ad");
    setWatchAdLockerActive(locking);
    return () => setWatchAdLockerActive(false);
  }, [enabled, phase]);

  useEffect(() => {
    if (phase !== "ad") return;
    setSecondsLeft(AD_SECONDS);
    setTimerDone(false);
    setTapStep(0);
    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(tick);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [phase, lockKey]);

  function unlock() {
    setPhase("open");
    window.dispatchEvent(new Event(WATCH_AD_LOCKER_EVENT));
  }

  function onTapToWatch() {
    if (!timerDone) return;
    fireHilltopOfferClick("locker");
    if (tapStep === 0) {
      setTapStep(1);
      return;
    }
    unlock();
  }

  if (!enabled || phase === "open") {
    return <>{children}</>;
  }

  const progress = ((AD_SECONDS - secondsLeft) / AD_SECONDS) * 100;
  const stepLabel = isAr
    ? `الخطوة ${tapStep + 1} من 2`
    : `Step ${tapStep + 1} of 2`;
  const buttonLabel = !timerDone
    ? isAr
      ? `انتظر ${Math.max(secondsLeft, 1)}…`
      : `Wait ${Math.max(secondsLeft, 1)}…`
    : tapStep === 0
      ? isAr
        ? "اضغط للمتابعة"
        : "Tap to continue"
      : isAr
        ? "اضغط مرة أخرى للمشاهدة"
        : "Tap again to watch";

  return (
    <div className="relative space-y-3" data-site-ui="1">
      {phase === "ad" && popunderUrl ? (
        <HilltopAdsPopunder key={`locker-pop-${lockKey}`} scriptUrl={popunderUrl} />
      ) : null}

      <div className="player-shell relative z-10 aspect-video overflow-hidden rounded-xl bg-[#050508]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(234,88,12,0.22), transparent 65%)",
          }}
        />

        <div
          className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="watch-ad-locker-title"
        >
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-[#12131a] to-[#0a0a10] p-4 text-center shadow-[0_25px_80px_rgba(0,0,0,0.65)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
              <div
                className="h-full bg-gradient-to-l from-orange-400 to-orange-600 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h2
              id="watch-ad-locker-title"
              className="mt-2 text-lg font-black text-white sm:text-xl"
            >
              {isAr ? "جاري بحث عن سيرفر" : "Looking for a server"}
            </h2>
            <p className="mt-1 text-sm text-white/55">
              {isAr
                ? `يرجى الانتظار ${Math.max(secondsLeft, 0)} ثانية ثم اضغط مرتين`
                : `Please wait ${Math.max(secondsLeft, 0)}s, then tap twice`}
            </p>

            {bannerUrl ? (
              <div className="mx-auto mt-3 flex min-h-[250px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a10] p-1">
                <HilltopAdsBannerFrame
                  key={`locker-banner-${lockKey}`}
                  scriptUrl={bannerUrl}
                />
              </div>
            ) : (
              <div className="mx-auto mt-3 max-w-sm rounded-2xl border border-amber-400/25 bg-amber-400/5 px-4 py-3">
                <p className="text-xs font-semibold leading-relaxed text-amber-100">
                  {isAr
                    ? "اضغط الزر لفتح الإعلان ثم المشاهدة"
                    : "Tap the button to open the offer, then watch"}
                </p>
              </div>
            )}

            {timerDone ? (
              <p className="mt-3 text-[11px] font-bold tracking-wide text-orange-300/90">
                {stepLabel}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onTapToWatch}
              disabled={!timerDone}
              className="btn-primary mt-2 w-full !rounded-2xl !py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              {buttonLabel}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
              <span
                className={`h-2 w-2 rounded-full ${tapStep >= 0 && timerDone ? "bg-orange-400" : "bg-white/20"}`}
              />
              <span
                className={`h-2 w-2 rounded-full ${tapStep >= 1 ? "bg-orange-400" : "bg-white/20"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
