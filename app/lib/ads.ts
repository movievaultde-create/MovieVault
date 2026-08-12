import { fireHilltopOfferClick } from "./hilltopOfferClick";

// HilltopAds Direct Link — Zone #6821389 (legacy waterfall fallback)
const HILLTOP_URL =
  "https://shiny-fortune.com/dim.FRzldWG/Npv/ZOGlUg/jeemU9rudZfUWl/kWPFTyY-4sMajXEHziO/D/kstFNvjvgtySMmTMMV5-Mfwv";

// HilltopAds Direct URL — Zone #6821405
const HILLTOP_URL_2 =
  "https://amazing-population.com/bv3WV.0APR3-pcvEb-m/VyJVZ_DE0g2nOzDhI/xUNLDTAa1jLrTWY/4AMAjNEy0IMZDXkE";

const STORAGE_KEY_PREFIX = "mv_ad_idx";
const EXOCLICK_URL = process.env.NEXT_PUBLIC_EXOCLICK_URL?.trim();
const ADSTERRA_URL = process.env.NEXT_PUBLIC_ADSTERRA_URL?.trim();

type TrafficTier = "tier1" | "tier2" | "tier3";

const TIER1_GEOS = new Set([
  "US", "CA", "GB", "DE", "FR", "AU", "NL", "SE", "NO", "DK", "CH", "AT", "BE", "IE", "NZ",
]);
const TIER2_GEOS = new Set([
  "AE", "SA", "KW", "QA", "TR", "ES", "IT", "PL", "CZ", "PT", "BR", "MX", "CL", "AR", "ZA",
]);

let lastTrigger = 0;
const COOLDOWN_MS = 5_000;
let vipMode = false;

function getRegionCode(): string | undefined {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const lang of langs) {
      const m = lang.match(/[-_](\w{2})$/);
      if (m?.[1]) return m[1].toUpperCase();
    }
  } catch {
    // ignore
  }
  return undefined;
}

function getTrafficTier(): TrafficTier {
  const region = getRegionCode();
  if (region && TIER1_GEOS.has(region)) return "tier1";
  if (region && TIER2_GEOS.has(region)) return "tier2";
  return "tier3";
}

function getRotationForTier(tier: TrafficTier): string[] {
  const pool: string[] = [];

  // Revenue-first waterfall by geo tier.
  if (tier === "tier1") {
    pool.push(HILLTOP_URL_2, HILLTOP_URL, HILLTOP_URL_2, HILLTOP_URL);
    if (EXOCLICK_URL) pool.push(EXOCLICK_URL);
    if (ADSTERRA_URL) pool.push(ADSTERRA_URL);
  } else if (tier === "tier2") {
    pool.push(HILLTOP_URL, HILLTOP_URL_2, HILLTOP_URL);
    if (ADSTERRA_URL) pool.push(ADSTERRA_URL);
    if (EXOCLICK_URL) pool.push(EXOCLICK_URL);
  } else {
    pool.push(HILLTOP_URL, HILLTOP_URL_2);
    if (ADSTERRA_URL) pool.push(ADSTERRA_URL);
  }

  return pool.length ? pool : [HILLTOP_URL, HILLTOP_URL_2];
}

function getStartAdForTier(tier: TrafficTier): string {
  return tier === "tier1" ? HILLTOP_URL_2 : HILLTOP_URL;
}

function getStoredIndex(tier: TrafficTier): number {
  const key = `${STORAGE_KEY_PREFIX}_${tier}`;
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setStoredIndex(tier: TrafficTier, i: number) {
  const key = `${STORAGE_KEY_PREFIX}_${tier}`;
  try { localStorage.setItem(key, String(i)); } catch {}
}

export function setVipMode(v: boolean) {
  vipMode = v;
}

export function getAdUrl(): string {
  const tier = getTrafficTier();
  const rotation = getRotationForTier(tier);
  const idx = getStoredIndex(tier);
  const url = rotation[idx % rotation.length];
  setStoredIndex(tier, idx + 1);
  return url;
}

// Hard open for Start button — Hilltop Direct + Popunder on real click.
export function triggerStartAd(): boolean {
  if (vipMode) return false;
  try {
    fireHilltopOfferClick("start-watching");
    return true;
  } catch {
    return false;
  }
}

export function triggerPopunder(options?: { force?: boolean }): boolean {
  if (vipMode) return false;

  const force = options?.force ?? false;
  const now = Date.now();
  if (!force && now - lastTrigger < COOLDOWN_MS) return false;
  lastTrigger = now;

  const adUrl = getAdUrl();
  let opened = false;

  try {
    const adWin = window.open("about:blank", "_blank");

    window.focus();
    document.body.focus();

    if (adWin) {
      opened = true;
      setTimeout(() => {
        try {
          adWin.location.href = adUrl;
        } catch {
          try { adWin.location.replace(adUrl); } catch {}
        }
      }, 50);

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          try { window.focus(); } catch {}
        }, i * 100);
      }
    }
  } catch {
    // fallback below
  }

  if (!opened) {
    try {
      const fallback = window.open(adUrl, "_blank", "noopener,noreferrer");
      if (fallback) {
        opened = true;
      }
      setTimeout(() => { try { window.focus(); } catch {} }, 100);
    } catch {
      // blocked
    }
  }

  return opened;
}

export { HILLTOP_URL, HILLTOP_URL_2 };
