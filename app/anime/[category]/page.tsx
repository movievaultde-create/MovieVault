"use client";

import { use } from "react";
import Link from "next/link";
import { useLang } from "../../context/LanguageContext";
import BrowseGrid from "../../components/BrowseGrid";

const VALID_CATEGORIES = ["all", "action", "family", "18", "servers", "translation"] as const;
type CategorySlug = (typeof VALID_CATEGORIES)[number];

const CATEGORY_CONFIG: Record<
  CategorySlug,
  { category: Parameters<typeof BrowseGrid>[0]["category"]; titleKey: "allAnime" | "animeAction" | "animeFamily" | "anime18" }
> = {
  all: { category: "anime", titleKey: "allAnime" },
  action: { category: "anime-action", titleKey: "animeAction" },
  family: { category: "anime-family", titleKey: "animeFamily" },
  "18": { category: "anime-18", titleKey: "anime18" },
  servers: { category: "anime", titleKey: "allAnime" },
  translation: { category: "anime", titleKey: "allAnime" },
};

export default function AnimeCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = use(params);
  const { t, isAr } = useLang();

  const normalized = (slug?.toLowerCase() ?? "") as CategorySlug;
  const isValid = VALID_CATEGORIES.includes(normalized);
  const config = isValid ? CATEGORY_CONFIG[normalized] : CATEGORY_CONFIG.all;
  const isInfoPage = normalized === "servers" || normalized === "translation";

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* Back to Anime categories */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/anime"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:bg-surface-light hover:text-white"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {isValid ? t(config.titleKey) : t("allAnime")}
          </h1>
        </div>

        {/* Info banner for Servers / Translation */}
        {normalized === "servers" && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm text-white">
            <p className={isAr ? "text-right" : "text-left"}>{t("animeServersInfo")}</p>
          </div>
        )}
        {normalized === "translation" && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm text-white">
            <p className={isAr ? "text-right" : "text-left"}>{t("animeTranslationInfo")}</p>
          </div>
        )}

        <BrowseGrid
          key={config.category}
          category={config.category}
          titleKey={isInfoPage ? "allAnime" : config.titleKey}
          hideHeader
        />
      </div>
    </div>
  );
}
