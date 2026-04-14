'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { AboutCard } from './AboutCard';
import { ModernChefHero } from './ModernChefHero';
import { QuickInfoCard } from './QuickInfoCard';
import { ReviewsSection } from '../restaurant/ReviewsSection';
import { SignatureDishes } from './SignatureDishes';
import { SpecialtiesCard } from './SpecialtiesCard';
import type { Restaurant, MenuCategory, MenuItem as MenuItemType } from '@/lib/types';
import { BookChef } from './BookChef';
import { cn } from '@/lib/utils';
import { fetchGroupedChefServices } from '@/services/api';
import { MenuItem } from '../restaurant/MenuItem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MenuItemDialog } from '../restaurant/MenuItemDialog';
import { useHeader } from '@/context/HeaderProvider';

type ChefTab = 'book' | 'signature' | 'enquiry';

interface ModernChefPageProps {
  restaurant: Restaurant;
  chefName: string;
}

export function ModernChefPage({ restaurant, chefName }: ModernChefPageProps) {
  const [activeTab, setActiveTab] = useState<ChefTab>('book');
  const [animatingSection, setAnimatingSection] = useState<ChefTab | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

  const [services, setServices] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const { searchQuery, setLocalItems } = useHeader();
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServices = async () => {
      if (restaurant.id && !hasFetched) {
        setLoading(true);
        try {
          const grouped = await fetchGroupedChefServices(restaurant.id);
          if (grouped && Array.isArray(grouped)) {
            setServices(grouped);
            const flattened = grouped.flatMap(cat => 
                cat.items.map((item: MenuItemType) => ({
                    ...item,
                    vendorSlug: restaurant.slug,
                    vendorName: restaurant.name,
                    vendorType: 'restaurant'
                }))
            );
            setLocalItems(flattened);
          }
          setHasFetched(true);
        } catch (err) {
          setHasFetched(true);
        } finally {
          setLoading(false);
        }
      }
    };
    loadServices();
    return () => setLocalItems(null);
  }, [restaurant.id, hasFetched, restaurant.slug, restaurant.name, setLocalItems]);

  // Scroll to results when searching
  useEffect(() => {
    if (searchQuery && searchSectionRef.current) {
        searchSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery]);

  const signatureRef = useRef<HTMLDivElement | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);

  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;
    const q = searchQuery.toLowerCase();
    return services
      .map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.name.toLowerCase().includes(q) || 
          item.description?.toLowerCase().includes(q)
        )
      }))
      .filter(category => category.items.length > 0);
  }, [services, searchQuery]);

  const signatures = useMemo(() => {
    const flat = filteredServices.flatMap(s => s.items);
    const explicit = flat.filter(item => item.isSignature);
    return explicit.length > 0 ? explicit.slice(0, 5) : flat.slice(0, 5);
  }, [filteredServices]);

  const handleTabChange = (tab: ChefTab) => {
    setActiveTab(tab);
    const targetEl = tab === 'signature' ? signatureRef.current : bookingRef.current;
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const offset = 90;
    const targetY = window.scrollY + rect.top - offset;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setAnimatingSection(tab);
    setTimeout(() => { setAnimatingSection(null); }, 600);
  };

  return (
    <div className="bg-muted/40 flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ModernChefHero restaurant={restaurant} chefName={chefName} activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 space-y-4">
            <AboutCard chefName={restaurant.name || chefName} bio={restaurant.bio} experience={restaurant.experience} city={restaurant.city} />
            <SpecialtiesCard specialty={restaurant.specialty} />

            {signatures.length > 0 && (
                <section id="signature-dishes" ref={signatureRef} className={cn('scroll-mt-28 transition-all duration-300 rounded-xl overflow-hidden', activeTab === 'signature' ? 'ring-2 ring-orange-500 shadow-sm' : '', animatingSection === 'signature' ? 'animate-highlight-pop' : '')}>
                  <SignatureDishes items={signatures} restaurant={restaurant} />
                </section>
            )}

            <div ref={searchSectionRef}>
                <section ref={servicesRef} className="space-y-4">
                    {filteredServices.length === 0 && searchQuery && (
                        <div className="bg-white p-8 rounded-xl text-center shadow-lg border-2 border-dashed border-muted mt-4">
                            <p className="font-bold text-muted-foreground italic">No matching services found for Chef {chefName}.</p>
                        </div>
                    )}
                    <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/60 bg-white rounded-2xl flex flex-col h-[800px]">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 py-5">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                <span className="w-2 h-8 bg-primary rounded-full" />
                                Chef's Menu & Services
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10 scroll-smooth">
                            {filteredServices.map((category, idx) => (
                                <div key={category.title} id={category.title} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">{category.title}</h3>
                                        <div className="h-px bg-muted flex-1" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {category.items.map((item) => (
                                            <MenuItem 
                                                key={item.id} 
                                                item={item as any} 
                                                onClick={() => setSelectedItem(item as any)} 
                                                hideAddButton={true} 
                                                hidePrice={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
            <ReviewsSection targetId={restaurant.id} type="Chef" />
            <QuickInfoCard workingHours={restaurant.workingHours} preference={restaurant.preference} />
            <section id="book-chef" ref={bookingRef} className={cn('scroll-mt-28 transition-all duration-300 rounded-[3rem] contain-paint p-1.5', (activeTab === 'book' || activeTab === 'enquiry') ? 'ring-[6px] ring-orange-500 shadow-2xl' : '', (animatingSection === 'book' || animatingSection === 'enquiry') ? 'animate-highlight-pop' : '')}>
              <BookChef chefName={restaurant.name || chefName} chefId={restaurant.id} basePrice={restaurant.basePrice} services={services} />
            </section>
          </div>
        </div>
      </div>
      {selectedItem && (
        <MenuItemDialog 
            item={selectedItem} 
            restaurant={restaurant} 
            open={!!selectedItem} 
            onOpenChange={(open) => !open && setSelectedItem(null)} 
            hideAddButton={true}
            hidePrice={true}
        />
      )}
    </div>
  );
}