'use client';

import { useState } from 'react';
import { Star, Info, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Restaurant } from '@/lib/types';

interface RestaurantInfoProps {
  restaurant: Restaurant & {
    location?: string;
  };
  displayName: string;
  isChefPage?: boolean;
}

export function RestaurantInfo({
  restaurant,
  displayName,
  isChefPage,
}: RestaurantInfoProps) {
  const [showLocation, setShowLocation] = useState(false);

  const toggleLocation = () => setShowLocation((prev) => !prev);

  return (
    <div className="mt-8">
      <h1 className="text-4xl font-bold lg:mt-0">{displayName}</h1>

      <div className="mt-6 space-y-3 text-sm">
        <h2 className="text-lg font-semibold sr-only lg:not-sr-only">
          {isChefPage ? 'Chef Info' : 'Store Info'}
        </h2>

        {isChefPage ? (
          <p className="text-muted-foreground">{restaurant.cuisine}</p>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Eat Hub</Badge>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span>
            {restaurant.rating} ({restaurant.reviews > 1000 ? '1k+' : restaurant.reviews})
          </span>
          {!isChefPage && <span>•</span>}
          {!isChefPage && <span>2 mi</span>}
        </div>

        {!isChefPage && (
          <p className="text-muted-foreground">
            $ • {restaurant.cuisine}
          </p>
        )}

        {!isChefPage && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Service fees apply</span>
            <Info className="h-3 w-3" />
          </div>
        )}

        {/* LOCATION BOX */}
        {!isChefPage && showLocation && (
          <div className="mt-1 rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 mt-[2px]" />
              <div>
                <p className="font-medium text-foreground text-sm">Location</p>
                <p className="mt-0.5">
                  {restaurant.location ?? 'Location information not available'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isChefPage && (
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={toggleLocation}
            aria-expanded={showLocation}
          >
            {showLocation ? 'See Less' : 'See More'}
          </Button>
        )}
      </div>
    </div>
  );
}
