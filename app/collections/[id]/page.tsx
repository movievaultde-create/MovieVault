"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "../../context/LanguageContext";
import MediaCard from "../../components/MediaCard";

interface MoviePart {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie";
}

interface CollectionData {
  name: string;
  overview: string;
  backdrop: string | null;
  parts: MoviePart[];
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, tmdbLang } = useLang();
  const [data, setData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/collections/${id}?lang=${tmdbLang}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id, tmdbLang]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.name) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-base)] pt-24">
        <p className="text-lg text-[var(--text-muted)]">{t("errorLoading")}</p>
        <Link href="/collections" className="text-[var(--accent)] hover:underline">{t("backToCollections")}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {data.backdrop && (
        <div className="relative h-[300px] w-full sm:h-[400px]">
          <Image src={data.backdrop} alt={data.name} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
        </div>
      )}

      <div className={`mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 ${data.backdrop ? "-mt-32 relative z-10" : "pt-24"}`}>
        <Link href="/collections" className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          {t("backToCollections")}
        </Link>

        <h1 className="mb-2 text-2xl font-black text-[var(--text-primary)] sm:text-4xl">{data.name}</h1>
        <p className="mb-1 text-sm font-semibold text-[var(--accent)]">{data.parts.length} {t("collectionParts")}</p>
        {data.overview && (
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">{data.overview}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.parts.map((movie) => (
            <MediaCard key={movie.id} item={movie} tvLabel={t("tvShow")} />
          ))}
        </div>
      </div>
    </div>
  );
}
