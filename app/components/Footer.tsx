"use client";

import Link from "next/link";
import { useLang } from "../context/LanguageContext";

const PARTNER_SITE_URL =
  process.env.NEXT_PUBLIC_PARTNER_SITE_URL?.trim() || "https://shaheiid4u.net";
const PARTNER_SITE_LABEL =
  process.env.NEXT_PUBLIC_PARTNER_SITE_LABEL?.trim() || "شاهد فور يو";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-[var(--accent)]">Movie</span>
              <span className="text-[var(--text-primary)]">Vault</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-dim)]">
            <Link
              href="/blog"
              onClick={(event) => {
                event.preventDefault();
                window.location.assign("/blog");
              }}
              className="transition-colors hover:text-[var(--accent)]"
            >
              Blog
            </Link>
            <span className="text-[var(--border)]">|</span>
            <a
              href={PARTNER_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent)]"
            >
              {PARTNER_SITE_LABEL}
            </a>
            <span className="text-[var(--border)]">|</span>
            <Link href="/impressum" className="transition-colors hover:text-[var(--accent)]">
              Impressum
            </Link>
            <span className="text-[var(--border)]">|</span>
            <Link href="/datenschutz" className="transition-colors hover:text-[var(--accent)]">
              Datenschutz
            </Link>
            <span className="text-[var(--border)]">|</span>
            <span>© {new Date().getFullYear()} MovieVault. {t("allRights")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
