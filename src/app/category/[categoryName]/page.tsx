

import { RestaurantCard } from '@/components/home/RestaurantCard';
import { ChefCard } from '@/components/home/ChefCard';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import type { Restaurant } from '@/lib/types';
import { notFound } from 'next/navigation';

const chefs = allHomeFoods.map(food => ({
    name: food.name.split("'s")[0],
    specialty: food.cuisine,
    avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
    slug: food.slug
}));

const uniqueChefs = chefs.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
        acc.push(current);
    }
    return acc;
}, [] as typeof chefs);

export default function CategoryPage({ params }: { params: { categoryName: string } }) {
    const categoryName = decodeURIComponent(params.categoryName);

    const filteredRestaurants = allRestaurants.filter(restaurant =>
        restaurant.categories.some(cat => cat.toLowerCase() === categoryName.toLowerCase()) ||
        restaurant.cuisine.toLowerCase() === categoryName.toLowerCase()
    );

    const filteredHomeFoods = allHomeFoods.filter(restaurant =>
        restaurant.categories.some(cat => cat.toLowerCase() === categoryName.toLowerCase()) ||
        restaurant.cuisine.toLowerCase() === categoryName.toLowerCase()
    );

    const filteredChefs = uniqueChefs.filter(chef =>
        chef.specialty.toLowerCase().includes(categoryName.toLowerCase())
    );
    
    const noResults = filteredRestaurants.length === 0 && filteredHomeFoods.length === 0 && filteredChefs.length === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Results for "{categoryName}"</h1>

      {filteredRestaurants.length > 0 && (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        </div>
      )}
      
      {filteredHomeFoods.length > 0 && (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Home Food</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredHomeFoods.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        </div>
      )}

      {filteredChefs.length > 0 && (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Chefs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredChefs.map((chef) => (
                    <ChefCard key={chef.name} chef={chef} />
                ))}
            </div>
        </div>
      )}

        {noResults && (
            <p className="text-center text-muted-foreground mt-12">No results found for "{categoryName}".</p>
        )}
    </div>
  );
}
