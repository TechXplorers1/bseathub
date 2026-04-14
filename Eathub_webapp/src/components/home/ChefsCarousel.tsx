'use client';

import { useEffect, useState } from 'react';
import { useRestaurants } from '@/context/RestaurantProvider';
import { ChefCard, ChefCardSkeleton } from './ChefCard';
import { Skeleton } from '../ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Chef } from '@/lib/types';

export function ChefsCarousel() {
    const { chefs, loading: providerLoading } = useRestaurants();
    const [error, setError] = useState<string | null>(null);

    if (providerLoading) {
        return (
            <div className="py-8">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-48 bg-muted" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <ChefCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    if (error) return <div className="h-64 flex items-center justify-center text-red-500">Error: {error}</div>;

    if (chefs.length === 0) return null;

    const INITIAL_VISIBLE_COUNT = 8;
    const visibleChefs = chefs.slice(0, INITIAL_VISIBLE_COUNT);

    return (
        <div className="py-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold">Book a Private Chef</h2>
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