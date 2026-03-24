
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { MenuItem as MenuItemType } from '@/lib/types';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { MenuItemDialog } from '../restaurant/MenuItemDialog';
import { useState } from 'react';
import { Badge } from '../ui/badge';

interface SignatureDishesProps {
    items: MenuItemType[];
}

export function SignatureDishes({ items }: SignatureDishesProps) {
    const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

    if (!items || items.length === 0) return null;
    
    // Fill up to 5 items with placeholders if needed to keep the grid layout consistent
    const displayItems = [...items];
    while (displayItems.length < 5) {
        displayItems.push({
            id: `placeholder-${displayItems.length}`,
            name: 'Specialty Dish',
            description: 'A culinary masterpiece prepared by our expert chef.',
            price: 0,
            imageId: 'food-1'
        });
    }

    const [dish1, dish2, dish3, dish4, dish5] = displayItems;

    const handleItemClick = (item: MenuItemType) => {
        setSelectedItem(item);
    };


    const renderImageWithOverlay = (dish: MenuItemType, className?: string) => {
        // Handle both placeholder IDs and direct URLs/Base64
        const placeholder = getImageById(dish.imageId);
        const imageSrc = placeholder ? placeholder.imageUrl : (dish.imageId || '/placeholder-food.jpg');
        
        return (
            <div key={dish.id} className={cn("overflow-hidden relative group rounded-lg cursor-pointer bg-muted", className)} onClick={() => handleItemClick(dish)}>
                <Image
                    src={imageSrc}
                    alt={dish.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-colors flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                    <div className="mb-1">
                        <Badge className="bg-primary hover:bg-primary border-none text-[10px] h-4">SIGNATURE</Badge>
                    </div>
                    <h3 className="font-bold text-white text-lg leading-tight">{dish.name}</h3>
                    <p className="text-white/80 text-xs line-clamp-2 mt-1">{dish.description}</p>
                </div>
            </div>
        );
    }

  return (
    <>
    <Card id="Signature Dishes">
      <CardHeader>
        <CardTitle>Signature Dishes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
            {renderImageWithOverlay(dish1, "col-span-2 row-span-2")}
            {renderImageWithOverlay(dish2)}
            {renderImageWithOverlay(dish3)}
            {renderImageWithOverlay(dish4)}
            {renderImageWithOverlay(dish5)}
        </div>
      </CardContent>
    </Card>
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
    </>
  );
}
