"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "../context/LanguageContext";
import { triggerPopunder } from "../lib/ads";

interface Collection {
  id: number;
  name: string;
  poster: string | null;
  backdrop: string | null;
  parts: number;
}

export default function CollectionsPage() {
  const { t, tmdbLang } = useLang();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/collections?lang=${tmdbLang}`)
      .then((r) => r.json())
      .then((d) => setCollections(d.results ?? []))
      .finally(() => setLoading(false));
  }, [tmdbLang]);

  return (
    <div className="mx-auto min-h-screen max-w-[1400px] px-4 pt-28 pb-16 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
        {t("allCollections")}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              onClick={() => triggerPopunder()}
              className="group relative overflow-hidden rounded-xl bg-surface transition-transform hover:scale-[1.03]"
            >
              <div className="relative aspect-[2/3] w-full">
                {c.poster ? (
                  <Image
                    src={c.poster}
                    alt={c.name}
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
                  <p className="text-sm font-bold leading-tight text-white line-clamp-2">{c.name}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {c.parts} {t("collectionParts")}
                  </p>
                </div>
                <div className="absolute top-2 right-2 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  {c.parts} 🎬
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
