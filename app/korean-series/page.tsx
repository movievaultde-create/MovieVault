import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("korean-series");

export default function KoreanSeriesPage() {
  return <BrowseGrid category="korean-series" titleKey="allKoreanSeries" />;
}
