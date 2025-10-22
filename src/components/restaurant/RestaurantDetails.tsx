'use client';

import * as React from 'react';
import Image from 'next/image';
import type { MenuItem as MenuItemType, Restaurant } from '@/lib/types';
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
import { AddReviewDialog } from './AddReviewDialog';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { MenuItemDialog } from './MenuItemDialog';
import { BookingForm } from '../chef/BookingForm';
import { ChefGallery } from '../chef/ChefGallery';

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

type Review = { author: string, text: string, rating: number, avatar: string };

function ReviewCard({ review }: { review: Review }) {
    return (
        <Card className="w-[300px] flex-shrink-0">
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
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{review.text}</p>
            </CardContent>
        </Card>
    )
}

const initialReviews: Review[] = [
    { author: "Jane D.", text: "Absolutely delicious! The carbonara was to die for. Will be ordering again soon.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { author: "John S.", text: "Good food, but the delivery was a bit slow. The pizza was still warm though.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e" },
    { author: "Mike L.", text: "The Calamari Fritti was a bit soggy, but the main course was great. Overall a good experience.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f" },
    { author: "Sarah B.", text: "Wow! The sushi was incredibly fresh and beautifully presented. Best I've had in a long time.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" },
    { author: "Tom H.", text: "Burger was juicy and cooked perfectly. Fries were a little cold on arrival, but still good.", rating: 4, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706e" },
    { author: "Emily R.", text: "The vegan options are amazing! So much flavor and creativity. Highly recommend the power bowl.", rating: 5, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707f" },
];

export function RestaurantDetails({ restaurant, chefName }: { restaurant: Restaurant, chefName?: string }) {
  const image = getImageById(restaurant.imageId);
  const logo = getImageById('restaurant-3'); // Using a placeholder for logo
  const menuCategories = restaurant.menu.map(cat => cat.title);
  const mostOrderedItems = [...restaurant.menu.flatMap(c => c.items)].sort(() => 0.5 - Math.random()).slice(0, 3);
  const featuredItems = [...restaurant.menu.flatMap(c => c.items)].sort(() => 0.5 - Math.random()).slice(0, 3);
  
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MenuItemType | null>(null);

  const handleAddReview = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
  };
  
  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
  };

  const displayName = chefName ? `Chef's ${chefName}` : restaurant.name;

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
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          
          {/* Left Column - Store Info & Menu Nav */}
          <div className="lg:col-span-1 lg:border-r lg:pr-8">
            <div className='lg:sticky lg:top-24 self-start'>
              <h1 className="text-4xl font-bold mt-8 lg:mt-0">{displayName}</h1>
              <div className="mt-6 space-y-3 text-sm">
                <h2 className="text-lg font-semibold sr-only lg:not-sr-only">Store Info</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Eat Hub</Badge>
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
              <div className="hidden lg:block">
                 <MenuNav menuCategories={menuCategories} hasChef={!!chefName} />
              </div>
            </div>
          </div>

          {/* Right Column - Menu & Other info */}
          <div className="lg:col-span-3">
            {/* Search and Delivery Options */}
            <div className="sticky top-[88px] bg-background py-4 z-10 border-b -mt-2">
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

            {chefName && (
              <>
                <div className="mt-8" id="About">
                  <h2 className="text-2xl font-bold mb-4">About {chefName}</h2>
                  <p className="text-muted-foreground">
                    Chef {chefName} is the heart and soul behind {restaurant.name}, bringing authentic {restaurant.cuisine} flavors to your table. With over 15 years of experience in kitchens around the world, {chefName.split(' ')[0]} has a passion for using fresh, local ingredients to create memorable dining experiences. This home kitchen is a culmination of that passion, offering a menu that is both innovative and deeply rooted in tradition.
                  </p>
                </div>
                <Separator className="my-8" />
              </>
            )}

            {/* Deals & Discounts */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4" id="Deals & Discounts">Deals & Discounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-50">
                  <Tag className="h-6 w-6 text-primary" />
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
            
            {/* Featured Items Section */}
            <div id="Featured Items">
                <h2 className="text-2xl font-semibold mt-6 mb-4">Featured Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredItems.map((item) => (
                        <MenuItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
                    ))}
                </div>
            </div>

            <Separator className="my-8" />
            
            {/* Reviews Section */}
            <div id="Reviews">
                <div className="flex justify-between items-center mt-6 mb-4">
                  <h2 className="text-2xl font-semibold">Reviews</h2>
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(true)}>Add Review</Button>
                </div>
                <ScrollArea>
                    <div className="flex space-x-4 pb-4">
                        {reviews.map((review, index) => (
                            <ReviewCard key={index} review={review} />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            <Separator className="my-8" />

            {/* Most Ordered Section */}
            <div id="Most Ordered">
                <h2 className="text-2xl font-semibold mt-6 mb-4">Most Ordered</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mostOrderedItems.map((item) => (
                        <MenuItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
                    ))}
                </div>
            </div>

            {/* Menu Sections */}
            <div className="mt-8">
               <Separator className="my-8" />
                {restaurant.menu.map((category, index) => (
                    <React.Fragment key={category.title}>
                        <div id={category.title}>
                          <h2 className="text-2xl font-semibold mt-6 mb-4">{category.title}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {category.items.map((item) => (
                               <MenuItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
                              ))}
                          </div>
                        </div>

                        {chefName && category.title.toLowerCase() === 'dumplings' && (
                            <>
                                <ChefGallery />
                                <div className="my-8">
                                    <BookingForm chefName={chefName} />
                                </div>
                            </>
                        )}

                        {index < restaurant.menu.length - 1 && <Separator className="my-8" />}
                    </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </div>

      <AddReviewDialog 
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onSubmit={handleAddReview}
      />
       {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedItem(null);
            }
          }}
        />
      )}
    </div>
  );
}
