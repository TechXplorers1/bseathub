'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getImageById } from '@/lib/placeholder-images';
import type { Restaurant } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const image = getImageById(restaurant.imageId);
  const logo = getImageById('restaurant-3'); // Using a placeholder for logo

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="relative h-48 w-full">
      {image && (
        <Image
          src={image.imageUrl}
          alt={restaurant.name}
          fill
          objectFit="cover"
          data-ai-hint={image.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      {logo && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform lg:left-8 lg:translate-x-0 h-20 w-20 rounded-full border-4 border-white bg-white overflow-hidden">
          <Image
            src={logo.imageUrl}
            alt={`${restaurant.name} logo`}
            width={80}
            height={80}
            className="object-contain"
            data-ai-hint={logo.imageHint}
          />
        </div>
      )}
      <div className="absolute top-4 right-4">
        <Button variant="secondary" size="icon" className="rounded-full" onClick={toggleFavorite}>
          <Heart className={cn("h-5 w-5", isFavorited && "fill-red-500 text-red-500")} />
        </Button>
      </div>
    </div>
  );
}
