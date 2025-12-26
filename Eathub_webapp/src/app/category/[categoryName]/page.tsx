// app/category/[categoryName]/page.tsx

import { RestaurantCard } from '@/components/home/RestaurantCard';
import { ChefCard } from '@/components/home/ChefCard';
import { allRestaurants, allHomeFoods } from '@/lib/data';

type CategoryPageProps = {
  // Next.js 15 – params is a Promise
  params: Promise<{ categoryName: string }>;
};

// helper for case-insensitive comparison
const normalize = (value: string) => value?.toLowerCase().trim() || '';

// build chefs list from home foods
const chefs = allHomeFoods.map((food) => ({
  name: food.name.split("'s")[0],
  specialty: food.cuisine,
  avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
  slug: food.slug,
  // Add missing properties required by ChefCard
  rating: (food as any).rating ?? 4.5,
  reviews: (food as any).reviews ?? 0,
  restaurantName: food.name,
  restaurantImageId: food.imageId,
  categories: food.categories || [],
  bio: `Expert home chef specializing in authentic ${food.cuisine} dishes.`,
}));

const uniqueChefs = chefs.reduce((acc, current) => {
  if (!acc.find((item) => item.name === current.name)) {
    acc.push(current);
  }
  return acc;
}, [] as typeof chefs);

/**
 * Let Next.js know all category route params that should be statically generated at build time.
 * We gather categories from your static data (restaurants + home foods) and return them.
 */
export async function generateStaticParams(): Promise<{ categoryName: string }[]> {
  const categorySet = new Set<string>();

  // collect categories from restaurants
  allRestaurants.forEach((r) => {
    (r.categories ?? []).forEach((c) => {
      if (typeof c === 'string' && c.trim()) categorySet.add(c.trim());
    });
  });

  // collect categories from home foods
  allHomeFoods.forEach((f) => {
    (f.categories ?? []).forEach((c) => {
      if (typeof c === 'string' && c.trim()) categorySet.add(c.trim());
    });
  });

  // map to route param objects. We encode to make sure spaces/special chars are route-safe.
  return Array.from(categorySet).map((cat) => ({
    categoryName: encodeURIComponent(cat),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // 1️⃣ await params (Next 15)
  const resolvedParams = await params;
  const rawCategoryName = resolvedParams.categoryName ?? '';

  // 2️⃣ decode category from URL (Fast%20Food → Fast Food)
  const categoryName = decodeURIComponent(rawCategoryName);
  const categoryKey = normalize(categoryName);

  // 3️⃣ Restaurants: only items whose categories contain this category
  const filteredRestaurants = allRestaurants.filter((restaurant) =>
    (restaurant.categories ?? []).some((cat) => normalize(cat) === categoryKey)
  );

  // 4️⃣ Home Food: same logic but on allHomeFoods
  const filteredHomeFoods = allHomeFoods.filter((item) =>
    (item.categories ?? []).some((cat) => normalize(cat) === categoryKey)
  );

  // 5️⃣ Chefs: optional – based on cuisine / specialty
  const filteredChefs = uniqueChefs.filter((chef) =>
    normalize(chef.specialty).includes(categoryKey)
  );

  const noResults =
    filteredRestaurants.length === 0 &&
    filteredHomeFoods.length === 0 &&
    filteredChefs.length === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Results for "{categoryName}"</h1>

      {/* Restaurants section */}
      {filteredRestaurants.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>
      )}

      {/* Home Food section */}
      {filteredHomeFoods.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Home Food</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredHomeFoods.map((item) => (
              <RestaurantCard key={item.id} restaurant={item} />
            ))}
          </div>
        </section>
      )}

      {/* Chefs section */}
      {filteredChefs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Chefs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredChefs.map((chef) => (
              <ChefCard key={chef.name} chef={chef} />
            ))}
          </div>
        </section>
      )}

      {/* No results state */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">
            No results found for "{categoryName}".
          </p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different category from the menu.</p>
        </div>
      )}
    </div>
  );
}
