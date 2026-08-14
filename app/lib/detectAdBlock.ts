/** Detects common ad blockers without false-locking mobile/tablet privacy DNS. */

declare global {
  interface Window {
    __MV_AD_OK?: number;
    __MV_ADV_OK?: number;
  }
}

const BAIT_CLASS =
  "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links adsbox adsbygoogle advertisement ad-banner ad-placement sponsored";

function baitLooksBlocked(node: HTMLElement) {
  if (!node.isConnected) return true;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (Number.parseFloat(style.opacity || "1") === 0) return true;
  if (style.height === "0px" || style.maxHeight === "0px") return true;
  // Use layout box — offsetHeight can be 0 for off-screen nodes on some WebViews.
  const rect = node.getBoundingClientRect();
  if (rect.height < 10 && node.clientHeight < 10) return true;
  return false;
}

function mountBait() {
  const node = document.createElement("div");
  node.className = BAIT_CLASS;
  node.setAttribute("aria-hidden", "true");
  // Keep on-screen but invisible so mobile WebViews still report a real box.
  node.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;";
  node.innerHTML = "&nbsp;";
  document.body.appendChild(node);

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.setAttribute("aria-hidden", "true");
  ins.style.cssText =
    "display:block;position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;";
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
 * Lock only on local evidence (bait DOM + first-party /ads.js).
 * Remote Google/DoubleClick/Adsterra probes false-positive on tablets with
 * Private DNS, Samsung/Brave shields, or slow networks — even with no extension.
 */
export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const { node, ins } = mountBait();
  await new Promise((r) => window.setTimeout(r, 120));
  const baitBlocked = baitLooksBlocked(node) || baitLooksBlocked(ins);

  const [adsJs, advertisementJs] = await Promise.all([
    loadFlagScript("/ads.js", "__MV_AD_OK"),
    loadFlagScript("/advertisement.js", "__MV_ADV_OK"),
  ]);

  await new Promise((r) => window.setTimeout(r, 250));
  const baitBlockedLate = baitLooksBlocked(node) || baitLooksBlocked(ins);
  node.remove();
  ins.remove();

  const localScriptsBlocked = adsJs || advertisementJs;
  // Require a script hit, or bait failing twice (early + late).
  if (localScriptsBlocked) return true;
  if (baitBlocked && baitBlockedLate) return true;
  return false;
}
