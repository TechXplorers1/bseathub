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
            const flattened = grouped.flatMap(cat => 
              cat.items.map(item => ({ 
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

  const displayName = chefName || restaurant.name;

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
  const visibleItems = filteredMenu.flatMap(c => c.items);
  const featuredItems = visibleItems.slice(0, 3);

  const filterButtons = availableFilterKeys.map(key => ({ key, label: key === 'all' ? 'All' : key }));

  const leftColumnClass = cn(
    'lg:col-span-1 lg:pr-4',
    heroOutOfView
      ? 'lg:border-r lg:sticky lg:top-24 self-start h-[calc(100vh-7rem)] overflow-y-auto pr-1 no-scrollbar'
      : 'pr-1'
  );

  const rightColumnClass = cn(
    'lg:col-span-4 lg:pr-1',
    heroOutOfView ? 'lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto no-scrollbar' : ''
  );

  const scrollStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

  if (chefName) {
    return (
      <div className="flex flex-col bg-background">
        <style>{scrollStyle}</style>
        <div ref={heroRef as any}><ChefHero restaurant={restaurant} chefName={chefName} /></div>
        <div className="mx-auto w-full px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={leftColumnClass}>
              <RestaurantInfo restaurant={restaurant} displayName={displayName} isChefPage={true} />
              <Separator className="my-3" /><MenuNav menuCategories={[]} hasChef={true} />
            </div>
            <div className={rightColumnClass}>
              <ChefAbout restaurant={restaurant} chefName={chefName} />
              <Separator className="my-5" /><ChefCuisineSpecialties cuisines={[restaurant.cuisine, ...restaurant.categories]} />
              <Separator className="my-5" /><div id="signature-dishes"><ChefGallery /></div>
              <Separator className="my-5" /><ReviewsSection targetId={restaurant.id} type="Chef" />
              <Separator className="my-5" /><BookChef chefName={chefName} chefId={restaurant.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background">
      <style>{scrollStyle}</style>
      <div ref={heroRef as any}><RestaurantHero restaurant={restaurant} /></div>
      <div className="mx-auto w-full px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className={leftColumnClass}>
            <RestaurantInfo restaurant={restaurant} displayName={displayName} />
            <Separator className="my-3" /><MenuNav menuCategories={menuCategories} hasChef={false} />
          </div>
          <div className={rightColumnClass}>
            <div ref={searchSectionRef} className="pt-3 pb-2 border-b">
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
                  <div className="flex flex-wrap gap-1.5">
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
            <section id="deals-and-discounts" className="mt-4"><DealsAndDiscounts /></section>
            <Separator className="my-5" />
            {featuredItems.length > 0 && (
              <section id="featured-items"><FeaturedItems items={featuredItems} onItemClick={handleItemClick} /><Separator className="my-5" /></section>
            )}
            <div className="mt-2 pb-6">
              {nonEmptyMenu.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">Menu coming soon for this restaurant.</p>
              ) : filteredMenu.length === 0 ? (
                <p className="text-sm text-slate-500 mt-2">No items match your filters.</p>
              ) : (
                filteredMenu.map((category, index) => (
                  <React.Fragment key={category.title}>
                    <section id={getSectionId(category.title)}>
                      <h2 className="text-xl md:text-2xl font-bold text-black mt-4 mb-3 tracking-tight">{category.title}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items.map(item => <MenuItem key={item.id} item={item} onClick={() => handleItemClick(item)} />)}
                      </div>
                    </section>
                    {index < filteredMenu.length - 1 && <Separator className="my-5" />}
                  </React.Fragment>
                ))
              )}
            </div>
            <section id="reviews">
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
