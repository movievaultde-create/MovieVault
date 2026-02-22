"use client";

import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-surface-border bg-surface/50">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-primary">Movie</span>
              <span className="text-white">Vault</span>
            </span>
          </div>
          <p className="text-xs text-text-muted">
            © 2024 MovieVault. {t("allRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
