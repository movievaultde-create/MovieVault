"use client";

import LegalDocumentPage from "../components/LegalDocumentPage";
import { PRIVACY_CONTENT } from "../lib/legalContent";

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage documents={PRIVACY_CONTENT} />;
}
