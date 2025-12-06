'use client';
import { AboutCard } from './AboutCard';
import { ModernChefHero } from './ModernChefHero';
import { QuickInfoCard } from './QuickInfoCard';
import { ReviewsCard } from './ReviewsCard';
import { SignatureDishes } from './SignatureDishes';
import { SpecialtiesCard } from './SpecialtiesCard';
import type { Restaurant } from '@/lib/types';
import { allHomeFoods } from '@/lib/data';
import { BookingForm } from './BookingForm';
import { BookChef } from './BookChef';

interface ModernChefPageProps {
  restaurant: Restaurant;
  chefName: string;
}

export function ModernChefPage({ restaurant, chefName }: ModernChefPageProps) {
    const signatureDishes = allHomeFoods.flatMap(r => r.menu.flatMap(c => c.items)).slice(0, 5);
    
  return (
    <div className="bg-muted/40 flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
            <ModernChefHero restaurant={restaurant} chefName={chefName} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-2">
          <div className="lg:col-span-2 space-y-2">
            <AboutCard chefName={chefName} />
            <SpecialtiesCard categories={restaurant.categories} />
            <SignatureDishes items={signatureDishes} />
          </div>
          <div className="space-y-2">
            <ReviewsCard rating={restaurant.rating} reviewCount={restaurant.reviews} />
            <QuickInfoCard />
            <BookChef chefName={chefName} />
          </div>
        </div>
      </div>
    </div>
  );
}
