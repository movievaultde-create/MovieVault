"use client";

import { useState, useEffect, useCallback } from "react";
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

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function VipCelebration() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [timeAgo, setTimeAgo] = useState("");
  const [lang, setLang] = useState<Lang>("EN");
  const [particles, setParticles] = useState<{ id: number; x: number; emoji: string }[]>([]);

  useEffect(() => {
    const detectLang = () => {
      const htmlLang = document.documentElement.lang;
      setLang(LANG_MAP[htmlLang] ?? "EN");
    };
    detectLang();
    const observer = new MutationObserver(detectLang);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const showCelebration = useCallback(() => {
    setName(randomItem(FAKE_NAMES));
    setCountry(randomItem(COUNTRIES));
    setTimeAgo(randomItem(TIME_AGO[lang]));
    setParticles(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        emoji: randomItem(["🎉", "⭐", "✨", "🌟", "👑", "💎"]),
      }))
    );
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(hide);
  }, [lang]);

  useEffect(() => {
    const initialDelay = setTimeout(() => showCelebration(), 20000);
    const interval = setInterval(() => showCelebration(), 60000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showCelebration]);

  const isRtl = lang === "AR";
  const countryName = lang === "AR" ? country.name.AR : country.name.EN;

  return (
    <div
      className={`fixed z-[9998] transition-all duration-500 ease-out ${
        isRtl ? "right-4" : "left-4"
      } bottom-4 sm:bottom-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="relative w-72 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#1a1408] to-[#0d0d0d] shadow-2xl shadow-amber-900/20 sm:w-80">
        {visible && particles.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute text-sm"
            style={{
              left: `${p.x}%`,
              top: "-8px",
              animation: `vip-fall ${2 + Math.random() * 2}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        <button
          onClick={() => setVisible(false)}
          className={`absolute top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white ${isRtl ? "left-2.5" : "right-2.5"}`}
        >
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-base">👑</span>
            <span className="text-xs font-bold tracking-wider text-amber-400/80 uppercase">VIP</span>
          </div>

          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 text-2xl ring-1 ring-amber-500/20">
              {country.flag}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{name}</p>
              <p className="mt-0.5 text-xs text-amber-400/70">{JOINED_TEXT[lang]}</p>
            </div>
          </div>

          <div className={`mt-3 flex items-center justify-between text-[10px] text-gray-500 ${isRtl ? "flex-row-reverse" : ""}`}>
            <span>{country.flag} {countryName}</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {visible && (
          <div className="h-0.5 w-full bg-amber-900/20">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ animation: "vip-shrink 6s linear forwards" }} />
          </div>
        )}

        <style jsx>{`
          @keyframes vip-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
          }
          @keyframes vip-shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}
