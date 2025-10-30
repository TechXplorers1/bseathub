'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getImageById } from '@/lib/placeholder-images';
import type { Restaurant } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function ChefHero({ restaurant, chefName }: { restaurant: Restaurant, chefName: string }) {
  const image = getImageById(restaurant.imageId);
  const chefAvatar = `https://i.pravatar.cc/150?u=${restaurant.id}`;

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
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform lg:left-8 lg:translate-x-0 h-20 w-20 rounded-full border-4 border-white bg-white overflow-hidden">
        <Avatar className="h-full w-full">
          <AvatarImage src={chefAvatar} alt={chefName} />
          <AvatarFallback>{chefName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute top-4 right-4">
        <Button variant="secondary" size="icon" className="rounded-full">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
