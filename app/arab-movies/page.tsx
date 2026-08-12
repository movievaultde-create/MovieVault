import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("arab-movies");

export default function ArabMoviesPage() {
  return <BrowseGrid category="arab-movies" titleKey="allArabMovies" />;
}
