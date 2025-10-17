'use client';

import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useSidebar } from '@/components/ui/sidebar';
import type { Restaurant } from '@/lib/types';
import { useEffect } from 'react';

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
