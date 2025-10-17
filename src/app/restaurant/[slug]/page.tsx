import Image from 'next/image';
import { notFound } from 'next/navigation';
import { allRestaurants } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Utensils, Zap } from 'lucide-react';
import { MenuItem } from '@/components/restaurant/MenuItem';
import { Separator } from '@/components/ui/separator';

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

  const image = getImageById(restaurant.imageId);

  return (
    <div>
      <div className="relative h-64 w-full">
        {image && (
          <Image
            src={image.imageUrl}
            alt={restaurant.name}
            fill
            objectFit="cover"
            className="brightness-75"
            data-ai-hint={image.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <h1 className="text-4xl font-bold">{restaurant.name}</h1>
          <p className="text-lg">{restaurant.cuisine}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
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
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Restaurant Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-3 text-yellow-500 fill-yellow-500" />
                  <span>{restaurant.rating} ({restaurant.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span>{restaurant.deliveryTime} min delivery</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-3 text-primary" />
                  <span>${restaurant.deliveryFee.toFixed(2)} delivery fee</span>
                </div>
                <div className="flex items-center">
                  <Utensils className="h-5 w-5 mr-3 text-primary" />
                  <span>{restaurant.cuisine}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {restaurant.categories.map(cat => (
                        <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
