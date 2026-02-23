import type { MetadataRoute } from "next";

const BASE = "https://movie-vault-eosin.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Main pages
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE}/movies`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/tv-series`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/anime`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },

    // Category pages
    { url: `${BASE}/korean-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/indian-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/indian-movies`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.8 },

    // Legal pages
    { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
