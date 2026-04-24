'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, ImageIcon, Store } from 'lucide-react';
import { getDisplayImage } from '@/lib/image-utils';
import type { Restaurant } from '@/lib/types';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function RestaurantHero({
  restaurant,
  displayName
}: {
  restaurant: Restaurant;
  displayName?: string;
}) {
  const finalName = displayName || restaurant.name;
  const [isFavorited, setIsFavorited] = useState(false);
  const [animatedQuote, setAnimatedQuote] = useState('');

  const coverImage = getDisplayImage(restaurant.coverImageId, 'restaurant-1');
  const logoImage = getDisplayImage(restaurant.imageId, 'restaurant-3');

  const toggleFavorite = () => {
    setIsFavorited((prev) => !prev);
  };

  // TYPEWRITER TEXT
  useEffect(() => {
    const fullText = `“Good food, better memories at ${finalName}.”`;
    setAnimatedQuote('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAnimatedQuote(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [finalName]);

  return (
    <div className={cn(
      "relative w-full",
      "h-[25vh] sm:h-[40vh]"
    )}>
      {!restaurant.coverImageId ? null : (
        <Image
          src={coverImage}
          alt={finalName}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* DARK MASK */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 sm:from-black/55 sm:via-black/45 sm:to-black/75" />

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
      <div className={cn(
        "absolute inset-0 z-10 flex items-end sm:items-center",
        !restaurant.coverImageId && "hidden sm:flex"
      )}>
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-xl space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {finalName}
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

      {!restaurant.imageId ? null : (
        <div className={cn(
          "absolute left-4 sm:left-8 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white bg-white overflow-hidden z-30 shadow-lg bottom-0 translate-y-1/2"
        )}>
          <Image
            src={logoImage}
            alt={`${finalName} logo`}
            width={96}
            height={96}
            className="object-cover h-full w-full"
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