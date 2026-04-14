'use client';

import React from 'react';
import Image from 'next/image';
import { getDisplayImage } from '@/lib/image-utils';
import { Star, Clock, MapPin, X, Minus, Plus, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import type { MenuItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface OfferDetailsModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  originalPrice?: number;
  discountText?: string;
  rating?: number;
  timeMins?: number;
  distance?: number;
}

export function OfferDetailsModal({
  item,
  isOpen,
  onClose,
  originalPrice,
  discountText = '50% OFF',
  rating = 4.8,
  timeMins = 40,
  distance = 4.0
}: OfferDetailsModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  // Reset quantity when modal opens
  React.useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!item) return null;

  const displayImage = getDisplayImage(item.imageId, 'food-1');
  const isVeg = item.itemType === 'Veg' || item.itemType === 'Vegan';
  const baseOriginalPrice = originalPrice || Math.floor(item.price * 1.5) || 499;

  const handleAddToCart = () => {
    // Add to cart with correct provider structure
    const providerType = item.providerType === 'home-food' ? 'HomeFood' : 'Restaurant';
    const provider = {
      id: item.providerId || 'unknown-provider',
      type: providerType as 'Restaurant' | 'HomeFood',
      name: item.providerName || 'Unknown Provider',
    };
    
    // Call addToCart N times or if cart takes quantity, pass it. 
    // Wait, addToCart in CartProvider adds 1 unit. We should loop, or update quantity immediately
    for (let i = 0; i < quantity; i++) {
        addToCart(item, provider);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:max-w-3xl overflow-hidden rounded-2xl bg-white border-0 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/50 backdrop-blur-md hover:bg-white text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Image Side */}
          <div className="relative w-full md:w-[45%] h-64 md:h-auto bg-gray-100 flex-shrink-0">
            <Image
              src={displayImage}
              alt={item.name}
              fill
              className="object-cover"
            />
            {/* Top Left Badge */}
            <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              {discountText}
            </div>
          </div>

          {/* Right: Details Side */}
          <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                {item.name}
              </h2>
              {item.providerName && (
                <p className="text-sm font-medium text-orange-500 mb-4">
                  From {item.providerName}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded text-orange-600 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-orange-500" />
                  {rating}
                </div>
                <span className="text-xs text-gray-400 font-medium">(189 reviews)</span>
              </div>

              {/* Price Row */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black text-gray-900">₹{item.price}</span>
                <span className="text-sm font-semibold text-gray-400 line-through mt-1">₹{baseOriginalPrice}</span>
                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md mt-1">
                  {discountText}
                </span>
              </div>

              {/* Offer Highlight Badge */}
              <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100 p-2.5 rounded-lg mb-6">
                <Tag className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600">
                  {discountText} applied on this item
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {item.description || "Indulge in our signature item carefully prepared with fresh ingredients. Order now to activate this exclusive deal!"}
              </p>

              {/* Quick Info Filters */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {timeMins} mins
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {distance.toFixed(1)} km
                </div>
                {isVeg ? (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <div className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center rounded-sm">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    </div>
                    Veg
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <div className="w-3.5 h-3.5 border border-red-600 flex items-center justify-center rounded-sm">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    </div>
                    Non-Veg
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-4 mt-auto pt-2">
              <div className="flex items-center justify-between border border-gray-200 rounded-full w-32 py-2 px-2 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-gray-900 w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button 
                onClick={handleAddToCart}
                className="flex-1 rounded-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 text-sm"
              >
                Add to Cart • ₹{item.price * quantity}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
