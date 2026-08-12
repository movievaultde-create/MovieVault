"use client";

import LegalDocumentPage from "../components/LegalDocumentPage";
import { TERMS_CONTENT } from "../lib/legalContent";

export default function TermsPage() {
  return <LegalDocumentPage documents={TERMS_CONTENT} />;
}
