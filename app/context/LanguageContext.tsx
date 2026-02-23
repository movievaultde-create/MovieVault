"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "EN" | "AR" | "DE" | "FR" | "ES" | "TR";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "AR", label: "العربية", flag: "🇸🇦" },
  { code: "DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "FR", label: "Français", flag: "🇫🇷" },
  { code: "ES", label: "Español", flag: "🇪🇸" },
  { code: "TR", label: "Türkçe", flag: "🇹🇷" },
];

const RTL_LANGS: Lang[] = ["AR"];

export const TMDB_LANG_MAP: Record<Lang, string> = {
  EN: "en-US",
  AR: "ar-SA",
  DE: "de-DE",
  FR: "fr-FR",
  ES: "es-ES",
  TR: "tr-TR",
};

const translations = {
  // Navbar
  navHome: { EN: "Home", AR: "الرئيسية", DE: "Startseite", FR: "Accueil", ES: "Inicio", TR: "Ana Sayfa" },
  navMovies: { EN: "Movies", AR: "أفلام", DE: "Filme", FR: "Films", ES: "Películas", TR: "Filmler" },
  navSeries: { EN: "Series", AR: "مسلسلات", DE: "Serien", FR: "Séries", ES: "Series", TR: "Diziler" },
  navAnime: { EN: "Anime", AR: "أنمي", DE: "Anime", FR: "Anime", ES: "Anime", TR: "Anime" },
  navArabMovies: { EN: "Arab Movies", AR: "أفلام عربية", DE: "Arabische Filme", FR: "Films arabes", ES: "Películas árabes", TR: "Arap Filmleri" },
  navArabSeries: { EN: "Arab Series", AR: "مسلسلات عربية", DE: "Arabische Serien", FR: "Séries arabes", ES: "Series árabes", TR: "Arap Dizileri" },
  allArabMovies: { EN: "Arab Movies", AR: "أفلام عربية", DE: "Arabische Filme", FR: "Films arabes", ES: "Películas árabes", TR: "Arap Filmleri" },
  allArabSeries: { EN: "Arab Series", AR: "مسلسلات عربية", DE: "Arabische Serien", FR: "Séries arabes", ES: "Series árabes", TR: "Arap Dizileri" },
  navTurkishSeries: { EN: "Turkish Series", AR: "مسلسلات تركية", DE: "Türkische Serien", FR: "Séries turques", ES: "Series turcas", TR: "Türk Dizileri" },
  allTurkishSeries: { EN: "Turkish Series", AR: "مسلسلات تركية", DE: "Türkische Serien", FR: "Séries turques", ES: "Series turcas", TR: "Türk Dizileri" },
  navKoreanSeries: { EN: "Korean Series", AR: "مسلسلات كورية", DE: "Koreanische Serien", FR: "Séries coréennes", ES: "Series coreanas", TR: "Kore Dizileri" },
  allKoreanSeries: { EN: "Korean Series", AR: "مسلسلات كورية", DE: "Koreanische Serien", FR: "Séries coréennes", ES: "Series coreanas", TR: "Kore Dizileri" },
  navIndianSeries: { EN: "Indian Series", AR: "مسلسلات هندية", DE: "Indische Serien", FR: "Séries indiennes", ES: "Series indias", TR: "Hint Dizileri" },
  allIndianSeries: { EN: "Indian Series", AR: "مسلسلات هندية", DE: "Indische Serien", FR: "Séries indiennes", ES: "Series indias", TR: "Hint Dizileri" },
  navIndianMovies: { EN: "Indian Movies", AR: "أفلام هندية", DE: "Indische Filme", FR: "Films indiens", ES: "Películas indias", TR: "Hint Filmleri" },
  allIndianMovies: { EN: "Indian Movies", AR: "أفلام هندية", DE: "Indische Filme", FR: "Films indiens", ES: "Películas indias", TR: "Hint Filmleri" },
  navCollections: { EN: "Franchises", AR: "سلاسل أفلام", DE: "Filmreihen", FR: "Sagas", ES: "Sagas", TR: "Film Serileri" },
  allCollections: { EN: "Movie Franchises", AR: "سلاسل الأفلام", DE: "Filmreihen", FR: "Sagas de films", ES: "Sagas de películas", TR: "Film Serileri" },
  collectionParts: { EN: "parts", AR: "أجزاء", DE: "Teile", FR: "parties", ES: "partes", TR: "bölüm" },
  backToCollections: { EN: "Back to Franchises", AR: "العودة لسلاسل الأفلام", DE: "Zurück zu Filmreihen", FR: "Retour aux sagas", ES: "Volver a sagas", TR: "Film Serilerine Dön" },
  upcomingMovies: { EN: "Coming Soon 🎥", AR: "قريباً في السينما 🎥", DE: "Demnächst 🎥", FR: "Prochainement 🎥", ES: "Próximamente 🎥", TR: "Yakında 🎥" },
  newReleases: { EN: "New Releases 🆕", AR: "أحدث الإصدارات 🆕", DE: "Neuerscheinungen 🆕", FR: "Nouvelles sorties 🆕", ES: "Nuevos lanzamientos 🆕", TR: "Yeni Çıkanlar 🆕" },
  searchPlaceholder: { EN: "Search movies, series...", AR: "ابحث عن فيلم أو مسلسل...", DE: "Filme, Serien suchen...", FR: "Rechercher films, séries...", ES: "Buscar películas, series...", TR: "Film, dizi ara..." },
  searchNoResults: { EN: "No results found", AR: "لا توجد نتائج", DE: "Keine Ergebnisse", FR: "Aucun résultat", ES: "Sin resultados", TR: "Sonuç bulunamadı" },
  searchTyping: { EN: "Type to search...", AR: "اكتب للبحث...", DE: "Tippen zum Suchen...", FR: "Tapez pour chercher...", ES: "Escribe para buscar...", TR: "Aramak için yazın..." },
  movie: { EN: "Movie", AR: "فيلم", DE: "Film", FR: "Film", ES: "Película", TR: "Film" },
  tvShow: { EN: "TV Show", AR: "مسلسل", DE: "Serie", FR: "Série", ES: "Serie", TR: "Dizi" },

  // Hero
  featured: { EN: "Featured", AR: "مميز", DE: "Empfohlen", FR: "À la une", ES: "Destacado", TR: "Öne Çıkan" },
  watchNow: { EN: "Watch Now", AR: "شاهد الآن", DE: "Jetzt ansehen", FR: "Regarder", ES: "Ver ahora", TR: "Şimdi İzle" },
  movieDetails: { EN: "Movie Details", AR: "تفاصيل الفيلم", DE: "Filmdetails", FR: "Détails du film", ES: "Detalles", TR: "Film Detayları" },

  // Sections
  latestMovies: { EN: "Latest Movies", AR: "أحدث الأفلام", DE: "Neueste Filme", FR: "Derniers films", ES: "Últimas películas", TR: "Son Filmler" },
  latestSeries: { EN: "Latest Series", AR: "أحدث المسلسلات", DE: "Neueste Serien", FR: "Dernières séries", ES: "Últimas series", TR: "Son Diziler" },
  latestAnime: { EN: "Latest Anime", AR: "أحدث الأنمي", DE: "Neuester Anime", FR: "Derniers anime", ES: "Último anime", TR: "Son Animeler" },
  trending: { EN: "Trending", AR: "الأكثر مشاهدة", DE: "Beliebt", FR: "Tendances", ES: "Tendencias", TR: "Trend" },
  trendingWeek: { EN: "Trending This Week 🔥", AR: "الأكثر مشاهدة هذا الأسبوع 🔥", DE: "Trend diese Woche 🔥", FR: "Tendances cette semaine 🔥", ES: "Tendencias de la semana 🔥", TR: "Bu Hafta Trend 🔥" },
  addedToday: { EN: "Just Released 🆕", AR: "أُضيف حديثاً 🆕", DE: "Gerade veröffentlicht 🆕", FR: "Sorties récentes 🆕", ES: "Recién agregado 🆕", TR: "Yeni Eklenen 🆕" },
  nowPlaying: { EN: "Now in Cinemas 🎬", AR: "حالياً في السينما 🎬", DE: "Jetzt im Kino 🎬", FR: "Actuellement au cinéma 🎬", ES: "Ahora en cines 🎬", TR: "Şimdi Sinemalarda 🎬" },
  newSeries: { EN: "New Episodes This Week 📺", AR: "حلقات جديدة هذا الأسبوع 📺", DE: "Neue Folgen diese Woche 📺", FR: "Nouveaux épisodes cette semaine 📺", ES: "Nuevos episodios esta semana 📺", TR: "Bu Hafta Yeni Bölümler 📺" },
  newAnime: { EN: "New Anime Episodes 🔥", AR: "حلقات أنمي جديدة 🔥", DE: "Neue Anime-Folgen 🔥", FR: "Nouveaux épisodes d'anime 🔥", ES: "Nuevos episodios de anime 🔥", TR: "Yeni Anime Bölümleri 🔥" },
  newAdded: { EN: "has been added in 4K.. Watch now!", AR: "تمت إضافته بجودة 4K.. شاهد الآن!", DE: "wurde in 4K hinzugefügt.. Jetzt ansehen!", FR: "a été ajouté en 4K.. Regardez !", ES: "se ha añadido en 4K.. ¡Ver ahora!", TR: "4K olarak eklendi.. Şimdi izle!" },
  viewAll: { EN: "View All", AR: "عرض الكل", DE: "Alle anzeigen", FR: "Voir tout", ES: "Ver todo", TR: "Tümünü Gör" },
  loadMore: { EN: "Load More", AR: "عرض المزيد", DE: "Mehr laden", FR: "Charger plus", ES: "Cargar más", TR: "Daha Fazla" },
  allMovies: { EN: "All Movies", AR: "جميع الأفلام", DE: "Alle Filme", FR: "Tous les films", ES: "Todas las películas", TR: "Tüm Filmler" },
  allSeries: { EN: "All Series", AR: "جميع المسلسلات", DE: "Alle Serien", FR: "Toutes les séries", ES: "Todas las series", TR: "Tüm Diziler" },
  allAnime: { EN: "All Anime", AR: "جميع الأنمي", DE: "Alle Anime", FR: "Tous les anime", ES: "Todo el anime", TR: "Tüm Animeler" },
  noMoreResults: { EN: "No more results", AR: "لا توجد نتائج أخرى", DE: "Keine weiteren Ergebnisse", FR: "Plus de résultats", ES: "No hay más resultados", TR: "Daha fazla sonuç yok" },

  // TV / Seasons / Episodes
  season: { EN: "Season", AR: "الموسم", DE: "Staffel", FR: "Saison", ES: "Temporada", TR: "Sezon" },
  episode: { EN: "Episode", AR: "الحلقة", DE: "Folge", FR: "Épisode", ES: "Episodio", TR: "Bölüm" },
  episodes: { EN: "Episodes", AR: "الحلقات", DE: "Folgen", FR: "Épisodes", ES: "Episodios", TR: "Bölümler" },
  selectSeason: { EN: "Select Season", AR: "اختر الموسم", DE: "Staffel wählen", FR: "Choisir la saison", ES: "Elegir temporada", TR: "Sezon Seç" },
  selectEpisode: { EN: "Select Episode", AR: "اختر الحلقة", DE: "Folge wählen", FR: "Choisir l'épisode", ES: "Elegir episodio", TR: "Bölüm Seç" },
  nowPlayingStatus: { EN: "Now Playing", AR: "يعرض الآن", DE: "Läuft jetzt", FR: "En cours", ES: "Reproduciendo", TR: "Şimdi Oynatılıyor" },

  // Watch page
  backToHome: { EN: "Back to Home", AR: "العودة للرئيسية", DE: "Zurück", FR: "Retour", ES: "Volver", TR: "Ana Sayfaya Dön" },
  clickToPlay: { EN: "Click to play", AR: "اضغط للمتابعة", DE: "Klicken zum Abspielen", FR: "Cliquez pour lire", ES: "Clic para reproducir", TR: "Oynatmak için tıklayın" },
  servers: { EN: "Servers:", AR: "السيرفرات:", DE: "Server:", FR: "Serveurs :", ES: "Servidores:", TR: "Sunucular:" },
  backupServer: { EN: "Backup Server", AR: "سيرفر احتياطي", DE: "Backup-Server", FR: "Serveur de secours", ES: "Servidor de respaldo", TR: "Yedek Sunucu" },
  fastServer: { EN: "Fast Server 4K", AR: "سيرفر سريع 4K", DE: "Schneller Server 4K", FR: "Serveur rapide 4K", ES: "Servidor rápido 4K", TR: "Hızlı Sunucu 4K" },
  serverBusy: { EN: "Server is busy, please try again", AR: "السيرفر مشغول، حاول مرة أخرى", DE: "Server beschäftigt, bitte erneut versuchen", FR: "Serveur occupé, réessayez", ES: "Servidor ocupado, intente de nuevo", TR: "Sunucu meşgul, tekrar deneyin" },
  checkingServer: { EN: "Checking server status...", AR: "جاري فحص السيرفر...", DE: "Server wird geprüft...", FR: "Vérification du serveur...", ES: "Verificando servidor...", TR: "Sunucu kontrol ediliyor..." },
  recommended: { EN: "Recommended", AR: "موصى به", DE: "Empfohlen", FR: "Recommandé", ES: "Recomendado", TR: "Önerilen" },
  currentServer: { EN: "Current Server", AR: "السيرفر الحالي", DE: "Aktueller Server", FR: "Serveur actuel", ES: "Servidor actual", TR: "Mevcut Sunucu" },
  share: { EN: "Share", AR: "مشاركة", DE: "Teilen", FR: "Partager", ES: "Compartir", TR: "Paylaş" },
  favorites: { EN: "Favorites", AR: "المفضلة", DE: "Favoriten", FR: "Favoris", ES: "Favoritos", TR: "Favoriler" },

  // Movie details
  movieStory: { EN: "Synopsis", AR: "قصة الفيلم", DE: "Handlung", FR: "Synopsis", ES: "Sinopsis", TR: "Özet" },
  movieInfo: { EN: "Movie Info", AR: "معلومات الفيلم", DE: "Filminfo", FR: "Infos du film", ES: "Info de la película", TR: "Film Bilgisi" },
  releaseDate: { EN: "Release Date", AR: "تاريخ الإصدار", DE: "Erscheinungsdatum", FR: "Date de sortie", ES: "Fecha de estreno", TR: "Yayın Tarihi" },
  duration: { EN: "Duration", AR: "المدة", DE: "Dauer", FR: "Durée", ES: "Duración", TR: "Süre" },
  genre: { EN: "Genre", AR: "النوع", DE: "Genre", FR: "Genre", ES: "Género", TR: "Tür" },
  director: { EN: "Director", AR: "المخرج", DE: "Regisseur", FR: "Réalisateur", ES: "Director", TR: "Yönetmen" },
  rating: { EN: "Rating", AR: "التقييم", DE: "Bewertung", FR: "Note", ES: "Calificación", TR: "Puan" },
  cast: { EN: "Cast", AR: "طاقم التمثيل", DE: "Besetzung", FR: "Distribution", ES: "Reparto", TR: "Oyuncular" },
  country: { EN: "Country", AR: "بلد الإنتاج", DE: "Land", FR: "Pays", ES: "País", TR: "Ülke" },
  minutes: { EN: "min", AR: "دقيقة", DE: "Min", FR: "min", ES: "min", TR: "dk" },
  minuteShort: { EN: "m", AR: "د", DE: "m", FR: "m", ES: "m", TR: "dk" },
  votes: { EN: "votes", AR: "تقييم", DE: "Stimmen", FR: "votes", ES: "votos", TR: "oy" },
  seasons: { EN: "Seasons", AR: "عدد المواسم", DE: "Staffeln", FR: "Saisons", ES: "Temporadas", TR: "Sezonlar" },
  loadingMovie: { EN: "Loading movie data...", AR: "جاري تحميل البيانات...", DE: "Filmdaten laden...", FR: "Chargement...", ES: "Cargando datos...", TR: "Film verileri yükleniyor..." },
  errorLoading: { EN: "Failed to load movie data", AR: "تعذر تحميل بيانات الفيلم", DE: "Fehler beim Laden", FR: "Échec du chargement", ES: "Error al cargar", TR: "Veri yüklenemedi" },
  noApiKey: { EN: "TMDB API key not configured", AR: "مفتاح TMDB غير مُعَد", DE: "TMDB-API-Schlüssel fehlt", FR: "Clé API TMDB manquante", ES: "Clave API TMDB no configurada", TR: "TMDB API anahtarı yapılandırılmamış" },

  // Download
  downloadMovie: { EN: "Download Movie", AR: "تحميل الفيلم", DE: "Film herunterladen", FR: "Télécharger le film", ES: "Descargar película", TR: "Filmi İndir" },
  downloadWait: { EN: "Please wait", AR: "انتظر", DE: "Bitte warten", FR: "Veuillez patienter", ES: "Por favor espere", TR: "Lütfen bekleyin" },
  downloadSeconds: { EN: "seconds", AR: "ثانية", DE: "Sekunden", FR: "secondes", ES: "segundos", TR: "saniye" },
  downloadReady: { EN: "Download link is ready!", AR: "رابط التحميل جاهز!", DE: "Download-Link bereit!", FR: "Lien prêt !", ES: "¡Enlace listo!", TR: "İndirme linki hazır!" },
  downloadNow: { EN: "Download Now", AR: "حمّل الآن", DE: "Jetzt herunterladen", FR: "Télécharger", ES: "Descargar ahora", TR: "Şimdi İndir" },
  downloadNote: { EN: "An ad page will open while you wait", AR: "سيتم فتح صفحة إعلانية أثناء الانتظار", DE: "Eine Werbeseite wird geöffnet", FR: "Une page publicitaire s'ouvrira", ES: "Se abrirá una página de anuncio", TR: "Beklerken bir reklam sayfası açılacak" },

  // Footer
  allRights: { EN: "All rights reserved", AR: "جميع الحقوق محفوظة", DE: "Alle Rechte vorbehalten", FR: "Tous droits réservés", ES: "Todos los derechos reservados", TR: "Tüm hakları saklıdır" },

  // VIP
  vipLogin: { EN: "VIP Access", AR: "دخول كبار الشخصيات", DE: "VIP-Zugang", FR: "Accès VIP", ES: "Acceso VIP", TR: "VIP Giriş" },
  vipHeroTitle: { EN: "We have many VIPs with us", AR: "لدينا الكثير من كبار الشخصيات معنا", DE: "Viele VIPs sind bei uns", FR: "Nous avons de nombreux VIPs", ES: "Tenemos muchos VIPs con nosotros", TR: "Birçok VIP üyemiz var" },
  vipHeroDesc: { EN: "If you want to enter our world and join us, just send us your email", AR: "إذا تريد الدخول إلى عالمنا ومشاركتنا، فقط أرسل لنا بريدك الإلكتروني", DE: "Wenn du unserer Welt beitreten möchtest, sende uns einfach deine E-Mail", FR: "Si vous voulez entrer dans notre monde et nous rejoindre, envoyez-nous votre email", ES: "Si quieres entrar a nuestro mundo y unirte, solo envíanos tu email", TR: "Dünyamıza katılmak istiyorsan, bize e-postanı gönder" },
  vipDesc: { EN: "Enter your VIP email to enjoy an ad-free experience", AR: "أدخل بريدك الإلكتروني الخاص بكبار الشخصيات لتستمتع بتجربة خالية من الإعلانات", DE: "VIP-E-Mail eingeben für werbefreies Erlebnis", FR: "Entrez votre email VIP pour une expérience sans pub", ES: "Ingresa tu email VIP para disfrutar sin anuncios", TR: "Reklamsız deneyim için VIP e-postanızı girin" },
  vipEmailPlaceholder: { EN: "Enter your email", AR: "أدخل بريدك الإلكتروني", DE: "E-Mail eingeben", FR: "Entrez votre email", ES: "Ingresa tu email", TR: "E-postanızı girin" },
  vipSubmit: { EN: "Login", AR: "تسجيل الدخول", DE: "Anmelden", FR: "Connexion", ES: "Ingresar", TR: "Giriş" },
  vipError: { EN: "This email is not authorized for VIP access", AR: "هذا البريد غير مصرح له بالدخول", DE: "Diese E-Mail ist nicht für VIP autorisiert", FR: "Cet email n'est pas autorisé VIP", ES: "Este email no tiene acceso VIP", TR: "Bu e-posta VIP erişimi için yetkili değil" },
  vipActive: { EN: "VIP Active ✓", AR: "VIP مفعّل ✓", DE: "VIP Aktiv ✓", FR: "VIP Actif ✓", ES: "VIP Activo ✓", TR: "VIP Aktif ✓" },
  vipNoAds: { EN: "You are browsing without ads", AR: "أنت تتصفح بدون إعلانات", DE: "Werbefrei browsen", FR: "Navigation sans publicité", ES: "Navegando sin anuncios", TR: "Reklamsız geziniyorsunuz" },
  vipLogout: { EN: "Logout", AR: "تسجيل خروج", DE: "Abmelden", FR: "Déconnexion", ES: "Cerrar sesión", TR: "Çıkış" },
  vipBadge: { EN: "VIP", AR: "VIP", DE: "VIP", FR: "VIP", ES: "VIP", TR: "VIP" },
} as const;

export type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
  isAr: boolean;
  tmdbLang: string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("EN");

  const isRtl = RTL_LANGS.includes(lang);
  const isAr = lang === "AR";
  const tmdbLang = TMDB_LANG_MAP[lang];

  useEffect(() => {
    const htmlLangMap: Record<Lang, string> = { EN: "en", AR: "ar", DE: "de", FR: "fr", ES: "es", TR: "tr" };
    document.documentElement.lang = htmlLangMap[lang];
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [lang, isRtl]);

  const t = (key: TranslationKey): string => translations[key][lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl, isAr, tmdbLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
