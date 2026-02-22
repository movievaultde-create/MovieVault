import type { MetadataRoute } from "next";

const BASE = "https://movie-vault-eosin.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE}/movies`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/tv-series`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/anime`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  ];
}
