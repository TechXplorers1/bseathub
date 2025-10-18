'use client';

import Image from 'next/image';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const image = getImageById(item.imageId);
  const { addToCart } = useCart();

  return (
    <Card className="overflow-hidden cursor-pointer group flex flex-col" onClick={() => addToCart(item)}>
        <CardContent className="p-0 flex flex-col flex-1">
            <div className="flex justify-between items-start p-4 flex-1">
                <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-base group-hover:text-primary">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    <p className="font-medium mt-2">${item.price.toFixed(2)}</p>
                </div>
                {image && (
                <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                    src={image.imageUrl}
                    alt={item.name}
                    fill
                    objectFit="cover"
                    className="rounded-md"
                    data-ai-hint={image.imageHint}
                    />
                </div>
                )}
            </div>
            <div className="p-4 pt-0 mt-auto">
                <Button size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
