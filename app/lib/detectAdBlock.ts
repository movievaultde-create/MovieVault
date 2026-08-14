/** Detects uBlock, AdBlock, AdGuard, and Edge Tracking Prevention. */

declare global {
  interface Window {
    __MV_AD_OK?: number;
    __MV_ADV_OK?: number;
  }
}

const BAIT_CLASS =
  "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links adsbox adsbygoogle advertisement ad-banner ad-placement sponsored";

const GOOGLE_ADS_JS = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
const DOUBLECLICK_JS = "https://static.doubleclick.net/instream/ad_status.js";
const MONETAG_JS = "https://quge5.com/88/tag.min.js";

function baitLooksBlocked(node: HTMLElement) {
  if (!node.isConnected) return true;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (Number.parseFloat(style.opacity || "1") === 0) return true;
  if (style.height === "0px" || style.maxHeight === "0px") return true;
  if (node.offsetHeight < 10) return true;
  return false;
}

function mountBait() {
  const node = document.createElement("div");
  node.className = BAIT_CLASS;
  node.setAttribute("aria-hidden", "true");
  node.style.cssText =
    "position:absolute;left:-10000px;top:0;width:300px;height:250px;pointer-events:none;";
  node.innerHTML = "&nbsp;";
  document.body.appendChild(node);

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.setAttribute("aria-hidden", "true");
  ins.style.cssText =
    "display:block;position:absolute;left:-10000px;top:0;width:300px;height:250px;";
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

function loadRemoteScript(src: string) {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = `${src}${src.includes("?") ? "&" : "?"}mv=${Date.now()}`;
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
    script.onload = () => done(false);
    script.onerror = () => done(true);
    document.head.appendChild(script);
    window.setTimeout(() => done(true), 2500);
  });
}

function fetchLooksBlocked(url: string) {
  return fetch(url, { method: "GET", mode: "no-cors", cache: "no-store", credentials: "omit" }).then(
    () => false,
    () => true,
  );
}

export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const { node, ins } = mountBait();
  await new Promise((r) => window.setTimeout(r, 80));
  const baitBlocked = baitLooksBlocked(node) || baitLooksBlocked(ins);

  const [adsJs, advertisementJs, googleAds, doubleClick, monetagNet] = await Promise.all([
    loadFlagScript("/ads.js", "__MV_AD_OK"),
    loadFlagScript("/advertisement.js", "__MV_ADV_OK"),
    loadRemoteScript(GOOGLE_ADS_JS),
    loadRemoteScript(DOUBLECLICK_JS),
    fetchLooksBlocked(MONETAG_JS),
  ]);

  await new Promise((r) => window.setTimeout(r, 300));
  const baitBlockedLate = baitLooksBlocked(node) || baitLooksBlocked(ins);
  node.remove();
  ins.remove();

  const trackersDown = [googleAds, doubleClick, monetagNet].filter(Boolean).length >= 2;
  return baitBlocked || baitBlockedLate || adsJs || advertisementJs || trackersDown;
}
