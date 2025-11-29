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
                className="object-cover rounded-l-lg"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>

          {/* Details side */}
          <div className="p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl mb-1">
                {item.name}
              </DialogTitle>

              {/* Restaurant name */}
              {item.restaurantName && (
                <p className="text-sm font-semibold text-primary">
                  From: {item.restaurantName}
                </p>
              )}

              {/* Rating */}
              {typeof item.rating === 'number' && (
                <p className="text-sm text-muted-foreground mt-1">
                  ⭐ {item.rating.toFixed(1)} / 5.0
                </p>
              )}

              {/* Recipe / Description */}
              <DialogDescription className="text-base text-muted-foreground mt-3">
                {item.recipe ?? item.description}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-grow" />

            <DialogFooter className="mt-6 sm:justify-between items-center">
              <div className="text-2xl font-bold">
                <span>₹{item.price.toFixed(2)}</span>
              </div>
              <Button size="lg" onClick={handleAddToCart}>
                Add To Cart
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
