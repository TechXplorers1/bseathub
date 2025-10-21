'use client';

import Image from 'next/image';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { getImageById } from '@/lib/placeholder-images';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface MenuItemProps {
  item: MenuItemType;
  onClick: () => void;
}

export function MenuItem({ item, onClick }: MenuItemProps) {
  const image = getImageById(item.imageId);

  return (
    <Card className="overflow-hidden cursor-pointer group flex flex-col" onClick={onClick}>
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
                <div className="w-full h-9 rounded-md px-3 bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Add
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
