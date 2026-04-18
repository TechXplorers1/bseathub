'use client';

import { RestaurantCarousel } from '@/components/home/RestaurantCarousel';
import { useRestaurants } from '@/context/RestaurantProvider';
import { FilterCategories } from '@/components/home/FilterCategories';
import { Banners } from '@/components/home/Banners';
import { OffersForYou } from '@/components/home/OffersForYou';
import { ChefsCarousel } from '@/components/home/ChefsCarousel';
import { useDistanceFilter } from '@/context/DistanceFilterProvider';
import { useUser } from '@/firebase/provider';
import { Loader2, MapPin } from 'lucide-react';
import type { Restaurant, Chef } from '@/lib/types';

export default function Home() {
  const { restaurants, homeFoods, loading, chefs } = useRestaurants();
  const { selectedRadius, nearbyData, isFetchingNearby, hasLocation, locationLabel } = useDistanceFilter();
  const { user } = useUser();
  const currentUserId = user?.uid;

  // Filter out the current user's provider card from showing on their own homepage
  const filterSelf = <T extends { ownerId?: string; owner?: { id: string } }>(items: T[]): T[] => {
    if (!currentUserId) return items;
    return items.filter(item => {
      const oid = item.ownerId || item.owner?.id;
      return oid !== currentUserId;
    });
  };

  // Only use proximity-based sorting/data if a distance radius is explicitly selected
  const useNearby = nearbyData !== null && selectedRadius !== null;
  const isFiltered = selectedRadius !== null; // Used for UI labels

  const displayRestaurants = filterSelf(useNearby
    ? nearbyData!.restaurants as Restaurant[]
    : restaurants);

  const displayHomeFoods = filterSelf(useNearby
    ? nearbyData!.homeFoods as Restaurant[]
    : homeFoods);

  const displayChefs = filterSelf(useNearby 
    ? nearbyData!.chefs as Chef[]
    : chefs as Chef[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-bold animate-pulse text-muted-foreground">Preparing your personalized menu...</p>
        </div>
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

      {/* Removed NearbyScroller per user request — proximity sorting now happens in-place */}

      <div className="mt-2 mb-2">
        <OffersForYou />
      </div>

      <div className="mb-6">
        <Banners />
      </div>

      {displayHomeFoods.length > 0 ? (
        <div className="mb-6">
          <RestaurantCarousel
            title={useNearby ? `Home Food Near ${locationLabel} (${displayHomeFoods.length})` : 'Home Food'}
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
            title={useNearby ? `Restaurants Near ${locationLabel} (${displayRestaurants.length})` : 'Restaurants'}
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

      <ChefsCarousel filteredChefs={displayChefs} />
    </div>
  );
}