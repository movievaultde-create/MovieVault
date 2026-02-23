"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lang } from "../context/LanguageContext";
import { useVip } from "../context/VipContext";

const AD_LINK =
  "https://www.effectivegatecpm.com/ksx3jaie5?key=e46ad7ef9f7376acad63fe30acbfcbff";

interface Notif {
  icon: string;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
}

const STATIC_NOTIFICATIONS: Notif[] = [
  {
    icon: "🎬",
    title: { EN: "Exclusive Offer!", AR: "عرض حصري!", DE: "Exklusives Angebot!", FR: "Offre exclusive !", ES: "¡Oferta exclusiva!", TR: "Özel Teklif!" },
    body: { EN: "Watch latest movies in 4K for free", AR: "شاهد أحدث الأفلام بجودة 4K مجاناً", DE: "Neueste Filme in 4K kostenlos ansehen", FR: "Regardez les derniers films en 4K gratuitement", ES: "Mira las últimas películas en 4K gratis", TR: "En yeni filmleri 4K'da ücretsiz izleyin" },
  },
  {
    icon: "🔥",
    title: { EN: "Don't Miss Out!", AR: "لا تفوت الفرصة!", DE: "Nicht verpassen!", FR: "Ne ratez pas !", ES: "¡No te lo pierdas!", TR: "Kaçırmayın!" },
    body: { EN: "Subscribe now & get VIP content", AR: "سارع بالاشتراك واحصل على محتوى VIP", DE: "Jetzt abonnieren und VIP-Inhalte erhalten", FR: "Abonnez-vous et accédez au contenu VIP", ES: "Suscríbete y obtén contenido VIP", TR: "Abone olun ve VIP içeriklere erişin" },
  },
  {
    icon: "⭐",
    title: { EN: "Premium Content", AR: "محتوى مميز", DE: "Premium-Inhalte", FR: "Contenu premium", ES: "Contenido premium", TR: "Premium İçerik" },
    body: { EN: "Discover thousands of movies & series", AR: "اكتشف آلاف الأفلام والمسلسلات", DE: "Tausende Filme und Serien entdecken", FR: "Découvrez des milliers de films et séries", ES: "Descubre miles de películas y series", TR: "Binlerce film ve diziyi keşfedin" },
  },
  {
    icon: "🎁",
    title: { EN: "Special Gift!", AR: "هدية خاصة!", DE: "Sondergeschenk!", FR: "Cadeau spécial !", ES: "¡Regalo especial!", TR: "Özel Hediye!" },
    body: { EN: "Get free access for 30 days", AR: "احصل على وصول مجاني لمدة 30 يوم", DE: "30 Tage kostenloser Zugang", FR: "Accès gratuit pendant 30 jours", ES: "Acceso gratuito por 30 días", TR: "30 gün ücretsiz erişim kazanın" },
  },
];

const NEW_ADDED_BODY: Record<Lang, string> = {
  EN: "has been added in 4K.. Watch now!",
  AR: "تمت إضافته بجودة 4K.. شاهد الآن!",
  DE: "wurde in 4K hinzugefügt.. Jetzt ansehen!",
  FR: "a été ajouté en 4K.. Regardez !",
  ES: "se ha añadido en 4K.. ¡Ver ahora!",
  TR: "4K olarak eklendi.. Şimdi izle!",
};

const LANG_HTML_MAP: Record<string, Lang> = { en: "EN", ar: "AR", de: "DE", fr: "FR", es: "ES", tr: "TR" };

const CTA_TEXT: Record<Lang, string> = {
  EN: "Click for more →", AR: "← اضغط للمزيد", DE: "Mehr erfahren →", FR: "En savoir plus →", ES: "Más información →", TR: "Daha fazlası →",
};

export default function SocialBar() {
  const { isVip } = useVip();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lang, setLang] = useState<Lang>("EN");
  const [notifications, setNotifications] = useState<Notif[]>(STATIC_NOTIFICATIONS);

  useEffect(() => {
    const detectLang = () => {
      const htmlLang = document.documentElement.lang;
      setLang(LANG_HTML_MAP[htmlLang] ?? "EN");
    };
    detectLang();
    const observer = new MutationObserver(detectLang);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/browse?lang=en-US")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const releases = d?.newReleases ?? d?.addedToday ?? [];
        if (!releases.length) return;
        const newNotifs: Notif[] = releases.slice(0, 3).map((item: { title: string }) => {
          const allLangs = Object.fromEntries(
            (["EN", "AR", "DE", "FR", "ES", "TR"] as Lang[]).map((l) => [l, `${item.title} ${NEW_ADDED_BODY[l]}`])
          ) as Record<Lang, string>;
          const titleLangs = Object.fromEntries(
            (["EN", "AR", "DE", "FR", "ES", "TR"] as Lang[]).map((l) => [l, "🆕 " + (l === "AR" ? "فيلم جديد!" : l === "DE" ? "Neuer Film!" : l === "FR" ? "Nouveau film !" : l === "ES" ? "¡Nueva película!" : l === "TR" ? "Yeni Film!" : "New Release!")])
          ) as Record<Lang, string>;
          return { icon: "🎬", title: titleLangs, body: allLangs };
        });
        setNotifications([...newNotifs, ...STATIC_NOTIFICATIONS]);
      })
      .catch(() => {});
  }, []);

  const showNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % notifications.length);
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(hideTimer);
  }, [notifications.length]);

  useEffect(() => {
    const initialDelay = setTimeout(() => showNext(), 4000);
    const interval = setInterval(() => showNext(), 15000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showNext]);

  if (isVip) return null;

  const notif = notifications[currentIndex % notifications.length];
  const isRtl = lang === "AR";

  const handleClick = () => {
    window.open(AD_LINK, "_blank", "noopener,noreferrer");
    setVisible(false);
  };

  return (
    <div
      className={`fixed z-[9999] transition-all duration-500 ease-out ${
        isRtl ? "left-4" : "right-4"
      } bottom-4 sm:bottom-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="relative w-72 overflow-hidden rounded-xl border border-surface-border bg-surface shadow-2xl shadow-black/40 sm:w-80">
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          className="absolute end-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-surface-light text-text-muted transition-colors hover:bg-surface-border hover:text-white"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div onClick={handleClick} className="flex cursor-pointer items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
            {notif?.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{notif?.title[lang]}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{notif?.body[lang]}</p>
            <span className="mt-2 inline-block text-[10px] font-medium text-primary">{CTA_TEXT[lang]}</span>
          </div>
        </div>

        {visible && (
          <div className="h-0.5 w-full bg-surface-light">
            <div className="h-full bg-primary" style={{ animation: "shrink-bar 8s linear forwards" }} />
          </div>
        )}

        <style jsx>{`
          @keyframes shrink-bar {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}
