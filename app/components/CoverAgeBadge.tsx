"use client";

import { ageBadgeClass, formatAgeBadge, type AgeCode } from "../lib/mal/ageRatingMap";
import { useMalAgeCode } from "../lib/mal/useMalAgeCode";
import { useLang } from "../context/LanguageContext";

type CoverAgeBadgeProps = {
  malId?: number | null;
  anilistId?: number | null;
  initialCode?: AgeCode | null;
  fallbackCode?: AgeCode | null;
  className?: string;
  size?: "card" | "hero";
};

export function CoverAgeBadge({
  malId,
  anilistId,
  initialCode,
  fallbackCode,
  className,
  size = "card",
}: CoverAgeBadgeProps) {
  const { lang } = useLang();
  const malCode = useMalAgeCode(malId, initialCode, anilistId);
  const code = malCode ?? initialCode ?? fallbackCode ?? null;
  if (!code) return null;

  const sizing = size === "hero" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]";

  return (
    <span
      dir="ltr"
      className={`pointer-events-none absolute end-2 top-2 z-20 rounded-md font-black tracking-wide text-white shadow ${sizing} ${ageBadgeClass(code)} ${className ?? ""}`}
    >
      {formatAgeBadge(code, lang)}
    </span>
  );
}
