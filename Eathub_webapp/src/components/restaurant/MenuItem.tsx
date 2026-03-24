'use client';

import Image from 'next/image';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { getImageById } from '@/lib/placeholder-images';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

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

          {/* IMAGE LEFT */}
          {image && (
            <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0 mr-4">
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

          {/* TEXT RIGHT */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base group-hover:text-primary">{item.name}</h3>
              {item.itemType && (
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  item.itemType === 'Veg' ? "bg-green-500" : "bg-red-500"
                )} />
              )}
            </div>
            
            <div className="flex gap-2 mt-1 flex-wrap">
              {item.itemType && (
                <Badge variant="outline" className="text-[10px] h-5">
                  {item.itemType}
                </Badge>
              )}
              {item.isNegotiable && (
                <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  Negotiable
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            <p className="font-bold mt-2 text-primary">₹ {item.price}</p>
          </div>

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
