'use client';

import { Banners } from '@/components/home/Banners';
import { ChefsCarousel } from '@/components/home/ChefsCarousel';
import { FilterCategories } from '@/components/home/FilterCategories';
import { HomeFeed } from '@/components/home/HomeFeed';
import { MostOrdered } from '@/components/home/MostOrdered';
import { Personalized } from '@/components/home/Personalized';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { useRestaurants } from '@/context/RestaurantProvider';

export default function Home() {
  const { restaurants, homeFoods } = useRestaurants();

  return (
    // Changed to 'flex flex-col' to stack components.
    <div className="flex flex-col w-full min-w-0"> 
      
      {/* Category Filters: NO TOP MARGIN. It should start immediately at the top of the scroll area. */}
      <FilterCategories />

      {/* Promo Banners - Add margin-top only for separation from the content above, if desired.
          Using standard vertical section spacing. */}
      <div className="mt-4 mb-6">
        <Banners />
      </div>
      {/* ... (Rest of the Home component content remains the same) ... */}
      
      {/* Personalized Picks */}
      <div className="mb-6">
        <Personalized />
      </div>

      {/* Most Ordered */}
      <div className="mb-6">
        <MostOrdered />
      </div>

      {/* Home Food Carousel */}
      <div className="mb-6">
        <RestaurantCarousel
          title="Home Food"
          restaurants={homeFoods}
          href="/home-food"
        />
      </div>

      {/* Picked From Your Location */}
      <div className="mb-6">
        <HomeFeed restaurants={restaurants} />
      </div>

      {/* Our Chefs */}
      <div className="mb-8">
        <ChefsCarousel />
      </div>
    </div>
  );
}