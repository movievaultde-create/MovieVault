import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("tv-series");

export default function TVSeriesPage() {
  return <BrowseGrid category="series" titleKey="allSeries" />;
}
