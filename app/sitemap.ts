import type { MetadataRoute } from "next";
import { getCombinedBlogPosts, getCombinedBlogTags } from "@/app/lib/blog";

const BASE = "https://movie-vault-eosin.vercel.app";

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
