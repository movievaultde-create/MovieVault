import BrowseGrid from "../components/BrowseGrid";
import { buildCategoryMetadata } from "../lib/seo";

export const metadata = buildCategoryMetadata("foreign-movies");

export default function ForeignMoviesPage() {
  return <BrowseGrid category="foreign-movies" titleKey="allForeignMovies" />;
}
