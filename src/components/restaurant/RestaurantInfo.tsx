'use client';

import { Star, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Restaurant } from '@/lib/types';

interface RestaurantInfoProps {
    restaurant: Restaurant;
    displayName: string;
    isChefPage?: boolean;
}

export function RestaurantInfo({ restaurant, displayName, isChefPage }: RestaurantInfoProps) {
    return (
        <div>
            <h1 className="text-4xl font-bold mt-8 lg:mt-0">{displayName}</h1>
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
            {!isChefPage && <p className="text-muted-foreground">$ • {restaurant.cuisine}</p>}
            {!isChefPage && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Service fees apply</span>
                <Info className="h-3 w-3" />
                </div>
            )}
             {!isChefPage && (
                <Button variant="outline" className="w-full rounded-full">
                    See More
                </Button>
             )}
            </div>
        </div>
    )
}
