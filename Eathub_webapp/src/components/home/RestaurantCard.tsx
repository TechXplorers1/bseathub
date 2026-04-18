import Image from 'next/image';
import Link from 'next/link';
import type { Restaurant } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Bike, ShoppingBag, ImageIcon, ChefHat, Utensils, MapPin } from 'lucide-react';
import { getDisplayImage } from '@/lib/image-utils';
import { FavoriteButton } from '@/components/shared/FavoriteButton';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const displayImage = getDisplayImage(restaurant.coverImageId || restaurant.imageId, 'restaurant-1');
  // Safe check for services array
  const services = restaurant.services || [];
  const typePrefix = restaurant.type === 'home-food' ? 'home-food' : 'restaurant';
  const displayName = restaurant.name || (restaurant as any).brandName || 'Provider';

  return (
    <Link
      href={`/${typePrefix}/${restaurant.slug || restaurant.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex group"
    >
      <Card className="overflow-hidden transition-all hover:shadow-xl w-full flex flex-col border-muted/60">
        <div className="relative h-48 w-full overflow-hidden bg-muted/30 flex items-center justify-center">
          {(!restaurant.coverImageId && !restaurant.imageId) ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground/40">
              {restaurant.type === 'home-food' ? (
                <ChefHat className="h-12 w-12 mb-2" />
              ) : (
                <Utensils className="h-12 w-12 mb-2" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
            </div>
          ) : (
            <Image
              src={displayImage}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          
          <div className="absolute top-2 right-2">
            <FavoriteButton
              targetId={restaurant.id}
              targetType={restaurant.type === 'home-food' ? 'HOME_FOOD' : 'RESTAURANT'}
            />
          </div>

          <div className="absolute bottom-2 right-2 flex gap-2">
            {services.includes('delivery') && (
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm flex items-center gap-1 shadow-sm">
                <Bike className="h-3 w-3 text-orange-600" />
                <span className="text-[10px]">Delivery</span>
              </Badge>
            )}
            {services.includes('pickup') && (
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm flex items-center gap-1 shadow-sm">
                <ShoppingBag className="h-3 w-3 text-blue-600" />
                <span className="text-[10px]">Pickup</span>
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-lg leading-tight line-clamp-1">{displayName}</h3>
              <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0 bg-green-50 border-green-200">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-green-700">
                  {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {restaurant.cuisine || 'Multi-cuisine'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{restaurant.deliveryTime || '30-40'} min</span>
              </div>
              {restaurant.distanceKm != null && (
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 transition-all group-hover:bg-primary group-hover:text-white">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[10px] font-black whitespace-nowrap">
                    {restaurant.distanceKm < 1 ? `${(restaurant.distanceKm * 1000).toFixed(0)}m` : `${restaurant.distanceKm.toFixed(1)}km`}
                  </span>
                </div>
              )}
            </div>
            {restaurant.isOpen === false && (
              <span className="text-destructive font-bold">CLOSED</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}