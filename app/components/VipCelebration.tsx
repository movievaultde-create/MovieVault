"use client";

import { useState, useEffect, useRef } from "react";
import type { Lang } from "../context/LanguageContext";

const FIRST_NAMES = [
  "Ahmed", "Sarah", "Youssef", "Lina", "Omar", "Fatima", "Hassan", "Nour", "Ali", "Mona",
  "Khaled", "Rania", "Tariq", "Dina", "Sami", "Layla", "Ziad", "Hana", "Faris", "Amira",
  "Mustafa", "Salma", "Karim", "Jasmine", "Bilal", "David", "Emma", "Lucas", "Sophie", "James",
  "Olivia", "Daniel", "Mia", "Alex", "Isabella", "Mehmet", "Elif", "Can", "Zeynep", "Emre",
  "Hans", "Marie", "Pierre", "Carmen", "Marco", "Yuki", "Min-Jun", "Priya", "Raj", "Chen",
  "Mohammed", "Aisha", "Ibrahim", "Noura", "Abdullah", "Mariam", "Saeed", "Reem", "Hamad", "Dana",
  "Yousef", "Huda", "Fahad", "Asma", "Sultan", "Lama", "Turki", "Ghada", "Faisal", "Abeer",
  "Jack", "Emily", "William", "Charlotte", "Benjamin", "Amelia", "Henry", "Harper", "Sebastian", "Evelyn",
  "Michael", "Jessica", "Christopher", "Ashley", "Matthew", "Samantha", "Andrew", "Lauren", "Joshua", "Hannah",
  "Liam", "Sophia", "Noah", "Ava", "Ethan", "Chloe", "Mason", "Ella", "Logan", "Grace",
  "Kenji", "Sakura", "Takeshi", "Hina", "Ryu", "Yuna", "Haruki", "Mei", "Daiki", "Aoi",
  "Ji-Hoon", "Soo-Jin", "Min-Seo", "Hyun-Woo", "Eun-Ji", "Tae-Yeon", "Dong-Hyun", "Yoo-Na", "Jae-Won", "Ha-Eun",
  "Wei", "Xiao-Ming", "Li-Na", "Jun", "Mei-Ling", "Hao", "Ying", "Feng", "Lan", "Bo",
  "Arjun", "Ananya", "Vikram", "Deepika", "Rohan", "Kavya", "Aditya", "Neha", "Siddharth", "Pooja",
  "Carlos", "Maria", "Juan", "Ana", "Diego", "Valentina", "Luis", "Camila", "Mateo", "Sofia",
  "Paulo", "Juliana", "Rafael", "Beatriz", "Thiago", "Larissa", "Bruno", "Fernanda", "Gustavo", "Leticia",
  "Dmitri", "Natasha", "Ivan", "Olga", "Sergei", "Anastasia", "Alexei", "Ekaterina", "Viktor", "Svetlana",
  "Obi", "Amara", "Kwame", "Nia", "Kofi", "Zara", "Jabari", "Aaliyah", "Tariq", "Imani",
  "Muhammad", "Zahra", "Yusuf", "Khadija", "Ismail", "Safiya", "Hamza", "Nadia", "Idris", "Sumaya",
  "Luca", "Giulia", "Alessandro", "Francesca", "Lorenzo", "Chiara", "Matteo", "Elena", "Andrea", "Giorgia",
  "Leon", "Mila", "Felix", "Anna", "Paul", "Leonie", "Lukas", "Lena", "Tim", "Clara",
  "Antoine", "Chloe", "Hugo", "Lea", "Louis", "Manon", "Arthur", "Jade", "Jules", "Louise",
  "Berk", "Defne", "Cem", "Ecrin", "Deniz", "Aylin", "Kaan", "Selin", "Arda", "Nur",
  "Riku", "Hana", "Sora", "Yui", "Ren", "Mio", "Kai", "Rin", "Shin", "Noa",
  "Oscar", "Astrid", "Erik", "Freja", "Lars", "Saga", "Axel", "Elsa", "Nils", "Maja",
  "Patrick", "Siobhan", "Conor", "Aoife", "Sean", "Niamh", "Declan", "Ciara", "Finn", "Roisin",
  "Adrian", "Petra", "Milos", "Ivana", "Stefan", "Katarina", "Nikola", "Maja", "Dragan", "Jelena",
];

const LAST_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
  { flag: "🇨🇦", name: { EN: "Canada", AR: "كندا" } },
  { flag: "🇦🇺", name: { EN: "Australia", AR: "أستراليا" } },
  { flag: "🇮🇹", name: { EN: "Italy", AR: "إيطاليا" } },
  { flag: "🇳🇱", name: { EN: "Netherlands", AR: "هولندا" } },
  { flag: "🇧🇪", name: { EN: "Belgium", AR: "بلجيكا" } },
  { flag: "🇨🇭", name: { EN: "Switzerland", AR: "سويسرا" } },
  { flag: "🇦🇹", name: { EN: "Austria", AR: "النمسا" } },
  { flag: "🇸🇪", name: { EN: "Sweden", AR: "السويد" } },
  { flag: "🇳🇴", name: { EN: "Norway", AR: "النرويج" } },
  { flag: "🇩🇰", name: { EN: "Denmark", AR: "الدنمارك" } },
  { flag: "🇫🇮", name: { EN: "Finland", AR: "فنلندا" } },
  { flag: "🇵🇱", name: { EN: "Poland", AR: "بولندا" } },
  { flag: "🇷🇺", name: { EN: "Russia", AR: "روسيا" } },
  { flag: "🇺🇦", name: { EN: "Ukraine", AR: "أوكرانيا" } },
  { flag: "🇨🇳", name: { EN: "China", AR: "الصين" } },
  { flag: "🇹🇼", name: { EN: "Taiwan", AR: "تايوان" } },
  { flag: "🇹🇭", name: { EN: "Thailand", AR: "تايلاند" } },
  { flag: "🇻🇳", name: { EN: "Vietnam", AR: "فيتنام" } },
  { flag: "🇮🇩", name: { EN: "Indonesia", AR: "إندونيسيا" } },
  { flag: "🇲🇾", name: { EN: "Malaysia", AR: "ماليزيا" } },
  { flag: "🇵🇭", name: { EN: "Philippines", AR: "الفلبين" } },
  { flag: "🇵🇰", name: { EN: "Pakistan", AR: "باكستان" } },
  { flag: "🇧🇩", name: { EN: "Bangladesh", AR: "بنغلاديش" } },
  { flag: "🇱🇧", name: { EN: "Lebanon", AR: "لبنان" } },
  { flag: "🇸🇾", name: { EN: "Syria", AR: "سوريا" } },
  { flag: "🇵🇸", name: { EN: "Palestine", AR: "فلسطين" } },
  { flag: "🇾🇪", name: { EN: "Yemen", AR: "اليمن" } },
  { flag: "🇴🇲", name: { EN: "Oman", AR: "عُمان" } },
  { flag: "🇧🇭", name: { EN: "Bahrain", AR: "البحرين" } },
  { flag: "🇱🇾", name: { EN: "Libya", AR: "ليبيا" } },
  { flag: "🇸🇩", name: { EN: "Sudan", AR: "السودان" } },
  { flag: "🇲🇽", name: { EN: "Mexico", AR: "المكسيك" } },
  { flag: "🇦🇷", name: { EN: "Argentina", AR: "الأرجنتين" } },
  { flag: "🇨🇴", name: { EN: "Colombia", AR: "كولومبيا" } },
  { flag: "🇨🇱", name: { EN: "Chile", AR: "تشيلي" } },
  { flag: "🇵🇪", name: { EN: "Peru", AR: "بيرو" } },
  { flag: "🇳🇬", name: { EN: "Nigeria", AR: "نيجيريا" } },
  { flag: "🇿🇦", name: { EN: "South Africa", AR: "جنوب أفريقيا" } },
  { flag: "🇰🇪", name: { EN: "Kenya", AR: "كينيا" } },
  { flag: "🇬🇭", name: { EN: "Ghana", AR: "غانا" } },
  { flag: "🇪🇹", name: { EN: "Ethiopia", AR: "إثيوبيا" } },
  { flag: "🇳🇿", name: { EN: "New Zealand", AR: "نيوزيلندا" } },
  { flag: "🇵🇹", name: { EN: "Portugal", AR: "البرتغال" } },
  { flag: "🇬🇷", name: { EN: "Greece", AR: "اليونان" } },
  { flag: "🇮🇪", name: { EN: "Ireland", AR: "أيرلندا" } },
  { flag: "🇷🇴", name: { EN: "Romania", AR: "رومانيا" } },
  { flag: "🇭🇺", name: { EN: "Hungary", AR: "المجر" } },
  { flag: "🇨🇿", name: { EN: "Czech Republic", AR: "التشيك" } },
  { flag: "🇷🇸", name: { EN: "Serbia", AR: "صربيا" } },
  { flag: "🇭🇷", name: { EN: "Croatia", AR: "كرواتيا" } },
  { flag: "🇸🇬", name: { EN: "Singapore", AR: "سنغافورة" } },
  { flag: "🇮🇱", name: { EN: "Israel", AR: "إسرائيل" } },
  { flag: "🇬🇪", name: { EN: "Georgia", AR: "جورجيا" } },
  { flag: "🇦🇿", name: { EN: "Azerbaijan", AR: "أذربيجان" } },
  { flag: "🇰🇿", name: { EN: "Kazakhstan", AR: "كازاخستان" } },
  { flag: "🇺🇿", name: { EN: "Uzbekistan", AR: "أوزبكستان" } },
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
  EN: ["just now", "10 sec ago", "30 sec ago", "1 min ago", "2 min ago", "3 min ago", "5 min ago"],
  AR: ["الآن", "منذ 10 ثوانٍ", "منذ 30 ثانية", "منذ دقيقة", "منذ دقيقتين", "منذ 3 دقائق", "منذ 5 دقائق"],
  DE: ["gerade eben", "vor 10 Sek.", "vor 30 Sek.", "vor 1 Min.", "vor 2 Min.", "vor 3 Min.", "vor 5 Min."],
  FR: ["à l'instant", "il y a 10 sec", "il y a 30 sec", "il y a 1 min", "il y a 2 min", "il y a 3 min", "il y a 5 min"],
  ES: ["ahora mismo", "hace 10 seg", "hace 30 seg", "hace 1 min", "hace 2 min", "hace 3 min", "hace 5 min"],
  TR: ["şimdi", "10 sn önce", "30 sn önce", "1 dk önce", "2 dk önce", "3 dk önce", "5 dk önce"],
};

const LANG_MAP: Record<string, Lang> = { en: "EN", ar: "AR", de: "DE", fr: "FR", es: "ES", tr: "TR" };
const EMOJIS = ["🎉", "⭐", "✨", "🌟", "👑", "💎", "🏆", "🥇", "🎊", "💫"];
const CELEBRATION_INTERVAL_MS = 35 * 60 * 1000;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VipCelebration() {
  const [visible, setVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [timeAgo, setTimeAgo] = useState("");
  const [lang, setLang] = useState<Lang>("EN");
  const [particles, setParticles] = useState<{ id: number; x: number; emoji: string; dur: number; delay: number }[]>([]);
  const hideRef = useRef<ReturnType<typeof setTimeout>>(null);
  const usedNamesRef = useRef<Set<string>>(new Set());
  const usedCountriesRef = useRef<Set<number>>(new Set());
  const shuffledNamesRef = useRef<string[]>([]);
  const shuffledCountriesRef = useRef<typeof COUNTRIES>([]);
  const nameIndexRef = useRef(0);
  const countryIndexRef = useRef(0);
  const lastResetRef = useRef(Date.now());

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
    shuffledNamesRef.current = shuffleArray(FIRST_NAMES);
    shuffledCountriesRef.current = shuffleArray(COUNTRIES);

    const getUniqueName = (): string => {
      if (Date.now() - lastResetRef.current > 3600000) {
        usedNamesRef.current.clear();
        usedCountriesRef.current.clear();
        shuffledNamesRef.current = shuffleArray(FIRST_NAMES);
        shuffledCountriesRef.current = shuffleArray(COUNTRIES);
        nameIndexRef.current = 0;
        countryIndexRef.current = 0;
        lastResetRef.current = Date.now();
      }

      if (nameIndexRef.current >= shuffledNamesRef.current.length) {
        shuffledNamesRef.current = shuffleArray(FIRST_NAMES);
        nameIndexRef.current = 0;
      }

      const firstName = shuffledNamesRef.current[nameIndexRef.current++];
      const initial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
      const fullName = `${firstName} ${initial}.`;

      if (usedNamesRef.current.has(fullName) && usedNamesRef.current.size < FIRST_NAMES.length * 20) {
        return getUniqueName();
      }
      usedNamesRef.current.add(fullName);
      return fullName;
    };

    const getUniqueCountry = () => {
      if (countryIndexRef.current >= shuffledCountriesRef.current.length) {
        shuffledCountriesRef.current = shuffleArray(COUNTRIES);
        countryIndexRef.current = 0;
      }
      return shuffledCountriesRef.current[countryIndexRef.current++];
    };

    const show = () => {
      const currentLang = LANG_MAP[document.documentElement.lang] ?? "EN";
      const name = getUniqueName();
      const c = getUniqueCountry();

      setDisplayName(name);
      setCountry(c);
      setTimeAgo(TIME_AGO[currentLang][Math.floor(Math.random() * TIME_AGO[currentLang].length)]);
      setParticles(
        Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          dur: 1.5 + Math.random() * 2.5,
          delay: Math.random() * 0.8,
        }))
      );
      setVisible(true);
      if (hideRef.current) clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => setVisible(false), 6000);
    };

    const first = setTimeout(show, CELEBRATION_INTERVAL_MS);
    const interval = setInterval(show, CELEBRATION_INTERVAL_MS);
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
        className="relative w-[280px] overflow-hidden rounded-2xl border border-[var(--accent)]/25 bg-[var(--bg-card)] shadow-lg sm:w-[310px]"
        style={{
          animation: visible ? "vip-pulse 2s ease-in-out infinite" : "none",
        }}
      >
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

        <button
          onClick={() => setVisible(false)}
          className={`absolute top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-dim)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] ${isRtl ? "left-2.5" : "right-2.5"}`}
        >
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg">👑</span>
            <span className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase">VIP Member</span>
          </div>

          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl ring-1 ring-[var(--accent)]/25">
              {country.flag}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-[var(--text-primary)]">{displayName}</p>
              <p className="mt-0.5 text-xs font-medium text-[var(--accent)]">{JOINED_TEXT[lang]}</p>
            </div>
          </div>

          <div className={`mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-[10px] text-[var(--text-dim)] ${isRtl ? "flex-row-reverse" : ""}`}>
            <span className="flex items-center gap-1">{country.flag} {countryName}</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {visible && (
          <div className="h-[3px] w-full bg-[var(--accent-soft)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{
                animation: "vip-shrink 6s linear forwards",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
