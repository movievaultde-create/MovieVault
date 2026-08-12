/** Shared Hilltop Direct Link + Popunder fire on a real user click. */

import {
  getHilltopAdsDirectUrl,
  getHilltopAdsPopunderUrl,
  isHilltopScriptUrl,
} from "./hilltopads";

export function injectHilltopPopunder(scriptUrl: string, marker = "offer") {
  const url = scriptUrl.trim();
  if (!url) return;

  const normalized = url.startsWith("//") ? `https:${url}` : url;

  // Popunder zone "Direct URL" — open on gesture (cannot inject as <script>).
  if (!isHilltopScriptUrl(normalized)) {
    try {
      window.open(normalized, "_blank", "noopener,noreferrer");
    } catch {
      /* blocked */
    }
    return;
  }

  document
    .querySelectorAll(`script[data-hilltop-popunder="${marker}"]`)
    .forEach((node) => node.remove());
  const script = document.createElement("script");
  script.src = normalized;
  script.async = true;
  script.dataset.hilltopPopunder = marker;
  script.referrerPolicy = "no-referrer-when-downgrade";
  document.body.appendChild(script);
}

/** Open Direct Link + inject/open popunder (must run inside a click handler). */
export function fireHilltopOfferClick(marker = "offer") {
  const direct = getHilltopAdsDirectUrl();
  const popunder = getHilltopAdsPopunderUrl();

  if (popunder) injectHilltopPopunder(popunder, marker);

  if (direct) {
    window.open(direct, "_blank", "noopener,noreferrer");
  }
}
