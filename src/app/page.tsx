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
    <div className="flex flex-col w-full min-w-0">
      {/* Category Filters */}
      <FilterCategories />

      {/* Promo Banners */}
      <Banners />

      {/* Personalized Picks */}
      <Personalized />

      {/* Most Ordered */}
      <MostOrdered />

      {/* Home Food Carousel */}
      <RestaurantCarousel
        title="Home Food"
        restaurants={homeFoods}
        href="/home-food"
      />

      {/* Picked From Your Location */}
      <HomeFeed restaurants={restaurants} />

      {/* Our Chefs */}
      <ChefsCarousel />
    </div>
  );
}