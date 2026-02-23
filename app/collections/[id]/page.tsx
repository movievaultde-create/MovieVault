"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "../../context/LanguageContext";
import { triggerPopunder } from "../../lib/ads";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.name) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-text-muted">{t("errorLoading")}</p>
        <Link href="/collections" className="text-primary hover:underline">{t("backToCollections")}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Backdrop Header */}
      {data.backdrop && (
        <div className="relative h-[300px] w-full sm:h-[400px]">
          <Image src={data.backdrop} alt={data.name} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        </div>
      )}

      <div className={`mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 ${data.backdrop ? "-mt-32 relative z-10" : "pt-28"}`}>
        <Link href="/collections" className="mb-4 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          {t("backToCollections")}
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-white sm:text-4xl">{data.name}</h1>
        <p className="mb-1 text-sm text-primary font-semibold">{data.parts.length} {t("collectionParts")}</p>
        {data.overview && (
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-text-secondary">{data.overview}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.parts.map((movie) => (
            <Link
              key={movie.id}
              href={`/watch/${movie.id}`}
              onClick={() => triggerPopunder()}
              className="group relative overflow-hidden rounded-xl bg-surface transition-transform hover:scale-[1.03]"
            >
              <div className="relative aspect-[2/3] w-full">
                {movie.poster ? (
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-80"
                    sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,16vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-light text-text-muted">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10">
                  <p className="text-sm font-bold leading-tight text-white line-clamp-2">{movie.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    {movie.year && <span>{movie.year}</span>}
                    {parseFloat(movie.rating) > 0 && (
                      <span className="flex items-center gap-0.5 text-yellow-400">★ {movie.rating}</span>
                    )}
                  </div>
                </div>
                {parseFloat(movie.rating) > 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
                    ★ {movie.rating}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
