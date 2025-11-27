import { RestaurantCard } from '@/components/home/RestaurantCard';
import { allRestaurants, allHomeFoods } from '@/lib/data'; // ⚠️ Verify this path matches where you saved data.ts

type CategoryPageProps = {
  params: Promise<{ categoryName: string }>; // Update for Next.js 15 support
};

// Helper to clean up strings for comparison (removes spaces, makes lowercase)
const normalize = (value: string) => value?.toLowerCase().trim() || '';

export default async function CategoryPage({ params }: CategoryPageProps) {
  // 1. Await params (Fixes "Empty Page" on Next.js 15)
  const resolvedParams = await params;
  const rawCategoryName = resolvedParams.categoryName ?? '';
  
  // 2. Decode the URL string (e.g., "Fast%20Food" -> "Fast Food")
  const categoryName = decodeURIComponent(rawCategoryName);
  const categoryKey = normalize(categoryName);

  // 3. Filter Restaurants
  // We check if ANY of the restaurant's categories match the selected category key
  const filteredRestaurants = allRestaurants.filter((restaurant) =>
    (restaurant.categories ?? []).some(
      (cat) => normalize(cat) === categoryKey
    )
  );

  // 4. Filter Home Food
  const filteredHomeFoods = allHomeFoods.filter((item) =>
    (item.categories ?? []).some(
      (cat) => normalize(cat) === categoryKey
    )
  );

  // 5. Merge into a single list (No separate headers, just one clean grid)
  const allResults = [...filteredRestaurants, ...filteredHomeFoods];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Results for "{categoryName}"
      </h1>

      {allResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allResults.map((item) => (
            <RestaurantCard key={item.id} restaurant={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">
            No results found for "{categoryName}".
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Try selecting a different category from the menu.
          </p>
        </div>
      )}
    </div>
  );
}