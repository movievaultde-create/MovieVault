const AD_URL =
  "https://www.effectivegatecpm.com/ksx3jaie5?key=e46ad7ef9f7376acad63fe30acbfcbff";

let lastTrigger = 0;
const COOLDOWN_MS = 3_000;

export function triggerPopunder() {
  const now = Date.now();
  if (now - lastTrigger < COOLDOWN_MS) return;
  lastTrigger = now;

  try {
    const w = window.open(AD_URL, "_blank");
    if (w) {
      w.blur();
    }
  } catch {
    // blocked
  }

  try {
    window.focus();
  } catch {
    // ignore
  }
}

export { AD_URL };
