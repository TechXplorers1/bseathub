import { Banners } from '@/components/home/Banners';
import { ChefsCarousel } from '@/components/home/ChefsCarousel';
import { FilterCategories } from '@/components/home/FilterCategories';
import { HomeFeed } from '@/components/home/HomeFeed';
import { HomeFoodCarousel } from '@/components/home/HomeFoodCarousel';
import { Personalized } from '@/components/home/Personalized';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { allRestaurants } from '@/lib/data';

export default function Home() {
  const whatsOnYourMindRestaurants = [...allRestaurants].sort(() => 0.5 - Math.random());
  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterCategories />
        <Banners />
        <Personalized />
        <RestaurantCarousel title="What's on your mind today!" restaurants={whatsOnYourMindRestaurants} />
        <HomeFeed restaurants={allRestaurants} />
        <ChefsCarousel />
      </div>
    </div>
  );
}
