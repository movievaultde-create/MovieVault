"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLang, LANGUAGES } from "../context/LanguageContext";
import { watchPath } from "../lib/watchUrl";
import { SearchDropdownAd } from "./ads/SearchDropdownAd";

interface SearchResult {
  id: number;
  title: string;
  type: "movie" | "tv" | "anime";
  poster: string | null;
  year: string;
  rating: string;
  href?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t, isRtl, tmdbLang, isAr } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
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
    setNavHidden(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    // Keep navbar sticky like Watch Clash Anime (no hide-on-scroll).
    setNavHidden(false);
  }, [pathname, searchOpen, menuOpen]);

  const handleResultClick = () => { setSearchOpen(false); setQuery(""); setResults([]); };

  const chevronDown = (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-1.5 opacity-70">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  const navLinkActive = "nav-link nav-link-active flex items-center";
  const navLinkInactive = "nav-link flex items-center";
  const dropdownItemClass = "nav-dropdown-item";
  const dropdownPanelClass = "nav-dropdown";

  const isHomeActive = pathname === "/";
  const isMoviesActive =
    pathname === "/movies" ||
    pathname.startsWith("/arab-movies") ||
    pathname.startsWith("/indian-movies") ||
    pathname.startsWith("/foreign-movies") ||
    pathname.startsWith("/collections");
  const isSeriesActive =
    pathname === "/tv-series" ||
    pathname.startsWith("/arab-series") ||
    pathname.startsWith("/turkish-series") ||
    pathname.startsWith("/korean-series") ||
    pathname.startsWith("/indian-series") ||
    pathname.startsWith("/foreign-series");

  return (
    <header
      data-site-chrome="1"
      className={`nav-shell fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out ${
        navHidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/logo.png"
              alt="MovieVault"
              width={96}
              height={96}
              className="h-10 w-10 object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.28)] sm:h-12 sm:w-12 lg:h-14 lg:w-14"
              priority
            />
            <span className="nav-brand-mark hidden text-[1.7rem] sm:inline sm:text-[1.9rem] lg:text-[2.35rem]">
              <span className="nav-brand-movie">Movie</span>
              <span className="nav-brand-vault">Vault</span>
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            <a href="/" className={isHomeActive ? navLinkActive : navLinkInactive}>
              {t("navHome")}
            </a>

            <div className="relative" ref={moviesRef}>
              <button
                onClick={() => { setMoviesDropdown(!moviesDropdown); setSeriesDropdown(false); }}
                className={moviesDropdown || isMoviesActive ? navLinkActive : navLinkInactive}
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
                    <a href="/foreign-movies" onClick={() => setMoviesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🌍</span> {t("navForeignMovies")}
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

            <div className="relative" ref={seriesRef}>
              <button
                onClick={() => { setSeriesDropdown(!seriesDropdown); setMoviesDropdown(false); }}
                className={seriesDropdown || isSeriesActive ? navLinkActive : navLinkInactive}
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
                    <a href="/foreign-series" onClick={() => setSeriesDropdown(false)} className={dropdownItemClass}>
                      <span className="text-lg">🌍</span> {t("navForeignSeries")}
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

            <a href="https://watchclashanime.com/" className={navLinkInactive}>
              {t("navAnime")}
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
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
                  className={`absolute top-14 inset-x-2 z-50 sm:inset-x-auto sm:w-[420px] ${
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
                        className="h-12 w-full border-0 bg-transparent px-0 text-base text-[var(--nav-text)] outline-none placeholder:text-[var(--nav-dim)]"
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
                        <p className="py-8 text-center text-base text-[var(--nav-dim)]">{t("searchNoResults")}</p>
                      )}
                      {!searching && query.length < 2 && (
                        <p className="py-8 text-center text-base text-[var(--nav-dim)]">{t("searchTyping")}</p>
                      )}
                      {!searching && results.length > 0 && (
                        <div className="py-2">
                          {results.map((item) => {
                            const isAnime = item.type === "anime" || Boolean(item.href);
                            const href =
                              item.href ??
                              watchPath(
                                item.type === "movie" ? "movie" : "tv",
                                item.id,
                                item.title,
                                lang,
                              );
                            const badgeLabel = isAnime
                              ? t("navAnime")
                              : item.type === "movie"
                                ? t("movie")
                                : t("tvShow");
                            const badgeClass = isAnime
                              ? "bg-fuchsia-500/15 text-fuchsia-300"
                              : item.type === "movie"
                                ? "bg-[var(--nav-accent-soft)] text-[var(--nav-accent)]"
                                : "bg-white/10 text-sky-300";

                            const content = (
                              <>
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
                                  <p className="truncate text-base font-bold text-[var(--nav-text)]">
                                    {isAr ? `${item.title} ${t("subtitled")}` : item.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--nav-dim)]">
                                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${badgeClass}`}>
                                      {badgeLabel}
                                    </span>
                                    {item.year && <span>{item.year}</span>}
                                    {parseFloat(item.rating) > 0 && <span className="text-[var(--nav-accent)]">★ {item.rating}</span>}
                                  </div>
                                </div>
                              </>
                            );

                            if (isAnime) {
                              return (
                                <a
                                  key={`anime-${item.id}`}
                                  href={href}
                                  onClick={handleResultClick}
                                  className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--nav-accent-soft)]"
                                >
                                  {content}
                                </a>
                              );
                            }

                            return (
                              <Link
                                key={`${item.type}-${item.id}`}
                                href={href}
                                onClick={handleResultClick}
                                className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--nav-accent-soft)]"
                              >
                                {content}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <SearchDropdownAd />
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/watchlist"
              className={pathname === "/watchlist" ? "nav-chip nav-chip-active" : "nav-chip"}
              aria-label={t("navMyList")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={pathname === "/watchlist" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7.5-4.35-10-9A6 6 0 0 1 12 5a6 6 0 0 1 10 7c-2.5 4.65-10 9-10 9z" />
              </svg>
              <span className="hidden xl:inline">{t("navMyList")}</span>
            </Link>

            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="nav-chip px-2.5 sm:px-4"
                aria-label={currentLang.label}
              >
                <span className="text-base">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.code}</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`hidden sm:block transition-transform ${langMenuOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className={`absolute top-13 z-50 w-48 ${isRtl ? "left-0" : "right-0"}`}>
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
                        <span className="font-bold">{l.label}</span>
                        {lang === l.code && (
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="ms-auto text-[var(--nav-accent)]"><path d="M20 6L9 17l-5-5" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="nav-icon-btn p-2.5 lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? (isAr ? "إغلاق القائمة" : "Close menu") : (isAr ? "فتح القائمة" : "Open menu")}
              onClick={() => {
                setMenuOpen((open) => !open);
                setMoviesDropdown(false);
                setSeriesDropdown(false);
                setLangMenuOpen(false);
              }}
            >
              {menuOpen ? (
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

        {menuOpen && (
          <div className="max-h-[min(80vh,640px)] overflow-y-auto border-t border-[var(--nav-border)] pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              <a href="/" className={isHomeActive ? navLinkActive : navLinkInactive} onClick={() => setMenuOpen(false)}>
                {t("navHome")}
              </a>
              <button
                type="button"
                onClick={() => { setMoviesDropdown(!moviesDropdown); setSeriesDropdown(false); }}
                className={`${moviesDropdown || isMoviesActive ? navLinkActive : navLinkInactive} w-full justify-between`}
              >
                <span className="flex items-center">{t("navMovies")}{chevronDown}</span>
              </button>
              {moviesDropdown && (
                <div className="ms-3 flex flex-col border-s border-[var(--nav-border)]">
                  <a href="/movies" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("allMovies")}</a>
                  <a href="/arab-movies" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navArabMovies")}</a>
                  <a href="/foreign-movies" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navForeignMovies")}</a>
                  <a href="/indian-movies" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navIndianMovies")}</a>
                  <a href="/collections" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navCollections")}</a>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setSeriesDropdown(!seriesDropdown); setMoviesDropdown(false); }}
                className={`${seriesDropdown || isSeriesActive ? navLinkActive : navLinkInactive} w-full justify-between`}
              >
                <span className="flex items-center">{t("navSeries")}{chevronDown}</span>
              </button>
              {seriesDropdown && (
                <div className="ms-3 flex flex-col border-s border-[var(--nav-border)]">
                  <a href="/tv-series" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("allSeries")}</a>
                  <a href="/arab-series" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navArabSeries")}</a>
                  <a href="/foreign-series" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navForeignSeries")}</a>
                  <a href="/turkish-series" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navTurkishSeries")}</a>
                  <a href="/korean-series" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navKoreanSeries")}</a>
                  <a href="/indian-series" onClick={() => setMenuOpen(false)} className={dropdownItemClass}>{t("navIndianSeries")}</a>
                </div>
              )}
              <a href="https://watchclashanime.com/" className={navLinkInactive} onClick={() => setMenuOpen(false)}>
                {t("navAnime")}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
