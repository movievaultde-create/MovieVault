/** Detects ad blockers via first-party scripts only — no bait class false-positives. */

declare global {
  interface Window {
    __MV_AD_OK?: number;
    __MV_ADV_OK?: number;
  }
}

/** Real Monetag / display ads already on the page → no blocker. */
function pageAlreadyShowsAds() {
  if (typeof document === "undefined") return false;
  for (const el of Array.from(document.querySelectorAll("iframe, img, a, script"))) {
    const src = `${el.getAttribute("src") || ""} ${el.getAttribute("href") || ""} ${el.getAttribute("data-src") || ""}`;
    if (
      /monetag|quge5|exoclick|adsterra|highperformanceformat|profitablegate|doubleclick|googlesyndication|effectivecreativeformat/i.test(
        src,
      )
    ) {
      return true;
    }
  }
  for (const el of Array.from(document.querySelectorAll("div, span"))) {
    const text = (el.textContent || "").trim();
    if (text !== "Ad" && text !== "AD") continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.width <= 72 && r.height > 0 && r.height <= 36) return true;
  }
  return false;
}

function loadFlagScript(src: string, flag: "__MV_AD_OK" | "__MV_ADV_OK") {
  return new Promise<boolean>((resolve) => {
    window[flag] = 0;
    const script = document.createElement("script");
    script.src = `${src}?t=${Date.now()}`;
    script.async = true;
    let settled = false;
    const done = (blocked: boolean) => {
      if (settled) return;
      settled = true;
      script.onload = null;
      script.onerror = null;
      script.remove();
      resolve(blocked);
    };
    script.onload = () => done(window[flag] !== 1);
    script.onerror = () => done(true);
    document.head.appendChild(script);
    // Longer timeout — mobile networks / tablets are slow; don't treat lag as a block.
    window.setTimeout(() => done(window[flag] !== 1), 4000);
  });
}

/**
 * Lock only when BOTH first-party probe scripts fail.
 * Do not use DOM bait (adsbox / adsbygoogle classes) — Samsung Internet, Brave,
 * and tablet "tracking protection" hide those nodes even with no ad-block extension,
 * while Monetag ads still load → false "Site locked".
 */
export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (pageAlreadyShowsAds()) return false;

  const [adsJs, advertisementJs] = await Promise.all([
    loadFlagScript("/ads.js", "__MV_AD_OK"),
    loadFlagScript("/advertisement.js", "__MV_ADV_OK"),
  ]);

  if (pageAlreadyShowsAds()) return false;

  return Boolean(adsJs && advertisementJs);
}
