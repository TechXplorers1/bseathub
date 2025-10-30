'use client';

import type { MenuItem as MenuItemType } from '@/lib/types';
import { MenuItem } from './MenuItem';

interface FeaturedItemsProps {
    items: MenuItemType[];
    onItemClick: (item: MenuItemType) => void;
}

export function FeaturedItems({ items, onItemClick }: FeaturedItemsProps) {
    return (
        <div id="Featured Items">
            <h2 className="text-2xl font-semibold mt-6 mb-4">Featured Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <MenuItem key={item.id} item={item} onClick={() => onItemClick(item)} />
                ))}
            </div>
        </div>
    );
}
