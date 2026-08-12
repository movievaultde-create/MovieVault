"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const [navHidden, setNavHidden] = useState(false);
  const moviesRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

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
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q || q.trim().length < 2) return;
    appliedUrlSearchRef.current = true;
    setQuery(q);
    setSearchOpen(true);
  }, [pathname]);

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
    setNavHidden(false);
    lastScrollY.current = 0;
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (mobileMenuOpen || searchOpen) {
        setNavHidden(false);
        return;
      }
      const y = window.scrollY;
      // Hide while scrolled down; show only near the top
      if (y > 80) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileMenuOpen, searchOpen]);

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

  const navLinkActive = "nav-link nav-link-active flex items-center";
  const navLinkInactive = "nav-link flex items-center";
  const dropdownItemClass = "nav-dropdown-item";
  const dropdownPanelClass = "nav-dropdown";
  const mobileSubLinkClass =
    "nav-dropdown-item rounded-lg !py-2.5 hover:bg-[var(--nav-accent-soft)]";

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
    <header
      className={`nav-shell fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out ${
        navHidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
            <Image
              src="/logo.png"
              alt="MovieVault"
              width={96}
              height={96}
              className="h-12 w-12 object-contain drop-shadow-[0_4px_12px_rgba(249,115,22,0.35)] sm:h-14 sm:w-14 lg:h-16 lg:w-16"
              priority
            />
            <span className="nav-brand-mark text-xl font-black sm:text-2xl">
              <span className="nav-brand-movie">Movie</span>
              <span className="nav-brand-vault">Vault</span>
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
                    <div className="mx-4 my-1.5 border-t border-[var(--nav-border)]" />
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
                className="nav-icon-btn p-2.5"
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
                  <div className={dropdownPanelClass}>
                    <div className="flex items-center gap-2.5 border-b border-[var(--nav-border)] px-4">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[var(--nav-dim)]">
                        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="h-12 w-full border-0 bg-transparent px-0 text-[15px] text-[var(--nav-text)] outline-none placeholder:text-[var(--nav-dim)]"
                      />
                      {query && (
                        <button onClick={() => { setQuery(""); setResults([]); }} className="text-[var(--nav-dim)] hover:text-[var(--nav-text)]">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {searching && (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--nav-accent)] border-t-transparent" />
                        </div>
                      )}
                      {!searching && query.length >= 2 && results.length === 0 && (
                        <p className="py-8 text-center text-[15px] text-[var(--nav-dim)]">{t("searchNoResults")}</p>
                      )}
                      {!searching && query.length < 2 && (
                        <p className="py-8 text-center text-[15px] text-[var(--nav-dim)]">{t("searchTyping")}</p>
                      )}
                      {!searching && results.length > 0 && (
                        <div className="py-2">
                          {results.map((item) => (
                            <Link
                              key={`${item.type}-${item.id}`}
                              href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--nav-accent-soft)]"
                            >
                              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--nav-elevated)]">
                                {item.poster ? (
                                  <Image src={item.poster} alt={item.title} fill className="object-cover" sizes="44px" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[var(--nav-dim)]">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-[var(--nav-text)]">{item.title}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--nav-dim)]">
                                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${item.type === "movie" ? "bg-[var(--nav-accent-soft)] text-[var(--nav-accent)]" : "bg-white/10 text-sky-300"}`}>
                                    {item.type === "movie" ? t("movie") : t("tvShow")}
                                  </span>
                                  {item.year && <span>{item.year}</span>}
                                  {parseFloat(item.rating) > 0 && <span className="text-[var(--nav-accent)]">★ {item.rating}</span>}
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

            <Link
              href="/watchlist"
              className={`hidden sm:inline-flex ${
                pathname === "/watchlist" ? "nav-chip nav-chip-active" : "nav-chip"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={pathname === "/watchlist" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7.5-4.35-10-9A6 6 0 0 1 12 5a6 6 0 0 1 10 7c-2.5 4.65-10 9-10 9z" />
              </svg>
              {t("navMyList")}
            </Link>

            <button
              type="button"
              onClick={openBlogInNewTab}
              className="nav-chip hidden sm:inline-flex"
            >
              Blog
            </button>

            {/* Language - desktop only */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="nav-chip"
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
                        className={`nav-dropdown-item text-start ${
                          lang === l.code ? "!bg-[var(--nav-accent-soft)] !text-[var(--nav-accent)]" : ""
                        }`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                        {lang === l.code && (
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-auto text-[var(--nav-accent)]"><path d="M20 6L9 17l-5-5" /></svg>
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
              className="nav-icon-btn flex h-10 w-10 lg:hidden"
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
        <div className="nav-mobile-panel max-h-[calc(100vh-64px)] overflow-y-auto lg:hidden">
          <nav className="flex flex-col gap-0.5 px-5 py-4">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`${isHomeActive ? navLinkActive : navLinkInactive} gap-3`}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
              {t("navHome")}
            </a>

            <div className="mx-2 my-2 border-t border-[var(--nav-border)]" />

            {/* Movies */}
            <button
              onClick={() => setMobileMoviesOpen(!mobileMoviesOpen)}
              className={`w-full justify-between ${mobileMoviesOpen || isMoviesActive ? navLinkActive : navLinkInactive}`}
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                {t("navMovies")}
              </span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`text-[var(--nav-dim)] transition-transform duration-200 ${mobileMoviesOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileMoviesOpen && (
              <div className={`mb-1 flex flex-col gap-0.5 rounded-xl bg-[var(--nav-elevated)] py-2 ${isRtl ? "mr-4 pr-2" : "ml-4 pl-2"}`}>
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
              className={`w-full justify-between ${mobileSeriesOpen || isSeriesActive ? navLinkActive : navLinkInactive}`}
            >
              <span className="flex items-center gap-3">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                {t("navSeries")}
              </span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`text-[var(--nav-dim)] transition-transform duration-200 ${mobileSeriesOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileSeriesOpen && (
              <div className={`mb-1 flex flex-col gap-0.5 rounded-xl bg-[var(--nav-elevated)] py-2 ${isRtl ? "mr-4 pr-2" : "ml-4 pl-2"}`}>
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

            <div className="mx-2 my-2 border-t border-[var(--nav-border)]" />

            <Link
              href="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className={`${pathname === "/watchlist" ? navLinkActive : navLinkInactive} gap-3`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={pathname === "/watchlist" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7.5-4.35-10-9A6 6 0 0 1 12 5a6 6 0 0 1 10 7c-2.5 4.65-10 9-10 9z" />
              </svg>
              {t("navMyList")}
            </Link>

            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); openBlogInNewTab(); }}
              className={`${navLinkInactive} gap-3`}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              Blog
            </button>
          </nav>

          {/* Mobile Language Selector */}
          <div className="border-t border-[var(--nav-border)] px-5 py-4 sm:hidden">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--nav-dim)]">Language</p>
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors ${
                    lang === l.code
                      ? "bg-[var(--nav-accent-soft)] text-[var(--nav-accent)] ring-1 ring-[var(--nav-accent)]/40"
                      : "border border-white/10 bg-white/5 text-[var(--nav-muted)] hover:border-[var(--nav-accent)]/40"
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
