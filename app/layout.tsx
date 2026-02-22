import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Popunder from "./components/Popunder";
import SocialBar from "./components/SocialBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MovieVault — أفلام مترجمة ومسلسلات حصرية بجودة عالية",
  description:
    "MovieVault — شاهد أحدث الأفلام المترجمة والمسلسلات الحصرية والأنمي بجودة عالية HD مجاناً. أكبر مكتبة عربية للأفلام والمسلسلات مع ترجمة كاملة. Watch the latest movies, exclusive series and anime in HD for free.",
  keywords: [
    "أفلام مترجمة",
    "مسلسلات حصرية",
    "أفلام عربية",
    "مشاهدة أفلام اون لاين",
    "أفلام 2025",
    "مسلسلات 2025",
    "أنمي مترجم",
    "أفلام HD",
    "أفلام بجودة عالية",
    "مسلسلات تركية مترجمة",
    "موقع أفلام عربي",
    "شاهد أفلام مجانا",
    "Arabische Filme",
    "Filme mit Untertiteln",
    "MovieVault",
    "movies online free",
    "watch series HD",
    "anime subtitled",
  ],
  openGraph: {
    title: "MovieVault — أفلام مترجمة ومسلسلات حصرية",
    description:
      "شاهد أحدث الأفلام المترجمة والمسلسلات الحصرية والأنمي بجودة HD مجاناً. أكبر مكتبة أفلام عربية.",
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    siteName: "MovieVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVault — أفلام مترجمة ومسلسلات حصرية بجودة عالية",
    description:
      "شاهد أحدث الأفلام المترجمة والمسلسلات الحصرية والأنمي بجودة HD. أكبر مكتبة عربية.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <LanguageProvider>
          <Popunder />
          <SocialBar />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
