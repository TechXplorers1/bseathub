import { notFound } from 'next/navigation';
import { allRestaurants } from '@/lib/data';
import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';

export function generateStaticParams() {
  return allRestaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

export default function RestaurantPage({ params }: { params: { slug: string } }) {
  const restaurant = allRestaurants.find((r) => r.slug === params.slug);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetails restaurant={restaurant} />;
}
