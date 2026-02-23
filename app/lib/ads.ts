// Adsterra Smartlink
const ADSTERRA_URL =
  "https://www.effectivegatecpm.com/ksx3jaie5?key=e46ad7ef9f7376acad63fe30acbfcbff";

// HilltopAds Direct Link — Zone #6821389
const HILLTOP_URL =
  "https://shiny-fortune.com/d.m/Fvz0dLG/N_vqZYGYUx/yeCm/9lucZMU_L/kcPmTsY/4DMVj/Ewz_00DBk/trNbjvgNyMoT/Ma5xM/wv";

// HilltopAds Direct URL — Zone #6821405
const HILLTOP_URL_2 =
  "https://amazing-population.com/b/3DVJ0oP.3vpovTbMm/V/J_Z/Du0e2QOEDUI/x/NqDBAI1/LHTeYp4UMdj/E/0pMfDnkJ";

let lastTrigger = 0;
const COOLDOWN_MS = 3_000;
let vipMode = false;
let clickCount = 0;

export function setVipMode(v: boolean) {
  vipMode = v;
}

const AD_ROTATION = [HILLTOP_URL, HILLTOP_URL_2, ADSTERRA_URL];

function getAdUrl(): string {
  const url = AD_ROTATION[clickCount % AD_ROTATION.length];
  clickCount++;
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

export { ADSTERRA_URL, HILLTOP_URL };
