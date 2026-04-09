'use client';

import { useState } from 'react';
import type { MenuItem as BaseMenuItem } from '@/lib/types';
import { MenuItem } from '@/components/restaurant/MenuItem';
import { MenuItemDialog } from '@/components/restaurant/MenuItemDialog';
import { Separator } from '../ui/separator';
import { useRestaurants } from '@/context/RestaurantProvider';

type EnrichedMenuItem = BaseMenuItem & {
  restaurantName?: string;
  rating?: number;
  recipe?: string;
};

export function MostOrdered() {
  const { allItems: vendors, loading: vendorsLoading } = useRestaurants();
  const [selectedItem, setSelectedItem] = useState<EnrichedMenuItem | null>(null);

  if (vendorsLoading) return null;

  const allEnrichedItems = vendors.flatMap((restaurant) =>
    (restaurant.menu || []).flatMap((category) =>
      (category.items || []).map((item) => ({
        ...item,
        type: restaurant.type,
        restaurantName: restaurant.name,
        rating: typeof (item as any).rating === 'number' ? (item as any).rating : restaurant.rating,
        recipe: (item as any).recipe ?? item.description,
      }))
    )
  );

  const uniqueEnrichedItems = Array.from(
    new Map(allEnrichedItems.map((item) => [item.id, item])).values()
  );

  const mostOrderedItems: EnrichedMenuItem[] = uniqueEnrichedItems
    .sort(() => 0.5 - Math.random())
    .slice(0, 9);

  const handleItemClick = (item: EnrichedMenuItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="py-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">What's on your mind today!</h2>
        <p className="text-muted-foreground">
          😋 “Cravings kick off here — explore the top picks everyone keeps
          coming back for.”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mostOrderedItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedItem(null);
            }
          }}
        />
      )}

      <Separator className="my-8" />
    </div>
  );
}
