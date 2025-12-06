// app/restaurant/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import { RestaurantClientPage } from './client-page';
import type { Restaurant } from '@/lib/types';

// this file is SERVER, so NO "use client" here

type PageProps = {
  params: { slug: string };
  searchParams: { chef?: string };
};

const allItems: Restaurant[] = [...allRestaurants, ...allHomeFoods];

// required when using `output: 'export'` with a dynamic segment
export const dynamicParams = false;

export function generateStaticParams() {
  return allItems.map((r) => ({ slug: r.slug }));
}

export default function RestaurantPage({ params, searchParams }: PageProps) {
  const restaurant = allItems.find((r) => r.slug === params.slug);

  if (!restaurant) {
    notFound();
  }

  const chefName = searchParams.chef
    ? decodeURIComponent(searchParams.chef)
    : undefined;

  return (
    <RestaurantClientPage
      restaurant={restaurant}
      chefName={chefName}
    />
  );
}
