
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RestaurantCard } from '@/components/home/RestaurantCard';
import { ChefCard } from '@/components/home/ChefCard';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import type { Restaurant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const chefs = allHomeFoods.map(food => ({
    name: food.name.split("'s")[0],
    specialty: food.cuisine,
    avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
    slug: food.slug
}));

const uniqueChefs = chefs.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
        acc.push(current);
    }
    return acc;
}, [] as typeof chefs);

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    if (!query) {
        return <p className="text-center text-muted-foreground mt-12">Please enter a search term.</p>;
    }

    const lowercasedQuery = query.toLowerCase();

    const filteredRestaurants = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(lowercasedQuery) ||
        restaurant.cuisine.toLowerCase().includes(lowercasedQuery) ||
        restaurant.categories.some(cat => cat.toLowerCase().includes(lowercasedQuery))
    );

    const filteredHomeFoods = allHomeFoods.filter(restaurant =>
        restaurant.name.toLowerCase().includes(lowercasedQuery) ||
        restaurant.cuisine.toLowerCase().includes(lowercasedQuery) ||
        restaurant.categories.some(cat => cat.toLowerCase().includes(lowercasedQuery))
    );

    const filteredChefs = uniqueChefs.filter(chef =>
        chef.name.toLowerCase().includes(lowercasedQuery) ||
        chef.specialty.toLowerCase().includes(lowercasedQuery)
    );

    const noResults = filteredRestaurants.length === 0 && filteredHomeFoods.length === 0 && filteredChefs.length === 0;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Results for "{query}"</h1>

            {filteredRestaurants.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredRestaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            )}
            
            {filteredHomeFoods.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Home Food</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredHomeFoods.map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            )}

            {filteredChefs.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Chefs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredChefs.map((chef) => (
                            <ChefCard key={chef.name} chef={chef} />
                        ))}
                    </div>
                </div>
            )}

            {noResults && (
                <p className="text-center text-muted-foreground mt-12">No results found for "{query}".</p>
            )}
        </div>
    );
}

function SearchSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-10 w-1/3 mb-8" />
            <div className="mb-12">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                            <Skeleton className="h-40 w-full rounded-md" />
                            <Skeleton className="mt-4 h-6 w-3/4 rounded-md" />
                            <Skeleton className="mt-2 h-4 w-1/2 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchResults />
        </Suspense>
    );
}
