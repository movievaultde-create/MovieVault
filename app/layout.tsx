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
  verification: {
    google: "NanJYRAGdLciF_E2zvtNxgWO36Uy1OdYtH8YNfpGESQ",
  },
  title: "MovieVault — Watch Movies, Series & Anime Free HD | أفلام مترجمة ومسلسلات حصرية",
  description:
    "MovieVault — Watch the latest movies, TV series and anime in HD for free. Stream thousands of titles with subtitles in Arabic, English, German, French, Spanish & Turkish. شاهد أحدث الأفلام المترجمة والمسلسلات الحصرية والأنمي بجودة عالية HD مجاناً. Kostenlos Filme und Serien in HD ansehen. Regardez des films gratuits en HD. Películas gratis en línea. Ücretsiz film izle.",
  keywords: [
    // Arabic العربية
    "مشاهدة أفلام أونلاين", "أفلام مترجمة", "مسلسلات مجانية", "أحدث الأفلام 2026",
    "سينما فور يو", "أفلام عربية", "مشاهدة أفلام اون لاين", "مسلسلات 2026",
    "أنمي مترجم", "أفلام HD", "أفلام بجودة عالية", "مسلسلات تركية مترجمة",
    "موقع أفلام عربي", "شاهد أفلام مجانا", "أفلام أكشن مترجمة", "مسلسلات حصرية",
    "أفلام رعب مترجمة", "أفلام كوميدي", "مسلسلات كورية مترجمة", "أفلام هندية مترجمة",
    "موقع مشاهدة مسلسلات", "أفلام جديدة 2026", "بديل ايجي بست", "بديل شاهد فور يو",
    "افلام اون لاين بدون اعلانات", "مسلسلات رمضان 2026",

    // English
    "MovieVault", "watch movies free", "free cinema online", "stream movies HD",
    "watch series online free", "anime subtitled free", "movies online free 2026",
    "free movie streaming", "watch TV shows online", "best free movie site",
    "watch movies without sign up", "free HD movies", "new movies 2026",
    "watch anime online free", "movie streaming site", "top movies 2026",

    // German Deutsch
    "Filme kostenlos ansehen", "Kostenlose Filme online", "Serien streamen kostenlos",
    "Arabische Filme mit Untertiteln", "Filme mit Untertiteln", "Filme online schauen",
    "Kostenlos Serien gucken", "Anime auf Deutsch", "Neue Filme 2026",
    "Filme streamen gratis", "Beste Film Streaming Seite",

    // French Français
    "regarder film gratuit", "films en streaming gratuit", "séries gratuites en ligne",
    "films sous-titrés gratuit", "regarder anime gratuit", "films HD gratuit",
    "nouveau film 2026", "site de streaming gratuit", "séries en streaming",

    // Spanish Español
    "ver películas gratis", "películas online gratis", "series gratis en línea",
    "películas subtituladas gratis", "ver anime gratis", "películas HD gratis",
    "películas nuevas 2026", "cine gratis online", "series de televisión gratis",
    "mejor sitio de películas gratis", "streaming películas",

    // Turkish Türkçe
    "ücretsiz film izle", "online film izle", "ücretsiz dizi izle",
    "altyazılı film izle", "anime izle ücretsiz", "HD film izle",
    "yeni filmler 2026", "bedava film sitesi", "dizi izle türkçe altyazılı",
    "en iyi film izleme sitesi", "film izle full HD",

    // Portuguese Português
    "assistir filmes grátis", "filmes online grátis", "séries grátis online",
    "filmes legendados grátis", "assistir anime grátis", "filmes HD grátis",

    // Russian Русский
    "смотреть фильмы бесплатно", "фильмы онлайн бесплатно", "сериалы бесплатно",
    "аниме с субтитрами", "новые фильмы 2026",

    // Hindi हिन्दी
    "फ्री मूवी देखें", "ऑनलाइन फिल्में देखें", "मुफ्त सीरीज देखें",

    // Japanese 日本語
    "映画 無料 視聴", "アニメ 無料", "ドラマ 無料 視聴",

    // Korean 한국어
    "영화 무료 보기", "드라마 무료 시청", "애니메이션 무료",

    // Indonesian / Malay
    "nonton film gratis", "streaming film gratis", "nonton anime gratis",
  ],
  openGraph: {
    title: "MovieVault — Watch Movies, Series & Anime Free HD",
    description:
      "Stream thousands of movies, TV series and anime in HD for free. Available in Arabic, English, German, French, Spanish & Turkish. شاهد أحدث الأفلام والمسلسلات والأنمي بجودة عالية مجاناً.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA", "de_DE", "fr_FR", "es_ES", "tr_TR"],
    siteName: "MovieVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVault — Watch Movies, Series & Anime Free HD | أفلام مترجمة",
    description:
      "Stream thousands of movies, series & anime in HD free. شاهد أحدث الأفلام والمسلسلات والأنمي مجاناً.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
