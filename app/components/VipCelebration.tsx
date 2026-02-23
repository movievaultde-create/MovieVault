"use client";

import { useState, useEffect, useRef } from "react";
import type { Lang } from "../context/LanguageContext";

const FAKE_NAMES = [
  "Ahmed K.", "Sarah M.", "Youssef A.", "Lina R.", "Omar T.",
  "Fatima Z.", "Hassan B.", "Nour D.", "Ali S.", "Mona H.",
  "Khaled W.", "Rania F.", "Tariq J.", "Dina L.", "Sami N.",
  "Layla Q.", "Ziad P.", "Hana E.", "Faris G.", "Amira V.",
  "Mustafa I.", "Salma C.", "Karim X.", "Jasmine O.", "Bilal U.",
  "David R.", "Emma S.", "Lucas T.", "Sophie W.", "James M.",
  "Olivia B.", "Daniel H.", "Mia K.", "Alex J.", "Isabella F.",
  "Mehmet Y.", "Elif A.", "Can D.", "Zeynep L.", "Emre S.",
  "Hans W.", "Marie P.", "Pierre G.", "Carmen R.", "Marco T.",
  "Yuki N.", "Min-Jun P.", "Priya S.", "Raj K.", "Chen W.",
];

const COUNTRIES = [
  { flag: "🇸🇦", name: { EN: "Saudi Arabia", AR: "السعودية" } },
  { flag: "🇪🇬", name: { EN: "Egypt", AR: "مصر" } },
  { flag: "🇦🇪", name: { EN: "UAE", AR: "الإمارات" } },
  { flag: "🇺🇸", name: { EN: "USA", AR: "أمريكا" } },
  { flag: "🇩🇪", name: { EN: "Germany", AR: "ألمانيا" } },
  { flag: "🇫🇷", name: { EN: "France", AR: "فرنسا" } },
  { flag: "🇹🇷", name: { EN: "Turkey", AR: "تركيا" } },
  { flag: "🇬🇧", name: { EN: "UK", AR: "بريطانيا" } },
  { flag: "🇲🇦", name: { EN: "Morocco", AR: "المغرب" } },
  { flag: "🇮🇶", name: { EN: "Iraq", AR: "العراق" } },
  { flag: "🇯🇴", name: { EN: "Jordan", AR: "الأردن" } },
  { flag: "🇰🇼", name: { EN: "Kuwait", AR: "الكويت" } },
  { flag: "🇶🇦", name: { EN: "Qatar", AR: "قطر" } },
  { flag: "🇪🇸", name: { EN: "Spain", AR: "إسبانيا" } },
  { flag: "🇧🇷", name: { EN: "Brazil", AR: "البرازيل" } },
  { flag: "🇮🇳", name: { EN: "India", AR: "الهند" } },
  { flag: "🇰🇷", name: { EN: "South Korea", AR: "كوريا" } },
  { flag: "🇯🇵", name: { EN: "Japan", AR: "اليابان" } },
  { flag: "🇩🇿", name: { EN: "Algeria", AR: "الجزائر" } },
  { flag: "🇹🇳", name: { EN: "Tunisia", AR: "تونس" } },
];

const JOINED_TEXT: Record<Lang, string> = {
  EN: "just joined VIP",
  AR: "انضم للتو إلى كبار الشخصيات",
  DE: "ist gerade VIP beigetreten",
  FR: "vient de rejoindre VIP",
  ES: "acaba de unirse a VIP",
  TR: "VIP'e katıldı",
};

const TIME_AGO: Record<Lang, string[]> = {
  EN: ["just now", "30 sec ago", "1 min ago", "2 min ago"],
  AR: ["الآن", "منذ 30 ثانية", "منذ دقيقة", "منذ دقيقتين"],
  DE: ["gerade eben", "vor 30 Sek.", "vor 1 Min.", "vor 2 Min."],
  FR: ["à l'instant", "il y a 30 sec", "il y a 1 min", "il y a 2 min"],
  ES: ["ahora mismo", "hace 30 seg", "hace 1 min", "hace 2 min"],
  TR: ["şimdi", "30 sn önce", "1 dk önce", "2 dk önce"],
};

const LANG_MAP: Record<string, Lang> = { en: "EN", ar: "AR", de: "DE", fr: "FR", es: "ES", tr: "TR" };
const EMOJIS = ["🎉", "⭐", "✨", "🌟", "👑", "💎"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function VipCelebration() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("Ahmed K.");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [timeAgo, setTimeAgo] = useState("");
  const [lang, setLang] = useState<Lang>("EN");
  const [particles, setParticles] = useState<{ id: number; x: number; emoji: string; dur: number; delay: number }[]>([]);
  const hideRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const detect = () => {
      const l = document.documentElement.lang;
      setLang(LANG_MAP[l] ?? "EN");
    };
    detect();
    const obs = new MutationObserver(detect);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const show = () => {
      const currentLang = LANG_MAP[document.documentElement.lang] ?? "EN";
      setName(pick(FAKE_NAMES));
      setCountry(pick(COUNTRIES));
      setTimeAgo(pick(TIME_AGO[currentLang]));
      setParticles(
        Array.from({ length: 8 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          emoji: pick(EMOJIS),
          dur: 2 + Math.random() * 2,
          delay: Math.random() * 0.5,
        }))
      );
      setVisible(true);
      if (hideRef.current) clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => setVisible(false), 6000);
    };

    const first = setTimeout(show, 8000);
    const interval = setInterval(show, 60000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  const isRtl = lang === "AR";
  const countryName = isRtl ? country.name.AR : country.name.EN;

  return (
    <div
      className={`fixed z-[9998] transition-all duration-500 ease-out ${
        isRtl ? "right-4" : "left-4"
      } bottom-4 sm:bottom-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
      }`}
      style={{ willChange: "transform, opacity" }}
    >
      <div
        className="relative w-[280px] overflow-hidden rounded-2xl border border-amber-500/25 shadow-2xl sm:w-[310px]"
        style={{
          background: "linear-gradient(135deg, #1a1408 0%, #0d0d0d 100%)",
          animation: visible ? "vip-pulse 2s ease-in-out infinite" : "none",
        }}
      >
        {/* Celebration particles */}
        {visible && particles.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute text-sm"
            style={{
              left: `${p.x}%`,
              top: "-8px",
              animation: `vip-fall ${p.dur}s ease-in forwards`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className={`absolute top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white ${isRtl ? "left-2.5" : "right-2.5"}`}
        >
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4">
          {/* VIP Badge */}
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-lg">👑</span>
            <span className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase">VIP Member</span>
          </div>

          {/* User info */}
          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/25 to-amber-700/10 text-2xl ring-1 ring-amber-500/25">
              {country.flag}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-white">{name}</p>
              <p className="mt-0.5 text-xs font-medium text-amber-400/80">{JOINED_TEXT[lang]}</p>
            </div>
          </div>

          {/* Footer info */}
          <div className={`mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] text-gray-500 ${isRtl ? "flex-row-reverse" : ""}`}>
            <span className="flex items-center gap-1">{country.flag} {countryName}</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Progress bar */}
        {visible && (
          <div className="h-[3px] w-full bg-amber-900/20">
            <div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #f59e0b, #d97706)",
                animation: "vip-shrink 6s linear forwards",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
