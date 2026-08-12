"use client";

import LegalDocumentPage from "../components/LegalDocumentPage";
import { AFFILIATE_CONTENT } from "../lib/legalContent";

export default function AffiliateDisclosurePage() {
  return <LegalDocumentPage documents={AFFILIATE_CONTENT} />;
}
