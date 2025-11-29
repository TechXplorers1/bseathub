'use client';

import { useState } from 'react';
import type { MenuItem as BaseMenuItem } from '@/lib/types';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import { MenuItem } from '@/components/restaurant/MenuItem';
import { MenuItemDialog } from '@/components/restaurant/MenuItemDialog';
import { Separator } from '../ui/separator';

type EnrichedMenuItem = BaseMenuItem & {
  restaurantName?: string;
  rating?: number;
  recipe?: string;
};

const allItems = [...allRestaurants, ...allHomeFoods];

const mostOrderedItems: EnrichedMenuItem[] = allItems
  .flatMap((restaurant) =>
    restaurant.menu.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        restaurantName: restaurant.name,
        // Prefer item rating, else fall back to restaurant rating
        rating:
          typeof (item as any).rating === 'number'
            ? (item as any).rating
            : restaurant.rating,
        // Prefer a specific recipe field if present, else use description
        recipe: (item as any).recipe ?? item.description,
      }))
    )
  )
  .sort(() => 0.5 - Math.random())
  .slice(0, 9);

export function MostOrdered() {
  const [selectedItem, setSelectedItem] = useState<EnrichedMenuItem | null>(
    null
  );

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
