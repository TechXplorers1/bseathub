import { notFound } from 'next/navigation';
import { allRestaurants } from '@/lib/data';
import { RestaurantClientPage } from './client-page';
import { generateStaticParams } from './client-page';

export { generateStaticParams };

export default function RestaurantPage({ params }: { params: { slug: string } }) {
  const restaurant = allRestaurants.find((r) => r.slug === params.slug);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantClientPage restaurant={restaurant} />;
}
