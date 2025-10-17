'use client';

import { notFound } from 'next/navigation';
import { allRestaurants } from '@/lib/data';
import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export default function RestaurantPage({ params }: { params: { slug: string } }) {
  const restaurant = allRestaurants.find((r) => r.slug === params.slug);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);


  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetails restaurant={restaurant} />;
}
