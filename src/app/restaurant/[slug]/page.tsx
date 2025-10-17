'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { allRestaurants } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Utensils, Zap } from 'lucide-react';
import { MenuItem } from '@/components/restaurant/MenuItem';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export function generateStaticParams() {
  return allRestaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

export default function RestaurantPage({ params }: { params: { slug: string } }) {
  const restaurant = allRestaurants.find((r) => r.slug === params.slug);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  if (!restaurant) {
    notFound();
  }

  const image = getImageById(restaurant.imageId);

  return (
    <div className="flex flex-col">
      <div className="relative h-48 w-full">
        {image && (
          <Image
            src={image.imageUrl}
            alt={restaurant.name}
            fill
            objectFit="cover"
            className="brightness-50"
            data-ai-hint={image.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="absolute bottom-0 p-4 sm:p-6 lg:p-8 text-white">
              <h1 className="text-3xl sm:text-4xl font-bold">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1.5 text-yellow-400 fill-yellow-400" />
                  <span>{restaurant.rating} ({restaurant.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{restaurant.deliveryTime} min</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1.5" />
                  <span>${restaurant.deliveryFee.toFixed(2)}</span>
                </div>
              </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
           <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline">{restaurant.cuisine}</Badge>
              {restaurant.categories.map(cat => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {restaurant.menu.map((category, index) => (
                <div key={category.title}>
                  <h2 className="text-2xl font-semibold mt-6 mb-4">{category.title}</h2>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <MenuItem key={item.id} item={item} />
                    ))}
                  </div>
                  {index < restaurant.menu.length - 1 && <Separator className="my-8" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
