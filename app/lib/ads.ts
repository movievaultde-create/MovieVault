const AD_URL =
  "https://www.effectivegatecpm.com/ksx3jaie5?key=e46ad7ef9f7376acad63fe30acbfcbff";

let lastTrigger = 0;
const COOLDOWN_MS = 3_000;
let vipMode = false;

export function setVipMode(v: boolean) {
  vipMode = v;
}

export function triggerPopunder() {
  if (vipMode) return;

  const now = Date.now();
  if (now - lastTrigger < COOLDOWN_MS) return;
  lastTrigger = now;

  try {
    // Technique: open blank first, grab focus back, then navigate the background window
    const adWin = window.open("about:blank", "_blank");

    // Immediately reclaim focus before anything loads
    window.focus();
    document.body.focus();

    if (adWin) {
      // Small delay then navigate the background window to the ad
      setTimeout(() => {
        try {
          adWin.location.href = AD_URL;
        } catch {
          // cross-origin block - the window is already open, just redirect
          try { adWin.location.replace(AD_URL); } catch {}
        }
      }, 50);

      // Keep reclaiming focus aggressively
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          try { window.focus(); } catch {}
        }, i * 100);
      }
    }
  } catch {
    // Fallback: plain link click
    try {
      const a = document.createElement("a");
      a.href = AD_URL;
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

export { AD_URL };
