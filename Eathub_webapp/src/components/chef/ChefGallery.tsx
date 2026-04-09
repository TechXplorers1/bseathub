'use client';

import Image from 'next/image';
import type { MenuItem } from '@/lib/types';
import { Card } from '../ui/card';
import { getDisplayImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { useRestaurants } from '@/context/RestaurantProvider';

const galleryImageIds = [
    'food-3',
    'food-5',
    'food-9',
    'food-13',
    'food-17',
    'food-21',
];

export function ChefGallery() {
    const { allItems, loading } = useRestaurants();

    if (loading) return null;

    const allMenuItems = allItems.flatMap(r => (r.menu || []).flatMap(c => c.items || []));

    const dishes = galleryImageIds.map(id => {
        const dish = allMenuItems.find(item => item.imageId === id);
        return dish;
    }).filter((d): d is MenuItem => !!d);

    if (dishes.length < 6) {
        // Fallback: just take the first 6 items from allMenuItems if we don't have the specific IDs
        const fallbackDishes = allMenuItems.slice(0, 6);
        if (fallbackDishes.length < 6) return null;
        return renderGallery(fallbackDishes);
    }

    return renderGallery(dishes);

    function renderGallery(galleryDishes: MenuItem[]) {
        const [dish1, dish2, dish3, dish4, dish5, dish6] = galleryDishes;

        const renderImageWithOverlay = (dish: MenuItem, className?: string) => {
            const imageUrl = getDisplayImage(dish.imageId, 'food-1');

            return (
                <div key={dish.id} className={cn("overflow-hidden relative group rounded-lg", className)}>
                    <Image
                        src={imageUrl}
                        alt={dish.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                        <h3 className="font-bold text-white text-lg">{dish.name}</h3>
                        <p className="text-white/90 text-sm line-clamp-2">{dish.description}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold mb-4">Signature Dishes</h2>
                <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
                    {renderImageWithOverlay(dish1, "col-span-2 row-span-2")}
                    {renderImageWithOverlay(dish2)}
                    {renderImageWithOverlay(dish3)}
                    {renderImageWithOverlay(dish4)}
                    {renderImageWithOverlay(dish5)}
                </div>
            </div>
        );
    }
}
