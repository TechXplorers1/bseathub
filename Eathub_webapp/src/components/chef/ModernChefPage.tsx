'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { AboutCard } from './AboutCard';
import { ModernChefHero } from './ModernChefHero';
import { QuickInfoCard } from './QuickInfoCard';
import { ReviewsSection } from '../restaurant/ReviewsSection';
import { SignatureDishes } from './SignatureDishes';
import { SpecialtiesCard } from './SpecialtiesCard';
import type { Restaurant, MenuCategory, MenuItem as MenuItemType } from '@/lib/types';
import { allHomeFoods } from '@/lib/data';
import { BookChef } from './BookChef';
import { cn } from '@/lib/utils';
import { fetchGroupedChefServices } from '@/services/api';
import { MenuItem } from '../restaurant/MenuItem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MenuItemDialog } from '../restaurant/MenuItemDialog';

type ChefTab = 'book' | 'signature' | 'enquiry';

interface ModernChefPageProps {
  restaurant: Restaurant;
  chefName: string;
}

export function ModernChefPage({ restaurant, chefName }: ModernChefPageProps) {
  // activeTab controls the persistent orange ring
  const [activeTab, setActiveTab] = useState<ChefTab>('book');
  // animatingSection controls the temporary zoom "pop" animation
  const [animatingSection, setAnimatingSection] = useState<ChefTab | null>(null);

  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

  const [services, setServices] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);


  // 👉 Memoize calculations to prevent re-computing on every re-render
  const allChefServices = useRef<MenuItemType[]>([]);
  const signatureDishes = useRef<MenuItemType[]>([]);

  // Update memoized lists when services change
  const { allServices, signatures } = useMemo(() => {
    const flat = services.flatMap(s => s.items);
    const explicit = flat.filter(item => item.isSignature);
    const finalSignatures = explicit.length > 0 
      ? explicit.slice(0, 5) 
      : flat.slice(0, 5);
    return { allServices: flat, signatures: finalSignatures };
  }, [services]);

  useEffect(() => {
    const loadServices = async () => {
      // Use existing services if already fetched to skip redundant loading state
      if (restaurant.id && !hasFetched) {
        setLoading(true);
        try {
          const grouped = await fetchGroupedChefServices(restaurant.id);
          if (grouped && Array.isArray(grouped)) {
            setServices(grouped);
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
  }, [restaurant.id, hasFetched]);

  const signatureRef = useRef<HTMLDivElement | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (tab: ChefTab) => {
    setActiveTab(tab);

    const targetEl =
      tab === 'signature' ? signatureRef.current : bookingRef.current;

    if (!targetEl) return;

    // 1. Start Scrolling
    const rect = targetEl.getBoundingClientRect();
    const offset = 90; // space for header
    const targetY = window.scrollY + rect.top - offset;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });

    // 2. Schedule Animation Sequence
    // Reduced delays for snappier feel
    const ANIMATION_DURATION = 600; // ms (must match CSS)

    // Trigger animation pop immediately for responsiveness
    setAnimatingSection(tab);

    // Stop animation after duration completes so it can be triggered again later
    setTimeout(() => {
      setAnimatingSection(null);
    }, ANIMATION_DURATION);
  };

  return (
    <div className="bg-muted/40 flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO + TABS */}
        <ModernChefHero
          restaurant={restaurant}
          chefName={chefName}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 space-y-4">
            <AboutCard 
              chefName={restaurant.name || chefName} 
              bio={restaurant.bio}
              experience={restaurant.experience}
              city={restaurant.city}
            />
            <SpecialtiesCard specialty={restaurant.specialty} />

            <section
              id="signature-dishes"
              ref={signatureRef}
              style={{ contentVisibility: 'auto', containIntrinsicHeight: '500px' }}
              className={cn(
                'scroll-mt-28 transition-all duration-300 rounded-xl overflow-hidden',
                activeTab === 'signature' ? 'ring-2 ring-orange-500 shadow-sm' : '',
                animatingSection === 'signature' ? 'animate-highlight-pop' : ''
              )}
            >
              <SignatureDishes items={signatures} restaurant={restaurant} />
            </section>

            {/* CATEGORIZED SERVICES */}
            <section ref={servicesRef} className="space-y-4">
              {services.map((category, idx) => (
                <Card 
                  key={category.title} 
                  id={category.title} 
                  // Use content-visibility for large lists to speed up initial paint
                  style={{ contentVisibility: idx > 1 ? 'auto' : 'visible', containIntrinsicHeight: idx > 1 ? '300px' : 'auto' }}
                  className="overflow-hidden border-0 shadow-lg shadow-slate-200/50"
                >
                  <CardHeader className="bg-muted/10 border-b border-border/10">
                    <CardTitle className="text-xl font-bold uppercase tracking-tight">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item as any}
                          onClick={() => setSelectedItem(item as any)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>

          <div className="space-y-4">
            <ReviewsSection 
              targetId={restaurant.id} 
              type="Chef" 
            />
            <QuickInfoCard 
              workingHours={restaurant.workingHours} 
              preference={restaurant.preference}
            />

            {/* BOOK / ENQUIRY SECTION */}
            <section
              id="book-chef"
              ref={bookingRef}
              // Added 'contain-paint' to optimize rendering during animation
              className={cn(
                'scroll-mt-28 transition-all duration-300 rounded-xl contain-paint',
                // Persistent active state (orange ring)
                activeTab === 'book' || activeTab === 'enquiry'
                  ? 'ring-2 ring-orange-500 shadow-sm'
                  : '',
                // Transient animation state (zoom pop)
                (animatingSection === 'book' || animatingSection === 'enquiry') ? 'animate-highlight-pop' : ''
              )}
            >
              <BookChef 
                chefName={restaurant.name || chefName} 
                chefId={restaurant.id} 
                basePrice={restaurant.basePrice} 
                services={services}
              />
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
        />
      )}
    </div>
  );
}