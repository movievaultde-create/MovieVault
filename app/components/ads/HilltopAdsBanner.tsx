"use client";

import { useEffect, useRef, useState } from "react";

type HilltopAdsBannerProps = {
  scriptUrl: string;
  className?: string;
  /** Hide the empty white box when Hilltop does not fill a creative. */
  collapseIfEmpty?: boolean;
  onEmpty?: () => void;
  onFilled?: () => void;
};

type HilltopScript = HTMLScriptElement & { settings?: Record<string, unknown>; used?: boolean };

/** Zone Multitag may set a singleton on `window` — clear on unmount or remounts stay empty. */
const HILLTOP_BANNER_GLOBAL = "aad373";

function hasCreative(container: HTMLElement) {
  return Boolean(
    container.querySelector("iframe, img, a, ins, video, canvas, object, embed") ||
      Array.from(container.children).some(
        (child) => child.tagName !== "SCRIPT" && child.childNodes.length > 0,
      ),
  );
}

function clearHilltopSingleton() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    delete w[HILLTOP_BANNER_GLOBAL];
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[HILLTOP_BANNER_GLOBAL] = false;
    } catch {
      /* ignore */
    }
  }
}

/** Hilltop MultiTag Banner — collapses empty slots instead of leaving a white box. */
export function HilltopAdsBanner({
  scriptUrl,
  className = "",
  collapseIfEmpty = true,
  onEmpty,
  onFilled,
}: HilltopAdsBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onEmptyRef = useRef(onEmpty);
  const onFilledRef = useRef(onFilled);
  const [visible, setVisible] = useState(true);

  onEmptyRef.current = onEmpty;
  onFilledRef.current = onFilled;

  useEffect(() => {
    const container = containerRef.current;
    const url = scriptUrl.trim();
    if (!container || !url) return;

    setVisible(true);
    clearHilltopSingleton();
    container.replaceChildren();

    const script = document.createElement("script") as HilltopScript;
    script.settings = {};
    script.src = url;
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    container.appendChild(script);

    let filled = false;
    const markFilled = () => {
      if (filled) return;
      if (!hasCreative(container)) return;
      filled = true;
      setVisible(true);
      onFilledRef.current?.();
    };

    const observer = new MutationObserver(markFilled);
    observer.observe(container, { childList: true, subtree: true });

    const checks = [600, 1200, 2200, 4000, 6500].map((ms) =>
      window.setTimeout(() => {
        if (hasCreative(container)) {
          markFilled();
          return;
        }
        if (ms >= 6500 && collapseIfEmpty && !filled) {
          setVisible(false);
          onEmptyRef.current?.();
        }
      }, ms),
    );

    return () => {
      observer.disconnect();
      checks.forEach((id) => window.clearTimeout(id));
      container.replaceChildren();
      clearHilltopSingleton();
    };
  }, [scriptUrl, collapseIfEmpty]);

  if (!scriptUrl.trim() || !visible) return null;

  return (
    <div
      ref={containerRef}
      className={`mx-auto flex w-full max-w-[300px] items-center justify-center overflow-hidden ${
        collapseIfEmpty ? "min-h-0" : "min-h-[250px]"
      } ${className}`.trim()}
      aria-label="Advertisement"
      data-hilltop-banner="1"
    />
  );
}
