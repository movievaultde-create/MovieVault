/** Detects common ad blockers without false-locking when ads are already showing. */

declare global {
  interface Window {
    __MV_AD_OK?: number;
    __MV_ADV_OK?: number;
  }
}

const BAIT_CLASS =
  "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links adsbox adsbygoogle advertisement ad-banner ad-placement sponsored";

/** Real Monetag / display ads already on the page → no blocker. */
function pageAlreadyShowsAds() {
  if (typeof document === "undefined") return false;
  for (const el of Array.from(document.querySelectorAll("iframe, img, a"))) {
    const src = `${el.getAttribute("src") || ""} ${el.getAttribute("href") || ""} ${el.getAttribute("data-src") || ""}`;
    if (/monetag|quge5|exoclick|adsterra|highperformanceformat|profitablegate|doubleclick|googlesyndication/i.test(src)) {
      return true;
    }
  }
  // Monetag / in-page push often paints a tiny "Ad" label
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
  // Only treat fully invisible — near-zero opacity is intentional for the bait.
  if (Number.parseFloat(style.opacity || "1") === 0) return true;
  if (style.height === "0px" || style.width === "0px" || style.maxHeight === "0px") return true;
  const rect = node.getBoundingClientRect();
  // Bait is ~50×50; anything under ~8px means a filter collapsed it.
  if (rect.width < 8 || rect.height < 8) return true;
  return false;
}

function mountBait() {
  const node = document.createElement("div");
  node.className = BAIT_CLASS;
  node.setAttribute("aria-hidden", "true");
  // Real box size (not 1×1) so height checks don't false-positive.
  node.style.cssText =
    "position:fixed;left:0;top:0;width:50px;height:50px;opacity:0.01;pointer-events:none;z-index:-1;overflow:hidden;";
  node.innerHTML = "&nbsp;";
  document.body.appendChild(node);

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.setAttribute("aria-hidden", "true");
  ins.style.cssText =
    "display:block;position:fixed;left:0;top:0;width:50px;height:50px;opacity:0.01;pointer-events:none;z-index:-1;overflow:hidden;";
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
    window.setTimeout(() => done(window[flag] !== 1), 2000);
  });
}

/**
 * Lock only when first-party bait/scripts are clearly blocked.
 * Never lock if the page is already rendering ads.
 */
export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (pageAlreadyShowsAds()) return false;

  const { node, ins } = mountBait();
  await new Promise((r) => window.setTimeout(r, 150));
  const baitBlocked = baitLooksBlocked(node) && baitLooksBlocked(ins);

  const [adsJs, advertisementJs] = await Promise.all([
    loadFlagScript("/ads.js", "__MV_AD_OK"),
    loadFlagScript("/advertisement.js", "__MV_ADV_OK"),
  ]);

  await new Promise((r) => window.setTimeout(r, 250));
  const baitBlockedLate = baitLooksBlocked(node) && baitLooksBlocked(ins);
  node.remove();
  ins.remove();

  if (pageAlreadyShowsAds()) return false;

  // Both first-party scripts must fail (one flake is not enough).
  if (adsJs && advertisementJs) return true;
  // Both bait nodes collapsed early and late.
  if (baitBlocked && baitBlockedLate) return true;
  return false;
}
