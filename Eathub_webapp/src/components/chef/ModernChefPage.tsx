'use client';

import { useRef, useState } from 'react';
import { AboutCard } from './AboutCard';
import { ModernChefHero } from './ModernChefHero';
import { QuickInfoCard } from './QuickInfoCard';
import { ReviewsCard } from './ReviewsCard';
import { SignatureDishes } from './SignatureDishes';
import { SpecialtiesCard } from './SpecialtiesCard';
import type { Restaurant } from '@/lib/types';
import { allHomeFoods } from '@/lib/data';
import { BookChef } from './BookChef';
import { cn } from '@/lib/utils';

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

  const signatureRef = useRef<HTMLDivElement | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);

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
    </div>
  );
}