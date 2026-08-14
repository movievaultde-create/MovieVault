import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Tajawal, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "./context/LanguageContext";
import { VipProvider } from "./context/VipContext";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AdChromeGuard } from "./components/ads/AdChromeGuard";
import { PlayerCornerAds } from "./components/ads/PlayerCornerAds";
import AntiAdblock from "./components/AntiAdblock";
import { Suspense } from "react";
import { SITE_URL } from "./lib/siteUrl";
import { ARABIC_SEARCH_KEYWORDS, ENGLISH_SEO_KEYWORDS, PORTUGUESE_SEO_KEYWORDS, HINDI_SEO_KEYWORDS } from "./lib/seo";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-8LZLKCYF4N";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const brandFont = Cormorant_Garamond({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "vvzlyoUeRi-NsOvqsuiEfxmF-xu_57vNLItuAU8OVGM",
    other: {
      "msvalidate.01": "D4907A47975D1815F1A33C38F469777C",
      "7c34f1fda1289a48919ed9574d9f66c300246dec":
        "7c34f1fda1289a48919ed9574d9f66c300246dec",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  title: "أفضل المواقع لمشاهدة افلام و مسلسلات مجاناً | وقت الافلام — MovieVault",
  description:
    "محرك بحث لبث الأفلام والمسلسلات. وقت الافلام - شاهد أحدث الأفلام والمسلسلات و انمي المترجمة مجاناً بجودة HD. وقت الافلام ووقت مسلسلات ووقت انمي على MovieVault خزنة الافلام.",
  keywords: [
    ...ARABIC_SEARCH_KEYWORDS,
    // Arabic العربية — brands + core phrases first
    "shahid4u",
    "شاهد فور يو",
    "شاهيد فور يو",
    "ايجي ايد",
    "ايجي ديد",
    "egydead",
    "افلام مترجمة",
    "مسلسلات مترجمة",
    "مشاهدة افلام مترجمة",
    "مشاهدة مسلسلات مترجمة",
    "افلام مترجمة اون لاين",
    "مسلسلات مترجمة اون لاين",
    "افلام مترجمة HD",
    "مسلسلات مترجمة HD",
    "افلام اجنبية مترجمة",
    "مسلسلات اجنبية مترجمة",
    "مشاهدة أفلام أونلاين",
    "مسلسلات مجانية",
    "أحدث الأفلام 2026",
    "سينما فور يو",
    "أفلام عربية",
    "مشاهدة أفلام اون لاين",
    "مسلسلات 2026",
    "أنمي مترجم",
    "أفلام HD",
    "أفلام بجودة عالية",
    "مسلسلات تركية مترجمة",
    "موقع أفلام عربي",
    "شاهد أفلام مجانا",
    "أفلام أكشن مترجمة",
    "مسلسلات حصرية",
    "أفلام رعب مترجمة",
    "أفلام كوميدي",
    "مسلسلات كورية مترجمة",
    "أفلام هندية مترجمة",
    "موقع مشاهدة مسلسلات",
    "أفلام جديدة 2026",
    "بديل ايجي بست",
    "بديل شاهد فور يو",
    "بديل ايجي ديد",
    "بديل shahid4u",
    "افلام اون لاين بدون اعلانات",
    "مسلسلات رمضان 2026",
    "بديل فاصل اعلاني",
    "بديل ماي سيما",
    "بديل عرب سيد",
    "بديل لاروز تي في",
    "بديل اكوام",
    "بديل سيما كلوب",
    "بديل سيما لايت",
    "بديل موفيز لاند",
    "افلام مصرية جديدة",
    "افلام خليجية",
    "مسلسلات سورية",
    "مسلسلات مصرية 2026",
    "افلام اجنبية مترجمة 2026",
    "افلام رومانسية مترجمة",
    "افلام حرب مترجمة",
    "مسلسلات اسيوية مترجمة",
    "مسلسلات يابانية مترجمة",
    "مسلسلات انمي مترجمة",
    "تحميل افلام مجانا",
    "موقع افلام بدون تسجيل",
    "مسلسلات نتفلكس مجانا",
    "افلام ديزني مترجمة",
    "افلام مارفل مترجمة",
    "مسلسلات HBO مترجمة",
    "افلام 4K مترجمة",
    "موقع افلام سريع",
    "افلام بدون حجب",
    "مترجم",
    "مترجمة",
    "subbed",
    "subtitled",
    "subtitulado",
    "legendado",
    "vostfr",
    "sous-titré",
    "altyazılı",
    "с субтитрами",
    "субтитры",

    // English — brand queries from Search Console + streaming intent
    ...ENGLISH_SEO_KEYWORDS,

    // German Deutsch
    "Filme kostenlos ansehen", "Kostenlose Filme online", "Serien streamen kostenlos",
    "Arabische Filme mit Untertiteln", "Filme mit Untertiteln", "Filme online schauen",
    "Kostenlos Serien gucken", "Anime auf Deutsch", "Neue Filme 2026",
    "Filme streamen gratis", "Beste Film Streaming Seite",
    "Kinofilme kostenlos", "Deutsche Serien online", "Türkische Serien mit Untertiteln",
    "Netflix Alternative kostenlos", "Filme ohne Anmeldung schauen",
    "Action Filme kostenlos", "Horror Filme online", "Komödien kostenlos streamen",
    "Bollywood Filme Deutsch", "Koreanische Serien Deutsch", "Anime Deutsch Untertitel",
    "beste Seiten zum Filme und Serien schauen", "Filmsuche Streaming",

    // French Français
    "regarder film gratuit", "films en streaming gratuit", "séries gratuites en ligne",
    "films sous-titrés gratuit", "regarder anime gratuit", "films HD gratuit",
    "nouveau film 2026", "site de streaming gratuit", "séries en streaming",
    "films sans inscription", "regarder séries netflix gratuit", "films action gratuit",
    "films horreur streaming", "comédie en streaming", "films romantiques gratuit",
    "meilleur site streaming 2026", "anime vostfr gratuit", "drama coréen gratuit",
    "films 4K gratuit", "alternative netflix gratuit",
    "meilleurs sites pour regarder films et séries gratuitement", "moteur de recherche films et séries",

    // Spanish Español
    "ver películas gratis", "películas online gratis", "series gratis en línea",
    "películas subtituladas gratis", "ver anime gratis", "películas HD gratis",
    "películas nuevas 2026", "cine gratis online", "series de televisión gratis",
    "mejor sitio de películas gratis", "streaming películas",
    "ver películas sin registro", "alternativa a netflix gratis", "doramas gratis",
    "películas de acción gratis", "películas de terror online", "comedia gratis online",
    "películas 4K gratis", "estrenos 2026 gratis", "anime latino gratis",
    "series turcas subtituladas", "películas marvel gratis",
    "mejores sitios para ver películas y series gratis", "buscador de películas y series",

    // Turkish Türkçe
    "ücretsiz film izle", "online film izle", "ücretsiz dizi izle",
    "altyazılı film izle", "anime izle ücretsiz", "HD film izle",
    "yeni filmler 2026", "bedava film sitesi", "dizi izle türkçe altyazılı",
    "en iyi film izleme sitesi", "film izle full HD",
    "kayıt olmadan film izle", "netflix alternatifleri ücretsiz", "kore dizileri izle",
    "aksiyon filmleri izle", "korku filmleri izle", "komedi filmleri ücretsiz",
    "4K film izle bedava", "2026 yeni çıkan filmler", "anime türkçe altyazılı",
    "hint filmleri türkçe", "yerli diziler izle", "türk filmleri izle",
    "ücretsiz film ve dizi izleme siteleri", "film dizi arama motoru",

    // Portuguese Português — Portugal is a top Search Console country
    ...PORTUGUESE_SEO_KEYWORDS,

    // Russian Русский
    "смотреть фильмы бесплатно", "фильмы онлайн бесплатно", "сериалы бесплатно",
    "аниме с субтитрами", "новые фильмы 2026",
    "смотреть сериалы бесплатно", "фильмы HD бесплатно", "лучший сайт для фильмов",
    "фильмы без регистрации", "альтернатива нетфликс", "корейские дорамы бесплатно",
    "фильмы 2026 онлайн", "боевики бесплатно", "ужасы онлайн", "аниме онлайн бесплатно",
    "фильмы с субтитрами", "сериалы с субтитрами", "субтитры", "смотреть с субтитрами",

    // Hindi हिन्दी — India is a top Search Console country
    ...HINDI_SEO_KEYWORDS,

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

    // Greek Ελληνικά — Greece appears in Search Console
    "δωρεάν ταινίες online", "σειρές δωρεάν", "anime δωρεάν", "νέες ταινίες 2026",
    "ταινίες με υπότιτλους", "δωρεάν ταινίες HD", "ταινίες χωρίς εγγραφή", "ταινίες Hollywood δωρεάν",

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
    title: "أفضل المواقع لمشاهدة افلام و مسلسلات مجاناً | وقت الافلام — MovieVault",
    description:
      "محرك بحث لبث الأفلام والمسلسلات. وقت الافلام - شاهد أحدث الأفلام والمسلسلات و انمي المترجمة مجاناً بجودة HD. وقت الافلام ووقت مسلسلات ووقت انمي على MovieVault.",
    url: SITE_URL,
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US", "de_DE", "fr_FR", "es_ES", "tr_TR"],
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
    title: "أفضل المواقع لمشاهدة افلام و مسلسلات مجاناً | وقت الافلام — MovieVault",
    description:
      "محرك بحث لبث الأفلام والمسلسلات. وقت الافلام - شاهد أحدث الأفلام والمسلسلات و انمي المترجمة مجاناً بجودة HD على MovieVault.",
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
  const logoUrl = `${SITE_URL}/icon-512.png`;
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "MovieVault",
        alternateName: [
          "خزنة الافلام",
          "خزنة الأفلام",
          "movie vault",
          "movievault",
          "وقت الافلام",
          "وقت مسلسلات",
          "وقت انمي",
        ],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: 512,
          height: 512,
        },
        image: logoUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "MovieVault",
        alternateName: [
          "خزنة الافلام",
          "خزنة الأفلام",
          "موقع خزنة الافلام",
          "موقع افلام اجنبيه مترجمه",
          "موقع انمي خزنة افلام",
          "وقت الافلام",
          "وقت مسلسلات",
          "وقت انمي",
        ],
        description:
          "محرك بحث لبث الأفلام والمسلسلات. أفضل المواقع لمشاهدة افلام و مسلسلات مجاناً. وقت الافلام - شاهد أحدث الأفلام والمسلسلات و انمي المترجمة.",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" dir="ltr" className={`${tajawal.variable} ${brandFont.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href={`${SITE_URL}/favicon.ico`} />
        <link rel="icon" href={`${SITE_URL}/favicon.ico`} sizes="any" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href={`${SITE_URL}/favicon-32.png`} />
        <link rel="icon" type="image/png" sizes="48x48" href={`${SITE_URL}/favicon-48.png`} />
        <link rel="icon" type="image/png" sizes="64x64" href={`${SITE_URL}/favicon-64.png`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${SITE_URL}/icon-192.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${SITE_URL}/apple-touch-icon.png`} />
        <meta name="msapplication-TileImage" content={`${SITE_URL}/icon-192.png`} />
        <meta name="msapplication-TileColor" content="#0a0a0c" />
        <meta name="msvalidate.01" content="D4907A47975D1815F1A33C38F469777C" />
        <meta name="6a97888e-site-verification" content="4885bbb7a2cecf9504e2ac389bb2a5a3" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="أفضل المواقع لمشاهدة افلام و مسلسلات مجاناً | وقت الافلام — MovieVault" />
        <meta property="og:description" content="محرك بحث لبث الأفلام والمسلسلات. وقت الافلام - شاهد أحدث الأفلام والمسلسلات و انمي المترجمة مجاناً بجودة HD على MovieVault." />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="MovieVault" />
        <script
          src="https://quge5.com/88/tag.min.js"
          async
          data-zone="269853"
          data-cfasync="false"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className={`${tajawal.variable} ${brandFont.variable} min-h-screen bg-background text-foreground antialiased`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <LanguageProvider>
          <AuthProvider>
            <WatchlistProvider>
              <VipProvider>
                <div data-site-chrome="1">
                  <Navbar />
                </div>
                <main data-site-root="1">{children}</main>
                <Footer />
                <AdChromeGuard />
                <PlayerCornerAds />
                <Suspense fallback={null}>
                  <AntiAdblock />
                </Suspense>
                <Analytics />
              </VipProvider>
            </WatchlistProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
