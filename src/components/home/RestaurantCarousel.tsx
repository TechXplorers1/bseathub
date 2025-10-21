'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from './RestaurantCard';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RestaurantCarouselProps {
  title: string;
  restaurants: Restaurant[];
  href?: string;
}

const INITIAL_VISIBLE_COUNT = 8;

export function RestaurantCarousel({ title, restaurants, href = "/restaurants" }: RestaurantCarouselProps) {
  const visibleRestaurants = restaurants.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="py-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            {restaurants.length > INITIAL_VISIBLE_COUNT && (
                <Link href={href} className={cn(buttonVariants({ variant: 'ghost' }))}>
                    See all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
    </div>
  );
}
