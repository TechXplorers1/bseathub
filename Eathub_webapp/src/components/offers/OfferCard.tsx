'use client';

import Image from 'next/image';
import type { MenuItem } from '@/lib/types';
import { getDisplayImage } from '@/lib/image-utils';
import { Star, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface OfferCardProps {
  item: MenuItem;
  discountText?: string;
  originalPrice?: number;
  rating?: number;
  timeMins?: number;
  onClick?: () => void;
}

export function OfferCard({
  item,
  discountText = '50% OFF',
  originalPrice,
  rating = 4.5,
  timeMins = 30,
  onClick
}: OfferCardProps) {
  const displayImage = getDisplayImage(item.imageId, 'food-1');
  const isVeg = item.itemType === 'Veg' || item.itemType === 'Vegan';
  const isNonVeg = item.itemType === 'Non-Veg';

  // calculate a default original price if not provided
  const baseOriginalPrice = originalPrice || Math.floor(item.price * 1.5) || 500;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer transition-all hover:shadow-md relative flex flex-col h-full">
      {/* Top Image Section */}
      <div className="relative h-48 w-full bg-gray-50">
        <Image
          src={displayImage}
          alt={item.name}
          fill
          className="object-cover"
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
          {discountText}
        </div>

        {/* Veg/Non-Veg Icon */}
        <div className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-sm z-10 hidden lg:block">
          {isVeg && (
            <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center bg-white">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
          )}
          {isNonVeg && (
            <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center bg-white">
              <div className="w-2 h-2 rounded-full bg-red-600" />
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
            View Details
          </Button>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate mb-1">
          {item.name}
        </h3>

        {item.providerName && (
          <p className="text-xs text-gray-500 truncate mb-3">
            {item.providerName}
          </p>
        )}

        <div className="mt-auto">
          {/* Price & Rating */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-base">${item.price}</span>
              <span className="text-xs text-gray-400 line-through">${baseOriginalPrice}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span className="text-[11px] font-bold text-gray-700">{rating}</span>
            </div>
          </div>

          {/* Time Limit / Delivery Time */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px]">{timeMins} mins</span>
          </div>
        </div>
      </div>

      {/* Fallback link wrapper stretching over card */}
      {onClick ? (
        <button
          className="absolute inset-0 z-30 w-full h-full opacity-0 cursor-pointer outline-none"
          onClick={onClick}
          aria-label={`View ${item.name}`}
        />
      ) : (
        <Link href={`/${item.providerType === 'home-food' ? 'home-food' : 'restaurant'}/${item.providerSlug || item.providerId}`} className="absolute inset-0 z-30 opacity-0" aria-label={`View ${item.name}`} />
      )}
    </div>
  );
}
