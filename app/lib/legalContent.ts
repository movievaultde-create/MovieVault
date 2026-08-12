import type { Lang } from "../context/LanguageContext";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  intro: string;
  effectiveLabel: string;
  effectiveDate: string;
  sections: LegalSection[];
  contactLabel: string;
  contactValue: string;
};

export type LocalizedMap<T> = Record<Lang, T>;

export const LEGAL_LINKS_LABELS: LocalizedMap<{
  about: string;
  privacy: string;
  terms: string;
  affiliate: string;
}> = {
  EN: {
    about: "About",
    privacy: "Privacy Policy",
    terms: "Terms",
    affiliate: "Affiliate Disclosure",
  },
  AR: {
    about: "من نحن",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    affiliate: "إفصاح التسويق بالعمولة",
  },
  DE: {
    about: "Über uns",
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    affiliate: "Affiliate-Hinweis",
  },
  FR: {
    about: "À propos",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    affiliate: "Divulgation d'affiliation",
  },
  ES: {
    about: "Acerca de",
    privacy: "Política de privacidad",
    terms: "Términos y condiciones",
    affiliate: "Divulgación de afiliados",
  },
  TR: {
    about: "Hakkımızda",
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Şartları",
    affiliate: "Satış Ortaklığı Açıklaması",
  },
};

export const LEGAL_UI: LocalizedMap<{
  backHome: string;
}> = {
  EN: { backHome: "Back to Home" },
  AR: { backHome: "العودة للرئيسية" },
  DE: { backHome: "Zurück zur Startseite" },
  FR: { backHome: "Retour à l'accueil" },
  ES: { backHome: "Volver al inicio" },
  TR: { backHome: "Ana sayfaya don" },
};

const CONTACT = "contact@movievault.app";
const EFFECTIVE_DATE = "2026-02-24";

export const ABOUT_CONTENT: LocalizedMap<LegalDocument> = {
  EN: {
    title: "About MovieVault",
    intro:
      "MovieVault is an entertainment discovery and streaming interface designed to help users find movies, TV series, and anime in one place with a multilingual experience.",
    effectiveLabel: "Last updated",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "MovieVault is operated as a digital media project focused on content discovery, multilingual access, and user-friendly browsing.",
          "We continuously improve user experience, language support, and platform reliability.",
        ],
      },
      {
        heading: "What we provide",
        paragraphs: [
          "We provide browsing pages, metadata presentation, recommendations, and playback interfaces.",
          "Content availability and playback quality may vary depending on providers, regions, and technical conditions.",
        ],
      },
      {
        heading: "User responsibility",
        paragraphs: [
          "Users are responsible for complying with their local laws and regulations when accessing content.",
          "By using MovieVault, you agree to use the platform for lawful and personal purposes only.",
        ],
      },
    ],
    contactLabel: "Contact",
    contactValue: CONTACT,
  },
  AR: {
    title: "من نحن - MovieVault",
    intro:
      "MovieVault منصة لعرض واستكشاف المحتوى الترفيهي، تساعد المستخدمين في الوصول إلى الأفلام والمسلسلات والأنمي ضمن تجربة متعددة اللغات.",
    effectiveLabel: "آخر تحديث",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "من نحن",
        paragraphs: [
          "يتم تشغيل MovieVault كمشروع رقمي يركز على اكتشاف المحتوى وتوفير تجربة تصفح سهلة بلغات متعددة.",
          "نعمل باستمرار على تحسين تجربة المستخدم ودعم اللغات واستقرار المنصة.",
        ],
      },
      {
        heading: "ما الذي نقدمه",
        paragraphs: [
          "نوفر صفحات تصفح وعرض بيانات المحتوى والتوصيات وواجهات تشغيل.",
          "قد تختلف إتاحة المحتوى وجودة التشغيل حسب مزود الخدمة والمنطقة والظروف التقنية.",
        ],
      },
      {
        heading: "مسؤولية المستخدم",
        paragraphs: [
          "المستخدم مسؤول عن الالتزام بالقوانين والأنظمة المحلية عند استخدام المحتوى.",
          "باستخدامك MovieVault فإنك توافق على الاستخدام القانوني والشخصي فقط.",
        ],
      },
    ],
    contactLabel: "التواصل",
    contactValue: CONTACT,
  },
  DE: {
    title: "Uber MovieVault",
    intro:
      "MovieVault ist eine Plattform zur Entdeckung und Darstellung von Filmen, Serien und Anime mit mehrsprachiger Benutzeroberflache.",
    effectiveLabel: "Zuletzt aktualisiert",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Wer wir sind",
        paragraphs: [
          "MovieVault wird als digitales Medienprojekt betrieben und konzentriert sich auf Inhaltsentdeckung sowie benutzerfreundliche Navigation.",
          "Wir verbessern fortlaufend Stabilitat, Sprachunterstutzung und Nutzererlebnis.",
        ],
      },
      {
        heading: "Was wir anbieten",
        paragraphs: [
          "Wir bieten Katalogseiten, Metadaten, Empfehlungen und Wiedergabeoberflachen.",
          "Verfugbarkeit und Qualitat konnen je nach Anbieter, Region und Technik variieren.",
        ],
      },
      {
        heading: "Verantwortung der Nutzer",
        paragraphs: [
          "Nutzer sind fur die Einhaltung lokaler Gesetze und Vorschriften selbst verantwortlich.",
          "Mit der Nutzung von MovieVault stimmen Sie einer rechtmaessigen und privaten Nutzung zu.",
        ],
      },
    ],
    contactLabel: "Kontakt",
    contactValue: CONTACT,
  },
  FR: {
    title: "A propos de MovieVault",
    intro:
      "MovieVault est une interface de decouverte et de lecture pour films, series et anime avec une experience multilingue.",
    effectiveLabel: "Derniere mise a jour",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Qui sommes-nous",
        paragraphs: [
          "MovieVault est exploite comme un projet numerique axe sur la decouverte de contenu et la simplicite d'utilisation.",
          "Nous ameliorons en continu la stabilite, les langues et l'experience utilisateur.",
        ],
      },
      {
        heading: "Ce que nous proposons",
        paragraphs: [
          "Nous proposons des pages de navigation, des metadonnees, des recommandations et des interfaces de lecture.",
          "La disponibilite et la qualite peuvent varier selon les fournisseurs, les regions et les conditions techniques.",
        ],
      },
      {
        heading: "Responsabilite de l'utilisateur",
        paragraphs: [
          "L'utilisateur est responsable du respect des lois applicables dans son pays.",
          "En utilisant MovieVault, vous acceptez un usage personnel et conforme a la loi.",
        ],
      },
    ],
    contactLabel: "Contact",
    contactValue: CONTACT,
  },
  ES: {
    title: "Acerca de MovieVault",
    intro:
      "MovieVault es una interfaz para descubrir y visualizar peliculas, series y anime con soporte multilingue.",
    effectiveLabel: "Ultima actualizacion",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Quienes somos",
        paragraphs: [
          "MovieVault se opera como un proyecto digital centrado en descubrimiento de contenido y facilidad de uso.",
          "Mejoramos continuamente la experiencia, la estabilidad y el soporte de idiomas.",
        ],
      },
      {
        heading: "Que ofrecemos",
        paragraphs: [
          "Ofrecemos secciones de exploracion, metadatos, recomendaciones e interfaces de reproduccion.",
          "La disponibilidad y la calidad pueden variar segun proveedor, region y condiciones tecnicas.",
        ],
      },
      {
        heading: "Responsabilidad del usuario",
        paragraphs: [
          "El usuario es responsable de cumplir con las leyes locales aplicables.",
          "Al usar MovieVault, aceptas un uso personal y legal de la plataforma.",
        ],
      },
    ],
    contactLabel: "Contacto",
    contactValue: CONTACT,
  },
  TR: {
    title: "MovieVault Hakkinda",
    intro:
      "MovieVault, filmleri, dizileri ve anime iceriklerini cok dilli bir deneyimle kesfetmeye ve izlemeye yardimci olan bir platformdur.",
    effectiveLabel: "Son guncelleme",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Biz kimiz",
        paragraphs: [
          "MovieVault, icerik kesfi ve kolay kullanim odakli bir dijital medya projesi olarak isletilmektedir.",
          "Kullanici deneyimi, dil destegi ve platform kararliligini surekli gelistiriyoruz.",
        ],
      },
      {
        heading: "Ne sunuyoruz",
        paragraphs: [
          "Kesif sayfalari, icerik metaverisi, oneriler ve oynatma arayuzleri sunuyoruz.",
          "Icerik erisimi ve kalite, saglayiciya, bolgeye ve teknik kosullara gore degisebilir.",
        ],
      },
      {
        heading: "Kullanici sorumlulugu",
        paragraphs: [
          "Kullanicilar, kendi ulkelerindeki yasal duzenlemelere uymaktan sorumludur.",
          "MovieVault'u kullanarak platformu yalnizca yasal ve kisisel amaclarla kullanmayi kabul edersiniz.",
        ],
      },
    ],
    contactLabel: "Iletisim",
    contactValue: CONTACT,
  },
};

export const PRIVACY_CONTENT: LocalizedMap<LegalDocument> = {
  EN: {
    title: "Privacy Policy",
    intro:
      "This policy explains what information we process, how we use it, and your rights regarding your personal data when you use MovieVault.",
    effectiveLabel: "Last updated",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "We may process technical data such as browser type, device information, language preference, and general usage signals.",
          "If you contact us, we may process the information you voluntarily provide (such as email content).",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use data to operate the service, improve performance, support localization, and maintain platform security.",
          "We may use aggregated and non-identifiable analytics to understand traffic and improve user experience.",
        ],
      },
      {
        heading: "Cookies and similar technologies",
        paragraphs: [
          "MovieVault and third-party services may use cookies or similar technologies for essential functionality, preferences, analytics, and advertising.",
          "You can control cookies from your browser settings; disabling some cookies may affect site functionality.",
        ],
      },
      {
        heading: "Third-party providers",
        paragraphs: [
          "We may rely on third-party infrastructure, analytics, and ad providers that process data under their own policies.",
          "We are not responsible for the privacy practices of external websites or services linked from MovieVault.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data.",
          "To request privacy-related actions, contact us using the email below.",
        ],
      },
    ],
    contactLabel: "Privacy contact",
    contactValue: CONTACT,
  },
  AR: {
    title: "سياسة الخصوصية",
    intro:
      "توضح هذه السياسة نوع المعلومات التي نعالجها وكيف نستخدمها وما هي حقوقك المتعلقة ببياناتك الشخصية عند استخدام MovieVault.",
    effectiveLabel: "آخر تحديث",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "المعلومات التي نجمعها",
        paragraphs: [
          "قد نعالج بيانات تقنية مثل نوع المتصفح، معلومات الجهاز، اللغة المفضلة، وإشارات الاستخدام العامة.",
          "إذا تواصلت معنا، قد نعالج المعلومات التي تقدمها بشكل طوعي مثل محتوى البريد الإلكتروني.",
        ],
      },
      {
        heading: "كيف نستخدم المعلومات",
        paragraphs: [
          "نستخدم البيانات لتشغيل الخدمة وتحسين الأداء ودعم تعدد اللغات والحفاظ على أمان المنصة.",
          "قد نستخدم تحليلات مجمعة وغير معرفة الهوية لفهم حركة الاستخدام وتحسين التجربة.",
        ],
      },
      {
        heading: "ملفات تعريف الارتباط",
        paragraphs: [
          "قد يستخدم MovieVault أو مزودو الطرف الثالث ملفات تعريف الارتباط للتشغيل الأساسي، التفضيلات، التحليلات، والإعلانات.",
          "يمكنك التحكم بملفات الارتباط من إعدادات المتصفح، وقد يؤثر تعطيل بعضها على وظائف الموقع.",
        ],
      },
      {
        heading: "مزودو الطرف الثالث",
        paragraphs: [
          "قد نعتمد على بنية تحتية أو تحليلات أو إعلانات من أطراف ثالثة تعالج البيانات وفق سياساتها الخاصة.",
          "لسنا مسؤولين عن ممارسات الخصوصية في المواقع أو الخدمات الخارجية المرتبطة من MovieVault.",
        ],
      },
      {
        heading: "حقوقك",
        paragraphs: [
          "بحسب بلدك، قد يكون لك حق الوصول لبياناتك أو تصحيحها أو حذفها أو تقييد معالجتها.",
          "لطلب أي إجراء متعلق بالخصوصية، تواصل معنا عبر البريد أدناه.",
        ],
      },
    ],
    contactLabel: "التواصل للخصوصية",
    contactValue: CONTACT,
  },
  DE: {
    title: "Datenschutzerklarung",
    intro:
      "Diese Richtlinie erklaert, welche Daten wir verarbeiten, wie wir sie nutzen und welche Rechte Sie in Bezug auf personenbezogene Daten haben.",
    effectiveLabel: "Zuletzt aktualisiert",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Erhobene Informationen",
        paragraphs: [
          "Wir konnen technische Daten wie Browsertyp, Geraeteinformationen, Spracheinstellungen und allgemeine Nutzungsdaten verarbeiten.",
          "Wenn Sie uns kontaktieren, verarbeiten wir gegebenenfalls freiwillig uebermittelte Daten.",
        ],
      },
      {
        heading: "Verwendung der Daten",
        paragraphs: [
          "Daten werden zur Bereitstellung des Dienstes, Leistungsverbesserung, Lokalisierung und Sicherheit verwendet.",
          "Zusammengefasste, nicht identifizierende Analysen konnen zur Produktverbesserung genutzt werden.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "MovieVault und Drittanbieter konnen Cookies fuer Funktionalitat, Praferenzen, Analysen und Werbung verwenden.",
          "Sie konnen Cookies im Browser steuern; das Deaktivieren kann Funktionen einschranken.",
        ],
      },
      {
        heading: "Drittanbieter",
        paragraphs: [
          "Wir nutzen gegebenenfalls Infrastruktur-, Analyse- oder Werbedienste von Drittanbietern mit eigenen Richtlinien.",
          "Fuer Datenschutzpraktiken externer Websites ubernehmen wir keine Verantwortung.",
        ],
      },
      {
        heading: "Ihre Rechte",
        paragraphs: [
          "Je nach Rechtsraum konnen Sie Rechte auf Auskunft, Berichtigung, Loschung oder Einschrankung haben.",
          "Fur Datenschutzanfragen kontaktieren Sie uns per E-Mail.",
        ],
      },
    ],
    contactLabel: "Datenschutzkontakt",
    contactValue: CONTACT,
  },
  FR: {
    title: "Politique de confidentialite",
    intro:
      "Cette politique explique quelles donnees sont traitees, comment elles sont utilisees et quels sont vos droits.",
    effectiveLabel: "Derniere mise a jour",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Donnees collectees",
        paragraphs: [
          "Nous pouvons traiter des donnees techniques: navigateur, appareil, langue choisie et signaux d'usage.",
          "Si vous nous contactez, nous pouvons traiter les informations fournies volontairement.",
        ],
      },
      {
        heading: "Utilisation des donnees",
        paragraphs: [
          "Les donnees servent a exploiter le service, ameliorer les performances, la localisation et la securite.",
          "Des analyses agreges non identifiantes peuvent etre utilisees pour ameliorer l'experience utilisateur.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "MovieVault et des tiers peuvent utiliser des cookies pour les fonctions essentielles, preferences, statistiques et publicite.",
          "Vous pouvez gerer les cookies via votre navigateur; certaines fonctions peuvent etre limitees.",
        ],
      },
      {
        heading: "Services tiers",
        paragraphs: [
          "Nous pouvons utiliser des services tiers (infrastructure, analytics, publicite) regis par leurs propres politiques.",
          "Nous ne sommes pas responsables des pratiques de confidentialite des sites externes lies.",
        ],
      },
      {
        heading: "Vos droits",
        paragraphs: [
          "Selon votre pays, vous pouvez disposer de droits d'acces, correction, suppression ou limitation.",
          "Pour toute demande relative a la confidentialite, contactez-nous par email.",
        ],
      },
    ],
    contactLabel: "Contact confidentialite",
    contactValue: CONTACT,
  },
  ES: {
    title: "Politica de privacidad",
    intro:
      "Esta politica explica que informacion tratamos, como la usamos y tus derechos sobre datos personales.",
    effectiveLabel: "Ultima actualizacion",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Informacion recopilada",
        paragraphs: [
          "Podemos procesar datos tecnicos como navegador, dispositivo, idioma y senales generales de uso.",
          "Si nos contactas, podemos procesar los datos que compartes voluntariamente.",
        ],
      },
      {
        heading: "Uso de la informacion",
        paragraphs: [
          "Usamos la informacion para operar el servicio, mejorar rendimiento, localizacion y seguridad.",
          "Tambien podemos usar analitica agregada no identificable para mejorar la experiencia.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "MovieVault y terceros pueden usar cookies para funciones esenciales, preferencias, analitica y publicidad.",
          "Puedes gestionar cookies desde tu navegador; desactivarlas puede afectar funciones del sitio.",
        ],
      },
      {
        heading: "Proveedores externos",
        paragraphs: [
          "Podemos depender de terceros para infraestructura, analitica y anuncios bajo sus propias politicas.",
          "No somos responsables de las practicas de privacidad de sitios externos enlazados.",
        ],
      },
      {
        heading: "Tus derechos",
        paragraphs: [
          "Segun tu jurisdiccion, puedes tener derechos de acceso, correccion, eliminacion o limitacion del tratamiento.",
          "Para solicitudes de privacidad, contactanos por correo electronico.",
        ],
      },
    ],
    contactLabel: "Contacto de privacidad",
    contactValue: CONTACT,
  },
  TR: {
    title: "Gizlilik Politikasi",
    intro:
      "Bu politika, hangi bilgileri isledigimizi, bunlari nasil kullandigimizi ve haklarinizi aciklar.",
    effectiveLabel: "Son guncelleme",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Toplanan bilgiler",
        paragraphs: [
          "Tarayici turu, cihaz bilgisi, dil tercihi ve genel kullanim sinyalleri gibi teknik veriler islenebilir.",
          "Bize ulasirsaniz, gonullu olarak paylastiginiz bilgiler de islenebilir.",
        ],
      },
      {
        heading: "Bilgilerin kullanimi",
        paragraphs: [
          "Verileri hizmeti sunmak, performansi gelistirmek, yerlestirme ve guvenligi saglamak icin kullaniriz.",
          "Kimliksiz toplu analizler kullanici deneyimini gelistirmek icin kullanilabilir.",
        ],
      },
      {
        heading: "Cerezler",
        paragraphs: [
          "MovieVault ve ucuncu taraflar temel islevler, tercihler, analiz ve reklam amaciyla cerez kullanabilir.",
          "Cerezleri tarayicidan yonetebilirsiniz; bazilarini kapatmak islevleri etkileyebilir.",
        ],
      },
      {
        heading: "Ucuncu taraf saglayicilar",
        paragraphs: [
          "Altyapi, analiz veya reklam icin kendi politikalarina sahip ucuncu taraf hizmetler kullanilabilir.",
          "Dis baglantili sitelerin gizlilik uygulamalarindan sorumlu degiliz.",
        ],
      },
      {
        heading: "Haklariniz",
        paragraphs: [
          "Bulundugunuz ulkeye gore erisim, duzeltme, silme veya islemi kisitlama haklariniz olabilir.",
          "Gizlilik talepleri icin asagidaki e-posta adresinden bize ulasin.",
        ],
      },
    ],
    contactLabel: "Gizlilik iletisim",
    contactValue: CONTACT,
  },
};

export const TERMS_CONTENT: LocalizedMap<LegalDocument> = {
  EN: {
    title: "Terms and Conditions",
    intro:
      "These Terms govern access to and use of MovieVault. By using the platform, you accept these terms.",
    effectiveLabel: "Last updated",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Acceptance of terms",
        paragraphs: [
          "By accessing MovieVault, you agree to comply with these Terms and all applicable laws.",
          "If you do not agree, you should stop using the platform.",
        ],
      },
      {
        heading: "Permitted use",
        paragraphs: [
          "You may use MovieVault for personal, non-commercial, and lawful purposes only.",
          "Any misuse, unauthorized automation, abuse, or disruption of services is prohibited.",
        ],
      },
      {
        heading: "Content and availability",
        paragraphs: [
          "MovieVault may display metadata, links, and third-party playback interfaces.",
          "We do not guarantee uninterrupted availability, quality, or continued access to any specific title.",
        ],
      },
      {
        heading: "Third-party links",
        paragraphs: [
          "External links and embedded services are controlled by third parties and may be subject to their own terms.",
          "You acknowledge that we are not liable for external services, policies, or content.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "The service is provided on an 'as is' basis without warranties of any kind.",
          "To the extent permitted by law, MovieVault is not liable for indirect, incidental, or consequential damages.",
        ],
      },
    ],
    contactLabel: "Legal contact",
    contactValue: CONTACT,
  },
  AR: {
    title: "الشروط والأحكام",
    intro:
      "تنظم هذه الشروط استخدام منصة MovieVault. باستخدامك للمنصة فإنك تقبل هذه الشروط.",
    effectiveLabel: "آخر تحديث",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "قبول الشروط",
        paragraphs: [
          "باستخدام MovieVault، فإنك توافق على الالتزام بهذه الشروط وجميع القوانين المعمول بها.",
          "إذا لم توافق، يجب عليك التوقف عن استخدام المنصة.",
        ],
      },
      {
        heading: "الاستخدام المسموح",
        paragraphs: [
          "يسمح باستخدام MovieVault للأغراض الشخصية وغير التجارية وبشكل قانوني فقط.",
          "يُمنع أي إساءة استخدام أو أتمتة غير مصرح بها أو تعطيل للخدمة.",
        ],
      },
      {
        heading: "المحتوى والتوفر",
        paragraphs: [
          "قد تعرض المنصة بيانات وصفية وروابط وواجهات تشغيل تابعة لطرف ثالث.",
          "لا نضمن توفرًا مستمرًا أو جودة ثابتة أو استمرار الوصول لأي عنوان محدد.",
        ],
      },
      {
        heading: "روابط الطرف الثالث",
        paragraphs: [
          "الروابط الخارجية والخدمات المضمنة تخضع لسياسات وشروط مزوديها.",
          "أنت تقر بأننا غير مسؤولين عن محتوى أو سياسات أو خدمات الأطراف الخارجية.",
        ],
      },
      {
        heading: "تحديد المسؤولية",
        paragraphs: [
          "يتم تقديم الخدمة كما هي دون أي ضمانات صريحة أو ضمنية.",
          "بالحد الذي يسمح به القانون، لا تتحمل MovieVault مسؤولية الأضرار غير المباشرة أو التبعية.",
        ],
      },
    ],
    contactLabel: "التواصل القانوني",
    contactValue: CONTACT,
  },
  DE: {
    title: "Nutzungsbedingungen",
    intro:
      "Diese Bedingungen regeln den Zugriff auf MovieVault und dessen Nutzung. Mit der Nutzung akzeptieren Sie diese Bedingungen.",
    effectiveLabel: "Zuletzt aktualisiert",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Annahme der Bedingungen",
        paragraphs: [
          "Durch die Nutzung von MovieVault akzeptieren Sie diese Bedingungen sowie geltendes Recht.",
          "Wenn Sie nicht zustimmen, sollten Sie den Dienst nicht verwenden.",
        ],
      },
      {
        heading: "Zulaessige Nutzung",
        paragraphs: [
          "Die Nutzung ist nur fur persoenliche, nicht-kommerzielle und rechtmaessige Zwecke erlaubt.",
          "Missbrauch, unerlaubte Automatisierung oder Stoerung der Dienste ist untersagt.",
        ],
      },
      {
        heading: "Inhalte und Verfugbarkeit",
        paragraphs: [
          "MovieVault kann Metadaten, Links und Wiedergabeoberflachen von Drittanbietern anzeigen.",
          "Wir geben keine Gewahr fur dauerhafte Verfugbarkeit oder Zugriff auf bestimmte Titel.",
        ],
      },
      {
        heading: "Links zu Dritten",
        paragraphs: [
          "Externe Dienste unterliegen den Bedingungen der jeweiligen Anbieter.",
          "Wir haften nicht fur Inhalte, Richtlinien oder Leistungen externer Dienste.",
        ],
      },
      {
        heading: "Haftungsbeschrankung",
        paragraphs: [
          "Der Dienst wird ohne Gewahr bereitgestellt.",
          "Soweit gesetzlich zulassig, haftet MovieVault nicht fur mittelbare oder Folgeschaden.",
        ],
      },
    ],
    contactLabel: "Rechtlicher Kontakt",
    contactValue: CONTACT,
  },
  FR: {
    title: "Conditions d'utilisation",
    intro:
      "Ces conditions regissent l'acces et l'utilisation de MovieVault. En utilisant la plateforme, vous acceptez ces conditions.",
    effectiveLabel: "Derniere mise a jour",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Acceptation",
        paragraphs: [
          "En accedant a MovieVault, vous acceptez ces conditions et les lois applicables.",
          "Si vous n'etes pas d'accord, vous devez cesser d'utiliser la plateforme.",
        ],
      },
      {
        heading: "Utilisation autorisee",
        paragraphs: [
          "MovieVault est reserve a un usage personnel, non commercial et legal.",
          "Tout abus, automatisation non autorisee ou perturbation du service est interdit.",
        ],
      },
      {
        heading: "Contenu et disponibilite",
        paragraphs: [
          "La plateforme peut afficher des metadonnees, liens et interfaces tiers.",
          "Nous ne garantissons pas un acces continu ou la disponibilite de titres specifiques.",
        ],
      },
      {
        heading: "Liens tiers",
        paragraphs: [
          "Les services externes restent soumis a leurs propres conditions.",
          "Nous ne sommes pas responsables du contenu ou des politiques de ces services.",
        ],
      },
      {
        heading: "Limitation de responsabilite",
        paragraphs: [
          "Le service est fourni en l'etat, sans garantie.",
          "Dans la limite de la loi, MovieVault n'est pas responsable des dommages indirects.",
        ],
      },
    ],
    contactLabel: "Contact legal",
    contactValue: CONTACT,
  },
  ES: {
    title: "Terminos y condiciones",
    intro:
      "Estos terminos regulan el acceso y uso de MovieVault. Al usar la plataforma, aceptas estas condiciones.",
    effectiveLabel: "Ultima actualizacion",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Aceptacion de terminos",
        paragraphs: [
          "Al acceder a MovieVault, aceptas cumplir estos terminos y las leyes aplicables.",
          "Si no estas de acuerdo, debes dejar de usar la plataforma.",
        ],
      },
      {
        heading: "Uso permitido",
        paragraphs: [
          "MovieVault solo puede utilizarse con fines personales, no comerciales y legales.",
          "Se prohibe el abuso, automatizacion no autorizada o interrupcion del servicio.",
        ],
      },
      {
        heading: "Contenido y disponibilidad",
        paragraphs: [
          "La plataforma puede mostrar metadatos, enlaces e interfaces de terceros.",
          "No garantizamos disponibilidad continua o acceso permanente a titulos especificos.",
        ],
      },
      {
        heading: "Enlaces de terceros",
        paragraphs: [
          "Los servicios externos se rigen por sus propias condiciones y politicas.",
          "No somos responsables del contenido ni de las practicas de esos servicios.",
        ],
      },
      {
        heading: "Limitacion de responsabilidad",
        paragraphs: [
          "El servicio se ofrece tal cual, sin garantias de ningun tipo.",
          "En la medida permitida por la ley, MovieVault no responde por danos indirectos o consecuentes.",
        ],
      },
    ],
    contactLabel: "Contacto legal",
    contactValue: CONTACT,
  },
  TR: {
    title: "Kullanim Sartlari",
    intro:
      "Bu sartlar MovieVault'a erisimi ve kullanimini duzenler. Platformu kullanarak bu sartlari kabul etmis olursunuz.",
    effectiveLabel: "Son guncelleme",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Sartlarin kabul edilmesi",
        paragraphs: [
          "MovieVault'u kullanarak bu sartlara ve yasal duzenlemelere uyacaginizi kabul edersiniz.",
          "Kabul etmiyorsaniz platformu kullanmayi birakmalisiniz.",
        ],
      },
      {
        heading: "Izin verilen kullanim",
        paragraphs: [
          "Platform yalnizca kisisel, ticari olmayan ve yasal amaclarla kullanilabilir.",
          "Kotuye kullanim, izinsiz otomasyon veya hizmeti bozma girisimleri yasaktir.",
        ],
      },
      {
        heading: "Icerik ve erisilebilirlik",
        paragraphs: [
          "MovieVault metaveri, baglanti ve ucuncu taraf oynatici arayuzleri gosterebilir.",
          "Belirli bir icerige surekli erisim veya kalite garantisi verilmez.",
        ],
      },
      {
        heading: "Ucuncu taraf baglantilar",
        paragraphs: [
          "Dis hizmetler kendi kosul ve politikalarina tabidir.",
          "Bu hizmetlerin icerigi veya uygulamalarindan sorumlu degiliz.",
        ],
      },
      {
        heading: "Sorumlulugun sinirlandirilmasi",
        paragraphs: [
          "Hizmet oldugu gibi sunulur ve acik veya zimmi garanti verilmez.",
          "Yasanin izin verdigi olcude, MovieVault dolayli veya sonuc niteligindeki zararlardan sorumlu degildir.",
        ],
      },
    ],
    contactLabel: "Hukuki iletisim",
    contactValue: CONTACT,
  },
};

export const AFFILIATE_CONTENT: LocalizedMap<LegalDocument> = {
  EN: {
    title: "Affiliate Disclosure",
    intro:
      "Some links or recommendations on MovieVault may be affiliate links, which means we may receive a commission at no extra cost to you.",
    effectiveLabel: "Last updated",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "What this means",
        paragraphs: [
          "If you click an affiliate link and complete an action, we may earn compensation from that partner.",
          "This helps support maintenance, development, and operation of MovieVault.",
        ],
      },
      {
        heading: "No additional user cost",
        paragraphs: [
          "Affiliate relationships generally do not increase your direct purchase price.",
          "Any financial relationship does not change our commitment to user-first decisions.",
        ],
      },
      {
        heading: "Editorial independence",
        paragraphs: [
          "We aim to present recommendations based on relevance and user value.",
          "Affiliate partnerships do not guarantee placement or ranking in content lists.",
        ],
      },
    ],
    contactLabel: "Affiliate contact",
    contactValue: CONTACT,
  },
  AR: {
    title: "إفصاح التسويق بالعمولة",
    intro:
      "قد تحتوي بعض الروابط أو التوصيات في MovieVault على روابط عمولة، ما يعني أننا قد نحصل على عمولة بدون أي تكلفة إضافية عليك.",
    effectiveLabel: "آخر تحديث",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "ماذا يعني ذلك",
        paragraphs: [
          "إذا قمت بالنقر على رابط عمولة وأتممت إجراءً معينًا، قد نحصل على مقابل من الشريك.",
          "يساعد ذلك في دعم صيانة المنصة وتطويرها وتشغيلها.",
        ],
      },
      {
        heading: "بدون تكلفة إضافية عليك",
        paragraphs: [
          "عادةً لا تؤدي روابط العمولة إلى زيادة السعر المباشر عليك كمستخدم.",
          "أي علاقة مالية لا تغيّر التزامنا بتقديم تجربة تضع المستخدم أولًا.",
        ],
      },
      {
        heading: "الاستقلالية التحريرية",
        paragraphs: [
          "نسعى لتقديم توصيات مبنية على الملاءمة وقيمة المحتوى للمستخدم.",
          "الشراكات بالعمولة لا تضمن ترتيبًا أو ظهورًا تلقائيًا داخل القوائم.",
        ],
      },
    ],
    contactLabel: "التواصل للعمولة",
    contactValue: CONTACT,
  },
  DE: {
    title: "Affiliate-Hinweis",
    intro:
      "Einige Links oder Empfehlungen auf MovieVault konnen Affiliate-Links sein. In diesem Fall erhalten wir ggf. eine Provision ohne Mehrkosten fur Sie.",
    effectiveLabel: "Zuletzt aktualisiert",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Bedeutung",
        paragraphs: [
          "Wenn Sie auf einen Affiliate-Link klicken und eine Aktion ausfuhren, konnen wir eine Vergutung erhalten.",
          "Das unterstutzt Betrieb, Wartung und Weiterentwicklung von MovieVault.",
        ],
      },
      {
        heading: "Keine Mehrkosten",
        paragraphs: [
          "Affiliate-Beziehungen erhohen in der Regel nicht den direkten Preis fur Nutzer.",
          "Finanzielle Beziehungen andern nicht unsere nutzerorientierte Ausrichtung.",
        ],
      },
      {
        heading: "Redaktionelle Unabhangigkeit",
        paragraphs: [
          "Empfehlungen basieren auf Relevanz und Nutzen fur Nutzer.",
          "Affiliate-Partnerschaften garantieren keine Platzierung oder Rangfolge.",
        ],
      },
    ],
    contactLabel: "Affiliate-Kontakt",
    contactValue: CONTACT,
  },
  FR: {
    title: "Divulgation d'affiliation",
    intro:
      "Certains liens ou recommandations sur MovieVault peuvent etre des liens d'affiliation, ce qui signifie que nous pouvons percevoir une commission sans cout supplementaire pour vous.",
    effectiveLabel: "Derniere mise a jour",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Ce que cela signifie",
        paragraphs: [
          "Si vous cliquez sur un lien d'affiliation et realisez une action, nous pouvons recevoir une remuneration.",
          "Cela aide a financer la maintenance et l'amelioration de MovieVault.",
        ],
      },
      {
        heading: "Sans cout supplementaire",
        paragraphs: [
          "Les liens d'affiliation n'augmentent generalement pas votre prix d'achat.",
          "Ces partenariats n'affectent pas notre engagement envers l'utilisateur.",
        ],
      },
      {
        heading: "Independance editoriale",
        paragraphs: [
          "Nous visons des recommandations fondees sur la pertinence et la valeur.",
          "Les partenariats d'affiliation ne garantissent aucun classement preferentiel.",
        ],
      },
    ],
    contactLabel: "Contact affiliation",
    contactValue: CONTACT,
  },
  ES: {
    title: "Divulgacion de afiliados",
    intro:
      "Algunos enlaces o recomendaciones en MovieVault pueden ser enlaces de afiliado, lo que significa que podemos recibir una comision sin costo adicional para ti.",
    effectiveLabel: "Ultima actualizacion",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Que significa",
        paragraphs: [
          "Si haces clic en un enlace de afiliado y completas una accion, podemos recibir compensacion.",
          "Esto ayuda a sostener el mantenimiento y desarrollo de MovieVault.",
        ],
      },
      {
        heading: "Sin costo adicional",
        paragraphs: [
          "Normalmente, las relaciones de afiliacion no aumentan tu precio final.",
          "Estas relaciones no cambian nuestro enfoque centrado en el usuario.",
        ],
      },
      {
        heading: "Independencia editorial",
        paragraphs: [
          "Intentamos recomendar contenido segun relevancia y valor para el usuario.",
          "Las alianzas de afiliacion no garantizan posicionamiento o prioridad en listados.",
        ],
      },
    ],
    contactLabel: "Contacto de afiliados",
    contactValue: CONTACT,
  },
  TR: {
    title: "Satis Ortakligi Aciklamasi",
    intro:
      "MovieVault'taki bazi baglanti veya oneriler satis ortakligi baglantisi olabilir. Bu durumda size ek maliyet olmadan komisyon kazanabiliriz.",
    effectiveLabel: "Son guncelleme",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        heading: "Bu ne anlama gelir",
        paragraphs: [
          "Bir ortaklik baglantisina tiklayip islem tamamlarsaniz, ilgili ortaktan komisyon alabiliriz.",
          "Bu gelir, MovieVault'un gelistirilmesi ve surdurulmesine katkida bulunur.",
        ],
      },
      {
        heading: "Ek ucret yok",
        paragraphs: [
          "Satis ortakligi iliskileri genellikle sizin odediginiz fiyati artirmaz.",
          "Mali iliskiler kullanici odakli yaklasimimizi degistirmez.",
        ],
      },
      {
        heading: "Editoryal bagimsizlik",
        paragraphs: [
          "Onerilerimizi uygunluk ve kullanici faydasina gore sunmaya calisiriz.",
          "Ortakliklar listelerde otomatik one cikma garantisi vermez.",
        ],
      },
    ],
    contactLabel: "Ortaklik iletisimi",
    contactValue: CONTACT,
  },
};
