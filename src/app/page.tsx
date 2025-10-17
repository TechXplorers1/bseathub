import { Hero } from '@/components/home/Hero';
import { FilterCategories } from '@/components/home/FilterCategories';
import { RestaurantGrid } from '@/components/home/RestaurantGrid';
import { RecommendedMeals } from '@/components/home/RecommendedMeals';
import { allRestaurants } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FilterCategories />
        <RecommendedMeals />
        <RestaurantGrid restaurants={allRestaurants} />
      </div>
    </div>
  );
}
