"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";
import WatchlistButton from "./WatchlistButton";

type MoodKey =
  | "exciting"
  | "funny"
  | "dark"
  | "chill"
  | "mindblowing"
  | "family"
  | "romantic";

interface RecommendationItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
  reason: string;
  confidence: number;
}

interface RecommendationResponse {
  mood: MoodKey;
  label: string;
  locked: boolean;
  isVip: boolean;
  total?: number;
  items: RecommendationItem[];
  upgradeMessage?: string | null;
}

const MOODS: Array<{ key: MoodKey; emoji: string; en: string; ar: string }> = [
  { key: "exciting", emoji: "🔥", en: "Exciting", ar: "حماس" },
  { key: "funny", emoji: "😂", en: "Funny", ar: "ضحك" },
  { key: "dark", emoji: "🌙", en: "Dark", ar: "غامق" },
  { key: "chill", emoji: "🧘", en: "Chill", ar: "رايق" },
  { key: "mindblowing", emoji: "🧠", en: "Mind-blowing", ar: "مفاجآت" },
  { key: "family", emoji: "👨‍👩‍👧‍👦", en: "Family", ar: "عائلي" },
  { key: "romantic", emoji: "💖", en: "Romantic", ar: "رومانسي" },
];

export default function AiRecommendationPanel() {
  const { isVip, vipEmail } = useVip();
  const { tmdbLang, isRtl, isAr } = useLang();

  const [mood, setMood] = useState<MoodKey>("exciting");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [payload, setPayload] = useState<RecommendationResponse | null>(null);

  const copy = useMemo(
    () => ({
      title: isAr ? "اقتراحات AI حسب مزاجك" : "AI Recommendations by Mood",
      subtitle: isAr
        ? "اختَر مزاجك وسيقترح لك النظام أفضل ما تشاهده الآن"
        : "Pick your mood and get the best titles to watch right now",
      vipTag: isAr ? "ميزة VIP مدفوعة" : "VIP Premium Feature",
      confidence: isAr ? "ثقة" : "Confidence",
      reason: isAr ? "سبب الترشيح" : "Why this pick",
      unlock: isAr ? "فتح كامل توصيات الذكاء الاصطناعي" : "Unlock full AI picks",
      teaser: isAr ? "20 ترشيح حسب المزاج" : "20 mood-based picks",
      loading: isAr ? "جاري تحليل مزاجك..." : "Analyzing your mood...",
      retry: isAr ? "فشل التحميل، حاول مرة أخرى" : "Failed to load recommendations",
      goVip: isAr ? "الترقية إلى VIP" : "Upgrade to VIP",
      vipActive: isAr ? "VIP مفعل: تظهر 10 توصيات" : "VIP active: showing 10 picks",
    }),
    [isAr],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const params = new URLSearchParams({
      mood,
      lang: tmdbLang,
      email: vipEmail ?? "",
    });

    fetch(`/api/recommend/mood?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: RecommendationResponse | null) => {
        if (cancelled || !json) return;
        setPayload(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mood, tmdbLang, vipEmail]);

  return (
    <section className="mx-auto mt-6 max-w-[1400px] px-4 sm:px-6">
      <div className="card overflow-hidden p-5 sm:p-7">
        <div className={`mb-4 flex items-start justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div>
            <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              <span>AI</span>
              <span>•</span>
              <span>{copy.vipTag}</span>
            </p>
            <h2 className="text-xl font-black text-[var(--text-primary)] sm:text-2xl">{copy.title}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{copy.subtitle}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-muted)]">
            {isVip ? copy.vipActive : copy.teaser}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {MOODS.map((entry) => (
            <button
              key={entry.key}
              onClick={() => setMood(entry.key)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                mood === entry.key
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              {entry.emoji} {isAr ? entry.ar : entry.en}
            </button>
          ))}
        </div>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-8 text-center text-[var(--text-muted)]">
            {copy.loading}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-red-600">
            {copy.retry}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(payload?.items ?? []).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-hover)] group-hover:shadow-md">
                  <div className="relative aspect-[2/3] bg-[var(--bg-elevated)]">
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--text-dim)]">N/A</div>
                    )}
                    {parseFloat(item.rating) > 0 && (
                      <span className="absolute start-2 top-2 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-[var(--rating)]">
                        ★ {item.rating}
                      </span>
                    )}
                    <WatchlistButton item={item} />
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
                  {item.year ? `${item.year} · ` : ""}
                  {copy.confidence}: {item.confidence}%
                </p>
                <p className="line-clamp-2 text-[11px] text-[var(--text-muted)]">
                  <span className="font-semibold">{copy.reason}: </span>
                  {item.reason}
                </p>
              </Link>
            ))}
          </div>
        )}

        {payload?.locked && (
          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] p-4">
            <p className="mb-3 text-sm text-[var(--text-muted)]">
              {isAr
                ? "افتح القائمة الكاملة (10 توصيات ذكية يومية) مع VIP."
                : (payload.upgradeMessage ?? copy.unlock)}
            </p>
            <Link href="/vip" className="btn-primary text-sm">
              {copy.goVip}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
