'use client';

import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useSidebar } from '@/components/ui/sidebar';
import { useHeader } from '@/context/HeaderProvider';
import type { Restaurant } from '@/lib/types';
import { useEffect } from 'react';
import { ModernChefPage } from '@/components/chef/ModernChefPage';

export function HomeFoodClientPage({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const { setOpen } = useSidebar();
  const { setHeaderTitle, setHeaderPath } = useHeader();

  useEffect(() => {
    setOpen(false);

    // Set the dynamic header title and path
    setHeaderTitle(restaurant.name);
    setHeaderPath(`/home-food/${restaurant.slug || restaurant.id}`);

    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
    };
  }, [setOpen, setHeaderTitle, setHeaderPath, restaurant.slug, restaurant.id, restaurant.name]);

  return <RestaurantDetails restaurant={restaurant} />;
}
