"use client";

import { useMemo } from "react";
import { getAdUrl, triggerPopunder } from "@/app/lib/ads";

interface BlogInlineAdProps {
  compact?: boolean;
}

export default function BlogInlineAd({ compact = false }: BlogInlineAdProps) {
  const adUrl = useMemo(() => getAdUrl(), []);

  return (
    <aside
      className={`rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-black to-black ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
      aria-label="Sponsored section"
    >
      <p className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        Sponsored
      </p>

      <h3 className={`mt-3 font-extrabold text-white ${compact ? "text-base" : "text-lg sm:text-xl"}`}>
        Unlock premium streaming deals
      </h3>
      <p className={`mt-2 text-gray-300 ${compact ? "text-xs leading-6" : "text-sm leading-7"}`}>
        Limited-time offer for faster streaming, cleaner playback, and extra privacy while watching online.
      </p>

      <a
        href={adUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          triggerPopunder({ force: true });
        }}
        className="mt-4 inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-amber-300"
      >
        Claim Offer
      </a>
    </aside>
  );
}
