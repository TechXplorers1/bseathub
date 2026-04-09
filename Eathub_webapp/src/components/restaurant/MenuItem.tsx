'use client';

import Image from 'next/image';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { Plus } from 'lucide-react';
import { getDisplayImage } from '@/lib/image-utils';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { FavoriteButton } from '../shared/FavoriteButton';

interface MenuItemProps {
  item: MenuItemType;
  onClick: () => void;
  showProviderInfo?: boolean;
}

export function MenuItem({ item, onClick, showProviderInfo = false }: MenuItemProps) {
  const displayImage = getDisplayImage(item.imageId, 'food-1');

  return (
    <Card className="overflow-hidden cursor-pointer group flex flex-col relative" onClick={onClick}>
      <CardContent className="p-0 flex flex-col flex-1">
        <div className="flex justify-between items-start p-4 flex-1">

          {/* IMAGE LEFT */}
          <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0 mr-4">
            <Image
              src={displayImage}
              alt={item.name}
              fill
              className="object-cover rounded-md"
            />
            {/* FAVORITE Tucked into Image Corner */}
            <div className="absolute top-1 right-1 z-10 p-1 bg-white/80 rounded-full shadow-sm">
              <FavoriteButton
                targetId={item.id}
                targetType="MENU_ITEM"
                size={14}
              />
            </div>
          </div>

          {/* TEXT RIGHT */}
          <div className="flex-1">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {showProviderInfo && item.providerName && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    <Link
                      href={`/${item.providerType === 'home-food' ? 'home-food' : 'restaurant'}/${item.providerSlug || item.providerId}`}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      {item.providerName}
                    </Link>
                  </div>
                )}
                <h3 className="font-black text-lg leading-tight uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                  {item.name}
                </h3>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-black text-xl tracking-tighter">₹{item.price}</span>
                {item.isSpecial && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">Featured</span>
                )}
              </div>
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
