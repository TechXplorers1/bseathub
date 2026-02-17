'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from './RestaurantCard';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDeliveryMode } from '@/context/DeliveryModeProvider';
import { useRatingFilter } from '@/context/RatingFilterProvider';

interface HomeFeedProps {
  restaurants: Restaurant[];
}

type SortOption = 'picked' | 'rating' | 'deliveryTime';

const INITIAL_VISIBLE_COUNT = 8;

export function HomeFeed({ restaurants }: HomeFeedProps) {

  const [sortOption, setSortOption] =
    useState<SortOption>('picked');

  const { deliveryMode } = useDeliveryMode();
  const { ratingFilter } = useRatingFilter();

  const sortFunctions: Record<
    SortOption,
    (a: Restaurant, b: Restaurant) => number
  > = {
    picked: (a, b) => a.id.localeCompare(b.id),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    deliveryTime: (a, b) =>
      (a.deliveryTime ?? 30) - (b.deliveryTime ?? 30),
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const services = restaurant.services || [];
    const deliveryModeMatch =
      deliveryMode === 'all' || services.includes(deliveryMode);

    const ratingMatch =
      ratingFilter === 0 || (restaurant.rating ?? 0) >= ratingFilter;

    return deliveryModeMatch && ratingMatch;
  });

  const sortedRestaurants =
    [...filteredRestaurants].sort(sortFunctions[sortOption]);

  const visibleRestaurants =
    sortedRestaurants.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Restaurants</h2>

        {sortedRestaurants.length > INITIAL_VISIBLE_COUNT && (
          <Link
            href="/restaurants"
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            See all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </div>
    </div>
  );
}
