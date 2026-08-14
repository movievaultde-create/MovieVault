import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("arab-series");

export default function ArabSeriesPage() {
  return <BrowseGrid category="arab-series" titleKey="allArabSeries" />;
}
