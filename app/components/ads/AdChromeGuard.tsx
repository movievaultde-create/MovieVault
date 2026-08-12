"use client";

import { useEffect } from "react";

const CHROME_Z = 400;
/** Ad scripts that append fixed layers above the whole page block sidebar/header clicks. */
const FLOATING_AD_Z_CAP = 50;

function isSiteChrome(el: Element) {
  return Boolean(el.closest("[data-site-chrome]"));
}

function demoteFloatingAdLayers() {
  for (const node of Array.from(document.body.children)) {
    if (!(node instanceof HTMLElement)) continue;
    if (isSiteChrome(node)) continue;
    if (node.dataset.siteUi === "1") continue;
    if (node.id?.startsWith("__next") || node.id === "root") continue;

    const style = window.getComputedStyle(node);
    if (style.position !== "fixed" && style.position !== "sticky") continue;

    const z = Number.parseInt(style.zIndex || "0", 10);
    if (!Number.isFinite(z) || z < 100) continue;

    if (node.dataset.interstitialAd === "1") continue;
    if (z >= CHROME_Z || z >= 200) {
      node.style.setProperty("z-index", String(FLOATING_AD_Z_CAP), "important");
    }
  }
}

/**
 * Hilltop Multitag often injects fixed full-page layers that steal clicks from the navbar.
 * Cap those layers below the site chrome so logo / nav stay usable.
 */
export function AdChromeGuard() {
  useEffect(() => {
    let scheduled = 0;
    const run = () => {
      scheduled = 0;
      demoteFloatingAdLayers();
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = window.requestAnimationFrame(run);
    };

    demoteFloatingAdLayers();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: false });
    const tick = window.setInterval(schedule, 4000);
    return () => {
      observer.disconnect();
      window.clearInterval(tick);
      if (scheduled) window.cancelAnimationFrame(scheduled);
    };
  }, []);

  return null;
}
