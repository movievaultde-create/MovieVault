import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("indian-series");

export default function IndianSeriesPage() {
  return <BrowseGrid category="indian-series" titleKey="allIndianSeries" />;
}
