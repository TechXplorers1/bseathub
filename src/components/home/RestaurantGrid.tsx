import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from './RestaurantCard';

interface RestaurantGridProps {
  restaurants: Restaurant[];
}

export function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  return (
    <div className="pb-16">
        <h2 className="text-2xl font-bold mb-4">All Restaurants</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
    </div>
  );
}
