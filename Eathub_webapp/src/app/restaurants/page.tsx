'use client';

import { useEffect, useState } from 'react';
import { RestaurantCard } from '@/components/home/RestaurantCard';
import { fetchRestaurants } from '@/services/api';
import type { Restaurant } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const categories = [
  "Breakfast", "Fast Food", "Burgers", "Coffee", "Pizza", "Halal", "Chicken",
  "Bubble Tea", "Indian", "Desserts", "Mexican", "Greek", "Healthy",
  "Sandwiches", "Noodle", "Italian", "Japanese", "American", "Salads",
  "Vietnamese", "Thai", "Vegan", "Steakhouse", "BBQ", "Mediterranean", "Bakery"
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants();
        // Normalize backend data to frontend Restaurant interface
        const normalized = data.map((item: any) => ({
          ...item,
          cuisine: item.cuisine || item.cuisineType || "Multi-cuisine",
          reviews: item.reviews || item.reviewsCount || 0,
          categories: item.categories || [item.cuisine || item.cuisineType || "General"],
          type: 'restaurant' as const
        }));
        setRestaurants(normalized);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Finding best restaurants for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100 max-w-md">
          <p className="text-red-600 font-semibold mb-2">Failed to load restaurants</p>
          <p className="text-red-500/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const restaurantsByCategory: { [category: string]: Restaurant[] } = {};

  categories.forEach(category => {
    const filtered = restaurants.filter(restaurant =>
      restaurant.categories?.some(cat => cat.toLowerCase().includes(category.toLowerCase())) ||
      restaurant.cuisine?.toLowerCase().includes(category.toLowerCase())
    );
    if (filtered.length > 0) {
      restaurantsByCategory[category] = filtered;
    }
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">All Restaurants</h1>
        <p className="text-muted-foreground">Discover the best places to eat around you</p>
      </div>

      {Object.entries(restaurantsByCategory).length > 0 ? (
        Object.entries(restaurantsByCategory).map(([category, list]) => (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{category}</h2>
              <div className="h-px flex-1 bg-muted" />
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{list.length} places</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {list.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
          <p className="text-muted-foreground">No restaurants found at the moment.</p>
        </div>
      )}
    </div>
  );
}
