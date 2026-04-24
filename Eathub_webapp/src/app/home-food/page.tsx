'use client';

import { useEffect, useState } from 'react';
import { RestaurantCard } from '@/components/home/RestaurantCard';
import { fetchHomeFoods } from '@/services/api';
import type { Restaurant } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function HomeFoodPage() {
  const [homeFoods, setHomeFoods] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomeFoods = async () => {
      try {
        const data = await fetchHomeFoods();
        // Normalize backend data
        const normalized = data.map((item: any) => ({
          ...item,
          cuisine: item.foodType || item.cuisine || "Home Cooked",
          reviews: item.reviews ?? 0,
          categories: item.foodType ? [item.foodType] : (item.categories || ["Homemade"]),
          isOpen: item.isActive ?? true,
          type: 'home-food' as const
        }));
        setHomeFoods(normalized);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHomeFoods();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Gathering homemade delicacies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100 max-w-md">
          <p className="text-red-600 font-semibold mb-2">Failed to load home food providers</p>
          <p className="text-red-500/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Dynamically derive categories from fetched data to ensure all kitchens are shown
  const dynamicCategories = Array.from(new Set(
    homeFoods.flatMap(r => [
      r.cuisine,
      ...(r.categories || [])
    ].filter(Boolean))
  ))
  .filter(cat => 
    !cat.toLowerCase().includes('restaurant') && 
    !cat.toLowerCase().includes('chef')
  )
  .sort();

  const homeFoodsByCategory: { [category: string]: Restaurant[] } = {};

  dynamicCategories.forEach(category => {
    const filtered = homeFoods.filter(restaurant =>
      restaurant.categories?.some(cat => cat.toLowerCase() === category.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase() === category.toLowerCase()
    );
    if (filtered.length > 0) {
      homeFoodsByCategory[category] = filtered;
    }
  });


  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-500">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Home Food</h1>
        <p className="text-muted-foreground">Authentic home-cooked meals from passionate chefs</p>
      </div>

      {Object.entries(homeFoodsByCategory).length > 0 ? (
        Object.entries(homeFoodsByCategory).map(([category, list]) => (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{category}</h2>
              <div className="h-px flex-1 bg-muted" />
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{list.length} kitchens</span>
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
          <p className="text-muted-foreground">No home food options available right now.</p>
        </div>
      )}
    </div>
  );
}
