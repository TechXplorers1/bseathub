'use client';

import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { useRestaurants } from '@/context/RestaurantProvider';
import { FilterCategories } from '@/components/home/FilterCategories';
import { Banners } from '@/components/home/Banners';
import { OffersForYou } from '@/components/home/OffersForYou';
import { ChefsCarousel } from '@/components/home/ChefsCarousel';
import { useDistanceFilter } from '@/context/DistanceFilterProvider';
import { Loader2, MapPin } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

export default function Home() {
  const { restaurants, homeFoods, loading, chefs } = useRestaurants();
  const { selectedRadius, nearbyData, isFetchingNearby, hasLocation, locationLabel } = useDistanceFilter();

  // When a distance is active, use the nearby API results; otherwise use the full list
  const isFiltered = selectedRadius !== null && nearbyData !== null;

  const displayRestaurants: Restaurant[] = isFiltered
    ? nearbyData!.restaurants as Restaurant[]
    : restaurants;

  const displayHomeFoods: Restaurant[] = isFiltered
    ? nearbyData!.homeFoods as Restaurant[]
    : homeFoods;

  const displayChefs = isFiltered ? nearbyData!.chefs : chefs;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg animate-pulse">Loading delicious food...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-w-0">
      <FilterCategories />

      {/* ── Distance filter status banner ──────────────────────────── */}
      {selectedRadius !== null && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {isFetchingNearby ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Finding providers within {selectedRadius < 1 ? `${selectedRadius * 1000}m` : `${selectedRadius}km`}…
              </span>
            ) : isFiltered ? (
              <span>
                Showing providers within{' '}
                <strong className="text-foreground">
                  {selectedRadius < 1 ? `${selectedRadius * 1000}m` : `${selectedRadius}km`}
                </strong>{' '}
                of{' '}
                <strong className="text-foreground truncate max-w-[160px] inline-block align-bottom">
                  {locationLabel}
                </strong>{' '}
                &mdash;{' '}
                <span className="text-primary font-semibold">
                  {displayRestaurants.length + displayHomeFoods.length + displayChefs.length} results
                </span>
              </span>
            ) : !hasLocation ? (
              <span className="text-amber-600 font-medium">
                📍 Location not available — showing all providers
              </span>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-2 mb-2">
        <OffersForYou />
      </div>

      <div className="mb-6">
        <Banners />
      </div>

      {displayHomeFoods.length > 0 ? (
        <div className="mb-6">
          <RestaurantCarousel
            title={isFiltered ? `Home Food Nearby (${displayHomeFoods.length})` : 'Home Food'}
            restaurants={displayHomeFoods}
            href="/home-food"
          />
        </div>
      ) : isFiltered ? (
        <div className="mb-6 py-8">
          <h2 className="text-2xl font-bold mb-3">Home Food</h2>
          <p className="text-muted-foreground text-sm">No home food providers found within this distance.</p>
        </div>
      ) : null}

      {displayRestaurants.length > 0 ? (
        <div className="mb-8">
          <RestaurantCarousel
            title={isFiltered ? `Restaurants Nearby (${displayRestaurants.length})` : 'Restaurants'}
            restaurants={displayRestaurants}
            href="/restaurants"
          />
        </div>
      ) : isFiltered ? (
        <div className="mb-8 py-8">
          <h2 className="text-2xl font-bold mb-3">Restaurants</h2>
          <p className="text-muted-foreground text-sm">No restaurants found within this distance.</p>
        </div>
      ) : null}

      <ChefsCarousel filteredChefs={isFiltered ? displayChefs : undefined} />
    </div>
  );
}