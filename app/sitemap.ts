import type { MetadataRoute } from "next";
import { getCombinedBlogPosts, getCombinedBlogTags } from "@/app/lib/blog";

const BASE = "https://movie-vault.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const blogPosts = await getCombinedBlogPosts();
  const blogTags = await getCombinedBlogTags();

  return [
    // Main pages
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE}/movies`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/tv-series`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/anime`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/anime/all`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/anime/action`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/anime/family`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/anime/18`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/anime/servers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/anime/translation`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/anime/anilist`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/anime/shounen`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/anime/seinen`, lastModified: now, changeFrequency: "daily", priority: 0.8 },

    // Category pages
    { url: `${BASE}/korean-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/indian-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/indian-movies`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.8 },

    // Legal pages
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/affiliate-disclosure`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/blog/rss.xml`, lastModified: now, changeFrequency: "daily", priority: 0.4 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/guides/best-action-movies-2026`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/guides/family-movies-weekend`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/guides/how-to-choose-movie-tonight`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...blogPosts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogTags.map((tag) => ({
      url: `${BASE}/blog/tag/${tag}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
