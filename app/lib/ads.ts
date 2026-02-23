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
    // Open as a small popup window (not tab) - browsers handle focus differently for popups
    const screenW = window.screen.availWidth;
    const screenH = window.screen.availHeight;
    const w = window.open(
      AD_URL,
      "ad_" + now,
      `width=${screenW},height=${screenH},left=0,top=0,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );

    if (w) {
      // Aggressively return focus to MovieVault
      w.blur();
      window.focus();

      // Multiple delayed focus attempts
      const delays = [0, 50, 100, 200, 400, 800];
      delays.forEach((d) => {
        setTimeout(() => {
          try { w.blur(); } catch {}
          try { window.focus(); } catch {}
          try { document.body.focus(); } catch {}
        }, d);
      });
    }
  } catch {
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
      // blocked entirely
    }
  }
}

export { AD_URL };
