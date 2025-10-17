'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from './RestaurantCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

interface HomeFeedProps {
  restaurants: Restaurant[];
}

type SortOption = 'picked' | 'rating' | 'deliveryTime';

export function HomeFeed({ restaurants }: HomeFeedProps) {
  const [sortOption, setSortOption] = useState<SortOption>('picked');

  const sortFunctions: Record<SortOption, (a: Restaurant, b: Restaurant) => number> = {
    picked: (a, b) => a.id.localeCompare(b.id),
    rating: (a, b) => b.rating - a.rating,
    deliveryTime: (a, b) => a.deliveryTime - b.deliveryTime,
  };

  const sortedRestaurants = [...restaurants].sort(sortFunctions[sortOption]);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Restaurants</h2>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                All Filters
            </Button>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="picked">Our picks</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="deliveryTime">Delivery time</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
