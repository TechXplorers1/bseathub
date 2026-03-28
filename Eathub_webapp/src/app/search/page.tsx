
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RestaurantCard } from '@/components/home/RestaurantCard';
import { ChefCard } from '@/components/home/ChefCard';
import { useRestaurants } from '@/context/RestaurantProvider';
import type { Restaurant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
    const { restaurants: allRestaurantsData, homeFoods: allHomeFoodsData, loading } = useRestaurants();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    if (loading) {
        return <div className="flex justify-center mt-12"><p className="animate-pulse">Searching...</p></div>;
    }

    if (!query) {
        return <p className="text-center text-muted-foreground mt-12">Please enter a search term.</p>;
    }

    const lowercasedQuery = query.toLowerCase();

    const filteredRestaurants = allRestaurantsData.filter((restaurant: Restaurant) =>
        restaurant.name.toLowerCase().includes(lowercasedQuery) ||
        restaurant.cuisine?.toLowerCase().includes(lowercasedQuery) ||
        restaurant.categories?.some((cat: string) => cat.toLowerCase().includes(lowercasedQuery))
    );

    const filteredHomeFoods = allHomeFoodsData.filter((restaurant: Restaurant) =>
        restaurant.name.toLowerCase().includes(lowercasedQuery) ||
        restaurant.cuisine?.toLowerCase().includes(lowercasedQuery) ||
        restaurant.categories?.some((cat: string) => cat.toLowerCase().includes(lowercasedQuery))
    );

    // Derive Chefs from Home Food providers
    const chefs = allHomeFoodsData.map((food: Restaurant) => ({
        name: food.name.split("'s")[0],
        specialty: food.cuisine || "Home-made",
        avatarUrl: food.imageId ? food.imageId : `https://i.pravatar.cc/150?u=${food.id}`,
        slug: food.slug
    }));

    const uniqueChefs = chefs.reduce((acc: any[], current: any) => {
        if (!acc.find((item: any) => item.name === current.name)) {
            acc.push(current);
        }
        return acc;
    }, [] as typeof chefs);

    const filteredChefs = uniqueChefs.filter((chef: any) =>
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
