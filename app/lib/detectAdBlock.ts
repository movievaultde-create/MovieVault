/** Detects ad blockers: bait + first-party scripts, never lock when ads are visible. */

declare global {
  interface Window {
    __MV_AD_OK?: number;
    __MV_ADV_OK?: number;
  }
}

const BAIT_CLASS =
  "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links adsbox adsbygoogle advertisement ad-banner ad-placement sponsored";

/** Monetag / network creatives already on the page → visitor is not blocking ads. */
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

function baitLooksBlocked(node: HTMLElement) {
  if (!node.isConnected) return true;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (Number.parseFloat(style.opacity || "1") === 0) return true;
  if (style.height === "0px" || style.width === "0px" || style.maxHeight === "0px") return true;
  const rect = node.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) return true;
  return false;
}

function mountBait() {
  const node = document.createElement("div");
  node.className = BAIT_CLASS;
  node.setAttribute("aria-hidden", "true");
  // Off-screen but real 300×250 box — EasyList / AdBlock collapse these by class.
  node.style.cssText =
    "position:absolute;left:-10000px;top:-10000px;width:300px;height:250px;pointer-events:none;";
  node.innerHTML = "&nbsp;";
  document.body.appendChild(node);

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.setAttribute("aria-hidden", "true");
  ins.style.cssText =
    "display:block;position:absolute;left:-10000px;top:-10000px;width:300px;height:250px;pointer-events:none;";
  document.body.appendChild(ins);

  return { node, ins };
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
    window.setTimeout(() => done(window[flag] !== 1), 3000);
  });
}

/**
 * Lock when an extension collapses ad baits / blocks probe scripts.
 * Never lock if Monetag (or similar) creatives are already on the page —
 * that covers tablet "tracking protection" false positives where ads still load.
 */
export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (pageAlreadyShowsAds()) return false;

  const { node, ins } = mountBait();
  await new Promise((r) => window.setTimeout(r, 200));

  const [adsJs, advertisementJs] = await Promise.all([
    loadFlagScript("/ads.js", "__MV_AD_OK"),
    loadFlagScript("/advertisement.js", "__MV_ADV_OK"),
  ]);

  await new Promise((r) => window.setTimeout(r, 300));
  const baitBlocked = baitLooksBlocked(node) || baitLooksBlocked(ins);
  node.remove();
  ins.remove();

  if (pageAlreadyShowsAds()) return false;

  if (adsJs && advertisementJs) return true;
  if (baitBlocked) return true;
  return false;
}
