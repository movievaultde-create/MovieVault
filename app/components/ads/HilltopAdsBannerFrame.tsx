"use client";

type HilltopAdsBannerFrameProps = {
  scriptUrl: string;
  className?: string;
};

/**
 * Loads Hilltop Multitag in a same-origin iframe page so:
 * - React countdown re-renders do not tear down the creative
 * - in-banner video can autoplay (allow= autoplay; encrypted-media)
 */
export function HilltopAdsBannerFrame({ scriptUrl, className = "" }: HilltopAdsBannerFrameProps) {
  const url = scriptUrl.trim();
  if (!url) return null;

  const frameSrc = `/ads/hilltop-banner.html?src=${encodeURIComponent(url)}`;

  return (
    <iframe
      title="Advertisement"
      width={300}
      height={250}
      src={frameSrc}
      className={`mx-auto block h-[250px] w-[300px] max-w-full border-0 bg-transparent ${className}`.trim()}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      data-hilltop-banner-frame="1"
    />
  );
}
