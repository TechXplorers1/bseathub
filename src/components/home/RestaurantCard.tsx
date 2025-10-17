import Image from 'next/image';
import Link from 'next/link';
import type { Restaurant } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';
import { getImageById } from '@/lib/placeholder-images';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const image = getImageById(restaurant.imageId);

  return (
    <Link href={`/restaurant/${restaurant.slug}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        {image && (
          <Image
            src={image.imageUrl}
            alt={restaurant.name}
            width={600}
            height={400}
            className="h-48 w-full object-cover"
            data-ai-hint={image.imageHint}
          />
        )}
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{restaurant.name}</h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{restaurant.deliveryTime} min</span>
            </div>
            <span>
              ${restaurant.deliveryFee.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
