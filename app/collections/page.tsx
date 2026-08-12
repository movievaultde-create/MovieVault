"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "../context/LanguageContext";

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
    <div className="mx-auto min-h-screen max-w-[1400px] bg-[var(--bg-base)] px-4 pt-24 pb-16 sm:px-6">
      <h1 className="mb-8 text-2xl font-black text-[var(--text-primary)] sm:text-3xl">
        {t("allCollections")}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-xl skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-hover)] group-hover:shadow-md">
                <div className="relative aspect-[2/3] w-full bg-[var(--bg-elevated)]">
                  {c.poster ? (
                    <Image
                      src={c.poster}
                      alt={c.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,16vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute end-2 top-2 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                    {c.parts} 🎬
                  </span>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-bold text-[var(--text-primary)]">{c.name}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
                {c.parts} {t("collectionParts")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
