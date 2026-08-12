import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("foreign-series");

export default function ForeignSeriesPage() {
  return <BrowseGrid category="foreign-series" titleKey="allForeignSeries" />;
}
