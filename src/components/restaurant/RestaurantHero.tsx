'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getImageById } from '@/lib/placeholder-images';
import type { Restaurant } from '@/lib/types';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [animatedQuote, setAnimatedQuote] = useState('');

  const image = getImageById(restaurant.imageId);
  const logo = getImageById('restaurant-3');

  const toggleFavorite = () => {
    setIsFavorited((prev) => !prev);
  };

  // TYPEWRITER TEXT
  useEffect(() => {
    const fullText = `“Good food, better memories at ${restaurant.name}.”`;
    setAnimatedQuote('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAnimatedQuote(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [restaurant.name]);

  return (
    <div className="relative w-full h-[40vh] min-h-[220px] sm:h-[48vh] ">
      {image && (
        <Image
          src={image.imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover "
          data-ai-hint={image.imageHint}
          priority
        />
      )}

      {/* DARK MASK */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />

      {/* FAVORITE BUTTON */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-white shadow-md"
          onClick={toggleFavorite}
        >
          <Heart
            className={cn(
              'h-5 w-5 text-black',
              isFavorited && 'fill-red-500 text-red-500'
            )}
          />
        </Button>
      </div>

      {/* TEXT OVERLAY */}
      <div className="absolute inset-0 z-10 flex items-end sm:items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-xl space-y-1.5 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              {(restaurant as any).cuisine || ''}
              {(restaurant as any).area
                ? ` • ${(restaurant as any).area}`
                : ''}
            </p>

            <p className="text-sm sm:text-base md:text-lg font-semibold text-white mt-1 whitespace-pre-line">
              {animatedQuote}
              <span className="inline-block w-2 h-4 bg-white/80 ml-0.5 animate-pulse" />
            </p>
          </div>
        </div>
      </div>

      {/* LOGO SQUARE (Changed from Circle) */}
      {logo && (
        // CHANGED: rounded-full -> rounded-xl
        <div className="absolute -bottom-10 left-4 sm:left-6 lg:left-8 h-16 w-16 sm:h-20 sm:w-20 rounded-xl border-4 border-white bg-white overflow-hidden z-30 shadow-md">
          <Image
            src={logo.imageUrl}
            alt={`${restaurant.name} logo`}
            width={80}
            height={80}
            className="object-cover"
            data-ai-hint={logo.imageHint}
          />
        </div>
      )}

      {/* ⭐ RATING PILL (added now) */}
      {(restaurant as any)?.rating && (
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 
                        rounded-full bg-black/70 px-3 py-1.5 text-xs sm:text-sm 
                        text-white shadow-md backdrop-blur-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-yellow-400 fill-yellow-400"
            viewBox="0 0 24 24"
          >
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 
                     1.48 8.279L12 18.896l-7.416 4.517 
                     1.48-8.279L0 9.306l8.332-1.151z" />
          </svg>

          <span className="font-semibold">
            {(restaurant as any).rating?.toFixed
              ? (restaurant as any).rating.toFixed(1)
              : (restaurant as any).rating}
          </span>

          {(restaurant as any)?.ratingCount && (
            <span className="text-[11px] text-white/80">
              ({(restaurant as any).ratingCount}+)
            </span>
          )}
        </div>
      )}
    </div>
  );
}