'use client';

import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useSidebar } from '@/components/ui/sidebar';
import { allRestaurants } from '@/lib/data';
import type { Restaurant } from '@/lib/types';
import { useEffect } from 'react';

export function generateStaticParams() {
  return allRestaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

export function RestaurantClientPage({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  return <RestaurantDetails restaurant={restaurant} />;
}
