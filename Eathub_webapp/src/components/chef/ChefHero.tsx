'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, ImageIcon, UserCircle2 } from 'lucide-react';
import { getDisplayImage } from '@/lib/image-utils';
import type { Restaurant } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ChefHero({ restaurant, chefName }: { restaurant: Restaurant, chefName: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const coverImage = getDisplayImage(restaurant.coverImageId, 'restaurant-1');
  const chefAvatar = getDisplayImage(restaurant.avatarUrl || restaurant.imageId, 'chef-1');

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="relative h-48 w-full">
      {!restaurant.coverImageId ? (
        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
             <ImageIcon className="h-16 w-16 text-slate-400 opacity-30" />
        </div>
      ) : (
        <Image
          src={coverImage}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform lg:left-8 lg:translate-x-0 h-20 w-20 rounded-full border-4 border-white bg-white overflow-hidden">
        <Avatar className="h-full w-full">
          {(!restaurant.avatarUrl && !restaurant.imageId) ? (
            <AvatarFallback className="bg-slate-100">
               <UserCircle2 className="h-10 w-10 text-slate-400" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={chefAvatar} alt={chefName} />
              <AvatarFallback>{chefName.charAt(0)}</AvatarFallback>
            </>
          )}
        </Avatar>
      </div>
      <div className="absolute top-4 right-4">
        <Button variant="secondary" size="icon" className="rounded-full" onClick={toggleFavorite}>
          <Heart className={cn("h-5 w-5", isFavorited && "fill-red-500 text-red-500")} />
        </Button>
      </div>
    </div>
  );
}
