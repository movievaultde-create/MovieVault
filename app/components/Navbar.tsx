"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useLang, LANGUAGES } from "../context/LanguageContext";

interface SearchResult {
  id: number;
  title: string;
  type: "movie" | "tv";
  poster: string | null;
  year: string;
  rating: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang, setLang, t, isRtl, tmdbLang } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appliedUrlSearchRef = useRef(false);

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
    if (appliedUrlSearchRef.current) return;
    const q = searchParams.get("q");
    if (!q || q.trim().length < 2) return;
    appliedUrlSearchRef.current = true;
    setQuery(q);
    setSearchOpen(true);
  }, [searchParams]);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleResultClick = () => { setSearchOpen(false); setQuery(""); setResults([]); };
  const openBlogInNewTab = useCallback(() => {
    const blogTab = window.open("/blog", "_blank", "noopener,noreferrer");
    if (blogTab) {
      blogTab.blur();
      window.focus();
    }
  }, []);

  const chevronDown = (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-1 opacity-60">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  const navLinkActive =
    "rounded-xl px-4 py-2.5 text-[15px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] transition";
  const navLinkInactive =
    "rounded-xl px-4 py-2.5 text-[15px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]";
  const dropdownItemClass =
    "flex w-full items-center gap-3 px-5 py-3 text-[15px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]";
  const dropdownPanelClass =
    "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-2 shadow-lg";
  const mobileSubLinkClass =
    "flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] active:bg-[var(--bg-elevated)]";

  const isHomeActive = pathname === "/";
  const isMoviesActive =
    pathname === "/movies" ||
    pathname.startsWith("/arab-movies") ||
    pathname.startsWith("/indian-movies") ||
    pathname.startsWith("/collections");
  const isSeriesActive =
    pathname === "/tv-series" ||
    pathname.startsWith("/arab-series") ||
    pathname.startsWith("/turkish-series") ||
    pathname.startsWith("/korean-series") ||
    pathname.startsWith("/indian-series");

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="relative shrink-0 rounded-2xl bg-[var(--bg-elevated)] p-1.5 ring-1 ring-[var(--border)] shadow-md">
              <Image
                src="/favicon.png"
                alt="MovieVault"
                width={64}
                height={64}
                className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-[var(--accent)]">Movie</span>
              <span className="text-[var(--text-primary)]">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <a href="/" className={isHomeActive ? navLinkActive : navLinkInactive}>
              {t("navHome")}
            </a>

            {/* Movies Dropdown */}
            <div className="relative" ref={moviesRef}>
              <button
                onClick={() => { setMoviesDropdown(!moviesDropdown); setSeriesDropdown(false); }}
                className={`flex items-center ${moviesDropdown || isMoviesActive ? navLinkActive : navLinkInactive}`}
              >
                {t("navMovies")}
                {chevronDown}
              </button>
              {moviesDropdown && (
                <div className={`absolute top-full z-50 mt-1 w-56 ${isRtl ? "right-0" : "left-0"}`}>
                  <div className={dropdownPanelClass}>
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
                    <div className="mx-4 my-1.5 border-t border-[var(--border)]" />
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
                className={`flex items-center ${seriesDropdown || isSeriesActive ? navLinkActive : navLinkInactive}`}
              >
                {t("navSeries")}
                {chevronDown}
              </button>
              {seriesDropdown && (
                <div className={`absolute top-full z-50 mt-1 w-60 ${isRtl ? "right-0" : "left-0"}`}>
                  <div className={dropdownPanelClass}>
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
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setQuery(""); setResults([]); } }}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-2.5 text-[var(--text-muted)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                aria-label="Search"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              {searchOpen && (
                <div
                  className={`absolute top-14 left-1/2 z-50 w-[calc(100vw-1rem)] -translate-x-1/2 sm:left-auto sm:w-[420px] sm:translate-x-0 ${
                    isRtl ? "sm:left-0" : "sm:right-0"
                  }`}
                >
                  <div className={`${dropdownPanelClass} shadow-lg`}>
                    <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[var(--text-dim)]">
                        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="input-field h-12 border-0 bg-transparent px-0 shadow-none focus:border-transparent"
                      />
                      {query && (
                        <button onClick={() => { setQuery(""); setResults([]); }} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {searching && (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                        </div>
                      )}
                      {!searching && query.length >= 2 && results.length === 0 && (
                        <p className="py-8 text-center text-[15px] text-[var(--text-dim)]">{t("searchNoResults")}</p>
                      )}
                      {!searching && query.length < 2 && (
                        <p className="py-8 text-center text-[15px] text-[var(--text-dim)]">{t("searchTyping")}</p>
                      )}
                      {!searching && results.length > 0 && (
                        <div className="py-2">
                          {results.map((item) => (
                            <Link
                              key={`${item.type}-${item.id}`}
                              href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--bg-elevated)]"
                            >
                              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                                {item.poster ? (
                                  <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="44px" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-[var(--text-primary)]">{item.title}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-dim)]">
                                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${item.type === "movie" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-blue-100 text-blue-600"}`}>
                                    {item.type === "movie" ? t("movie") : t("tvShow")}
                                  </span>
                                  {item.year && <span>{item.year}</span>}
                                  {parseFloat(item.rating) > 0 && <span className="text-[var(--warning)]">★ {item.rating}</span>}
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

            <button
              type="button"
              onClick={openBlogInNewTab}
              className="btn-ghost hidden h-10 items-center px-4 text-sm font-semibold sm:flex"
            >
              Blog
            </button>

            {/* Language - desktop only */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="btn-ghost flex h-10 items-center gap-2 px-4 text-sm font-semibold"
              >
                <span className="text-base">{currentLang.flag}</span>
                <span>{currentLang.code}</span>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${langMenuOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className={`absolute top-13 w-48 ${isRtl ? "left-0" : "right-0"}`}>
                  <div className={dropdownPanelClass}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                        className={`flex w-full items-center gap-3 px-5 py-3 text-start text-[15px] transition-colors ${
                          lang === l.code
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                        {lang === l.code && (
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-auto text-[var(--accent)]"><path d="M20 6L9 17l-5-5" /></svg>
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] lg:hidden"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[var(--border)] bg-[var(--bg-surface)] lg:hidden">
          <nav className="flex flex-col px-5 py-4">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={isHomeActive ? navLinkActive + " flex items-center gap-3" : navLinkInactive + " flex items-center gap-3"}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
              {t("navHome")}
            </a>

            <div className="mx-4 my-1 border-t border-[var(--border)]" />

            {/* Movies */}
            <button
              onClick={() => setMobileMoviesOpen(!mobileMoviesOpen)}
              className={`flex items-center justify-between ${mobileMoviesOpen || isMoviesActive ? navLinkActive : navLinkInactive}`}
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                {t("navMovies")}
              </span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`text-[var(--text-dim)] transition-transform duration-200 ${mobileMoviesOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileMoviesOpen && (
              <div className={`mb-1 flex flex-col gap-0.5 rounded-xl bg-[var(--bg-elevated)] py-2 ${isRtl ? "mr-4 pr-4" : "ml-4 pl-4"}`}>
                <a href="/movies" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                  {t("allMovies")}
                </a>
                <a href="/arab-movies" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🇸🇦</span> {t("navArabMovies")}
                </a>
                <a href="/indian-movies" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🇮🇳</span> {t("navIndianMovies")}
                </a>
                <a href="/collections" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🎬</span> {t("navCollections")}
                </a>
              </div>
            )}

            {/* Series */}
            <button
              onClick={() => setMobileSeriesOpen(!mobileSeriesOpen)}
              className={`flex items-center justify-between ${mobileSeriesOpen || isSeriesActive ? navLinkActive : navLinkInactive}`}
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                {t("navSeries")}
              </span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`text-[var(--text-dim)] transition-transform duration-200 ${mobileSeriesOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileSeriesOpen && (
              <div className={`mb-1 flex flex-col gap-0.5 rounded-xl bg-[var(--bg-elevated)] py-2 ${isRtl ? "mr-4 pr-4" : "ml-4 pl-4"}`}>
                <a href="/tv-series" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                  {t("allSeries")}
                </a>
                <a href="/arab-series" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🇸🇦</span> {t("navArabSeries")}
                </a>
                <a href="/turkish-series" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🇹🇷</span> {t("navTurkishSeries")}
                </a>
                <a href="/korean-series" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🇰🇷</span> {t("navKoreanSeries")}
                </a>
                <a href="/indian-series" onClick={() => setMobileMenuOpen(false)} className={mobileSubLinkClass}>
                  <span className="text-lg">🇮🇳</span> {t("navIndianSeries")}
                </a>
              </div>
            )}

            <div className="mx-4 my-1 border-t border-[var(--border)]" />

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); openBlogInNewTab(); }}
              className={`${navLinkInactive} flex items-center gap-3`}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              Blog
            </button>
          </nav>

          {/* Mobile Language Selector */}
          <div className="border-t border-[var(--border)] px-5 py-4 sm:hidden">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">Language</p>
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors ${
                    lang === l.code
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                      : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
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
