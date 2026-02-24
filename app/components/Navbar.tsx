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

  const [moviesDropdown, setMoviesDropdown] = useState(false);
  const [seriesDropdown, setSeriesDropdown] = useState(false);
  const [mobileMoviesOpen, setMobileMoviesOpen] = useState(false);
  const [mobileSeriesOpen, setMobileSeriesOpen] = useState(false);
  const moviesRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  const doSearch = useCallback(
    (q: string) => {
      if (q.trim().length < 2) { setResults([]); return; }
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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false);
      if (moviesRef.current && !moviesRef.current.contains(e.target as Node)) setMoviesDropdown(false);
      if (seriesRef.current && !seriesRef.current.contains(e.target as Node)) setSeriesDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = () => { setSearchOpen(false); setQuery(""); setResults([]); triggerPopunder(); };
  const goToBlog = useCallback(() => {
    window.location.assign("/blog");
  }, []);

  const chevronDown = (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ml-1 opacity-60">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  const dropdownItemClass = "flex w-full items-center gap-3 px-5 py-3 text-[15px] font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex h-[64px] items-center justify-between gap-3 sm:h-[80px] lg:h-[88px]">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
            <Image
              src="/favicon.png"
              alt="MovieVault"
              width={64}
              height={64}
              className="h-10 w-10 rounded-xl sm:h-14 sm:w-14 lg:h-[56px] lg:w-[56px]"
              priority
            />
            <span className="text-[22px] font-extrabold tracking-tight sm:text-[32px] lg:text-[38px]">
              <span className="text-primary">Movie</span>
              <span className="text-white">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <a href="/" className="rounded-xl px-5 py-2.5 text-[17px] font-bold text-primary transition-colors">
              {t("navHome")}
            </a>

            {/* Movies Dropdown */}
            <div className="relative" ref={moviesRef}>
              <button
                onClick={() => { setMoviesDropdown(!moviesDropdown); setSeriesDropdown(false); }}
                className="flex items-center rounded-xl px-5 py-2.5 text-[17px] font-bold text-gray-300 transition-colors hover:text-white"
              >
                {t("navMovies")}
                {chevronDown}
              </button>
              {moviesDropdown && (
                <div className={`absolute top-12 w-56 ${isRtl ? "right-0" : "left-0"}`}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] py-2 shadow-2xl shadow-black/60">
                    <a href="/movies" onClick={() => setMoviesDropdown(false)} className={dropdownItemClass}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                      {t("allMovies")}
                    </a>
                    <a href="/arab-movies" onClick={() => setMoviesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🇸🇦</span> {t("navArabMovies")}
                    </a>
                    <a href="/indian-movies" onClick={() => setMoviesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🇮🇳</span> {t("navIndianMovies")}
                    </a>
                    <div className="mx-4 my-1.5 border-t border-white/10" />
                    <a href="/collections" onClick={() => setMoviesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🎬</span> {t("navCollections")}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Series Dropdown */}
            <div className="relative" ref={seriesRef}>
              <button
                onClick={() => { setSeriesDropdown(!seriesDropdown); setMoviesDropdown(false); }}
                className="flex items-center rounded-xl px-5 py-2.5 text-[17px] font-bold text-gray-300 transition-colors hover:text-white"
              >
                {t("navSeries")}
                {chevronDown}
              </button>
              {seriesDropdown && (
                <div className={`absolute top-12 w-60 ${isRtl ? "right-0" : "left-0"}`}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] py-2 shadow-2xl shadow-black/60">
                    <a href="/tv-series" onClick={() => setSeriesDropdown(false)} className={dropdownItemClass}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                      {t("allSeries")}
                    </a>
                    <a href="/arab-series" onClick={() => setSeriesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🇸🇦</span> {t("navArabSeries")}
                    </a>
                    <a href="/turkish-series" onClick={() => setSeriesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🇹🇷</span> {t("navTurkishSeries")}
                    </a>
                    <a href="/korean-series" onClick={() => setSeriesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🇰🇷</span> {t("navKoreanSeries")}
                    </a>
                    <a href="/indian-series" onClick={() => setSeriesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🇮🇳</span> {t("navIndianSeries")}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a href="/anime" className="rounded-xl px-5 py-2.5 text-[17px] font-bold text-gray-300 transition-colors hover:text-white">
              {t("navAnime")}
            </a>
            <button
              onClick={goToBlog}
              className="rounded-xl px-5 py-2.5 text-[17px] font-bold text-gray-300 transition-colors hover:text-white"
            >
              Blog
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setQuery(""); setResults([]); } }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
                aria-label="Search"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              {searchOpen && (
                <div className={`absolute top-14 w-[340px] sm:w-[420px] ${isRtl ? "left-0" : "right-0"}`}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60">
                    <div className="flex items-center gap-2.5 border-b border-white/10 px-4">
                      <svg width="18" height="18" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="h-12 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-gray-500"
                      />
                      {query && (
                        <button onClick={() => { setQuery(""); setResults([]); }} className="text-gray-500 hover:text-white">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {searching && (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                      {!searching && query.length >= 2 && results.length === 0 && (
                        <p className="py-8 text-center text-[15px] text-gray-500">{t("searchNoResults")}</p>
                      )}
                      {!searching && query.length < 2 && (
                        <p className="py-8 text-center text-[15px] text-gray-500">{t("searchTyping")}</p>
                      )}
                      {!searching && results.length > 0 && (
                        <div className="py-2">
                          {results.map((item) => (
                            <Link
                              key={`${item.type}-${item.id}`}
                              href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-white/5"
                            >
                              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-white/5">
                                {item.poster ? (
                                  <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="44px" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-white">{item.title}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${item.type === "movie" ? "bg-primary/15 text-primary" : "bg-blue-500/15 text-blue-400"}`}>
                                    {item.type === "movie" ? t("movie") : t("tvShow")}
                                  </span>
                                  {item.year && <span>{item.year}</span>}
                                  {parseFloat(item.rating) > 0 && <span className="text-yellow-400">★ {item.rating}</span>}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VIP */}
            <Link
              href="/vip"
              className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold tracking-wide transition-all sm:h-11 sm:px-4 sm:text-sm ${
                isVip
                  ? "border border-amber-400/40 bg-amber-500/10 text-amber-400"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:border-amber-400/40 hover:text-amber-400"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
              </svg>
              <span className="hidden sm:inline">{isVip ? "VIP ✓" : "VIP"}</span>
            </Link>

            {/* Language - desktop only */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold text-gray-400 transition-all hover:border-primary/40 hover:text-white"
              >
                <span className="text-base">{currentLang.flag}</span>
                <span>{currentLang.code}</span>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${langMenuOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className={`absolute top-13 w-48 ${isRtl ? "left-0" : "right-0"}`}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] py-2 shadow-2xl shadow-black/60">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                        className={`flex w-full items-center gap-3 px-5 py-3 text-start text-[15px] transition-colors ${
                          lang === l.code ? "bg-primary/10 text-primary" : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                        {lang === l.code && (
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-auto text-primary"><path d="M20 6L9 17l-5-5" /></svg>
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ Mobile Menu ═══════════════ */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-white/10 bg-black/98 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col px-5 py-4">
            {/* Home */}
            <a href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-4 text-[17px] font-bold text-primary">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
              {t("navHome")}
            </a>

            <div className="mx-4 my-1 border-t border-white/5" />

            {/* Movies */}
            <button
              onClick={() => setMobileMoviesOpen(!mobileMoviesOpen)}
              className="flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-bold text-gray-300 transition-colors active:bg-white/5"
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                {t("navMovies")}
              </span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`text-gray-500 transition-transform duration-200 ${mobileMoviesOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileMoviesOpen && (
              <div className={`mb-1 flex flex-col gap-0.5 rounded-xl bg-white/[0.03] py-2 ${isRtl ? "mr-4 pr-4" : "ml-4 pl-4"}`}>
                <a href="/movies" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                  {t("allMovies")}
                </a>
                <a href="/arab-movies" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🇸🇦</span> {t("navArabMovies")}
                </a>
                <a href="/indian-movies" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🇮🇳</span> {t("navIndianMovies")}
                </a>
                <a href="/collections" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🎬</span> {t("navCollections")}
                </a>
              </div>
            )}

            {/* Series */}
            <button
              onClick={() => setMobileSeriesOpen(!mobileSeriesOpen)}
              className="flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-bold text-gray-300 transition-colors active:bg-white/5"
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                {t("navSeries")}
              </span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`text-gray-500 transition-transform duration-200 ${mobileSeriesOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileSeriesOpen && (
              <div className={`mb-1 flex flex-col gap-0.5 rounded-xl bg-white/[0.03] py-2 ${isRtl ? "mr-4 pr-4" : "ml-4 pl-4"}`}>
                <a href="/tv-series" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                  {t("allSeries")}
                </a>
                <a href="/arab-series" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🇸🇦</span> {t("navArabSeries")}
                </a>
                <a href="/turkish-series" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🇹🇷</span> {t("navTurkishSeries")}
                </a>
                <a href="/korean-series" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🇰🇷</span> {t("navKoreanSeries")}
                </a>
                <a href="/indian-series" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors active:bg-white/5 hover:text-white">
                  <span className="text-lg">🇮🇳</span> {t("navIndianSeries")}
                </a>
              </div>
            )}

            <div className="mx-4 my-1 border-t border-white/5" />

            {/* Anime */}
            <a href="/anime" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-4 text-[17px] font-bold text-gray-300 transition-colors active:bg-white/5">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              {t("navAnime")}
            </a>
            <button
              onClick={() => { setMobileMenuOpen(false); goToBlog(); }}
              className="flex items-center gap-3 rounded-xl px-4 py-4 text-[17px] font-bold text-gray-300 transition-colors active:bg-white/5"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              Blog
            </button>
          </nav>

          {/* Mobile Language Selector */}
          <div className="border-t border-white/5 px-5 py-4 sm:hidden">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Language</p>
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors ${
                    lang === l.code
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-white/5 text-gray-400 active:bg-white/10"
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
