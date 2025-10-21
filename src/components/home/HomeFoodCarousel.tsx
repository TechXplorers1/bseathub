import { allHomeFoods } from '@/lib/data';
import { RestaurantCarousel } from './RestaurantCarousel';

export function HomeFoodCarousel() {
  return (
    <RestaurantCarousel title="Home Food" restaurants={allHomeFoods} />
  );
}
