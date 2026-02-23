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
    const w = window.open(AD_URL, "_blank", "noopener");
    if (w) {
      w.blur();
      window.focus();
      setTimeout(() => { try { window.focus(); } catch {} }, 50);
      setTimeout(() => { try { window.focus(); } catch {} }, 200);
      setTimeout(() => { try { window.focus(); } catch {} }, 500);
    }
  } catch {
    // fallback: create a hidden link and click it
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
      setTimeout(() => { try { window.focus(); } catch {} }, 300);
    } catch {
      // blocked entirely
    }
  }
}

export { AD_URL };
