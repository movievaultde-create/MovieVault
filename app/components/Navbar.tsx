"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang, LANGUAGES } from "../context/LanguageContext";
import { useVip } from "../context/VipContext";
import { triggerPopunder } from "../lib/ads";

interface SearchResult {
  id: number;
  title: string;
  type: "movie" | "tv";
  poster: string | null;
  year: string;
  rating: string;
}

export default function Navbar() {
  const { lang, setLang, t, isRtl, tmdbLang } = useLang();
  const { isVip } = useVip();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  const doSearch = useCallback(
    (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${tmdbLang}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => setResults(d.results ?? []))
        .finally(() => setSearching(false));
    },
    [tmdbLang]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    triggerPopunder();
  };

  const navLinks = [
    { label: t("navHome"), href: "/" },
    { label: t("navMovies"), href: "/movies" },
    { label: t("navSeries"), href: "/tv-series" },
    { label: t("navAnime"), href: "/anime" },
    { label: t("navArabMovies"), href: "/arab-movies" },
    { label: t("navArabSeries"), href: "/arab-series" },
    { label: t("navTurkishSeries"), href: "/turkish-series" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex h-[80px] items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3.5">
            <Image
              src="/favicon.png"
              alt="MovieVault"
              width={64}
              height={64}
              className="h-14 w-14 rounded-xl sm:h-[60px] sm:w-[60px]"
              priority
            />
            <span className="text-[34px] font-extrabold tracking-tight sm:text-[40px]">
              <span className="text-primary">Movie</span>
              <span className="text-white">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-[15px] font-semibold transition-colors ${
                  i === 0 ? "text-primary" : "text-text-secondary hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (searchOpen) { setQuery(""); setResults([]); }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-light hover:text-white"
                aria-label="Search"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              {searchOpen && (
                <div className={`absolute top-12 w-80 sm:w-96 ${isRtl ? "left-0" : "right-0"}`}>
                  <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-surface-border px-3">
                      <svg width="16" height="16" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-text-muted"
                      />
                      {query && (
                        <button onClick={() => { setQuery(""); setResults([]); }} className="text-text-muted hover:text-white">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {searching && (
                        <div className="flex items-center justify-center py-6">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                      {!searching && query.length >= 2 && results.length === 0 && (
                        <p className="py-6 text-center text-sm text-text-muted">{t("searchNoResults")}</p>
                      )}
                      {!searching && query.length < 2 && (
                        <p className="py-6 text-center text-sm text-text-muted">{t("searchTyping")}</p>
                      )}
                      {!searching && results.length > 0 && (
                        <div className="py-1">
                          {results.map((item) => (
                            <Link
                              key={`${item.type}-${item.id}`}
                              href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-light"
                            >
                              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-light">
                                {item.poster ? (
                                  <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="40px" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{item.title}</p>
                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-muted">
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${item.type === "movie" ? "bg-primary/15 text-primary" : "bg-blue-500/15 text-blue-400"}`}>
                                    {item.type === "movie" ? t("movie") : t("tvShow")}
                                  </span>
                                  {item.year && <span>{item.year}</span>}
                                  {parseFloat(item.rating) > 0 && (
                                    <span className="flex items-center gap-0.5 text-yellow-400">★ {item.rating}</span>
                                  )}
                                </div>
                              </div>
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`shrink-0 text-text-muted ${isRtl ? "rotate-180" : ""}`}>
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VIP Button */}
            <Link
              href="/vip"
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold tracking-wide transition-all ${
                isVip
                  ? "border border-amber-400/50 bg-amber-500/10 text-amber-400"
                  : "border border-surface-border bg-surface text-text-secondary hover:border-amber-400/40 hover:text-amber-400"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
              </svg>
              <span className="hidden sm:inline">{isVip ? "VIP ✓" : "VIP"}</span>
            </Link>

            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 text-xs font-bold tracking-wide text-text-secondary transition-all hover:border-primary/40 hover:text-white"
              >
                <span className="text-sm">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.code}</span>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${langMenuOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {langMenuOpen && (
                <div className={`absolute top-11 w-44 ${isRtl ? "left-0" : "right-0"}`}>
                  <div className="overflow-hidden rounded-xl border border-surface-border bg-surface py-1 shadow-2xl">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition-colors ${
                          lang === l.code
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-surface-light hover:text-white"
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                        {lang === l.code && (
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-auto text-primary">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-light hover:text-white md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-surface-border bg-black/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  i === 0 ? "text-primary" : "text-text-secondary hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
