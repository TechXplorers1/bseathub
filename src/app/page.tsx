'use client';

import { Banners } from '@/components/home/Banners';
import { ChefsCarousel } from '@/components/home/ChefsCarousel';
import { FilterCategories } from '@/components/home/FilterCategories';
import { HomeFeed } from '@/components/home/HomeFeed';
import { HomeFoodCarousel } from '@/components/home/HomeFoodCarousel';
import { MostOrdered } from '@/components/home/MostOrdered';
import { Personalized } from '@/components/home/Personalized';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { useRestaurants } from '@/context/RestaurantProvider';

export default function Home() {
  const { restaurants, homeFoods } = useRestaurants();
  return (
    <div className="flex flex-col">
      <div className="w-full py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <FilterCategories />
          <Banners />
          <Personalized />
          <MostOrdered />
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <RestaurantCarousel title="Home Food" restaurants={homeFoods} href="/home-food" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <HomeFeed restaurants={restaurants} />
          <ChefsCarousel />
        </div>
      </div>
    </div>
  );
}
