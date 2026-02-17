'use client';

import { HomeFeed } from '@/components/home/HomeFeed';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { useRestaurants } from '@/context/RestaurantProvider';
import { FilterCategories } from '@/components/home/FilterCategories';
import { Banners } from '@/components/home/Banners';
import { ChefsCarousel } from '@/components/home/ChefsCarousel';

export default function Home() {
  const { restaurants, homeFoods, loading, allItems } = useRestaurants();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg animate-pulse">Loading delicious food...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-w-0">
      <FilterCategories />

      <div className="mt-4 mb-6">
        <Banners />
      </div>

      {/* Debug Info: Remove this after you see the items */}
      <div className="text-xs text-gray-400 px-4">
        Found {allItems.length} total items. ({restaurants.length} Restaurants, {homeFoods.length} Home-food)
      </div>

      {homeFoods.length > 0 && (
        <div className="mb-6">
          <RestaurantCarousel
            title="Home Food"
            restaurants={homeFoods}
            href="/home-food"
          />
        </div>
      )}

      {restaurants.length > 0 && (
        <div className="mb-8">
          <RestaurantCarousel
            title="Restaurants"
            restaurants={restaurants}
            href="/restaurants"
          />
        </div>
      )}

      <HomeFeed restaurants={restaurants} />
      <ChefsCarousel />
    </div>
  );
}