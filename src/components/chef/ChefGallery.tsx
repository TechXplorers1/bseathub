'use client';

import Image from 'next/image';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import type { MenuItem } from '@/lib/types';
import { Card } from '../ui/card';
import { getImageById } from '@/lib/placeholder-images';

const galleryImageIds = [
    'food-3',
    'food-5',
    'food-9',
    'food-13',
    'food-17',
    'food-21',
];

const allMenuItems = [...allRestaurants, ...allHomeFoods].flatMap(r => r.menu.flatMap(c => c.items));

export function ChefGallery() {
    const dishes = galleryImageIds.map(id => {
        const dish = allMenuItems.find(item => item.imageId === id);
        return dish;
    }).filter((d): d is MenuItem => !!d);

    if (dishes.length < 6) return null;

    const [dish1, dish2, dish3, dish4, dish5, dish6] = dishes;

    const renderImageWithOverlay = (dish: MenuItem) => {
        const image = getImageById(dish.imageId);
        if (!image) return null;
        
        return (
            <Card key={dish.id} className="overflow-hidden relative group">
                <Image
                    src={image.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                    <h3 className="font-bold text-white text-lg">{dish.name}</h3>
                    <p className="text-white/90 text-sm line-clamp-2">{dish.description}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Signature Dishes</h2>
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
                <div className="col-span-2 row-span-2">
                    {renderImageWithOverlay(dish1)}
                </div>
                {renderImageWithOverlay(dish2)}
                {renderImageWithOverlay(dish3)}
                {renderImageWithOverlay(dish4)}
                {renderImageWithOverlay(dish5)}
            </div>
        </div>
    );
}
