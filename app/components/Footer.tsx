"use client";

import Link from "next/link";
import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-surface-border bg-surface/50">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-primary">Movie</span>
              <span className="text-white">Vault</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-text-muted">
            <Link href="/blog" className="transition-colors hover:text-white">
              Blog
            </Link>
            <span className="text-surface-border">|</span>
            <Link href="/impressum" className="transition-colors hover:text-white">
              Impressum
            </Link>
            <span className="text-surface-border">|</span>
            <Link href="/datenschutz" className="transition-colors hover:text-white">
              Datenschutz
            </Link>
            <span className="text-surface-border">|</span>
            <span>© {new Date().getFullYear()} MovieVault. {t("allRights")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
