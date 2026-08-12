"use client";

import { WatchSiteAds } from "./WatchSiteAds";

/** Bottom slots on watch pages: Hilltop Multitag. */
export function WatchPageBottomAds() {
  return (
    <div className="mt-4 space-y-3">
      <WatchSiteAds variant="banner" placement="bottom" />
    </div>
  );
}
