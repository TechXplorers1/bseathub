// app/restaurant/[slug]/page.tsx (NEW SERVER COMPONENT)

// NOTE: This file is a Server Component. DO NOT add 'use client' here.
// You must import the data source that contains all possible restaurant slugs.
import { allRestaurants } from '@/lib/data'; 
import { RestaurantClientWrapper } from './page-client'; 

// REQUIRED FIX: This function tells Next.js which pages to build statically.
export async function generateStaticParams() {
  // Replace this with your actual, complete restaurant data array if 'allRestaurants'
  // is not the correct name.
  return allRestaurants.map((restaurant) => ({
    // The key 'slug' MUST match the dynamic segment name ([slug])
    slug: restaurant.slug,
  }));
}

// The main Server Page component renders your Client Wrapper.
export default async function RestaurantPage({ params }: { params: { slug: string } }) {
  // Because the actual data fetching is done via context/useEffect in the client,
  // this Server Component only needs to exist to run generateStaticParams().
  // It renders the client wrapper that contains the rest of your logic.
  return <RestaurantClientWrapper />; 
}