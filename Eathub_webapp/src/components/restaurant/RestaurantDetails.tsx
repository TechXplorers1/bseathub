'use client';

import * as React from 'react';
import type { MenuItem as MenuItemType, Restaurant, MenuCategory } from '@/lib/types';
import { MenuNav } from './MenuNav';
import { MenuItem } from './MenuItem';
import { MenuItemDialog } from './MenuItemDialog';
import { fetchGroupedMenu } from '@/services/api';
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
import { getTodayOpeningTime } from '@/lib/hours-utils';
import { useHeader } from '@/context/HeaderProvider';

type CategoryFilterKey = string;

const getSectionId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

const getDisplayName = (r: Restaurant, cName?: string) => {
  if (cName) return cName;
  const name = r.name || '';
  if (isEmail(name)) {
    // Attempt fallback to brand name or other identity fields if the name column contains an email
    return (r as any).brandName || (r as any).legalBusinessName || (r as any).ownerName || name;
  }
  return name;
};

function filterMenuByCategory(
  menu: MenuCategory[],
  filter: CategoryFilterKey
) {
  if (filter === 'all') return menu;
  return menu.filter((category) => category.title === filter);
}

export function RestaurantDetails({
  restaurant,
  chefName,
}: {
  restaurant: Restaurant;
  chefName?: string;
}) {
  const [selectedItem, setSelectedItem] = React.useState<MenuItemType | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilterKey>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [menu, setMenu] = React.useState<MenuCategory[]>(restaurant.menu || []);
  const [loadingMenu, setLoadingMenu] = React.useState(false);
  const [hasFetchedMenu, setHasFetchedMenu] = React.useState(false);

  const { searchQuery, setLocalItems } = useHeader();
  const searchSectionRef = React.useRef<HTMLDivElement>(null);

  const displayName = React.useMemo(() => getDisplayName(restaurant, chefName), [restaurant, chefName]);

  // Sync menu and header search
  React.useEffect(() => {
    async function loadMenu() {
      if (restaurant.id && !hasFetchedMenu) {
        setLoadingMenu(true);
        try {
          const normalizedType = restaurant.type?.toLowerCase();
          const providerType = (normalizedType === 'home-food' || normalizedType === 'homefood') ? 'home-food' : 'restaurant';
          const grouped = await fetchGroupedMenu(restaurant.id, providerType as any);
          if (grouped && Array.isArray(grouped)) {
            setMenu(grouped);
            const flattened = grouped.flatMap((cat: any) =>
              cat.items.map((item: any) => ({
                ...item,
                vendorSlug: restaurant.slug,
                vendorName: restaurant.name,
                vendorType: restaurant.type
              }))
            );
            setLocalItems(flattened);
          }
          setHasFetchedMenu(true);
        } catch (error) {
          setHasFetchedMenu(true);
        } finally {
          setLoadingMenu(false);
        }
      }
    }
    loadMenu();
    return () => setLocalItems(null);
  }, [restaurant.id, restaurant.type, hasFetchedMenu, restaurant.slug, restaurant.name, setLocalItems]);

  // Scroll to results when searching in header
  React.useEffect(() => {
    if (searchQuery && searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery]);

  const heroRef = React.useRef<HTMLElement | null>(null);
  const [heroOutOfView, setHeroOutOfView] = React.useState(false);

  React.useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(([e]) => setHeroOutOfView(!e.isIntersecting), { threshold: 0 });
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handleItemClick = (item: MenuItemType) => setSelectedItem(item);

  const nonEmptyMenu = React.useMemo(() => (menu ?? []).filter(c => c.items?.length > 0), [menu]);

  const availableFilterKeys = React.useMemo(() => {
    const keys: string[] = ['all'];
    nonEmptyMenu.forEach(cat => cat.title && keys.push(cat.title));
    return keys;
  }, [nonEmptyMenu]);

  const filteredMenu = React.useMemo(() => {
    const byCategory = filterMenuByCategory(nonEmptyMenu, categoryFilter);
    const term = (searchQuery || searchTerm).trim().toLowerCase();
    if (!term) return byCategory;

    return byCategory
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [nonEmptyMenu, categoryFilter, searchTerm, searchQuery]);

  const menuCategories = nonEmptyMenu.map(c => c.title);
  const featuredItems = filteredMenu.flatMap(c => c.items).slice(0, 3);

  const filterButtons = availableFilterKeys.map(key => ({ key, label: key === 'all' ? 'All' : key }));

  const leftColumnClass = cn(
    'lg:col-span-1 lg:pr-4',
    heroOutOfView
      ? 'lg:border-r lg:sticky lg:top-24 self-start'
      : ''
  );

  const rightColumnClass = cn(
    'lg:col-span-8 xl:col-span-9'
  );

  const scrollStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

  if (chefName) {
    return (
      <div className="flex flex-col bg-background relative w-full">
        <style>{scrollStyle}</style>
        <div ref={heroRef as any} className="w-full relative">
          <ChefHero restaurant={restaurant} chefName={displayName} />
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 lg:pt-6">
            <div className={cn(leftColumnClass, "lg:col-span-4 xl:col-span-3")}>
              <RestaurantInfo restaurant={restaurant} displayName={displayName} isChefPage={true} />
              <Separator className="my-3" /><MenuNav menuCategories={[]} hasChef={true} />
            </div>
            <div className={cn(rightColumnClass, "lg:col-span-8 xl:col-span-9")}>
              <ChefAbout restaurant={restaurant} chefName={displayName} />
              <Separator className="my-5" /><ChefCuisineSpecialties cuisines={[restaurant.cuisine, ...restaurant.categories]} />
              <Separator className="my-5" /><div id="signature-dishes"><ChefGallery /></div>
              <Separator className="my-5" /><ReviewsSection targetId={restaurant.id} type="Chef" />
              <Separator className="my-5" /><BookChef chefName={displayName} chefId={restaurant.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background min-h-screen w-full relative">
      <style>{scrollStyle}</style>
      <div ref={heroRef as any} className="w-full relative">
        <RestaurantHero restaurant={restaurant} displayName={displayName} />
      </div>
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 lg:pt-6">
          <div className={cn(leftColumnClass, "lg:col-span-4 xl:col-span-3")}>
            <RestaurantInfo restaurant={restaurant} displayName={displayName} />
            <Separator className="my-3" /><MenuNav menuCategories={menuCategories} hasChef={false} />
          </div>
          <div className={cn(rightColumnClass, "lg:col-span-8 xl:col-span-9")}>
            <div ref={searchSectionRef} className="pt-3 pb-2 border-b px-4 sm:px-0">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="relative w-full sm:max-w-md md:max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${restaurant.name}`}
                      value={searchQuery || searchTerm}
                      onChange={(e) => {
                        if (searchQuery) { /* Read only if header is active */ }
                        else setSearchTerm(e.target.value);
                      }}
                      className="pl-9 rounded-full bg-gray-50 border border-gray-200 text-black placeholder:text-slate-400 focus-visible:border-orange-500 transition-colors"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full h-9 px-4 text-xs sm:text-sm">
                    {restaurant.workingHours ? `Opens ${getTodayOpeningTime(restaurant.workingHours)}` : 'Hours not available'}<ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {filterButtons.length > 1 && (
                  <div className="hidden lg:flex flex-wrap gap-1.5">
                    {filterButtons.map(btn => (
                      <Button
                        key={btn.key}
                        size="sm"
                        variant="outline"
                        onClick={() => setCategoryFilter(btn.key)}
                        className={cn('rounded-full px-3 text-xs md:text-sm font-semibold transition-all', categoryFilter === btn.key ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-black')}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <section id="deals-and-discounts" className="mt-2 px-4 sm:px-0 scroll-mt-28"><DealsAndDiscounts /></section>
            <Separator className="my-5" />
            {featuredItems.length > 0 && (
              <section id="featured-items" className="scroll-mt-28"><FeaturedItems items={featuredItems} onItemClick={handleItemClick} /><Separator className="my-5" /></section>
            )}
            <div className="mt-2 pb-6 px-4 sm:px-0">
              {nonEmptyMenu.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">Menu coming soon for this restaurant.</p>
              ) : filteredMenu.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">No items match your filters.</p>
              ) : (
                filteredMenu.map((category, index) => (
                  <React.Fragment key={category.title}>
                    <section id={getSectionId(category.title)} className="scroll-mt-28">
                      <section className="mb-6 overflow-hidden px-4 sm:px-0">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1 tracking-tight">{category.title}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.items.map(item => <MenuItem key={item.id} item={item} onClick={() => handleItemClick(item)} />)}
                        </div>
                      </section>
                    </section>
                    {index < filteredMenu.length - 1 && <Separator className="my-5" />}
                  </React.Fragment>
                ))
              )}
            </div>
            <section id="reviews" className="px-4 sm:px-0 scroll-mt-28">
              <ReviewsSection targetId={restaurant.id} type={(restaurant.type?.toLowerCase() === 'home-food' || restaurant.type?.toLowerCase() === 'homefood') ? 'HomeFood' : 'Restaurant'} />
            </section>
            <Separator className="my-5" />
          </div>
        </div>
      </div>
      {selectedItem && (
        <MenuItemDialog item={selectedItem} restaurant={restaurant} open={!!selectedItem} onOpenChange={open => !open && setSelectedItem(null)} />
      )}
    </div>
  );
}
