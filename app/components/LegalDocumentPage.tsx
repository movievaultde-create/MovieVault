"use client";

import Link from "next/link";
import { useLang, type Lang } from "../context/LanguageContext";
import type { LegalDocument, LocalizedMap } from "../lib/legalContent";
import { LEGAL_UI } from "../lib/legalContent";

export default function LegalDocumentPage({
  documents,
}: {
  documents: LocalizedMap<LegalDocument>;
}) {
  const { lang } = useLang();
  const currentLang = (lang ?? "EN") as Lang;
  const content = documents[currentLang] ?? documents.EN;
  const ui = LEGAL_UI[currentLang] ?? LEGAL_UI.EN;

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[var(--bg-base)] px-4 pb-16 pt-24">
      <h1 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">{content.title}</h1>
      <p className="mb-2 text-xs text-[var(--text-dim)]">
        {content.effectiveLabel}: {content.effectiveDate}
      </p>
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">{content.intro}</p>

      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-muted)]">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{section.heading}</h2>
            <div className="space-y-2">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <p className="text-xs text-[var(--text-dim)]">{content.contactLabel}</p>
        <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{content.contactValue}</p>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]">
          ← {ui.backHome}
        </Link>
      </div>
    </div>
  );
}
