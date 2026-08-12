"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HilltopAdsBanner } from "./HilltopAdsBanner";
import { HilltopAdsPopunder } from "./HilltopAdsPopunder";
import {
  getHilltopAdsBannerUrl,
  getHilltopAdsBottomBannerUrl,
  getHilltopAdsPopunderUrl,
  isHilltopAdsEnabled,
} from "../../lib/hilltopads";
import {
  getWatchAdLockerActive,
  subscribeWatchAdLockerActive,
} from "../../lib/adLockerActive";

type WatchSiteAdsProps = {
  variant?: "banner" | "popunder" | "site" | "both";
  placement?: "top" | "bottom";
};

function isAdsBlockedPath(pathname: string) {
  return (
    pathname.startsWith("/out/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/vip") ||
    pathname.startsWith("/dashboard")
  );
}

function bannerShellClass(placement: "top" | "bottom") {
  return placement === "bottom"
    ? "mt-4 flex justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-3"
    : "mb-4 flex justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-3";
}

export function WatchSiteAds({ variant = "both", placement = "top" }: WatchSiteAdsProps) {
  const pathname = usePathname();
  const [bannerGone, setBannerGone] = useState(false);
  const [bannerFilled, setBannerFilled] = useState(false);
  const [lockerActive, setLockerActive] = useState(
    () => (pathname.startsWith("/watch") ? true : getWatchAdLockerActive()),
  );

  useEffect(() => {
    setBannerGone(false);
    setBannerFilled(false);
  }, [pathname, placement]);

  useEffect(() => {
    return subscribeWatchAdLockerActive(() => setLockerActive(getWatchAdLockerActive()));
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/watch")) {
      setLockerActive(getWatchAdLockerActive());
      return;
    }
    setLockerActive(true);
    const id = window.requestAnimationFrame(() => {
      setLockerActive(getWatchAdLockerActive());
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  if (isAdsBlockedPath(pathname)) return null;

  const wantPopunder =
    !pathname.startsWith("/watch") &&
    (variant === "popunder" || variant === "site" || variant === "both");
  const wantBanner =
    !lockerActive &&
    (variant === "banner" || variant === "site" || variant === "both");

  const hilltopEnabled = isHilltopAdsEnabled();
  const hilltopPopunder = getHilltopAdsPopunderUrl();
  const hilltopBanner =
    placement === "bottom" ? getHilltopAdsBottomBannerUrl() : getHilltopAdsBannerUrl();
  const showHilltopPopunder = wantPopunder && hilltopEnabled && Boolean(hilltopPopunder);
  const showHilltopBanner = wantBanner && hilltopEnabled && Boolean(hilltopBanner) && !bannerGone;

  if (!showHilltopPopunder && !showHilltopBanner) {
    return null;
  }

  const renderBanner = variant === "banner" || variant === "both" || variant === "site";

  return (
    <>
      {showHilltopPopunder ? <HilltopAdsPopunder scriptUrl={hilltopPopunder} /> : null}
      {renderBanner && showHilltopBanner ? (
        <div
          className={
            bannerFilled
              ? bannerShellClass(placement)
              : "flex justify-center overflow-hidden"
          }
        >
          <HilltopAdsBanner
            key={`hilltop-${placement}-${pathname}`}
            scriptUrl={hilltopBanner}
            collapseIfEmpty
            onFilled={() => setBannerFilled(true)}
            onEmpty={() => setBannerGone(true)}
          />
        </div>
      ) : null}
    </>
  );
}
