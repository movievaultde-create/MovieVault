// HilltopAds Direct Link — Zone #6821389
const HILLTOP_URL =
  "https://shiny-fortune.com/dim.FRzldWG/Npv/ZOGlUg/jeemU9rudZfUWl/kWPFTyY-4sMajXEHziO/D/kstFNvjvgtySMmTMMV5-Mfwv";

// HilltopAds Direct URL — Zone #6821405
const HILLTOP_URL_2 =
  "https://amazing-population.com/bv3WV.0APR3-pcvEb-m/VyJVZ_DE0g2nOzDhI/xUNLDTAa1jLrTWY/4AMAjNEy0IMZDXkE";

// EffectiveGate Smartlink — ID: 28679894
const EFFECTIVEGATE_ID = "28679894";
const EFFECTIVEGATE_URL =
  "https://www.effectivegatecpm.com/fxi219fn?key=394514b812e454d18ab09bc6b9eba0f6";

const AD_ROTATION = [HILLTOP_URL, HILLTOP_URL_2, EFFECTIVEGATE_URL];
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

export function triggerPopunder() {
  if (vipMode) return;

  const now = Date.now();
  if (now - lastTrigger < COOLDOWN_MS) return;
  lastTrigger = now;

  const adUrl = getAdUrl();

  try {
    const adWin = window.open("about:blank", "_blank");

    window.focus();
    document.body.focus();

    if (adWin) {
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
    try {
      const a = document.createElement("a");
      a.href = adUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => { try { window.focus(); } catch {} }, 100);
    } catch {
      // blocked
    }
  }
}

export { HILLTOP_URL, HILLTOP_URL_2, EFFECTIVEGATE_ID, EFFECTIVEGATE_URL };
