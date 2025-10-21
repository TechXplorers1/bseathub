'use client';

import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useSidebar } from '@/components/ui/sidebar';
import { useHeader } from '@/context/HeaderProvider';
import type { Restaurant } from '@/lib/types';
import { useEffect } from 'react';

export function RestaurantClientPage({
  restaurant,
  chefName,
}: {
  restaurant: Restaurant;
  chefName?: string;
}) {
  const { setOpen } = useSidebar();
  const { setHeaderTitle } = useHeader();

  useEffect(() => {
    setOpen(false);
    if (chefName) {
      setHeaderTitle(`Chef's ${chefName}`);
    } else {
      setHeaderTitle(restaurant.name);
    }

    return () => {
      setHeaderTitle(null);
    };
  }, [setOpen, setHeaderTitle, restaurant.name, chefName]);

  return <RestaurantDetails restaurant={restaurant} chefName={chefName} />;
}
