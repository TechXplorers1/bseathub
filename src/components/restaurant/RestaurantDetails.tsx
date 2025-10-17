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
} from '../ui/card';
import { MenuNav } from './MenuNav';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

function ReviewStars({ rating, className }: { rating: number, className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.floor(rating)
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300 fill-gray-300"
          )}
        />
      ))}
    </div>
  );
}


function ReviewCard({ review }: { review: { author: string, text: string, rating: number, avatar: string } }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={review.avatar} alt={review.author} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{review.author}</p>
                        <ReviewStars rating={review.rating} />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{review.text}</p>
            </CardContent>
        </Card>
    )
}

export function RestaurantDetails({ restaurant }: { restaurant: Restaurant }) {
  const image = getImageById(restaurant.imageId);
  const logo = getImageById('restaurant-3'); // Using a placeholder for logo
  const menuCategories = restaurant.menu.map(cat => cat.title);
  const mostOrderedItems = [...restaurant.menu.flatMap(c => c.items)].sort(() => 0.5 - Math.random()).slice(0, 3);
  
  const reviews = [
    { author: "Jane D.", text: "Absolutely delicious! The carbonara was to die for. Will be ordering again soon.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { author: "John S.", text: "Good food, but the delivery was a bit slow. The pizza was still warm though.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e" },
    { author: "Mike L.", text: "The Calamari Fritti was a bit soggy, but the main course was great. Overall a good experience.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f" },
  ]

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
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
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform lg:left-8 lg:translate-x-0 h-20 w-20 rounded-full border-4 border-white bg-white overflow-hidden">
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
      
      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Store Info & Menu Nav */}
          <div className="lg:col-span-3">
            <div className='lg:sticky lg:top-24 self-start'>
              <h1 className="text-4xl font-bold mt-8 text-center lg:text-left">{restaurant.name}</h1>
              <div className="mt-6 space-y-3 text-sm">
                <h2 className="text-lg font-semibold sr-only lg:not-sr-only">Store Info</h2>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Badge variant="outline">Eat Hub</Badge>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 fill-foreground text-foreground" />
                  <span>
                    {restaurant.rating} ({restaurant.reviews > 1000 ? '1k+' : restaurant.reviews})
                  </span>
                  <span>•</span>
                  <span>2 mi</span>
                </div>
                <p className="text-muted-foreground text-center lg:text-left">$ • Canadian</p>
                <div className="flex items-center justify-center lg:justify-start gap-1 text-xs text-muted-foreground">
                  <span>Service fees apply</span>
                  <Info className="h-3 w-3" />
                </div>
                <Button variant="outline" className="w-full rounded-full max-w-xs mx-auto lg:max-w-full">
                  See More
                </Button>
              </div>
              <Separator className="my-6" />
              <div className="hidden lg:block">
                 <MenuNav menuCategories={menuCategories} />
              </div>
            </div>
          </div>

          {/* Right Column - Menu & Other info */}
          <div className="lg:col-span-9">
            {/* Search and Delivery Options */}
            <div className="sticky top-20 bg-background py-4 z-10 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${restaurant.name}`}
                    className="pl-9 rounded-full bg-gray-100 border-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="rounded-full">
                    <span>Opens 6:30 AM</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Items */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4" id="Featured Items">Featured Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-50">
                  <Tag className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="font-bold text-sm">50TREAT - 50% off your first order</h3>
                    <p className="text-xs text-muted-foreground">50TREAT - 50% off your first order of $15+, up to $15</p>
                  </div>
                </Card>
                <Card className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-50">
                  <Badge variant="outline">Eat Hub</Badge>
                  <div>
                    <h3 className="font-bold text-sm">Get $0 delivery fees with Eat Hub</h3>
                    <p className="text-xs text-muted-foreground">Plus, low service fees. Sign up now.</p>
                  </div>
                   <Button size="sm" variant="secondary" className="ml-auto">Sign Up</Button>
                </Card>
              </div>
            </div>

            <Separator className="my-8" />
            
            {/* Reviews Section */}
            <div id="Reviews">
                <h2 className="text-2xl font-semibold mt-6 mb-4">Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((review, index) => (
                        <ReviewCard key={index} review={review} />
                    ))}
                </div>
            </div>

            <Separator className="my-8" />

            {/* Most Ordered Section */}
            <div id="Most Ordered">
                <h2 className="text-2xl font-semibold mt-6 mb-4">Most Ordered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mostOrderedItems.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>
            </div>

            {/* Menu Sections */}
            <div className="mt-8">
               <Separator className="my-8" />
                {restaurant.menu.map((category, index) => (
                    <div key={category.title} id={category.title}>
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
