import { Banners } from '@/components/home/Banners';
import { FilterCategories } from '@/components/home/FilterCategories';
import { HomeFeed } from '@/components/home/HomeFeed';
import { allRestaurants } from '@/lib/data';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { Personalized } from '@/components/home/Personalized';

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterCategories />
        <Banners />
        <Personalized />
        <HomeFeed restaurants={allRestaurants} />
      </div>
    </div>
  );
}
