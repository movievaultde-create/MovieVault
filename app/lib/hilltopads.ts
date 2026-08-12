/** movie-vault.dev — Zone #7313277 Popunder Direct URL (opens on real click). */
const DEFAULT_POPUNDER_SRC =
  "https://plump-plastic.com/bZ3/VZ0/P.3Jpuv/bLmVVyJ/Z-DP0q3MMgzHEtzyM/j/cE3dLFT-cSz/MITUMOy/OlDjEk";

/**
 * Zone #7313293 Multitag-style script (HTML CODE) — locker + page banners.
 * Prefer a dedicated MultiTag 300x250 zone when you create one.
 */
const DEFAULT_BANNER_SRC =
  "//prizefamily.com/b.XgVrsTdQGWlh0/YVWycv/xeRms9euMZWUulikzPFTLcXz/MDT_MPyJO/TNMttcN/zXMExTMpzOI/5LNswZ";

/** movie-vault.dev — Zone #7313317 Direct Link. */
const DEFAULT_DIRECT_URL = "https://plump-plastic.com/7DApnl";
function normalizeHilltopScriptUrl(raw: string) {
  if (raw.startsWith("//")) return `https:${raw}`;
  return raw;
}

/** Script hosts vs Direct Link domains (plump-plastic Direct URLs are not inject-able scripts). */
export function isHilltopScriptUrl(raw: string) {
  const url = normalizeHilltopScriptUrl(raw.trim());
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return /prizefamily|funny-tooth|amazing-population|shiny-fortune/i.test(host);
  } catch {
    return false;
  }
}

let vipMuted = false;

/** Called from VipContext so Hilltop stays off for VIP. */
export function setHilltopVipMuted(muted: boolean) {
  vipMuted = muted;
}

export function isHilltopAdsEnabled() {
  if (vipMuted) return false;
  return process.env.NEXT_PUBLIC_HILLTOPADS_ENABLED !== "false";
}

export function getHilltopAdsPopunderUrl() {
  const raw =
    process.env.NEXT_PUBLIC_HILLTOPADS_POPUNDER_URL?.trim() || DEFAULT_POPUNDER_SRC;
  return normalizeHilltopScriptUrl(raw);
}

export function getHilltopAdsBannerUrl() {
  const raw =
    process.env.NEXT_PUBLIC_HILLTOPADS_BANNER_URL?.trim() || DEFAULT_BANNER_SRC;
  return normalizeHilltopScriptUrl(raw);
}

export function getHilltopAdsBottomBannerUrl() {
  const raw =
    process.env.NEXT_PUBLIC_HILLTOPADS_BOTTOM_BANNER_URL?.trim() ||
    process.env.NEXT_PUBLIC_HILLTOPADS_BANNER_URL?.trim() ||
    DEFAULT_BANNER_SRC;
  return normalizeHilltopScriptUrl(raw);
}

/** MultiTag video slider script — only when env is set. */
export function getHilltopAdsVideoSliderUrl() {
  const raw = process.env.NEXT_PUBLIC_HILLTOPADS_VIDEO_SLIDER_URL?.trim() ?? "";
  if (!raw) return "";
  return normalizeHilltopScriptUrl(raw);
}

/** VAST tag — leave empty (IMA overlay often breaks the player). */
export function getHilltopAdsVastUrl() {
  const raw = process.env.NEXT_PUBLIC_HILLTOPADS_VAST_URL?.trim() ?? "";
  if (!raw) return "";
  return normalizeHilltopScriptUrl(raw);
}

export function getHilltopAdsDirectUrl() {
  const raw = process.env.NEXT_PUBLIC_HILLTOPADS_DIRECT_URL?.trim() || DEFAULT_DIRECT_URL;
  if (!raw) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  return raw;
}

export function getWatchAdExitPath(lockKey: string, returnPath: string) {
  const params = new URLSearchParams({
    k: lockKey,
    return: returnPath,
  });
  return `/out/ad?${params.toString()}`;
}

/** Center overlay inside the player — defaults to Banner 300x250 zone. */
export function getHilltopAdsPlayerOverlayUrl() {
  const raw =
    process.env.NEXT_PUBLIC_HILLTOPADS_PLAYER_OVERLAY_URL?.trim() ||
    process.env.NEXT_PUBLIC_HILLTOPADS_BANNER_URL?.trim() ||
    DEFAULT_BANNER_SRC;
  return normalizeHilltopScriptUrl(raw);
}
