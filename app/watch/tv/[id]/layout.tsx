import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { notifyIndexNow } from "../../../lib/indexnow";
import {
  SITE_URL,
  buildTvMetadata,
  fetchTmdbTvSeo,
} from "../../../lib/seo";
import {
  isCanonicalWatchParam,
  parseWatchParam,
  watchPath,
} from "../../../lib/watchUrl";

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
  const show = await fetchTmdbTvSeo(id);
  return buildTvMetadata(id, show);
}

export default async function WatchTvLayout({ children, params }: Props) {
  const { id: raw } = await params;
  const id = parseWatchParam(raw);
  if (!/^\d+$/.test(id)) return children;

  const show = await fetchTmdbTvSeo(id);

  if (!show) return children;

  if (!isCanonicalWatchParam(raw, "tv", id, show.name)) {
    permanentRedirect(encodeURI(watchPath("tv", id, show.name)));
  }

  const showUrl = `${SITE_URL}${watchPath("tv", id, show.name)}`;
  await notifyIndexNow(showUrl);
  const image = show.poster_path
    ? `https://image.tmdb.org/t/p/w780${show.poster_path}`
    : `${SITE_URL}/og-image.jpg`;
  const year = show.first_air_date?.slice(0, 4);

  const tvSchema = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    description: show.overview,
    startDate: show.first_air_date || undefined,
    numberOfSeasons: show.number_of_seasons || undefined,
    numberOfEpisodes: show.number_of_episodes || undefined,
    image,
    inLanguage: ["ar", "en"],
    url: showUrl,
    genre: show.genres?.map((g) => g.name) ?? [],
    aggregateRating:
      show.vote_average > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(show.vote_average.toFixed(1)),
            ratingCount: show.vote_count || 1,
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
        name: "Series",
        item: `${SITE_URL}/tv-series`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: year ? `${show.name} (${year})` : show.name,
        item: showUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tvSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
