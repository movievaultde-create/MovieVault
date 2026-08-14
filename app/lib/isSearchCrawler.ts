const CRAWLER_UA =
  /googlebot|google-inspectiontool|bingbot|bingpreview|msnbot|adidxbot|yandex(?:bot|images)|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|dotbot|petalbot|bytespider/i;

export function isSearchCrawlerUserAgent(ua: string | null | undefined): boolean {
  return Boolean(ua && CRAWLER_UA.test(ua));
}

export function isBrowserSearchCrawler(): boolean {
  if (typeof navigator === "undefined") return false;
  return isSearchCrawlerUserAgent(navigator.userAgent);
}
