"use client";

import { isAdsterraEnabled } from "../../lib/adsterra";
import { useLang } from "../../context/LanguageContext";

type WatchServerLoadingAdProps = {
  lockKey: string;
};

export function WatchServerLoadingAd({ lockKey: _lockKey }: WatchServerLoadingAdProps) {
  const { isAr } = useLang();
  const showBanner = isAdsterraEnabled();

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-[#050508]">
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] rounded-3xl border border-white/12 bg-gradient-to-b from-[#12131a] to-[#0a0a10] p-5 text-center">
          <h2 className="text-lg font-black text-white sm:text-xl">
            {isAr ? "جاري التحميل" : "Loading"}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            {isAr ? "جاري البحث عن سيرفر" : "Looking for a server"}
          </p>
          {showBanner ? (
            <p className="mt-3 text-xs text-white/45">
              {isAr ? "الإعلان يظهر فوق المشغّل" : "The ad is above the player"}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            <p className="text-sm font-semibold text-white/70">
              {isAr ? "جاري البحث عن سيرفر…" : "Searching for a server…"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
