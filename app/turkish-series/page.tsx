import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("turkish-series");

export default function TurkishSeriesPage() {
  return <BrowseGrid category="turkish-series" titleKey="allTurkishSeries" />;
}
