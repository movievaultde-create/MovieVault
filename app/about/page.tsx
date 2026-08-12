"use client";

import LegalDocumentPage from "../components/LegalDocumentPage";
import { ABOUT_CONTENT } from "../lib/legalContent";

export default function AboutPage() {
  return <LegalDocumentPage documents={ABOUT_CONTENT} />;
}
