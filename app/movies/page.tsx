import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("movies");

export default function MoviesPage() {
  return <BrowseGrid category="movies" titleKey="allMovies" />;
}
