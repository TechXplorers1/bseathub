'use client';

import Image from 'next/image';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const image = getImageById(item.imageId);
  const { addToCart } = useCart();

  return (
    <div className="flex justify-between items-start p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
      <div className="flex-1 pr-4">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        <p className="font-medium mt-2">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end space-y-2">
        {image && (
          <div className="relative h-24 w-24">
            <Image
              src={image.imageUrl}
              alt={item.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
              data-ai-hint={image.imageHint}
            />
          </div>
        )}
        <Button size="sm" onClick={() => addToCart(item)}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
}
