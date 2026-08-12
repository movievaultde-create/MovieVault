import type { Metadata } from "next";
import { SITE_URL } from "./siteUrl";
import { watchPath } from "./watchUrl";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";

export { SITE_URL };

/** High-intent Arabic search queries (Bing/Google suggestions + brand). */
export const ARABIC_SEARCH_KEYWORDS = [
  "خزنة الافلام",
  "خزنة الأفلام",
  "موقع خزنة الافلام",
  "موقع خزنة الأفلام",
  "موقع افلام اجنبيه مترجمه",
  "موقع انمي خزنة افلام",
  "موقع انمي عربي خزنة افلام",
  "مسلسل او فيلم مترجم",
  "موقع خزنة الافلام افلام",
  "خزنة الافلام افلام",
  "خزنة الافلام مسلسلات",
  "خزنة الافلام انمي",
  "خزنة الافلام اصلي",
  "خزنة الافلام مسلسلات اجنبية",
  "خزنة الافلام مسلسلات عربية",
  "خزنة الافلام مسلسلات هندي",
  "خزنة الافلام مسلسلات تركية",
  "خزنة الافلام مسلسلات كورية",
  "خزنة الافلام مسلسلات غربية",
  "خزنة الافلام سلاسل الافلام",
  "خزنة الافلام مجانا",
  "خزنة الافلام مسلسلات مجانا",
  "خزنة الافلام افلام مجانا",
  "خزنة الافلام تحميل",
  "افضل موقع افلام اجنبيه مترجمه",
  "موقع افلام مترجمه عربي",
  "موقع ترجمة افلام اجنبي",
  "موقع تحميل افلام اجنبي",
  "مشاهدة افلام اجنبية مترجمة",
  "افلام اجنبي مترجمة للعربية",
  "افلام اجنبية مترجمة مجانا",
  "مواقع افلام اجنبية مترجمة",
  "مشاهدة افلام اجنبية اون لاين",
  "افلام و مسلسلات اجنبية مترجمة",
  "مشاهدة افلام اجنبي مترجم عربي",
  "افلام اجنبية اون لاين",
  "مشاهدة افلام اون لاين مجانا",
  "مشاهدة افلام اجنبيه مجانا",
  "مشاهدة الافلام والمسلسلات مترجمة مجانا",
  "موقع افلام",
  "افلام اجنبي مترجم",
  "افلام اجنبيه مترجمه بالعربي",
  "موقع انمي",
  "موقع انمي عربي",
  "موقع انمي مجاني",
  "موقع انمي عربي مجانا",
  "انمي عرب",
  "موقع انمي العرب",
  "موقع انمي ليك",
  "موقع انمي عربي للكمبيوتر",
  "مشاهده الانمي",
  "موقع لمشاهدة الأنمي مجانا",
  "موقع انمي مترجم",
  "مشاهدة انمي مترجم",
  "مشاهدة انمي اون لاين",
  "مشاهدة انمي مترجم مجانا",
  "انمي مترجم اون لاين",
  "موقع مشاهده انمي مترجم",
  "موقع انمي مترجمة بالعربية",
  "موقع انمي مدبلج عربي",
  "موقع انمي اون لاين",
  "موقع مشاهدة انمي مجاني",
  "موقع افلام اون لاين مترجمة",
  "موقع لمشاهدة الأنمي مجانا",
  "موقع انمي مترجم",
  "مشاهدة الانمي",
  "موقع شاهد فور يو الاصلي",
  "موقع شاهد فور يو مسلسلات عربية",
  "موقع شاهد فور يو مسلسلات تركية",
  "موقع شاهد فور يو مسلسلات اجنبية",
  "موقع شاهد فور يو مجانا",
  "موقع شاهد فور يو تحميل",
] as const;

/** Shared Arabic SEO keywords (site-wide + per-title). Phase: Arabic first. */
export const ARABIC_SEO_KEYWORDS = [
  ...ARABIC_SEARCH_KEYWORDS,
  // User-requested brands / phrases
  "shahid4u",
  "شاهد فور يو",
  "شاهيد فور يو",
  "ايجي ايد",
  "ايجي ديد",
  "egydead",
  "افلام مترجمة",
  "مسلسلات مترجمة",
  // Core Arabic discovery
  "مشاهدة افلام مترجمة",
  "مشاهدة مسلسلات مترجمة",
  "افلام مترجمة اون لاين",
  "مسلسلات مترجمة اون لاين",
  "افلام مترجمة HD",
  "مسلسلات مترجمة HD",
  "افلام اجنبية مترجمة",
  "مسلسلات اجنبية مترجمة",
  "مشاهدة افلام اون لاين",
  "مشاهدة مسلسلات اون لاين",
  "موقع افلام مترجمة",
  "موقع مسلسلات مترجمة",
  "افلام مترجمة مجانا",
  "مسلسلات مترجمة مجانا",
  "افلام بدون اعلانات",
  "مسلسلات بدون اعلانات",
  "تحميل افلام مترجمة",
  "تحميل مسلسلات مترجمة",
  "افلام جديدة مترجمة",
  "مسلسلات جديدة مترجمة",
  "انمي مترجم",
  "افلام اكشن مترجمة",
  "افلام رعب مترجمة",
  "مسلسلات تركية مترجمة",
  "مسلسلات كورية مترجمة",
  "بديل شاهد فور يو",
  "بديل ايجي ديد",
  "بديل shahid4u",
  "MovieVault",
] as const;

export function arabicTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  if (kind === "movie") {
    return [
      `${name} مترجم`,
      `فيلم ${name} مترجم`,
      `مسلسل او فيلم ${name} مترجم`,
      `مشاهدة فيلم ${name} مترجم`,
      `مشاهدة ${name} مترجم اون لاين`,
      `${name} مترجم HD`,
      `${name} كامل مترجم`,
      `تحميل فيلم ${name} مترجم`,
      `${name} اون لاين مترجم`,
      `${name} مترجم خزنة الافلام`,
    ];
  }
  return [
    `${name} مترجم`,
    `مسلسل ${name} مترجم`,
    `مسلسل او فيلم ${name} مترجم`,
    `مشاهدة مسلسل ${name} مترجم`,
    `مشاهدة ${name} مترجم اون لاين`,
    `${name} مترجم HD`,
    `${name} حلقات مترجمة`,
    `تحميل مسلسل ${name} مترجم`,
    `${name} اون لاين مترجم`,
    `${name} مترجم خزنة الافلام`,
  ];
}

/** Shared English SEO keywords (site-wide + per-title). */
export const ENGLISH_SEO_KEYWORDS = [
  "MovieVault",
  "movie vault",
  "movievault",
  "movievault.dev",
  "movie vault movies",
  "movie vault series",
  "movie vault anime",
  "movie vault free",
  "movie vault streaming",
  "movievault.eu alternative",
  "watch movies free",
  "watch movies online free",
  "stream movies HD",
  "free movie streaming",
  "movies with subtitles",
  "watch movies with subtitles",
  "subtitled movies online",
  "watch series online free",
  "watch TV shows online free",
  "TV series with subtitles",
  "watch series with subtitles",
  "anime subtitled free",
  "watch anime online free",
  "free HD movies",
  "movies online free 2026",
  "new movies 2026",
  "best free movie site",
  "watch movies without sign up",
  "watch movies no account",
  "free streaming no ads",
  "123movies alternative",
  "putlocker alternative",
  "fmovies alternative",
  "soap2day alternative",
  "watch netflix free",
  "watch disney plus free",
  "watch HBO free",
  "4K movies free",
  "watch bollywood movies online",
  "watch korean drama free",
  "watch action movies free",
  "watch horror movies online",
  "comedy movies free",
  "romance movies free",
  "thriller movies streaming",
  "sci-fi movies free",
  "watch marvel movies free",
  "new releases 2026 movies",
  "full movies online free",
  "stream TV shows HD",
  "download movies free HD",
  "free subtitled movies",
  "free subtitled series",
  "watch foreign movies online",
  "watch hollywood movies free",
] as const;

export const PORTUGUESE_SEO_KEYWORDS = [
  "MovieVault",
  "assistir filmes grátis",
  "filmes online grátis",
  "séries grátis online",
  "filmes legendados grátis",
  "assistir anime grátis",
  "filmes HD grátis",
  "filmes novos 2026",
  "assistir séries grátis",
  "melhor site de filmes",
  "filmes sem cadastro",
  "alternativa netflix grátis",
  "doramas grátis",
  "filmes de ação grátis",
  "filmes de terror online",
  "animes legendados grátis",
  "filmes hollywood grátis",
  "filmes legendados em português",
  "assistir filmes online HD",
  "séries legendadas grátis",
  "site de filmes grátis Portugal",
  "ver filmes grátis Portugal",
  "streaming filmes Portugal",
  "filmes 4K grátis",
  "baixar filmes grátis HD",
] as const;

export const HINDI_SEO_KEYWORDS = [
  "MovieVault",
  "फ्री मूवी देखें",
  "ऑनलाइन फिल्में देखें",
  "मुफ्त सीरीज देखें",
  "बॉलीवुड फिल्में ऑनलाइन",
  "हिंदी फिल्में देखें",
  "नई फिल्में 2026",
  "एनीमे हिंदी में देखें",
  "हॉलीवुड फिल्में हिंदी में",
  "वेब सीरीज फ्री",
  "फिल्में मुफ्त में देखें",
  "मूवी ऑनलाइन फ्री",
  "हॉलीवुड मूवी हिंदी सबटाइटल",
  "साउथ इंडियन फिल्में हिंदी में",
  "कोरियाई ड्रामा हिंदी में",
  "नेटफ्लिक्स फ्री में देखें",
  "फिल्म डाउनलोड फ्री HD",
  "नए मूवी 2026",
  "एक्शन मूवी फ्री",
  "हॉरर मूवी ऑनलाइन",
  "वेब सीरीज हिंदी में",
] as const;

export function englishTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  if (kind === "movie") {
    return [
      `${name} subtitled`,
      `watch ${name} online`,
      `watch ${name} free`,
      `${name} full movie`,
      `${name} full movie free`,
      `${name} HD`,
      `stream ${name} online`,
      `${name} with subtitles`,
      `watch ${name} online free HD`,
    ];
  }
  return [
    `${name} subtitled`,
    `watch ${name} online`,
    `watch ${name} free`,
    `${name} full episodes`,
    `${name} HD`,
    `stream ${name} online`,
    `${name} with subtitles`,
    `watch ${name} online free HD`,
    `${name} TV series`,
  ];
}

export function hindiTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  if (kind === "movie") {
    return [
      `${name} हिंदी में`,
      `${name} ऑनलाइन`,
      `${name} फ्री`,
      `${name} फुल मूवी`,
    ];
  }
  return [
    `${name} हिंदी में`,
    `${name} ऑनलाइन`,
    `${name} वेब सीरीज`,
    `${name} फ्री`,
  ];
}

export function portugueseTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  if (kind === "movie") {
    return [
      `${name} legendado`,
      `assistir ${name} online`,
      `filme ${name} grátis`,
      `${name} legendado HD`,
    ];
  }
  return [
    `${name} legendado`,
    `assistir ${name} online`,
    `série ${name} grátis`,
    `${name} episódios`,
  ];
}

export const GERMAN_SEO_KEYWORDS = [
  "MovieVault",
  "Filme gratis streamen",
  "Serien gratis online",
  "Filme mit Untertiteln",
  "Anime gratis schauen",
  "Filme HD gratis",
  "neue Filme 2026",
  "Serien mit Untertiteln",
  "Filme online schauen",
  "kostenlos Filme streamen",
] as const;

export const FRENCH_SEO_KEYWORDS = [
  "MovieVault",
  "films gratuits en streaming",
  "séries gratuites en ligne",
  "films sous-titrés",
  "anime gratuit",
  "films HD gratuits",
  "nouveaux films 2026",
  "regarder films en ligne",
  "séries sous-titrées",
  "streaming films gratuit",
] as const;

export const SPANISH_SEO_KEYWORDS = [
  "MovieVault",
  "ver películas gratis",
  "series gratis online",
  "películas subtituladas",
  "anime gratis",
  "películas HD gratis",
  "películas nuevas 2026",
  "ver series online",
  "streaming películas gratis",
  "películas extranjeras subtituladas",
] as const;

export const TURKISH_SEO_KEYWORDS = [
  "MovieVault",
  "ücretsiz film izle",
  "dizi izle ücretsiz",
  "altyazılı film",
  "anime izle",
  "HD film izle",
  "yeni filmler 2026",
  "online dizi izle",
  "yabancı film izle",
  "türkçe altyazılı film",
] as const;

export function germanTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  return kind === "movie"
    ? [`${name} streamen`, `${name} gratis`, `${name} mit Untertiteln`, `${name} HD`]
    : [`${name} Serie`, `${name} streamen`, `${name} Folgen`, `${name} mit Untertiteln`];
}

export function frenchTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  return kind === "movie"
    ? [`${name} streaming`, `regarder ${name}`, `${name} sous-titré`, `${name} HD`]
    : [`série ${name}`, `regarder ${name}`, `${name} épisodes`, `${name} sous-titrée`];
}

export function spanishTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  return kind === "movie"
    ? [`ver ${name}`, `${name} online`, `${name} subtitulada`, `${name} HD`]
    : [`serie ${name}`, `ver ${name}`, `${name} capítulos`, `${name} subtitulada`];
}

export function turkishTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  const name = title.trim();
  if (!name) return [];
  return kind === "movie"
    ? [`${name} izle`, `${name} full`, `${name} altyazılı`, `${name} HD`]
    : [`${name} dizi`, `${name} izle`, `${name} bölümleri`, `${name} altyazılı`];
}

/** All language banks used on watch pages + hubs. */
export function allLanguageKeywords(): string[] {
  return [
    ...ARABIC_SEO_KEYWORDS,
    ...ENGLISH_SEO_KEYWORDS,
    ...PORTUGUESE_SEO_KEYWORDS,
    ...HINDI_SEO_KEYWORDS,
    ...GERMAN_SEO_KEYWORDS,
    ...FRENCH_SEO_KEYWORDS,
    ...SPANISH_SEO_KEYWORDS,
    ...TURKISH_SEO_KEYWORDS,
  ];
}

export function allTitleKeywords(title: string, kind: "movie" | "tv"): string[] {
  return [
    ...arabicTitleKeywords(title, kind),
    ...englishTitleKeywords(title, kind),
    ...portugueseTitleKeywords(title, kind),
    ...hindiTitleKeywords(title, kind),
    ...germanTitleKeywords(title, kind),
    ...frenchTitleKeywords(title, kind),
    ...spanishTitleKeywords(title, kind),
    ...turkishTitleKeywords(title, kind),
  ];
}

export type CategorySeoKey =
  | "movies"
  | "tv-series"
  | "arab-movies"
  | "arab-series"
  | "turkish-series"
  | "korean-series"
  | "indian-movies"
  | "indian-series"
  | "foreign-movies"
  | "foreign-series";

const CATEGORY_SEO: Record<
  CategorySeoKey,
  { title: string; description: string; path: string; extra: string[] }
> = {
  movies: {
    path: "/movies",
    title: "أفلام مترجمة اون لاين HD — MovieVault",
    description:
      "شاهد أحدث الأفلام المترجمة اون لاين بجودة HD على MovieVault. Watch translated movies online free.",
    extra: ["افلام مترجمة", "افلام اجنبية مترجمة", "watch movies free", "Filme gratis"],
  },
  "tv-series": {
    path: "/tv-series",
    title: "مسلسلات مترجمة اون لاين HD — MovieVault",
    description:
      "مسلسلات مترجمة اون لاين بجودة HD مع تحديث مستمر. Watch TV series with subtitles on MovieVault.",
    extra: ["مسلسلات مترجمة", "مسلسلات اجنبية", "watch series free", "Serien gratis"],
  },
  "arab-movies": {
    path: "/arab-movies",
    title: "أفلام عربية مترجمة — MovieVault",
    description: "أحدث الأفلام العربية للمشاهدة اون لاين على خزنة الأفلام. Arabic movies on MovieVault.",
    extra: ["افلام عربية", "افلام عربية اون لاين", "arabic movies", "أفلام عربية"],
  },
  "arab-series": {
    path: "/arab-series",
    title: "مسلسلات عربية — MovieVault",
    description: "مسلسلات عربية اون لاين بجودة HD على خزنة الأفلام. Arabic series streaming.",
    extra: ["مسلسلات عربية", "مسلسلات عربية اون لاين", "arabic series"],
  },
  "turkish-series": {
    path: "/turkish-series",
    title: "مسلسلات تركية مترجمة — MovieVault",
    description: "مسلسلات تركية مترجمة اون لاين HD. Turkish diziler altyazılı — MovieVault.",
    extra: ["مسلسلات تركية مترجمة", "turkish series", "türkçe dizi izle", "diziler"],
  },
  "korean-series": {
    path: "/korean-series",
    title: "مسلسلات كورية مترجمة — MovieVault",
    description: "دراما كورية مترجمة اون لاين HD. Korean drama with subtitles on MovieVault.",
    extra: ["مسلسلات كورية مترجمة", "korean drama", "K-drama", "دراما كورية"],
  },
  "indian-movies": {
    path: "/indian-movies",
    title: "أفلام هندية مترجمة — MovieVault",
    description: "أفلام بوليوود وهندي مترجمة اون لاين. Bollywood movies Hindi — MovieVault.",
    extra: ["افلام هندية", "بوليوود", "bollywood movies", "हिंदी फिल्में"],
  },
  "indian-series": {
    path: "/indian-series",
    title: "مسلسلات هندية مترجمة — MovieVault",
    description: "مسلسلات هندية مترجمة اون لاين HD. Indian web series on MovieVault.",
    extra: ["مسلسلات هندية", "indian series", "वेब सीरीज हिंदी"],
  },
  "foreign-movies": {
    path: "/foreign-movies",
    title: "أفلام أجنبية مترجمة — MovieVault",
    description: "أفلام أجنبية وهوليوود مترجمة اون لاين HD. Foreign/Hollywood movies — MovieVault.",
    extra: ["افلام اجنبية مترجمة", "هوليوود", "hollywood movies", "Hollywood movies"],
  },
  "foreign-series": {
    path: "/foreign-series",
    title: "مسلسلات أجنبية مترجمة — MovieVault",
    description: "مسلسلات أجنبية مترجمة اون لاين HD. Foreign TV series with subtitles.",
    extra: ["مسلسلات اجنبية مترجمة", "foreign series", "TV shows subtitles"],
  },
};

export function buildCategoryMetadata(key: CategorySeoKey): Metadata {
  const cat = CATEGORY_SEO[key];
  return {
    title: { absolute: cat.title },
    description: cat.description,
    keywords: [...cat.extra, ...allLanguageKeywords()],
    alternates: { canonical: cat.path },
    openGraph: {
      title: cat.title,
      description: cat.description,
      url: `${SITE_URL}${cat.path}`,
      siteName: "MovieVault",
      type: "website",
      locale: "ar_SA",
    },
    robots: { index: true, follow: true },
  };
}

type TmdbMovieSeo = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  credits?: { crew?: Array<{ job: string; name: string }> };
};

type TmdbTvSeo = {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
};

export async function fetchTmdbMovieSeo(id: string): Promise<TmdbMovieSeo | null> {
  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return null;
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=credits`,
      { next: { revalidate: 3600 } } as RequestInit
    );
    if (!res.ok) return null;
    return (await res.json()) as TmdbMovieSeo;
  } catch {
    return null;
  }
}

export async function fetchTmdbTvSeo(id: string): Promise<TmdbTvSeo | null> {
  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return null;
  try {
    const res = await fetch(
      `${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=en-US`,
      { next: { revalidate: 3600 } } as RequestInit
    );
    if (!res.ok) return null;
    return (await res.json()) as TmdbTvSeo;
  } catch {
    return null;
  }
}

export function buildMovieMetadata(id: string, movie: TmdbMovieSeo | null): Metadata {
  const numericId = id.match(/(\d+)$/)?.[1] ?? id;
  if (!movie) {
    return {
      title: `Watch Movie #${numericId} Online HD - MovieVault`,
      description:
        "Watch movies online in HD on MovieVault. مشاهدة افلام مترجمة اون لاين بجودة عالية HD.",
      keywords: allLanguageKeywords(),
      alternates: { canonical: watchPath("movie", numericId) },
      robots: { index: true, follow: true },
    };
  }

  const year = movie.release_date?.slice(0, 4) || "HD";
  const path = watchPath("movie", numericId, movie.title);
  const title = `مشاهدة فيلم ${movie.title} مترجم اون لاين HD (${year}) - MovieVault`;
  const description = `مشاهدة فيلم ${movie.title} مترجم اون لاين بجودة عالية HD على MovieVault، مع خيارات تحميل ومشاهدة مباشرة. Watch ${movie.title} online in HD with subtitles.`;
  const image = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [...allTitleKeywords(movie.title, "movie"), ...allLanguageKeywords()],
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: "video.movie",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function buildTvMetadata(id: string, tv: TmdbTvSeo | null): Metadata {
  const numericId = id.match(/(\d+)$/)?.[1] ?? id;
  if (!tv) {
    return {
      title: `Watch TV Show #${numericId} Online HD - MovieVault`,
      description:
        "Watch TV series online in HD on MovieVault. مشاهدة المسلسلات مترجمة اون لاين بجودة عالية.",
      keywords: allLanguageKeywords(),
      alternates: { canonical: watchPath("tv", numericId) },
      robots: { index: true, follow: true },
    };
  }

  const year = tv.first_air_date?.slice(0, 4) || "HD";
  const path = watchPath("tv", numericId, tv.name);
  const title = `مشاهدة مسلسل ${tv.name} مترجم اون لاين HD (${year}) - MovieVault`;
  const description = `مشاهدة مسلسل ${tv.name} مترجم اون لاين بجودة HD على MovieVault مع تحديث مستمر للحلقات. Watch ${tv.name} online in HD with subtitles.`;
  const image = tv.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}`
    : tv.poster_path
      ? `https://image.tmdb.org/t/p/w780${tv.poster_path}`
      : `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [...allTitleKeywords(tv.name, "tv"), ...allLanguageKeywords()],
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: "video.tv_show",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}
