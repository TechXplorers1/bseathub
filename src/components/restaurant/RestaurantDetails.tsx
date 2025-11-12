'use client';

import * as React from 'react';
import type { MenuItem as MenuItemType, Restaurant } from '@/lib/types';
import { MenuNav } from './MenuNav';
import { MenuItem } from './MenuItem';
import { MenuItemDialog } from './MenuItemDialog';
import { BookingForm } from '../chef/BookingForm';
import { ChefGallery } from '../chef/ChefGallery';
import { ChefCuisineSpecialties } from '../chef/ChefCuisineSpecialties';
import { Separator } from '../ui/separator';
import { RestaurantHero } from './RestaurantHero';
import { RestaurantInfo } from './RestaurantInfo';
import { DealsAndDiscounts } from './DealsAndDiscounts';
import { FeaturedItems } from './FeaturedItems';
import { ReviewsSection } from './ReviewsSection';
import { ChefHero } from '../chef/ChefHero';
import { ChefAbout } from '../chef/ChefAbout';
import { BookChef } from '../chef/BookChef';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function RestaurantDetails({ restaurant, chefName }: { restaurant: Restaurant, chefName?: string }) {
  const menuCategories = restaurant.menu.map(cat => cat.title);
  const [selectedItem, setSelectedItem] = React.useState<MenuItemType | null>(null);

  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
  };

  const displayName = chefName ? chefName : restaurant.name;

  if (chefName) {
    return (
      <div className="flex flex-col bg-background">
        <ChefHero restaurant={restaurant} chefName={chefName} />
        
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-1 lg:border-r lg:pr-8">
              <div className='lg:sticky lg:top-24 self-start'>
                <RestaurantInfo restaurant={restaurant} displayName={displayName} isChefPage={true} />
                <Separator className="my-6" />
                <div className="hidden lg:block">
                   <MenuNav menuCategories={[]} hasChef={true} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ChefAbout restaurant={restaurant} chefName={chefName} />
              <Separator className="my-8" />
              <ChefCuisineSpecialties cuisines={[restaurant.cuisine, ...restaurant.categories]} />
              <Separator className="my-8" />
              <div id="Signature Dishes">
                  <ChefGallery />
              </div>
              <Separator className="my-8" />
              <ReviewsSection />
              <Separator className="my-8" />
              <BookChef chefName={chefName} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original Restaurant Details Page
  return (
    <div className="flex flex-col bg-background">
      <RestaurantHero restaurant={restaurant} />
      
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8">
          
          <div className="lg:col-span-1 lg:border-r lg:pr-8">
            <div className='lg:sticky lg:top-24 self-start h-full'>
              <RestaurantInfo restaurant={restaurant} displayName={displayName} />
              <Separator className="my-6" />
              <div className="hidden lg:block">
                 <MenuNav menuCategories={menuCategories} hasChef={!!chefName} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-[64px] bg-background py-4 z-10 border-b -mt-2">
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
            
            <DealsAndDiscounts />

            <Separator className="my-8" />
            
            <FeaturedItems items={restaurant.menu.flatMap(c => c.items).slice(0,3)} onItemClick={handleItemClick} />

            <Separator className="my-8" />
            
            <ReviewsSection />

            <Separator className="my-8" />

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
                        {index < restaurant.menu.length - 1 && <Separator className="my-8" />}
                    </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </div>

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
