import { RestaurantCard } from '@/components/home/RestaurantCard';
import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { allRestaurants } from '@/lib/data';
import type { Restaurant } from '@/lib/types';

const categories = [
  "Breakfast",
  "Fast Food",
  "Burgers",
  "Coffee",
  "Pizza",
  "Halal",
  "Chicken",
  "Bubble Tea",
  "Indian",
  "Desserts",
  "Mexican",
  "Greek",
  "Healthy",
  "Sandwiches",
  "Noodle",
  "Italian",
  "Japanese",
  "American",
  "Salads",
  "Vietnamese",
  "Thai",
  "Vegan",
  "Steakhouse",
  "BBQ",
  "Mediterranean",
  "Bakery"
];

export default function RestaurantsPage() {

  const restaurantsByCategory: { [category: string]: Restaurant[] } = {};

  categories.forEach(category => {
    const filtered = allRestaurants.filter(restaurant => 
      restaurant.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase())) ||
      restaurant.cuisine.toLowerCase().includes(category.toLowerCase())
    );
    if (filtered.length > 0) {
      restaurantsByCategory[category] = filtered;
    }
  });


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">All Restaurants</h1>
      
      {Object.entries(restaurantsByCategory).map(([category, restaurants]) => (
        <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        </div>
      ))}
    </div>
  );
}
