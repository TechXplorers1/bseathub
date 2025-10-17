'use client';

import Image from 'next/image';
import type { Restaurant } from '@/lib/types';
import { getImageById } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Star,
  Info,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Heart,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MenuItem } from './MenuItem';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

export function RestaurantDetails({ restaurant }: { restaurant: Restaurant }) {
  const image = getImageById(restaurant.imageId);
  const logo = getImageById('restaurant-3'); // Using a placeholder for logo

  return (
    <div className="flex flex-col bg-background">
      <div className="relative h-48 w-full">
        {image && (
          <Image
            src={image.imageUrl}
            alt={restaurant.name}
            fill
            objectFit="cover"
            data-ai-hint={image.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {logo && (
          <div className="absolute -bottom-8 left-8 h-20 w-20 rounded-full border-4 border-white bg-white overflow-hidden">
            <Image
              src={logo.imageUrl}
              alt={`${restaurant.name} logo`}
              width={80}
              height={80}
              className="object-contain"
              data-ai-hint={logo.imageHint}
            />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Button variant="secondary" size="icon" className="rounded-full">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="bg-yellow-100/50 p-3 text-center text-sm font-medium">
        Closed. Order now, get it later
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-bold mt-8">{restaurant.name}</h1>
            <div className="mt-6 space-y-3 text-sm">
              <h2 className="text-lg font-semibold">Store Info</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">DashPass</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span>
                  {restaurant.rating} ({restaurant.reviews > 1000 ? '1k+' : restaurant.reviews})
                </span>
                <span>•</span>
                <span>2 mi</span>
              </div>
              <p className="text-muted-foreground">$ • Canadian</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Service fees apply</span>
                <Info className="h-3 w-3" />
              </div>
              <Button variant="outline" className="w-full rounded-full">
                See More
              </Button>
            </div>
            <Separator className="my-6" />
            {/* Menu items can go here later */}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-9">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${restaurant.name}`}
                  className="pl-9 rounded-full bg-gray-100 border-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
                  <Button size="sm" className="rounded-full">
                    Delivery
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                  >
                    Pickup
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                  >
                    Group Order
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-medium text-teal-600 text-sm">
                      CA$0 delivery fee
                    </p>
                    <p className="text-xs text-muted-foreground">
                      pricing & fees
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-full">
                    <span>Opens 6:30 AM</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Deals & benefits</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost">See All</Button>
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="flex items-center p-4 gap-4">
                  <Tag className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="font-bold text-sm">50TREAT - 50% off your first order</h3>
                    <p className="text-xs text-muted-foreground">50TREAT - 50% off your first order of $15+, up to $15</p>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground"/>
                </Card>
                <Card className="flex items-center p-4 gap-4">
                  <Badge variant="outline">DashPass</Badge>
                  <div>
                    <h3 className="font-bold text-sm">Get $0 delivery fees with DashPass</h3>
                    <p className="text-xs text-muted-foreground">Plus, low service fees. Sign up now.</p>
                  </div>
                   <Button size="sm" variant="secondary" className="ml-auto">Sign Up</Button>
                </Card>
              </div>
            </div>

            <div className="mt-8">
               <Separator className="my-8" />
                {restaurant.menu.map((category, index) => (
                    <div key={category.title}>
                    <h2 className="text-2xl font-semibold mt-6 mb-4">{category.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items.map((item) => (
                        <MenuItem key={item.id} item={item} />
                        ))}
                    </div>
                    {index < restaurant.menu.length - 1 && <Separator className="my-8" />}
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
