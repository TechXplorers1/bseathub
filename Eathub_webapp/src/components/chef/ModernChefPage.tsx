'use client';

import { useEffect, useRef, useState } from 'react';
import { AboutCard } from './AboutCard';
import { ModernChefHero } from './ModernChefHero';
import { QuickInfoCard } from './QuickInfoCard';
import { ReviewsCard } from './ReviewsCard';
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
  const signatureDishes = allHomeFoods
    .flatMap((r) => r.menu.flatMap((c) => c.items))
    .slice(0, 5);

  // activeTab controls the persistent orange ring
  const [activeTab, setActiveTab] = useState<ChefTab>('book');
  // animatingSection controls the temporary zoom "pop" animation
  const [animatingSection, setAnimatingSection] = useState<ChefTab | null>(null);

  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);

  const [services, setServices] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      // Assuming restaurant.id is the chef profile ID here if chefName is present
      // or we need to find the actual chef ID. 
      // For now, let's assume restaurant might contain it or we need another fetch.
      // Based on client-page.tsx, restaurant is passed down.
      if (restaurant.id) {
        setLoading(true);
        try {
          // If restaurant.id is actually the restaurant ID but we need chef ID,
          // we might need to fetch chef by slug first.
          // But looking at the backend, chef has its own ID.
          const grouped = await fetchGroupedChefServices(restaurant.id);
          setServices(grouped);
        } catch (err) {
          console.error("Failed to load chef services:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadServices();
  }, [restaurant.id]);

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
    // We wait a bit for the smooth scroll to near completion before triggering the pop
    const SCROLL_DURATION_ESTIMATE = 400; // ms
    const ANIMATION_DURATION = 600; // ms (must match CSS)

    setTimeout(() => {
      // Start animation
      setAnimatingSection(tab);

      // Stop animation after duration completes so it can be triggered again later
      setTimeout(() => {
        setAnimatingSection(null);
      }, ANIMATION_DURATION);
    }, SCROLL_DURATION_ESTIMATE);
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
            <AboutCard chefName={chefName} />
            <SpecialtiesCard categories={restaurant.categories} />

            {/* SIGNATURE DISHES SECTION */}
            <section
              ref={signatureRef}
              // Added 'contain-paint' to optimize rendering during animation
              className={cn(
                'scroll-mt-28 transition-all duration-300 rounded-xl contain-paint',
                // Persistent active state (orange ring)
                activeTab === 'signature'
                  ? 'ring-2 ring-orange-500 shadow-sm'
                  : '',
                // Transient animation state (zoom pop)
                animatingSection === 'signature' ? 'animate-highlight-pop' : ''
              )}
            >
              <SignatureDishes items={signatureDishes} />
            </section>

            {/* CATEGORIZED SERVICES */}
            <section ref={servicesRef} className="space-y-4">
              {services.map((category) => (
                <Card key={category.title} id={category.title}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
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
            <ReviewsCard
              rating={restaurant.rating}
              reviewCount={restaurant.reviews}
            />
            <QuickInfoCard />

            {/* BOOK / ENQUIRY SECTION */}
            <section
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
              <BookChef chefName={chefName} />
            </section>
          </div>
        </div>
      </div>
      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
    </div>
  );
}