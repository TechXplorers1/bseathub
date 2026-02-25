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
import { cn } from '@/lib/utils';

type CategoryFilterKey = 'all' | 'starters' | 'main' | 'desserts' | 'beverages';

const getSectionId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function filterMenuByCategory(
  menu: Restaurant['menu'],
  filter: CategoryFilterKey
) {
  if (filter === 'all') return menu;

  const contains = (title: string, ...keywords: string[]) => {
    const lower = title.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  };

  return menu.filter((category) => {
    const title = category.title || '';
    switch (filter) {
      case 'starters':
        return contains(title, 'starter', 'appetiser', 'appetizer');
      case 'main':
        return contains(title, 'main course', 'main dish');
      case 'desserts':
        return contains(title, 'dessert', 'sweet');
      case 'beverages':
        return contains(
          title,
          'beverage',
          'drink',
          'mocktail',
          'shake',
          'juice'
        );
      default:
        return true;
    }
  });
}

export function RestaurantDetails({
  restaurant,
  chefName,
}: {
  restaurant: Restaurant;
  chefName?: string;
}) {
  const [selectedItem, setSelectedItem] = React.useState<MenuItemType | null>(
    null
  );
  const [categoryFilter, setCategoryFilter] =
    React.useState<CategoryFilterKey>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  // NEW: hero observer state + ref
  const heroRef = React.useRef<HTMLElement | null>(null);
  const [heroOutOfView, setHeroOutOfView] = React.useState(false);

  React.useEffect(() => {
    if (!heroRef.current) return;
    const el = heroRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // when hero is not intersecting the viewport -> heroOutOfView = true
        setHeroOutOfView(!e.isIntersecting);
      },
      {
        root: null,
        threshold: 0, // any intersection counts
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [heroRef.current]);

  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
  };

  const displayName = chefName ? chefName : restaurant.name;

  // Only keep categories that actually have items
  const nonEmptyMenu = React.useMemo(
    () =>
      (restaurant.menu ?? []).filter(
        (category) => category.items && category.items.length > 0
      ),
    [restaurant.menu]
  );

  // Which filters are actually available for this restaurant
  const availableFilterKeys: CategoryFilterKey[] = React.useMemo(() => {
    const keys: CategoryFilterKey[] = ['all'];
    if (filterMenuByCategory(nonEmptyMenu, 'starters').length > 0) {
      keys.push('starters');
    }
    if (filterMenuByCategory(nonEmptyMenu, 'main').length > 0) {
      keys.push('main');
    }
    if (filterMenuByCategory(nonEmptyMenu, 'desserts').length > 0) {
      keys.push('desserts');
    }
    if (filterMenuByCategory(nonEmptyMenu, 'beverages').length > 0) {
      keys.push('beverages');
    }
    return keys;
  }, [nonEmptyMenu]);

  React.useEffect(() => {
    if (!availableFilterKeys.includes(categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [availableFilterKeys, categoryFilter]);

  // Category + search filtering
  const filteredMenu = React.useMemo(() => {
    const byCategory = filterMenuByCategory(nonEmptyMenu, categoryFilter);
    const term = searchTerm.trim().toLowerCase();
    if (!term) return byCategory;

    return byCategory
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const name = item.name?.toLowerCase() ?? '';
          const desc = item.description?.toLowerCase() ?? '';
          return name.includes(term) || desc.includes(term);
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [nonEmptyMenu, categoryFilter, searchTerm]);

  const menuCategories = nonEmptyMenu.map((category) => category.title);

  const visibleItems = filteredMenu.flatMap((category) => category.items);
  const featuredItems = visibleItems.slice(0, 3);

  const filterButtons = ([
    { key: 'all', label: 'All' },
    { key: 'starters', label: 'Starters' },
    { key: 'main', label: 'Main course' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'beverages', label: 'Beverages' },
  ] as const).filter((btn) => availableFilterKeys.includes(btn.key as CategoryFilterKey));

  const scrollStyle = `
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  // helper classes that switch behavior depending on hero visibility
  const leftColumnClass = cn(
    'lg:col-span-1 lg:pr-4',
    // when hero is out of view -> enable sticky + internal scrolling
    heroOutOfView
      ? 'lg:border-r lg:sticky lg:top-24 self-start h-[calc(100vh-7rem)] overflow-y-auto pr-1 no-scrollbar'
      : 'pr-1' // while hero is visible, let it be normal flow (page scrolls)
  );

  const rightColumnClass = cn(
    'lg:col-span-4 lg:pr-1',
    heroOutOfView
      ? 'lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto no-scrollbar'
      : ''
  );

  // ----------------------------
  // Chef Page branch
  // ----------------------------
  if (chefName) {
    return (
      <div className="flex flex-col bg-background">
        <style>{scrollStyle}</style>

        {/* Wrap the hero (chef) with the ref we observe */}
        <div ref={(el) => (heroRef.current = el as any)}>
          <ChefHero restaurant={restaurant} chefName={chefName} />
        </div>

        <div className="mx-auto w-full px-4 sm:px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-6 gap-2">
            <div className={leftColumnClass}>
              {/* While hero visible these will flow naturally (no internal scroll),
                  once hero out of view the classes above make this sticky + scrollable */}
              <RestaurantInfo
                restaurant={restaurant}
                displayName={displayName}
                isChefPage={true}
              />
              <Separator className="my-3" />
              <MenuNav menuCategories={[]} hasChef={true} />
            </div>

            <div className={rightColumnClass}>
              <ChefAbout restaurant={restaurant} chefName={chefName} />
              <Separator className="my-4 md:my-5" />
              <ChefCuisineSpecialties
                cuisines={[restaurant.cuisine, ...restaurant.categories]}
              />
              <Separator className="my-4 md:my-5" />
              <div id="signature-dishes">
                <ChefGallery />
              </div>
              <Separator className="my-4 md:my-5" />
              <ReviewsSection />
              <Separator className="my-4 md:my-5" />
              <BookChef chefName={chefName} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Normal Restaurant Page branch
  // ----------------------------
  return (
    <div className="flex flex-col bg-background">
      <style>{scrollStyle}</style>

      {/* Observe this hero too */}
      <div ref={(el) => (heroRef.current = el as any)}>
        <RestaurantHero restaurant={restaurant} />
      </div>

      <div className="mx-auto w-full px-4 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-6 gap-2">
          {/* Left Sidebar */}
          <div className={leftColumnClass}>
            <RestaurantInfo restaurant={restaurant} displayName={displayName} />
            <Separator className="my-3" />
            <MenuNav menuCategories={menuCategories} hasChef={!!chefName} />
          </div>

          {/* Right Content */}
          <div className={rightColumnClass}>
            {/* Search + filter area */}
            <div className="pt-3 pb-2 border-b">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="relative w-full sm:max-w-md md:max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${restaurant.name}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 rounded-full bg-gray-50 border border-gray-200 text-black placeholder:text-slate-400 focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-0 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full h-9 px-4 border-gray-200 text-black hover:border-orange-400 hover:text-orange-500 transition-colors text-xs sm:text-sm"
                    >
                      <span>Opens 6:30 AM</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Category filter buttons */}
                {filterButtons.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {filterButtons.map((btn) => (
                      <Button
                        key={btn.key}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCategoryFilter(btn.key)}
                        className={cn(
                          'rounded-full px-3 py-1 text-[11px] sm:text-xs md:text-sm font-semibold transition-all duration-200 border',
                          categoryFilter === btn.key
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm hover:bg-orange-600'
                            : 'bg-white text-black border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                        )}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Deals & Discounts */}
            <section id="deals-and-discounts" className="mt-3 md:mt-4">
              <DealsAndDiscounts />
            </section>

            <Separator className="my-4 md:my-5" />

            {/* Featured Items */}
            {featuredItems.length > 0 && (
              <>
                <section id="featured-items">
                  <FeaturedItems
                    items={featuredItems}
                    onItemClick={handleItemClick}
                  />
                </section>
                <Separator className="my-4 md:my-5" />
              </>
            )}

            {/* Full Menu */}
            <div className="mt-2 pb-5 md:pb-6">
              {nonEmptyMenu.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">
                  Menu coming soon for this restaurant.
                </p>
              ) : filteredMenu.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">
                  No items match your filters.
                </p>
              ) : (
                filteredMenu.map((category, index) => (
                  <React.Fragment key={category.title}>
                    <section id={getSectionId(category.title)}>
                      <h2 className="text-xl md:text-2xl font-bold text-black mt-4 mb-3 tracking-tight transition-transform duration-200 hover:translate-x-1">
                        {category.title}
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {category.items.map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            onClick={() => handleItemClick(item)}
                          />
                        ))}
                      </div>
                    </section>
                    {index < filteredMenu.length - 1 && (
                      <Separator className="my-4 md:my-5" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Reviews at bottom */}
            <section id="reviews">
              <ReviewsSection />
            </section>

            <Separator className="my-4 md:my-5" />
          </div>
        </div>
      </div>

      {/* Item dialog */}
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
