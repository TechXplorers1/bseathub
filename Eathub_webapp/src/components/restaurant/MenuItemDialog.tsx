'use client';

import * as React from 'react';
import Image from 'next/image';
import type { MenuItem } from '@/lib/types';
import { getImageById } from '@/lib/placeholder-images';
import { useCart } from '@/context/CartProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MenuItemDialogProps {
  item: MenuItem & {
    restaurantName?: string;
    rating?: number;
    recipe?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemDialog({
  item,
  open,
  onOpenChange,
}: MenuItemDialogProps) {
  const { addToCart } = useCart();
  const image = getImageById(item.imageId);

  const handleAddToCart = () => {
    addToCart(item);
    onOpenChange(false);
  };

  const hasRating = typeof item.rating === 'number';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image side */}
          <div className="relative h-64 md:h-full min-h-[250px]">
            {image && (
              <Image
                src={image.imageUrl}
                alt={item.name}
                fill
                className="object-cover rounded-l-lg md:rounded-l-lg md:rounded-r-none"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>

          {/* Details side */}
          <div className="p-6 flex flex-col bg-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl">
                  {item.name}
                </DialogTitle>
                {item.itemType && (
                    <Badge variant="outline" className={cn(
                        "text-[10px] h-5",
                        item.itemType === 'Veg' ? "border-green-500 text-green-700" : "border-red-500 text-red-700"
                    )}>
                        {item.itemType}
                    </Badge>
                )}
                {item.isNegotiable && (
                    <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Negotiable
                    </Badge>
                )}
              </div>

              {/* Restaurant name */}
              {item.restaurantName && (
                <p className="text-sm font-semibold text-orange-500">
                  From: {item.restaurantName}
                </p>
              )}

              {/* Rating row */}
              {hasRating && (
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px]">
                    ⭐
                  </span>
                  <span className="font-semibold">
                    {item.rating!.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    / 5.0
                  </span>
                </div>
              )}

              {/* Recipe / Description */}
              {item.recipe ? (
                <DialogDescription className="text-base text-muted-foreground mt-3">
                  {item.recipe}
                </DialogDescription>
              ) : item.description ? (
                <DialogDescription className="text-base text-muted-foreground mt-3">
                  {item.description}
                </DialogDescription>
              ) : null}
            </DialogHeader>

            <div className="flex-grow" />

            <DialogFooter className="mt-6 sm:justify-between items-center">
              <div className="text-2xl font-bold text-primary">
                <span>₹ {item.price}</span>
              </div>
              <Button size="lg" onClick={handleAddToCart} className="rounded-full px-8">
                Add To Cart
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
