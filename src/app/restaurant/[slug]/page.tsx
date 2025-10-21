import { notFound } from 'next/navigation';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import { RestaurantClientPage } from './client-page';

export function generateStaticParams() {
  const restaurantSlugs = allRestaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
  const homeFoodSlugs = allHomeFoods.map((restaurant) => ({
    slug: restaurant.slug,
  }));
  return [...restaurantSlugs, ...homeFoodSlugs];
}

export default function RestaurantPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { chef?: string };
}) {
  const allItems = [...allRestaurants, ...allHomeFoods];
  const restaurant = allItems.find((r) => r.slug === params.slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <RestaurantClientPage restaurant={restaurant} chefName={searchParams?.chef} />
  );
}
