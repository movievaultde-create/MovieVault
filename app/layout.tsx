import type { Metadata } from "next";
import { Suspense } from "react";
import { Tajawal } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "./context/LanguageContext";
import { VipProvider } from "./context/VipContext";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SITE_URL } from "./lib/siteUrl";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "vvzlyoUeRi-NsOvqsuiEfxmF-xu_57vNLItuAU8OVGM",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
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
    "بديل فاصل اعلاني", "بديل ماي سيما", "بديل عرب سيد", "بديل لاروز تي في",
    "بديل اكوام", "بديل سيما كلوب", "بديل سيما لايت", "بديل موفيز لاند",
    "افلام مصرية جديدة", "افلام خليجية", "مسلسلات سورية", "مسلسلات مصرية 2026",
    "افلام اجنبية مترجمة 2026", "افلام رومانسية مترجمة", "افلام حرب مترجمة",
    "مسلسلات اسيوية مترجمة", "مسلسلات يابانية مترجمة", "مسلسلات انمي مترجمة",
    "تحميل افلام مجانا", "موقع افلام بدون تسجيل", "مسلسلات نتفلكس مجانا",
    "افلام ديزني مترجمة", "افلام مارفل مترجمة", "مسلسلات HBO مترجمة",
    "افلام 4K مترجمة", "موقع افلام سريع", "افلام بدون حجب",

    // English
    "MovieVault", "watch movies free", "free cinema online", "stream movies HD",
    "watch series online free", "anime subtitled free", "movies online free 2026",
    "free movie streaming", "watch TV shows online", "best free movie site",
    "watch movies without sign up", "free HD movies", "new movies 2026",
    "watch anime online free", "movie streaming site", "top movies 2026",
    "watch movies no account", "free streaming no ads", "123movies alternative",
    "putlocker alternative", "fmovies alternative", "soap2day alternative",
    "watch netflix free", "watch disney plus free", "watch HBO free",
    "4K movies free", "watch bollywood movies online", "watch korean drama free",
    "best movie website 2026", "free anime streaming site", "watch action movies free",
    "watch horror movies online", "comedy movies free", "romance movies free",
    "thriller movies streaming", "sci-fi movies free", "watch marvel movies free",
    "new releases 2026 movies", "oscar movies 2026", "box office movies free",

    // German Deutsch
    "Filme kostenlos ansehen", "Kostenlose Filme online", "Serien streamen kostenlos",
    "Arabische Filme mit Untertiteln", "Filme mit Untertiteln", "Filme online schauen",
    "Kostenlos Serien gucken", "Anime auf Deutsch", "Neue Filme 2026",
    "Filme streamen gratis", "Beste Film Streaming Seite",
    "Kinofilme kostenlos", "Deutsche Serien online", "Türkische Serien mit Untertiteln",
    "Netflix Alternative kostenlos", "Filme ohne Anmeldung schauen",
    "Action Filme kostenlos", "Horror Filme online", "Komödien kostenlos streamen",
    "Bollywood Filme Deutsch", "Koreanische Serien Deutsch", "Anime Deutsch Untertitel",

    // French Français
    "regarder film gratuit", "films en streaming gratuit", "séries gratuites en ligne",
    "films sous-titrés gratuit", "regarder anime gratuit", "films HD gratuit",
    "nouveau film 2026", "site de streaming gratuit", "séries en streaming",
    "films sans inscription", "regarder séries netflix gratuit", "films action gratuit",
    "films horreur streaming", "comédie en streaming", "films romantiques gratuit",
    "meilleur site streaming 2026", "anime vostfr gratuit", "drama coréen gratuit",
    "films 4K gratuit", "alternative netflix gratuit",

    // Spanish Español
    "ver películas gratis", "películas online gratis", "series gratis en línea",
    "películas subtituladas gratis", "ver anime gratis", "películas HD gratis",
    "películas nuevas 2026", "cine gratis online", "series de televisión gratis",
    "mejor sitio de películas gratis", "streaming películas",
    "ver películas sin registro", "alternativa a netflix gratis", "doramas gratis",
    "películas de acción gratis", "películas de terror online", "comedia gratis online",
    "películas 4K gratis", "estrenos 2026 gratis", "anime latino gratis",
    "series turcas subtituladas", "películas marvel gratis",

    // Turkish Türkçe
    "ücretsiz film izle", "online film izle", "ücretsiz dizi izle",
    "altyazılı film izle", "anime izle ücretsiz", "HD film izle",
    "yeni filmler 2026", "bedava film sitesi", "dizi izle türkçe altyazılı",
    "en iyi film izleme sitesi", "film izle full HD",
    "kayıt olmadan film izle", "netflix alternatifleri ücretsiz", "kore dizileri izle",
    "aksiyon filmleri izle", "korku filmleri izle", "komedi filmleri ücretsiz",
    "4K film izle bedava", "2026 yeni çıkan filmler", "anime türkçe altyazılı",
    "hint filmleri türkçe", "yerli diziler izle", "türk filmleri izle",

    // Portuguese Português
    "assistir filmes grátis", "filmes online grátis", "séries grátis online",
    "filmes legendados grátis", "assistir anime grátis", "filmes HD grátis",
    "filmes novos 2026", "assistir séries grátis", "melhor site de filmes",
    "filmes sem cadastro", "alternativa netflix grátis", "doramas grátis",
    "filmes de ação grátis", "filmes de terror online", "animes legendados grátis",

    // Russian Русский
    "смотреть фильмы бесплатно", "фильмы онлайн бесплатно", "сериалы бесплатно",
    "аниме с субтитрами", "новые фильмы 2026",
    "смотреть сериалы бесплатно", "фильмы HD бесплатно", "лучший сайт для фильмов",
    "фильмы без регистрации", "альтернатива нетфликс", "корейские дорамы бесплатно",
    "фильмы 2026 онлайн", "боевики бесплатно", "ужасы онлайн", "аниме онлайн бесплатно",

    // Hindi हिन्दी
    "फ्री मूवी देखें", "ऑनलाइन फिल्में देखें", "मुफ्त सीरीज देखें",
    "बॉलीवुड फिल्में ऑनलाइन", "हिंदी फिल्में देखें", "नई फिल्में 2026",
    "एनीमे हिंदी में देखें", "हॉलीवुड फिल्में हिंदी में", "वेब सीरीज फ्री",

    // Japanese 日本語
    "映画 無料 視聴", "アニメ 無料", "ドラマ 無料 視聴",
    "映画 無料 サイト", "海外ドラマ 無料", "アニメ 無料 視聴 サイト",
    "新作映画 2026", "韓国ドラマ 無料", "洋画 無料 字幕",

    // Korean 한국어
    "영화 무료 보기", "드라마 무료 시청", "애니메이션 무료",
    "한국 드라마 무료", "최신 영화 2026", "미드 무료 시청",
    "일본 애니메이션 무료", "넷플릭스 대안 무료", "영화 무료 사이트",

    // Indonesian / Malay
    "nonton film gratis", "streaming film gratis", "nonton anime gratis",
    "nonton drama korea gratis", "film terbaru 2026", "nonton series gratis",
    "situs film gratis terbaik", "nonton film tanpa daftar", "film subtitle indonesia",

    // Italian Italiano
    "guardare film gratis", "film in streaming gratis", "serie TV gratis online",
    "anime gratis italiano", "film nuovi 2026", "miglior sito film gratis",
    "film senza registrazione", "film 4K gratis", "alternativa netflix gratis",

    // Polish Polski
    "filmy za darmo online", "seriale za darmo", "anime za darmo",
    "najlepsze filmy 2026", "oglądaj filmy bez rejestracji", "filmy HD za darmo",

    // Dutch Nederlands
    "gratis films kijken", "series gratis kijken", "anime gratis kijken",
    "nieuwe films 2026", "films zonder account", "beste streaming site gratis",

    // Thai ไทย
    "ดูหนังฟรี", "ดูหนังออนไลน์", "ดูซีรีส์ฟรี", "อนิเมะฟรี", "หนังใหม่ 2026",

    // Vietnamese Tiếng Việt
    "xem phim miễn phí", "phim online miễn phí", "xem anime miễn phí",
    "phim mới 2026", "xem phim không cần đăng ký",

    // Romanian Română
    "filme online gratis", "seriale gratis online", "anime gratis", "filme noi 2026",

    // Greek Ελληνικά
    "δωρεάν ταινίες online", "σειρές δωρεάν", "anime δωρεάν", "νέες ταινίες 2026",

    // Czech Čeština
    "filmy zdarma online", "seriály zdarma", "anime zdarma", "nové filmy 2026",

    // Swedish Svenska
    "gratis filmer online", "serier gratis", "anime gratis", "nya filmer 2026",

    // Persian فارسی
    "فیلم رایگان آنلاین", "سریال رایگان", "انیمه رایگان", "فیلم جدید 2026",
    "دانلود فیلم رایگان", "فیلم با زیرنویس فارسی",

    // Urdu اردو
    "مفت فلمیں دیکھیں", "آن لائن فلمیں", "مفت سیریز دیکھیں",
  ],
  openGraph: {
    title: "MovieVault — Watch Movies, Series & Anime Free HD",
    description:
      "Stream thousands of movies, TV series and anime in HD for free. Available in Arabic, English, German, French, Spanish & Turkish. شاهد أحدث الأفلام والمسلسلات والأنمي بجودة عالية مجاناً.",
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA", "de_DE", "fr_FR", "es_ES", "tr_TR"],
    siteName: "MovieVault",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "MovieVault — Watch Movies, Series & Anime Free in HD",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVault — Watch Movies, Series & Anime Free HD | أفلام مترجمة",
    description:
      "Stream thousands of movies, series & anime in HD free. شاهد أحدث الأفلام والمسلسلات والأنمي مجاناً.",
    images: [`${SITE_URL}/og-image.jpg`],
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
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MovieVault",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`} suppressHydrationWarning>
      <head>
        <meta name="6a97888e-site-verification" content="e84c90fd1f6d68a8c466b0ea5a1d8874" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MovieVault — Watch Movies, Series & Anime Free HD" />
        <meta property="og:description" content="Stream thousands of movies, TV series and anime in HD for free. شاهد أحدث الأفلام والمسلسلات والأنمي بجودة عالية مجاناً." />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="MovieVault" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className={`${tajawal.variable} min-h-screen bg-background text-foreground antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <WatchlistProvider>
              <VipProvider>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                <main>{children}</main>
                <Footer />
                <Analytics />
              </VipProvider>
            </WatchlistProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
