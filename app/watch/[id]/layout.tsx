import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { notifyIndexNow } from "../../lib/indexnow";
import {
  SITE_URL,
  buildMovieMetadata,
  fetchTmdbMovieSeo,
} from "../../lib/seo";
import {
  isCanonicalWatchParam,
  parseWatchParam,
  watchPath,
} from "../../lib/watchUrl";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseWatchParam(raw);
  if (!/^\d+$/.test(id)) {
    return { title: "MovieVault", robots: { index: false, follow: true } };
  }
  const movie = await fetchTmdbMovieSeo(id);
  return buildMovieMetadata(id, movie);
}

export default async function WatchMovieLayout({ children, params }: Props) {
  const { id: raw } = await params;
  const id = parseWatchParam(raw);
  if (!/^\d+$/.test(id)) return children;

  const movie = await fetchTmdbMovieSeo(id);

  if (!movie) return children;

  if (!isCanonicalWatchParam(raw, "movie", id, movie.title)) {
    // encodeURI keeps slashes; encodes Arabic so redirects don't 500
    permanentRedirect(encodeURI(watchPath("movie", id, movie.title)));
  }

  const movieUrl = `${SITE_URL}${watchPath("movie", id, movie.title)}`;
  await notifyIndexNow(movieUrl);
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : `${SITE_URL}/og-image.jpg`;
  const year = movie.release_date?.slice(0, 4);
  const director = movie.credits?.crew?.find((c) => c.job === "Director")?.name;

  const movieSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    datePublished: movie.release_date || undefined,
    image,
    inLanguage: ["ar", "en"],
    url: movieUrl,
    genre: movie.genres?.map((g) => g.name) ?? [],
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    director: director
      ? {
          "@type": "Person",
          name: director,
        }
      : undefined,
    aggregateRating:
      movie.vote_average > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(movie.vote_average.toFixed(1)),
            ratingCount: movie.vote_count || 1,
          }
        : undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Movies",
        item: `${SITE_URL}/movies`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: year ? `${movie.title} (${year})` : movie.title,
        item: movieUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
