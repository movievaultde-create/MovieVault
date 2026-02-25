"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";

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
      teaser: isAr ? "توصيتان مجانيتان فقط" : "2 free recommendations only",
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
      <div className="overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-white/[0.03] to-transparent p-5 sm:p-7">
        <div className={`mb-4 flex items-start justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div>
            <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <span>AI</span>
              <span>•</span>
              <span>{copy.vipTag}</span>
            </p>
            <h2 className="text-2xl font-extrabold text-white">{copy.title}</h2>
            <p className="mt-1 text-sm text-gray-300">{copy.subtitle}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-gray-300">
            {isVip ? copy.vipActive : copy.teaser}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {MOODS.map((entry) => (
            <button
              key={entry.key}
              onClick={() => setMood(entry.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                mood === entry.key
                  ? "border-amber-400 bg-amber-500/20 text-amber-200"
                  : "border-white/15 bg-white/[0.03] text-gray-300 hover:border-white/25 hover:text-white"
              }`}
            >
              {entry.emoji} {isAr ? entry.ar : entry.en}
            </button>
          ))}
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-8 text-center text-gray-300">
            {copy.loading}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-8 text-center text-red-300">
            {copy.retry}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(payload?.items ?? []).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition-all hover:-translate-y-1 hover:border-amber-400/30"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-black/40">
                  {item.poster ? (
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">N/A</div>
                  )}
                </div>
                <div className="space-y-1.5 p-3">
                  <h3 className="truncate text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-[11px] text-gray-400">
                    ⭐ {item.rating} {item.year ? `• ${item.year}` : ""}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-300">
                    {copy.confidence}: {item.confidence}%
                  </p>
                  <p className="line-clamp-2 text-[11px] text-gray-300">
                    <span className="font-semibold">{copy.reason}: </span>
                    {item.reason}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {payload?.locked && (
          <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="mb-3 text-sm text-amber-200">
              {isAr
                ? "افتح القائمة الكاملة (10 توصيات ذكية يومية) مع VIP."
                : (payload.upgradeMessage ?? copy.unlock)}
            </p>
            <Link
              href="/vip"
              className="inline-flex rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-400"
            >
              {copy.goVip}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
