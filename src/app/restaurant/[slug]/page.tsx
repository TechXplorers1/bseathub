
'use client';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { RestaurantClientPage } from './client-page';
import { useRestaurants } from '@/context/RestaurantProvider';
import { useEffect, useState } from 'react';
import type { Restaurant } from '@/lib/types';

export default function RestaurantPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { allItems } = useRestaurants();
  const slug = params.slug as string;
  const chefName = searchParams.get('chef') || undefined;
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();

  useEffect(() => {
    const foundRestaurant = allItems.find((r) => r.slug === slug);
    setRestaurant(foundRestaurant);
  }, [allItems, slug]);


  if (!restaurant) {
    // We could show a loading state here while waiting for context
    // For now, we'll just return null or a loading indicator.
    // A better solution might involve server-side fetching and client-side hydration.
    return <div>Loading restaurant...</div>;
  }

  return <RestaurantClientPage restaurant={restaurant} chefName={chefName} />;
}
