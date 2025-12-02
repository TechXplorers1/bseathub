'use client';

import * as React from 'react';
import type { MenuItem as MenuItemType, Restaurant } from '@/lib/types';
import { MenuNav } from './MenuNav';
import { MenuItem } from './MenuItem';
import { MenuItemDialog } from './MenuItemDialog';
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
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function RestaurantDetails({
  restaurant,
  chefName,
}: {
  restaurant: Restaurant;
  chefName?: string;
}) {
  const [selectedItem, setSelectedItem] = React.useState<MenuItemType | null>(null);

  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
  };

  // Function to smoothly scroll to a section by its ID, accounting for the sticky header
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120; // Adjust for sticky header height (top-[64px] + a little extra)
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const displayName = chefName ? chefName : restaurant.name;
  const featuredItems =
    restaurant.menu.find((c) => c.title === 'Featured Items')?.items || [];

  // Define all possible categories including static sections for Restaurant
  const restaurantNavItems = [
    'Deals & Discounts',
    'Featured Items',
    ...restaurant.menu.map((cat) => cat.title).filter(title => title !== 'Featured Items'), // All other dynamic menu categories
    'Reviews',
  ].filter(Boolean); // Filter out any null/undefined entries

  // Define all possible categories including static sections for Chef
  const chefNavItems = ['About', 'Specialties', 'Signature Dishes', 'Reviews', 'Book a Chef', ...restaurant.menu.map((cat) => cat.title)].filter(Boolean);


  const mainCategories = [
    { name: 'Starters', id: 'Starters / Appetisers' },
    { name: 'Main Course', id: 'Main Course (Veg)' },
    { name: 'Desserts', id: 'Desserts' },
    { name: 'Beverages', id: 'Beverages (Hot & Cold)' },
  ];

  // Component to wrap sections and apply common animation/transition
  const AnimatedSection: React.FC<React.PropsWithChildren<{ id: string }>> = ({ id, children }) => (
    <section
        id={id}
        className={cn(
            "scroll-mt-32", // Offset for sticky header
            "pb-8 pt-4", // Consistent padding around sections
            "transition-all duration-500 ease-in-out"
        )}
    >
      {children}
    </section>
  );

  // =============== CHEF / HOMEFOOD PAGE ===============
  if (chefName) {
    return (
      <div className="flex flex-col bg-background">
        <ChefHero restaurant={restaurant} chefName={chefName} />

        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12">
            
            {/* ⬅️ SIDEBAR (STICKY & RESPONSIVE) */}
            <div className="lg:col-span-1 lg:border-r lg:pr-8">
              <div className="lg:sticky lg:top-24 self-start h-full pb-8">
                <RestaurantInfo
                  restaurant={restaurant}
                  displayName={displayName}
                  isChefPage={true}
                />
                <Separator className="my-6" />
                
                {/* Vertical Menu Nav for Desktop */}
                <div className="hidden lg:block">
                  <MenuNav navItems={chefNavItems} hasChef={true} />
                </div>
                
                {/* Mobile horizontal menu nav (for Chef content) */}
                <div className="lg:hidden -mx-4 px-4 pt-4">
                  <MenuNav
                    navItems={chefNavItems}
                    hasChef={true}
                    orientation="horizontal"
                  />
                </div>
                
              </div>
            </div>

            {/* ➡️ MAIN CONTENT (ANIMATED SECTIONS) */}
            <div className="lg:col-span-4 overflow-hidden">
              <AnimatedSection id="About">
                <ChefAbout restaurant={restaurant} chefName={chefName} />
              </AnimatedSection>

              <Separator className="my-10" />

              <AnimatedSection id="Specialties">
                <h2 className="text-3xl font-bold mb-6">Specialties</h2>
                <ChefCuisineSpecialties
                  cuisines={[restaurant.cuisine, ...restaurant.categories]}
                />
              </AnimatedSection>

              <Separator className="my-10" />

              <AnimatedSection id="Signature Dishes">
                <h2 className="text-3xl font-bold mb-6">Signature Dishes</h2>
                <ChefGallery />
              </AnimatedSection>

              <Separator className="my-10" />

              <AnimatedSection id="Reviews">
                <ReviewsSection />
              </AnimatedSection>

              <Separator className="my-10" />

              <AnimatedSection id="Book a Chef">
                <h2 className="text-3xl font-bold mb-6">Book This Chef</h2>
                <BookChef chefName={chefName} />
              </AnimatedSection>

              {/* Dynamic Menu Categories for Chef */}
              {restaurant.menu.length > 0 && (
                <>
                  <Separator className="my-10" />
                  <h2 className="text-3xl font-bold mb-6">Chef's Menu</h2>
                  <div className="space-y-10">
                    {restaurant.menu.map((category, index) => (
                      <AnimatedSection key={category.title} id={category.title}>
                        <h3 className="text-2xl font-semibold mb-4">
                          {category.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {category.items.map((item) => (
                            <MenuItem
                              key={item.id}
                              item={item}
                              onClick={() => handleItemClick(item)}
                            />
                          ))}
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {selectedItem && (
          <MenuItemDialog
            item={selectedItem}
            open={!!selectedItem}
            onOpenChange={(open) => {
              if (!open) setSelectedItem(null);
            }}
          />
        )}
      </div>
    );
  }

  // =============== NORMAL RESTAURANT PAGE ===============
  return (
    <div className="flex flex-col bg-background">
      <RestaurantHero restaurant={restaurant} />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12">
          
          {/* ⬅️ LEFT SIDEBAR (STICKY & RESPONSIVE) */}
          <div className="lg:col-span-1 lg:border-r lg:pr-8">
            <div className="lg:sticky lg:top-24 self-start h-full pb-8">
              <RestaurantInfo restaurant={restaurant} displayName={displayName} />
              <Separator className="my-6" />
              
              {/* Vertical Menu Nav for Desktop */}
              <div className="hidden lg:block">
                <MenuNav navItems={restaurantNavItems} hasChef={false} />
              </div>
            </div>
          </div>

          {/* ➡️ MAIN CONTENT (ANIMATED SECTIONS) */}
          <div className="lg:col-span-4 overflow-hidden">
            
            {/* TOP STICKY BAR (Search & Quick Nav) */}
            <div className="sticky top-[64px] bg-background pt-4 pb-2 z-20 border-b space-y-3 transition-all duration-300 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Search Field */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${restaurant.name}`}
                    className="pl-9 rounded-full bg-gray-100 border-none transition-shadow duration-300 focus-within:shadow-md"
                  />
                </div>
                
                {/* Quick Category Buttons (Only for Restaurant Page, not Chef) */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                  {mainCategories.map((category) => (
                    <Button
                      key={category.name}
                      variant="outline"
                      className="rounded-full hover:bg-primary/10 transition-colors duration-200"
                      onClick={() => scrollToCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* MOBILE HORIZONTAL MENU NAV (Below Search Bar) */}
              <div className="lg:hidden -mx-4 px-4">
                <MenuNav
                  navItems={restaurantNavItems}
                  hasChef={false}
                  orientation="horizontal"
                />
              </div>
            </div>

            {/* DEALS & DISCOUNTS */}
            {/* Only render if restaurant has deals - for demo, we assume it does */}
            <AnimatedSection id="Deals & Discounts">
              <h2 className="text-3xl font-bold mb-6">Deals & Discounts</h2>
              <DealsAndDiscounts />
            </AnimatedSection>

            <Separator className="my-10" />

            {/* FEATURED ITEMS */}
            {featuredItems.length > 0 && (
              <>
                <AnimatedSection id="Featured Items">
                  {/* <h2 className="text-3xl font-bold mb-6">Featured Items</h2> */}
                  <FeaturedItems items={featuredItems} onItemClick={handleItemClick} />
                </AnimatedSection>
                <Separator className="my-10" />
              </>
            )}

            {/* REVIEWS */}
            <AnimatedSection id="Reviews">
              {/* <h2 className="text-3xl font-bold mb-6">Reviews</h2> */}
              <ReviewsSection />
            </AnimatedSection>

            <Separator className="my-10" />

            <h2 className="text-3xl font-bold mb-6">Full Menu</h2>

            {/* MENU CATEGORIES */}
            <div className="space-y-10">
              {restaurant.menu.map((category, index) => {
                if (category.title === 'Featured Items') return null; // Featured is rendered above

                return (
                  <AnimatedSection key={category.title} id={category.title}>
                    <h3 className="text-2xl font-semibold mb-4">
                      {category.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items.map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          onClick={() => handleItemClick(item)}
                        />
                      ))}
                    </div>
                  </AnimatedSection>
                );
              })}
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