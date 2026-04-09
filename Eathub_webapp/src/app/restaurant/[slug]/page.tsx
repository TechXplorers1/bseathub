// app/restaurant/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { RestaurantClientPage } from './client-page';
import type { Restaurant } from '@/lib/types';
import { fetchRestaurantBySlug, fetchChefBySlug, fetchHomeFoodBySlug } from '@/services/api';

type PageProps = {
  params: { slug: string };
  searchParams: { chef?: string };
};

export const dynamic = 'force-dynamic';

export default async function RestaurantPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const chefName = sParams.chef ? decodeURIComponent(sParams.chef) : undefined;

  let restaurant: Restaurant | null = null;

  // 1. Parallel fetch from all potential sources (Source of Truth)
  try {
    const [restRes, chefRes, hfRes] = await Promise.allSettled([
      fetchRestaurantBySlug(slug),
      chefName ? fetchChefBySlug(slug) : Promise.reject('No chef requested'),
      fetchHomeFoodBySlug(slug)
    ]);

    if (chefRes.status === 'fulfilled' && chefRes.value) {
      const chef = chefRes.value;
      restaurant = {
        id: chef.id,
        name: chef.name,
        slug: chef.slug,
        imageId: chef.avatarUrl || 'food-1',
        cuisine: chef.specialty || 'Chef Special',
        rating: chef.rating || 5.0,
        reviews: chef.reviews || 0,
        deliveryTime: 40,
        deliveryFee: 5.0,
        categories: chef.categories || ['Chef Table'],
        services: ['delivery'],
        menu: [],
        type: 'restaurant',
        bio: chef.bio,
        experience: chef.experience,
        specialty: chef.specialty,
        workingHours: chef.workingHours,
        preference: chef.preference,
        city: chef.city,
      } as any;
    } else if (restRes.status === 'fulfilled' && restRes.value) {
      restaurant = { ...restRes.value, type: 'restaurant' };
    } else if (hfRes.status === 'fulfilled' && hfRes.value) {
      restaurant = { ...hfRes.value, type: 'home-food' };
    }
  } catch (globalErr) {
    console.error("Critical error during backend hydration:", globalErr);
  }

  // 2. Fallback check
  if (!restaurant) {
    notFound();
  }

  return (
    <RestaurantClientPage
      restaurant={restaurant}
      chefName={chefName}
    />
  );
}
