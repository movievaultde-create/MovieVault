"use client";

import { useEffect, useState } from "react";
import { HilltopAdsBannerFrame } from "./HilltopAdsBannerFrame";
import { fireHilltopOfferClick } from "../../lib/hilltopOfferClick";
import { getHilltopAdsBannerUrl, getHilltopAdsPopunderUrl } from "../../lib/hilltopads";
import { HilltopAdsPopunder } from "./HilltopAdsPopunder";
import { useLang } from "../../context/LanguageContext";

export type PlaybackAdMode = "midroll" | "seek";

type WatchPlaybackAdGateProps = {
  mode: PlaybackAdMode;
  gateKey: string;
  onUnlocked: () => void;
};

const READY_SECONDS = 2;

/**
 * In-player gate:
 * - midroll → 1 offer tap
 * - seek (ff/rewind) → 2 offer taps
 */
export function WatchPlaybackAdGate({ mode, gateKey, onUnlocked }: WatchPlaybackAdGateProps) {
  const { isAr } = useLang();
  const bannerUrl = getHilltopAdsBannerUrl();
  const popunderUrl = getHilltopAdsPopunderUrl();
  const tapsNeeded = mode === "seek" ? 2 : 1;
  const [ready, setReady] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(READY_SECONDS);
  const [tapStep, setTapStep] = useState(0);

  useEffect(() => {
    setReady(false);
    setSecondsLeft(READY_SECONDS);
    setTapStep(0);
    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(tick);
          setReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [gateKey, mode]);

  function onTap() {
    if (!ready) return;
    fireHilltopOfferClick(`playback-${mode}`);
    if (tapStep + 1 >= tapsNeeded) {
      onUnlocked();
      return;
    }
    setTapStep((n) => n + 1);
  }

  const title =
    mode === "seek"
      ? isAr
        ? "تابع المشاهدة"
        : "Continue watching"
      : isAr
        ? "فاصل إعلاني"
        : "Ad break";
  const body =
    mode === "seek"
      ? isAr
        ? "اضغط مرتين للمتابعة بعد التقديم/الترجيع"
        : "Tap twice to continue after seek"
      : isAr
        ? "اضغط للمتابعة"
        : "Tap to continue";
  const buttonLabel = !ready
    ? isAr
      ? `انتظر ${Math.max(secondsLeft, 1)}…`
      : `Wait ${Math.max(secondsLeft, 1)}…`
    : tapsNeeded === 1
      ? isAr
        ? "اضغط للمتابعة"
        : "Tap to continue"
      : tapStep === 0
        ? isAr
          ? "اضغط للمتابعة"
          : "Tap to continue"
        : isAr
          ? "اضغط مرة أخرى"
          : "Tap again";

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      data-playback-ad-gate={mode}
    >
      {popunderUrl ? (
        <HilltopAdsPopunder key={`play-pop-${gateKey}`} scriptUrl={popunderUrl} />
      ) : null}

      <div className="w-full max-w-[380px] rounded-3xl border border-white/12 bg-gradient-to-b from-[#12131a] to-[#0a0a10] p-4 text-center shadow-2xl sm:p-5">
        <h2 className="text-lg font-black text-white sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-white/55">{body}</p>

        {bannerUrl ? (
          <div className="mx-auto mt-3 flex min-h-[250px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a10] p-1">
            <HilltopAdsBannerFrame key={`play-banner-${gateKey}`} scriptUrl={bannerUrl} />
          </div>
        ) : null}

        {ready && tapsNeeded === 2 ? (
          <p className="mt-3 text-[11px] font-bold text-orange-300/90">
            {isAr ? `الخطوة ${tapStep + 1} من 2` : `Step ${tapStep + 1} of 2`}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onTap}
          disabled={!ready}
          className="btn-primary mt-3 w-full !rounded-2xl !py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-45"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
