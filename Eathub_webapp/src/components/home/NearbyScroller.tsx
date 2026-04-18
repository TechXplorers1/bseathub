'use client';

import type { Restaurant, Chef } from '@/lib/types';
import { RestaurantCard } from './RestaurantCard';
import { ChefCard } from './ChefCard';
import { ArrowRight, MapPin, Zap } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocation } from '@/context/LocationProvider';

interface NearbyScrollerProps {
  restaurants: Restaurant[];
  homeFoods: Restaurant[];
  chefs: Chef[];
  isLoading: boolean;
}

export function NearbyScroller({ restaurants, homeFoods, chefs, isLoading }: NearbyScrollerProps) {
  const { location } = useLocation();

  // Combine and sort by distance for the "Best of Nearby"
  const allProviders = [
    ...restaurants.map(r => ({ ...r, category: 'Restaurant' })),
    ...homeFoods.map(h => ({ ...h, category: 'Home Food' })),
    ...chefs.map(c => ({ ...c, category: 'Chef', type: 'chef' } as any))
  ].filter(p => p.distanceKm != null)
   .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  const topNearby = allProviders.slice(0, 6);

  if (isLoading) return null;
  if (topNearby.length === 0) return null;

  return (
    <div className="py-8 bg-gradient-to-r from-primary/5 via-white to-transparent rounded-3xl px-4 md:px-8 mb-8 border border-primary/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-foreground">
              Nearest to You
            </h2>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
              <Zap className="h-3 w-3 fill-green-700" />
              FASTEST DELIVERY
            </div>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-1">
            Handpicked favorites in <span className="text-primary font-bold">{location || 'your area'}</span>
          </p>
        </div>
        <Link 
          href="/nearby" 
          className={cn(buttonVariants({ variant: 'default' }), "rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform")}
        >
          Explore on Map <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {topNearby.map((provider) => (
          <div key={provider.id} className="min-w-[280px] md:min-w-[320px] transform transition-all hover:-translate-y-1">
            {provider.category === 'Chef' ? (
              <ChefCard chef={provider as unknown as Chef} />
            ) : (
              <RestaurantCard restaurant={provider as Restaurant} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
