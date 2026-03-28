// app/restaurant/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { allRestaurants, allHomeFoods } from '@/lib/data';
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

  // 1. Try fetching from Backend first (Source of Truth)
  try {
    if (chefName) {
      // If it's a chef, we fetch from chefs endpoint
      try {
        const chef = await fetchChefBySlug(slug);
        if (chef) {
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
            // Pass through chef specific fields
            bio: chef.bio,
            experience: chef.experience,
            specialty: chef.specialty,
            workingHours: chef.workingHours,
            preference: chef.preference,
            city: chef.city,
          } as any;
        }
      } catch (chefErr) {
        console.warn(`Chef not found in backend for slug: ${slug}`);
      }
    } else {
      // Try restaurant first
      try {
        const res = await fetchRestaurantBySlug(slug);
        if (res) {
          restaurant = { ...res, type: 'restaurant' };
        }
      } catch (restErr) {
        // Then try home food
        try {
          const res = await fetchHomeFoodBySlug(slug);
          if (res) {
            restaurant = { ...res, type: 'home-food' };
          }
        } catch (hfErr) {
          console.warn(`Provider not found in backend (Restaurant or HomeFood) for slug: ${slug}`);
        }
      }
    }
  } catch (globalErr) {
    console.error("Critical error during backend hydration:", globalErr);
  }

  // 2. Fallback to Mock Data if backend failed
  if (!restaurant) {

    const allMockItems = [...allRestaurants, ...allHomeFoods];
    restaurant = allMockItems.find((r) => r.slug === slug) || null;
  }

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
