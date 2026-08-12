import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MovieVault Guides | Movie Lists, Picks and Watch Tips",
  description:
    "Explore MovieVault guides for curated movie lists, practical watch tips, and genre-based recommendations updated for 2026.",
  alternates: {
    canonical: "/guides",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
