'use client';

import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useSidebar } from '@/components/ui/sidebar';
import { useHeader } from '@/context/HeaderProvider';
import type { Restaurant } from '@/lib/types';
import { useEffect } from 'react';
import { ModernChefPage } from '@/components/chef/ModernChefPage';

export function RestaurantClientPage({
  restaurant,
  chefName,
}: {
  restaurant: Restaurant;
  chefName?: string;
}) {
  const { setOpen } = useSidebar();
  const { setHeaderTitle, setHeaderPath } = useHeader();

  useEffect(() => {
    setOpen(false);

    if (chefName) {
      // header when viewing chef profile
      setHeaderTitle(`Chef ${chefName}`);
      setHeaderPath(window.location.pathname + window.location.search); // Use current path as reset
    } else {
      // header for normal restaurant page
      setHeaderTitle(restaurant.name);
      setHeaderPath(`/restaurant/${restaurant.slug}`);
    }

    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
    };
  }, [setOpen, setHeaderTitle, setHeaderPath, restaurant.name, restaurant.slug, chefName]);

  // 👉 If a chef was selected (?chef= in URL), show the chef profile layout
  if (chefName) {
    return <ModernChefPage restaurant={restaurant} chefName={chefName} />;
  }

  // 👉 Otherwise show normal restaurant details page
  return <RestaurantDetails restaurant={restaurant} />;
}
