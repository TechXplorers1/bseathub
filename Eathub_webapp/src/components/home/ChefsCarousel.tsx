'use client';

import { useRestaurants } from '@/context/RestaurantProvider';
import { ChefCard, ChefCardSkeleton } from './ChefCard';
import { Skeleton } from '../ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ChefsCarouselProps {
  /** When provided (distance filter active), overrides the full chefs list */
  filteredChefs?: any[];
}

export function ChefsCarousel({ filteredChefs }: ChefsCarouselProps) {
  const { chefs, loading: providerLoading } = useRestaurants();

  if (providerLoading) {
    return (
      <div className="py-4 sm:py-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48 bg-muted" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <ChefCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Use filteredChefs when distance filter is active, otherwise use full list
  const displayChefs = filteredChefs !== undefined ? filteredChefs : chefs;

  const isFiltered = filteredChefs !== undefined;
  const title = isFiltered
    ? `Private Chefs Nearby (${displayChefs.length})`
    : 'Book a Private Chef';

  if (displayChefs.length === 0) {
    if (isFiltered) {
      return (
        <div className="py-4 sm:py-8">
          <h2 className="text-2xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground text-sm">No chefs found within this distance.</p>
        </div>
      );
    }
    return null;
  }

  const INITIAL_VISIBLE_COUNT = 8;
  const visibleChefs = displayChefs.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="py-4 sm:py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/chefs" className={cn(buttonVariants({ variant: 'ghost' }))}>
          See all <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleChefs.map((chef, idx) => (
          <ChefCard key={chef.id} chef={chef} priority={idx < 4} />
        ))}
      </div>
    </div>
  );
}