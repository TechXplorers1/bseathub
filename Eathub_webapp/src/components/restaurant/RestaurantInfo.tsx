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

  const fullAddress = [
    restaurant.addressLine1,
    restaurant.city,
    restaurant.state
  ].filter(Boolean).join(', ');

  return (
    <div className="mt-8">
      <h1 className="text-4xl font-bold lg:mt-0 tracking-tight">{displayName}</h1>

      <div className="mt-6 space-y-3 text-sm">
        <h2 className="text-lg font-semibold sr-only lg:not-sr-only">
          {isChefPage ? 'Chef Info' : 'Store Info'}
        </h2>

        {isChefPage ? (
          <p className="text-muted-foreground font-medium">{restaurant.cuisine}</p>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">Eat Hub</Badge>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-foreground">
            {restaurant.rating?.toFixed(1) || '0.0'} ({restaurant.reviewsCount || restaurant.reviews || 0})
          </span>
          {!isChefPage && <span className="opacity-40">•</span>}
          {!isChefPage && <span className="text-foreground/60">Local Delivery</span>}
        </div>

        {!isChefPage && (
          <p className="text-muted-foreground font-medium">
             • {restaurant.cuisineType || restaurant.cuisine}
          </p>
        )}

        {!isChefPage && (
          <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">
            <span>Service fees apply</span>
            <Info className="h-3 w-3" />
          </div>
        )}

        {/* LOCATION BOX */}
        {!isChefPage && showLocation && (
          <div className="mt-3 rounded-2xl border-2 border-primary/10 bg-primary/5 p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-black uppercase tracking-widest text-[10px] text-primary/60">Location</p>
                <p className="text-sm font-bold text-foreground leading-snug">
                  {fullAddress || 'Location information not available'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isChefPage && (
          <Button
            variant="outline"
            className="w-full rounded-2xl h-12 border-muted hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all mt-4 font-bold uppercase text-[11px] tracking-[0.15em]"
            onClick={toggleLocation}
            aria-expanded={showLocation}
          >
            {showLocation ? 'Conceal Address' : 'View Full Address'}
          </Button>
        )}
      </div>
    </div>
  );
}
