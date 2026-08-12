"use client";

import { HilltopAdsBannerFrame } from "./HilltopAdsBannerFrame";
import { getHilltopAdsBannerUrl, isHilltopAdsEnabled } from "../../lib/hilltopads";
import { fireHilltopOfferClick } from "../../lib/hilltopOfferClick";
import { useLang } from "../../context/LanguageContext";

type InGridAdCardProps = {
  size?: "sm" | "md" | "lg";
  /** Unique slot id so multiple iframes do not collide. */
  slotId?: string | number;
};

/**
 * Native-looking Hilltop slot sized like a poster — sits between catalog cards.
 * Entire card is clickable so empty fills still open Direct Link / Popunder.
 */
export function InGridAdCard({ size = "md", slotId = "1" }: InGridAdCardProps) {
  const { isAr } = useLang();
  const enabled = isHilltopAdsEnabled();
  const scriptUrl = getHilltopAdsBannerUrl();

  if (!enabled || !scriptUrl) return null;

  const label = isAr ? "إعلان" : "Ad";
  const sponsored = isAr ? "إعلان ممول" : "Sponsored";

  function onCardClick() {
    fireHilltopOfferClick(`in-grid-${slotId}`);
  }

  return (
    <button
      type="button"
      onClick={onCardClick}
      className="group block w-full cursor-pointer text-start"
      data-in-grid-ad={String(slotId)}
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm ${
          size === "lg" ? "rounded-2xl" : ""
        }`}
      >
        <div className="relative aspect-[2/3] bg-[var(--bg-elevated)]">
          <span className="absolute start-2 top-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {label}
          </span>
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-1">
            <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden">
              <div className="origin-center scale-[0.42] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.6]">
                <HilltopAdsBannerFrame
                  key={`hilltop-frame-${slotId}`}
                  scriptUrl={scriptUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p
        className={`mt-2 line-clamp-2 font-bold text-[var(--text-dim)] ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {sponsored}
      </p>
    </button>
  );
}
