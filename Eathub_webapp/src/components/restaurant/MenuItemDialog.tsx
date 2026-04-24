'use client';

import * as React from 'react';
import Image from 'next/image';
import type { MenuItem, Restaurant } from '@/lib/types';
import { getDisplayImage } from '@/lib/image-utils';
import { useCart } from '@/context/CartProvider';
import { useHeader } from '@/context/HeaderProvider';
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
  restaurant?: Restaurant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideAddButton?: boolean;
  hidePrice?: boolean;
}

export function MenuItemDialog({
  item,
  restaurant,
  open,
  onOpenChange,
  hideAddButton = false,
  hidePrice = false,
}: MenuItemDialogProps) {
  const { addToCart, providerInfo, clearAndAddToCart } = useCart();
  const { setIsAuthSuggestionOpen } = useHeader();
  const [showReplaceConfirm, setShowReplaceConfirm] = React.useState(false);

  const handleAddToCart = () => {
    // Guest Mode Check
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        setIsAuthSuggestionOpen(true);
        return;
    }

    // Determine Provider Info (Prop or Item Fallback)
    const pId = restaurant?.id || item.providerId;
    const pName = restaurant?.name || item.providerName || 'Unknown Provider';
    const pTypeRaw = restaurant?.type || item.providerType || 'restaurant';
    
    if (!pId) {
        console.warn("No provider context for menu item:", item.name);
        return;
    }

    const providerData = {
        id: pId,
        type: ((pTypeRaw as string) === 'home-food' || (pTypeRaw as string) === 'homefood') ? 'HomeFood' : 'Restaurant' as any,
        name: pName
    };

    // CONFLICT CHECK
    if (providerInfo && providerInfo.id !== pId) {
        setShowReplaceConfirm(true);
        return;
    }

    addToCart(item, providerData);
    onOpenChange(false);
  };

  const handleConfirmReplace = () => {
    const pId = restaurant?.id || item.providerId;
    const pName = restaurant?.name || item.providerName || 'Unknown Provider';
    const pTypeRaw = restaurant?.type || item.providerType || 'restaurant';
    
    const providerData = {
        id: pId!,
        type: ((pTypeRaw as string) === 'home-food' || (pTypeRaw as string) === 'homefood') ? 'HomeFood' : 'Restaurant' as any,
        name: pName
    };

    clearAndAddToCart(item, providerData);
    setShowReplaceConfirm(false);
    onOpenChange(false);
  };

  const hasRating = typeof item.rating === 'number';
  const imageUrl = getDisplayImage(item.imageId, 'food-1');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image side */}
          <div className="relative h-64 md:h-auto min-h-[300px]">
            <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
            />
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

            <DialogFooter className={cn("mt-6 gap-4 items-center", hideAddButton ? "justify-center" : "sm:justify-between")}>
              {!hidePrice && (
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-primary">
                    {item.isOnOffer && item.offerType === 'Percentage' ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>$ {(item.price * (1 - (item.offerValue || 0) / 100)).toFixed(2)}</span>
                          <span className="text-sm line-through text-muted-foreground">$ {item.price}</span>
                        </div>
                        <Badge className="w-fit bg-red-100 text-red-600 hover:bg-red-100 border-none text-[10px] mt-1">
                          {item.offerValue}% OFF
                        </Badge>
                      </div>
                    ) : item.isOnOffer && item.offerType === 'Fixed Amount' ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>$ {(item.price - (item.offerValue || 0)).toFixed(2)}</span>
                          <span className="text-sm line-through text-muted-foreground">$ {item.price}</span>
                        </div>
                        <Badge className="w-fit bg-red-100 text-red-600 hover:bg-red-100 border-none text-[10px] mt-1">
                          $ {item.offerValue} OFF
                        </Badge>
                      </div>
                    ) : (
                      <span>$ {item.price}</span>
                    )}
                  </div>
                  {item.isOnOffer && item.offerDescription && (
                    <p className="text-xs text-orange-600 font-semibold mt-1 italic">
                      ✨ {item.offerDescription}
                    </p>
                  )}
                </div>
              )}
              {!hideAddButton && (
                <div className="flex flex-col items-end gap-2">
                    {showReplaceConfirm ? (
                        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-[10px] text-red-600 font-black uppercase text-right max-w-[200px]">
                                Your cart has items from {providerInfo?.name}. Clear it?
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setShowReplaceConfirm(false)} className="rounded-full text-[10px] h-8">
                                    Cancel
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleConfirmReplace} className="rounded-full text-[10px] h-8 bg-red-600">
                                    Clear & Add
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button size="lg" onClick={handleAddToCart} className="rounded-full px-8 whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs">
                            Add To Cart
                        </Button>
                    )}
                </div>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
