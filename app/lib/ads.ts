// HilltopAds Direct Link — Zone #6821389
const HILLTOP_URL =
  "https://shiny-fortune.com/dim.FRzldWG/Npv/ZOGlUg/jeemU9rudZfUWl/kWPFTyY-4sMajXEHziO/D/kstFNvjvgtySMmTMMV5-Mfwv";

// HilltopAds Direct URL — Zone #6821405
const HILLTOP_URL_2 =
  "https://amazing-population.com/bv3WV.0APR3-pcvEb-m/VyJVZ_DE0g2nOzDhI/xUNLDTAa1jLrTWY/4AMAjNEy0IMZDXkE";

// Prioritize higher-value Hilltop links first, keep EffectiveGate as secondary.
const AD_ROTATION = [
  HILLTOP_URL,
  HILLTOP_URL_2,
  HILLTOP_URL,
  HILLTOP_URL_2,
];
const HIGH_VALUE_START_AD = HILLTOP_URL;
const STORAGE_KEY = "mv_ad_idx";

let lastTrigger = 0;
const COOLDOWN_MS = 5_000;
let vipMode = false;

function getStoredIndex(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setStoredIndex(i: number) {
  try { localStorage.setItem(STORAGE_KEY, String(i)); } catch {}
}

export function setVipMode(v: boolean) {
  vipMode = v;
}

export function getAdUrl(): string {
  const idx = getStoredIndex();
  const url = AD_ROTATION[idx % AD_ROTATION.length];
  setStoredIndex(idx + 1);
  return url;
}

// Hard open for Start button to maximize reliability.
export function triggerStartAd(): boolean {
  if (vipMode) return false;

  const adUrl = HIGH_VALUE_START_AD;
  let opened = false;

  try {
    const win = window.open(adUrl, "_blank", "noopener,noreferrer");
    if (win) opened = true;
  } catch {
    // try fallback below
  }

  if (!opened) {
    try {
      const a = document.createElement("a");
      a.href = adUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      opened = true;
    } catch {
      // blocked
    }
  }

  return opened;
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
