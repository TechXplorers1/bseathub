'use client';

import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useSidebar } from '@/components/ui/sidebar';
import { useHeader } from '@/context/HeaderProvider';
import type { Restaurant } from '@/lib/types';
import { useEffect } from 'react';

export function RestaurantClientPage({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const { setOpen } = useSidebar();
  const { setHeaderTitle } = useHeader();

  useEffect(() => {
    setOpen(false);
    setHeaderTitle(restaurant.name);

    return () => {
      setHeaderTitle(null);
    };
  }, [setOpen, setHeaderTitle, restaurant.name]);

  return <RestaurantDetails restaurant={restaurant} />;
}
