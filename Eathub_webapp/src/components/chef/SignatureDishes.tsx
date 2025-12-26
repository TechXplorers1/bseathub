
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { MenuItem as MenuItemType } from '@/lib/types';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { MenuItemDialog } from '../restaurant/MenuItemDialog';
import { useState } from 'react';

interface SignatureDishesProps {
    items: MenuItemType[];
}

export function SignatureDishes({ items }: SignatureDishesProps) {
    const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

    if (!items || items.length < 5) return null;
    
    const [dish1, dish2, dish3, dish4, dish5] = items;

    const handleItemClick = (item: MenuItemType) => {
        setSelectedItem(item);
    };


    const renderImageWithOverlay = (dish: MenuItemType, className?: string) => {
        const image = getImageById(dish.imageId);
        if (!image) return null;
        
        return (
            <div key={dish.id} className={cn("overflow-hidden relative group rounded-lg cursor-pointer", className)} onClick={() => handleItemClick(dish)}>
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
