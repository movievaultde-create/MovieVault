export type BlogCategory = "reviews" | "guides" | "best-lists" | "news";

export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogAffiliateBlock {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  disclaimer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  readingMinutes: number;
  category: BlogCategory;
  tags: string[];
  featuredImage: string | null;
  seoTitle: string;
  seoDescription: string;
  sections: BlogSection[];
  watchHref?: string;
  source: "manual" | "auto";
  affiliate?: BlogAffiliateBlock;
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-thriller-movies-to-watch-tonight",
    title: "Best Thriller Movies to Watch Tonight (No Filler List)",
    excerpt:
      "A curated thriller list with pace, twists, and high replay value. Perfect when you need a guaranteed intense movie night.",
    publishedAt: "2026-02-20",
    author: "MovieVault Editorial",
    readingMinutes: 7,
    category: "best-lists",
    tags: ["thriller", "movie-lists", "weekend-watch"],
    featuredImage: "https://image.tmdb.org/t/p/w780/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    seoTitle: "Best Thriller Movies to Watch Tonight | MovieVault Blog",
    seoDescription:
      "Discover the best thriller movies to watch tonight, hand-picked for suspense, pacing, and unforgettable plot twists.",
    sections: [
      {
        heading: "Why this thriller list works",
        paragraphs: [
          "Most thriller lists are random. This one is built around tension control, pacing, and payoff. Every title here starts strong and avoids the slow middle that kills momentum.",
          "If you want one movie that keeps everyone focused until the final scene, start with a psychological thriller from this list instead of action-heavy titles.",
        ],
      },
      {
        heading: "How to pick the right thriller for your mood",
        paragraphs: [
          "Choose mind-game thrillers if you want twists and unreliable narrators. Choose crime thrillers if you want realistic pressure and a grounded atmosphere.",
          "For late-night watching, prioritize movies under 2 hours with a high first-act hook. That combination gives a better completion rate and stronger satisfaction.",
        ],
      },
      {
        heading: "Final recommendation",
        paragraphs: [
          "If you are watching with friends, pick a twist-driven title. If you are watching solo, choose a slow-burn psychological thriller with deeper character writing.",
          "Bookmark this list and rotate one title weekly. Consistency is the fastest way to discover your personal favorite sub-genre.",
        ],
      },
    ],
    watchHref: "/movies",
    source: "manual",
    affiliate: {
      title: "Secure your streaming setup with a premium VPN",
      description:
        "For better privacy, fewer throttling issues, and stable HD streaming quality, use a trusted VPN provider.",
      ctaLabel: "Check the recommended VPN",
      href: "#",
      disclaimer:
        "Disclosure: This section may contain affiliate links. We may earn a commission if you subscribe through our link at no extra cost to you.",
    },
  },
  {
    slug: "movie-night-setup-guide",
    title: "Movie Night Setup Guide: Better Picture, Better Sound, Better Experience",
    excerpt:
      "A practical setup guide to improve your movie nights instantly without expensive equipment or complicated steps.",
    publishedAt: "2026-02-18",
    author: "MovieVault Editorial",
    readingMinutes: 6,
    category: "guides",
    tags: ["home-cinema", "streaming-tips", "movie-night"],
    featuredImage: "https://image.tmdb.org/t/p/w780/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
    seoTitle: "Movie Night Setup Guide for Home Streaming | MovieVault Blog",
    seoDescription:
      "Upgrade your movie night with a simple setup checklist for picture quality, audio balance, and distraction-free streaming.",
    sections: [
      {
        heading: "Start with lighting and display settings",
        paragraphs: [
          "The biggest upgrade is usually not a new TV. It is controlling room light and using a balanced display mode. Avoid the over-saturated presets made for store demos.",
          "A dim, neutral room with reduced reflections gives better contrast and deeper blacks, especially in dark scenes.",
        ],
      },
      {
        heading: "Audio matters more than resolution",
        paragraphs: [
          "A clean dialogue mix has more impact than jumping from 1080p to 4K. If voices sound buried, reduce bass and increase center-channel focus where possible.",
          "Even basic external speakers can dramatically improve immersion compared to default TV audio.",
        ],
      },
      {
        heading: "Build a repeatable watch ritual",
        paragraphs: [
          "Prepare snacks, silence notifications, and pick one title before starting. Decision fatigue is the reason many sessions end without actually watching anything.",
          "A repeatable 5-minute routine turns random browsing into a real movie-night habit.",
        ],
      },
    ],
    watchHref: "/movies",
    source: "manual",
    affiliate: {
      title: "Recommended streaming toolkit",
      description:
        "Explore tools that improve privacy, playback consistency, and subscription value while watching online.",
      ctaLabel: "View recommended tools",
      href: "#",
      disclaimer:
        "Disclosure: Some links are affiliate links. If you buy through them, we may receive a small commission.",
    },
  },
  {
    slug: "dune-part-two-review-no-spoilers",
    title: "Dune: Part Two Review (No Spoilers) - Is It Worth Your Time?",
    excerpt:
      "A no-spoiler review focused on pacing, performances, visual scale, and who will enjoy this film most.",
    publishedAt: "2026-02-14",
    updatedAt: "2026-02-19",
    author: "MovieVault Editorial",
    readingMinutes: 5,
    category: "reviews",
    tags: ["reviews", "sci-fi", "cinema"],
    featuredImage: "https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    seoTitle: "Dune Part Two Review (No Spoilers) | MovieVault Blog",
    seoDescription:
      "Read our no-spoiler Dune: Part Two review covering storytelling, visuals, sound design, and whether it deserves a full watch.",
    sections: [
      {
        heading: "Story and pacing",
        paragraphs: [
          "The film commits to scale and political tension without sacrificing emotional beats. It is deliberate, but more focused than many long-form sci-fi titles.",
          "If you prefer fast-cut action every ten minutes, the pacing may feel controlled rather than explosive.",
        ],
      },
      {
        heading: "Visual and sound impact",
        paragraphs: [
          "The visual language is massive, clean, and unmistakable. Large-format scenes are designed to be felt, not just seen.",
          "Sound design is a major strength. The low-end and atmospheric layers add intensity to even quiet moments.",
        ],
      },
      {
        heading: "Who should watch it",
        paragraphs: [
          "Watch it if you enjoy epic world-building, strong cinematography, and deliberate storytelling. Skip it if you want a lightweight popcorn tone.",
          "For most sci-fi fans, this is a high-priority watch.",
        ],
      },
    ],
    watchHref: "/watch/693134",
    source: "manual",
  },
  {
    slug: "best-sci-fi-movies-2026-list",
    title: "Top 10 Sci-Fi Movies to Watch in 2026",
    excerpt:
      "A high-intent watchlist for sci-fi fans with action scale, emotional depth, and the strongest titles trending this year.",
    publishedAt: "2026-02-13",
    author: "MovieVault Editorial",
    readingMinutes: 8,
    category: "best-lists",
    tags: ["sci-fi", "movie-lists", "2026"],
    featuredImage: "https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    seoTitle: "Best Sci-Fi Movies in 2026 | Top 10 List",
    seoDescription:
      "Explore 10 must-watch sci-fi movies in 2026 with quick picks for epic scale, strong visuals, and rewatch value.",
    sections: [
      {
        heading: "Why this 2026 list matters",
        paragraphs: [
          "This list is built around what viewers are actively searching now: big worlds, strong pacing, and memorable scenes.",
          "Instead of random picks, every title here is selected for high replay value and movie-night satisfaction.",
        ],
      },
      {
        heading: "How to pick your first watch",
        paragraphs: [
          "Start with fast-paced sci-fi if you are watching with friends. Pick character-driven sci-fi if you want deeper story impact.",
          "For weekend marathons, alternate between heavy and light titles to avoid fatigue.",
        ],
      },
    ],
    watchHref: "/movies",
    source: "manual",
  },
  {
    slug: "oppenheimer-review-worth-watching",
    title: "Oppenheimer Review - Is It Worth Watching in 2026?",
    excerpt:
      "A spoiler-free review focused on pacing, tension, and why this film still performs strongly with serious cinema fans.",
    publishedAt: "2026-02-12",
    author: "MovieVault Editorial",
    readingMinutes: 6,
    category: "reviews",
    tags: ["reviews", "drama", "cinema"],
    featuredImage: "https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    seoTitle: "Oppenheimer Review (No Spoilers) | MovieVault",
    seoDescription:
      "Read our concise Oppenheimer review with no spoilers, including pacing notes, strengths, and watch recommendation.",
    sections: [
      {
        heading: "What works best",
        paragraphs: [
          "The biggest strength is tension through dialogue and structure, not only visual spectacle.",
          "It rewards focused watching and gives a stronger payoff if you enjoy historical drama with pressure-driven scenes.",
        ],
      },
      {
        heading: "Should you watch now?",
        paragraphs: [
          "Watch it if you want intense drama and serious tone. Skip it for casual background viewing.",
          "For most mature audiences, this is still one of the strongest modern drama experiences.",
        ],
      },
    ],
    watchHref: "/watch/872585",
    source: "manual",
  },
  {
    slug: "avatar-way-of-water-review-streaming",
    title: "Avatar: The Way of Water Review - Streaming Rewatch Guide",
    excerpt:
      "A quick review of visual quality, story pacing, and whether Avatar 2 is worth rewatching on home streaming.",
    publishedAt: "2026-02-11",
    author: "MovieVault Editorial",
    readingMinutes: 5,
    category: "reviews",
    tags: ["reviews", "sci-fi", "adventure"],
    featuredImage: "https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    seoTitle: "Avatar 2 Review for Streaming Viewers | MovieVault",
    seoDescription:
      "A practical Avatar: The Way of Water review for streaming viewers, including visuals, pacing, and final recommendation.",
    sections: [
      {
        heading: "Visual impact at home",
        paragraphs: [
          "Avatar 2 remains visually stunning even on home setups, especially with balanced brightness and good contrast.",
          "Its strongest moments are world-building scenes that reward bigger screens.",
        ],
      },
      {
        heading: "Best way to watch",
        paragraphs: [
          "Use a dark room and stable HD stream for the best result. Sound setup matters more than most viewers expect.",
          "If you enjoyed the first film, this rewatch is easy to recommend.",
        ],
      },
    ],
    watchHref: "/watch/76600",
    source: "manual",
  },
  {
    slug: "deadpool-wolverine-arabic-subtitle-release-date",
    title: "Deadpool & Wolverine Arabic Subtitle Release Update",
    excerpt:
      "Latest update on Arabic subtitle availability, expected timelines, and how to follow release changes without missing alerts.",
    publishedAt: "2026-02-10",
    author: "MovieVault Editorial",
    readingMinutes: 4,
    category: "news",
    tags: ["movie-news", "arabic-subtitles", "new-release"],
    featuredImage: "https://image.tmdb.org/t/p/w780/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
    seoTitle: "Deadpool & Wolverine Arabic Subtitle Date | MovieVault",
    seoDescription:
      "Track the latest Arabic subtitle release timing for Deadpool & Wolverine and jump directly to watch options.",
    sections: [
      {
        heading: "Current subtitle status",
        paragraphs: [
          "Search volume for this title is high, especially for Arabic subtitle requests. Users want clear updates, not rumors.",
          "This post is maintained as a quick reference for release timing and watch readiness.",
        ],
      },
      {
        heading: "What to do next",
        paragraphs: [
          "Save this page and check the watch button for immediate access once the preferred version is available.",
        ],
      },
    ],
    watchHref: "/watch/533535",
    source: "manual",
  },
  {
    slug: "best-action-movies-2026-fast-list",
    title: "Best Action Movies in 2026 (Fast Watchlist)",
    excerpt:
      "An action-focused shortlist for viewers who want high intensity, no filler, and reliable picks for tonight.",
    publishedAt: "2026-02-09",
    author: "MovieVault Editorial",
    readingMinutes: 7,
    category: "best-lists",
    tags: ["action", "movie-lists", "2026"],
    featuredImage: "https://image.tmdb.org/t/p/w780/r7Dfg9aRZ78gJsmDlCirIIlNH3d.jpg",
    seoTitle: "Best Action Movies 2026 | Fast Watchlist",
    seoDescription:
      "Discover the strongest action movies to watch in 2026 with quick picks for pace, intensity, and entertainment value.",
    sections: [
      {
        heading: "Action picks with real pace",
        paragraphs: [
          "These picks avoid slow intros and focus on momentum from the first act.",
          "If your main goal is pure entertainment, this list gives reliable, high-energy options.",
        ],
      },
      {
        heading: "Quick recommendation",
        paragraphs: [
          "Pick one grounded action title and one stylized title for variety.",
          "This strategy keeps your session engaging and reduces mid-movie drop-off.",
        ],
      },
    ],
    watchHref: "/movies",
    source: "manual",
  },
  {
    slug: "gladiator-2-review-first-impression",
    title: "Gladiator II Review - First Impression Without Spoilers",
    excerpt:
      "A first-impression review covering tone, atmosphere, and whether Gladiator II lives up to legacy expectations.",
    publishedAt: "2026-02-08",
    author: "MovieVault Editorial",
    readingMinutes: 5,
    category: "reviews",
    tags: ["reviews", "historical", "cinema"],
    featuredImage: "https://image.tmdb.org/t/p/w780/3S0rwQ0zv1fY1xJzQw7Q9M5a9lM.jpg",
    seoTitle: "Gladiator II Review (No Spoilers) | MovieVault",
    seoDescription:
      "Read a spoiler-free Gladiator II review focused on tone, acting presence, and whether it is worth immediate watching.",
    sections: [
      {
        heading: "Atmosphere and tone",
        paragraphs: [
          "The movie leans heavily into scale and intensity. Its tone is serious and built for big dramatic moments.",
          "Fans of historical conflict drama will likely enjoy the mood and visual setup.",
        ],
      },
      {
        heading: "Who should watch it",
        paragraphs: [
          "Watch if you enjoy legacy sequels with cinematic ambition. Save for later if you want a light, easy watch.",
        ],
      },
    ],
    watchHref: "/movies",
    source: "manual",
  },
  {
    slug: "inside-out-2-arabic-dub-subtitle-update",
    title: "Inside Out 2 Arabic Dub & Subtitle Update",
    excerpt:
      "A practical update for families about Arabic dub and subtitle availability, with direct watch path when ready.",
    publishedAt: "2026-02-07",
    author: "MovieVault Editorial",
    readingMinutes: 4,
    category: "news",
    tags: ["movie-news", "family", "arabic-subtitles"],
    featuredImage: "https://image.tmdb.org/t/p/w780/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg",
    seoTitle: "Inside Out 2 Arabic Dub Release Update | MovieVault",
    seoDescription:
      "Follow the latest Arabic dub and subtitle status for Inside Out 2 and access watch options quickly.",
    sections: [
      {
        heading: "What families are searching for",
        paragraphs: [
          "Parents are mainly searching for clean subtitle timing and reliable Arabic dub availability.",
          "This page is optimized for quick updates so you can decide fast without checking multiple sources.",
        ],
      },
      {
        heading: "Next step",
        paragraphs: [
          "Use the watch button below to check availability and move directly to viewing when your preferred option appears.",
        ],
      },
    ],
    watchHref: "/movies",
    source: "manual",
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.tags.includes(tag));
}

export function getAllBlogTags(): string[] {
  const tagSet = new Set<string>();
  for (const post of BLOG_POSTS) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b));
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3): BlogPost[] {
  return getAllBlogPosts()
    .filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        candidate.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, limit);
}

export function getRelatedBlogPostsFromPool(
  post: BlogPost,
  pool: BlogPost[],
  limit = 3,
): BlogPost[] {
  return pool
    .filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        candidate.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, limit);
}

interface TmdbMovie {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  popularity?: number;
  adult?: boolean;
}

type UpcomingCandidate = {
  id: number;
  type: "movie";
  title: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  posterPath: string | null;
  backdropPath: string | null;
  popularity: number;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysAhead(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyEntertainmentTrend(keyword: string): boolean {
  const blocked = [
    "weather",
    "earthquake",
    "election",
    "crypto",
    "stock",
    "football",
    "soccer",
    "nba",
    "match",
    "news",
    "live",
  ];
  const normalized = normalizeForMatch(keyword);
  return !blocked.some((term) => normalized.includes(term));
}

async function fetchGoogleTrendKeywords(limit = 25): Promise<string[]> {
  // Public Google Trends RSS feed (no API key required).
  const rssUrl = "https://trends.google.com/trending/rss?geo=US";
  try {
    const res = await fetch(rssUrl, { next: { revalidate: 1800 } } as RequestInit);
    if (!res.ok) return [];
    const xml = await res.text();
    const matches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)];
    const rawTitles = matches.map((m) => m[1]).filter(Boolean);
    const cleaned = rawTitles
      .map((title) => title.trim())
      .filter((title) => title.length > 1 && title.toLowerCase() !== "daily search trends")
      .filter(isLikelyEntertainmentTrend);
    return cleaned.slice(0, limit);
  } catch {
    return [];
  }
}

function buildUpcomingLandingPost(
  item: UpcomingCandidate,
  trendKeywords: string[],
): BlogPost {
  const year = item.releaseDate.slice(0, 4) || "2026";
  const score = item.voteAverage > 0 ? item.voteAverage.toFixed(1) : "N/A";
  const slugBase = slugify(item.title) || `${item.type}-${item.id}`;
  const slug = `landing-${slugBase}-${item.id}`;
  const normalizedTitle = normalizeForMatch(item.title);
  const trendMention = trendKeywords.find((kw) =>
    normalizedTitle.includes(normalizeForMatch(kw)),
  );
  const trendLine = trendMention
    ? `Google Trends interest is rising for "${trendMention}", which is helping this title gain early momentum.`
    : "Search demand is rising this week, making this one of the most valuable early-index pages.";

  return {
    slug,
    title: `${item.title} (${year}) Release Date, Poster, Story & Watch Updates`,
    excerpt:
      item.overview?.slice(0, 220) ||
      `Track the latest update for ${item.title}: release timing, trailer buzz, early audience interest, and where to watch once available.`,
    publishedAt: new Date().toISOString().slice(0, 10),
    author: "MovieVault Trend Desk",
    readingMinutes: 4,
    category: "news",
    tags: [
      "landing-page",
      "upcoming",
      "movie-news",
      year,
    ],
    featuredImage: item.backdropPath
      ? `https://image.tmdb.org/t/p/w780${item.backdropPath}`
      : item.posterPath
        ? `https://image.tmdb.org/t/p/w780${item.posterPath}`
        : null,
    seoTitle: `${item.title} Release Date, Poster & Updates (${year}) | MovieVault`,
    seoDescription:
      `Get the latest ${item.title} update: release date, poster, trailer buzz, and instant watch updates on MovieVault.`.slice(
        0,
        158,
      ),
    sections: [
      {
        heading: `${item.title} release timeline`,
        paragraphs: [
          `${item.title} is currently tracked as an upcoming ${item.type === "movie" ? "movie" : "series"} with expected audience demand building before release.`,
          `${item.title} is currently tracked as an upcoming movie with expected audience demand building before release.`,
          "This landing page is published early to capture search intent before launch day and keep updates centralized.",
        ],
      },
      {
        heading: "Trend momentum and audience interest",
        paragraphs: [
          trendLine,
          `Current rating indicator sits around ${score}. This can shift rapidly once the full audience watches the title.`,
        ],
      },
      {
        heading: "Poster, trailer, and watch updates",
        paragraphs: [
          "As new assets drop (poster, trailer, dubbed/subbed versions), this page can be refreshed quickly for SEO freshness.",
          "Use the watch button below to jump directly once the title is available on-site.",
        ],
      },
    ],
    watchHref: `/watch/${item.id}`,
    source: "auto",
    affiliate: {
      title: "Get launch-day streaming advantages",
      description:
        "Use a premium VPN for privacy, stable speed, and smoother playback when major titles release and traffic spikes.",
      ctaLabel: "Check launch-ready VPN deal",
      href: "#",
      disclaimer:
        "Affiliate disclosure: We may earn a commission from qualifying subscriptions.",
    },
  };
}

function isQualifiedUpcomingMovie(movie: TmdbMovie, today: string, horizon: string): boolean {
  const title = movie.title ?? movie.original_title ?? "";
  const releaseDate = movie.release_date ?? "";
  if (!title || !releaseDate) return false;
  if (movie.adult) return false;
  if (releaseDate < today || releaseDate > horizon) return false;
  if ((movie.vote_count ?? 0) < 30) return false;
  if ((movie.popularity ?? 0) < 20) return false;
  if ((movie.overview ?? "").trim().length < 40) return false;
  if (!movie.poster_path && !movie.backdrop_path) return false;
  return true;
}

function buildAutoMoviePost(movie: TmdbMovie): BlogPost | null {
  const title = movie.title ?? movie.original_title ?? "";
  if (!title) return null;

  const releaseYear = (movie.release_date ?? "").slice(0, 4) || "2026";
  const score = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const safeTitleSlug = slugify(title) || `movie-${movie.id}`;

  return {
    slug: `daily-${safeTitleSlug}-${movie.id}`,
    title: `${title} (${releaseYear}) Review, Release Update & Watch Guide`,
    excerpt:
      movie.overview?.slice(0, 220) ||
      `Everything you need before watching ${title}: release buzz, audience expectations, and whether this title is worth adding to your watchlist.`,
    publishedAt: movie.release_date || new Date().toISOString().slice(0, 10),
    author: "MovieVault Auto Desk",
    readingMinutes: 4,
    category: "news",
    tags: ["new-release", "movie-news", "reviews", releaseYear],
    featuredImage: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
      : movie.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : null,
    seoTitle: `${title} Review & Release News (${releaseYear}) | MovieVault`,
    seoDescription:
      `Read the latest update about ${title}, check early reactions, and jump directly to watch options on MovieVault.`.slice(
        0,
        158,
      ),
    sections: [
      {
        heading: `What is happening with ${title} now?`,
        paragraphs: [
          `${title} is one of the most searched new releases right now. Interest is increasing because viewers are actively looking for fast watch options and spoiler-free impressions.`,
          `Our team tracks high-intent movie searches daily, so this article is refreshed around release momentum and audience demand.`,
        ],
      },
      {
        heading: "Early expectations and first impressions",
        paragraphs: [
          `Current rating indicators put this title around ${score}, which suggests strong early curiosity. Keep in mind that scores can shift quickly in the first days after release.`,
          "If you like clean updates without filler, this guide helps you decide quickly whether to watch now or save it for your weekend list.",
        ],
      },
      {
        heading: "How to watch next",
        paragraphs: [
          `Ready to continue? Use the watch button below to open ${title} directly and keep your session focused without extra searching.`,
        ],
      },
    ],
    watchHref: `/watch/${movie.id}`,
    source: "auto",
    affiliate: {
      title: "Boost streaming quality and privacy",
      description:
        "Many users pair new-release nights with a premium VPN for stable speed, privacy, and broader access options.",
      ctaLabel: "View the recommended VPN offer",
      href: "#",
      disclaimer:
        "Affiliate disclosure: We may earn a commission if you subscribe through selected links.",
    },
  };
}

export async function getAutoDailyBlogPosts(limit = 12): Promise<BlogPost[]> {
  const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return [];

  const BASE = "https://api.themoviedb.org/3";
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = daysAgo(1);

  const url =
    `${BASE}/discover/movie?api_key=${TMDB_KEY}` +
    `&language=en-US&sort_by=primary_release_date.desc` +
    `&primary_release_date.gte=${yesterday}&primary_release_date.lte=${today}` +
    `&vote_count.gte=5&page=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: TmdbMovie[] };
    const mapped = (data.results ?? [])
      .slice(0, limit)
      .map(buildAutoMoviePost)
      .filter((post): post is BlogPost => Boolean(post));
    return mapped;
  } catch {
    return [];
  }
}

export async function getUpcomingLandingBlogPosts(limit = 50): Promise<BlogPost[]> {
  const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return [];

  const BASE = "https://api.themoviedb.org/3";
  const today = new Date().toISOString().slice(0, 10);
  const horizon = daysAhead(180);

  const movieUrls = [1, 2, 3, 4, 5].map(
    (page) =>
      `${BASE}/discover/movie?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${today}&primary_release_date.lte=${horizon}&vote_count.gte=5&page=${page}`,
  );

  try {
    const [trendKeywords, ...responses] = await Promise.all([
      fetchGoogleTrendKeywords(),
      ...movieUrls.map((url) => fetch(url, { next: { revalidate: 3600 } } as RequestInit)),
    ]);

    const payloads = await Promise.all(
      responses.map(async (res) => (res.ok ? (await res.json()) : { results: [] })),
    );

    const moviePayloads = payloads.slice(0, movieUrls.length);

    const movieCandidates: UpcomingCandidate[] = moviePayloads.flatMap(
      (payload: { results?: TmdbMovie[] }) =>
        (payload.results ?? [])
          .filter((movie) => isQualifiedUpcomingMovie(movie, today, horizon))
          .map((movie) => ({
            id: movie.id,
            type: "movie" as const,
            title: movie.title ?? movie.original_title ?? "",
            overview: movie.overview ?? "",
            releaseDate: movie.release_date ?? today,
            voteAverage: movie.vote_average ?? 0,
            voteCount: movie.vote_count ?? 0,
            posterPath: movie.poster_path ?? null,
            backdropPath: movie.backdrop_path ?? null,
            popularity: movie.popularity ?? 0,
          })),
    );
    const uniqueByKey = new Map<string, UpcomingCandidate>();
    for (const candidate of movieCandidates) {
      uniqueByKey.set(`movie-${candidate.id}`, candidate);
    }

    const normalizedTrends = trendKeywords.map(normalizeForMatch);
    const sorted = [...uniqueByKey.values()].sort((a, b) => {
      const aTitle = normalizeForMatch(a.title);
      const bTitle = normalizeForMatch(b.title);
      const aTrendScore = normalizedTrends.some((kw) => aTitle.includes(kw)) ? 1 : 0;
      const bTrendScore = normalizedTrends.some((kw) => bTitle.includes(kw)) ? 1 : 0;
      if (bTrendScore !== aTrendScore) return bTrendScore - aTrendScore;
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    });

    return sorted
      .slice(0, limit)
      .map((candidate) => buildUpcomingLandingPost(candidate, trendKeywords));
  } catch {
    return [];
  }
}

export async function getCombinedBlogPosts(): Promise<BlogPost[]> {
  const autoPosts = await getAutoDailyBlogPosts();
  const landingPosts = await getUpcomingLandingBlogPosts(50);
  const merged = [...landingPosts, ...autoPosts, ...getAllBlogPosts()];
  const deduped = new Map<string, BlogPost>();
  for (const post of merged) {
    deduped.set(post.slug, post);
  }
  return [...deduped.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getCombinedBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const posts = await getCombinedBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getCombinedBlogTags(): Promise<string[]> {
  const posts = await getCombinedBlogPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b));
}

export async function getCombinedBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getCombinedBlogPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function humanizeBlogTag(tag: string): string {
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
