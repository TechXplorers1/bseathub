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

    // Set the dynamic header title and path
    const name = chefName ? `Chef ${chefName}` : restaurant.name;
    const path = chefName
      ? `/restaurant/${restaurant.slug}?chef=${encodeURIComponent(chefName)}`
      : `/restaurant/${restaurant.slug}`;

    setHeaderTitle(name);
    setHeaderPath(path);

    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
    };
  }, [setOpen, setHeaderTitle, setHeaderPath, restaurant.slug, restaurant.name, chefName]);

  // 👉 If a chef was selected (?chef= in URL), show the chef profile layout
  if (chefName) {
    return <ModernChefPage restaurant={restaurant} chefName={chefName} />;
  }

  // 👉 Otherwise show normal restaurant details page
  return <RestaurantDetails restaurant={restaurant} />;
}
