"use client";

import { useEffect, useRef } from "react";
import { isHilltopScriptUrl } from "../../lib/hilltopads";

type HilltopAdsPopunderProps = {
  scriptUrl: string;
};

export function HilltopAdsPopunder({ scriptUrl }: HilltopAdsPopunderProps) {
  const loaded = useRef(false);

  useEffect(() => {
    const url = scriptUrl.trim();
    if (!url || loaded.current) return;
    // Direct URL popunders are fired on click via fireHilltopOfferClick — not as scripts.
    if (!isHilltopScriptUrl(url)) return;

    loaded.current = true;

    const script = document.createElement("script");
    script.src = url.startsWith("//") ? `https:${url}` : url;
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    document.body.appendChild(script);

    return () => {
      script.remove();
      loaded.current = false;
    };
  }, [scriptUrl]);

  return null;
}
