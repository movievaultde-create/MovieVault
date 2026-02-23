// Adsterra Smartlink
const ADSTERRA_URL =
  "https://www.effectivegatecpm.com/ksx3jaie5?key=e46ad7ef9f7376acad63fe30acbfcbff";

// HilltopAds Direct Link — Zone #6821389
const HILLTOP_URL =
  "https://shiny-fortune.com/d.m/Fvz0dLG/N_vqZYGYUx/yeCm/9lucZMU_L/kcPmTsY/4DMVj/Ewz_00DBk/trNbjvgNyMoT/Ma5xM/wv";

let lastTrigger = 0;
const COOLDOWN_MS = 3_000;
let vipMode = false;
let clickCount = 0;

export function setVipMode(v: boolean) {
  vipMode = v;
}

function getAdUrl(): string {
  // Alternate between Adsterra and HilltopAds for max revenue
  clickCount++;
  return clickCount % 2 === 1 ? HILLTOP_URL : ADSTERRA_URL;
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

export { ADSTERRA_URL, HILLTOP_URL };
