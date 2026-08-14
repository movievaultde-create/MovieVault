import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("indian-movies");

export default function IndianMoviesPage() {
  return <BrowseGrid category="indian-movies" titleKey="allIndianMovies" />;
}
