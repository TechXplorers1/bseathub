// app/home-food/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { HomeFoodClientPage } from './client-page';
import type { Restaurant } from '@/lib/types';
import { fetchHomeFoodBySlug } from '@/services/api';

type PageProps = {
  params: { slug: string };
};

export const dynamic = 'force-dynamic';

export default async function HomeFoodPage({ params }: PageProps) {
  const { slug } = await params;

  let restaurant: Restaurant | null = null;

  try {
    restaurant = await fetchHomeFoodBySlug(slug);
    if (restaurant) {
        restaurant.type = 'home-food';
    }
  } catch (err) {
    console.error("Error fetching home food slug:", err);
  }

  if (!restaurant) {
    notFound();
  }

  return (
    <HomeFoodClientPage
      restaurant={restaurant}
    />
  );
}
