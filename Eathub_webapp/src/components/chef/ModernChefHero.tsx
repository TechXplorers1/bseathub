'use client';

import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star } from 'lucide-react';
import { getDisplayImage } from '@/lib/image-utils';
import type { Restaurant } from '@/lib/types';

interface ModernChefHeroProps {
  restaurant: Restaurant;
  chefName: string;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function ModernChefHero({ restaurant, chefName, activeTab, onTabChange }: ModernChefHeroProps) {

  const chefAvatar = getDisplayImage(restaurant.avatarUrl || restaurant.imageId, 'chef-1');

  const handleScrollToSignature = () => {
    const section = document.getElementById('signature-dishes');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToBooking = () => {
    const section = document.getElementById('book-chef');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="w-full">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold tracking-tight">Chef {restaurant.name || chefName}</h1>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <span className="font-medium text-primary">{restaurant.specialty?.split(',')[0] || restaurant.cuisine}</span>
                <span className="text-gray-300">·</span>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{restaurant.rating}</span>
                <span className="text-muted-foreground">({restaurant.reviews} reviews)</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {(restaurant.specialty ? restaurant.specialty.split(',').map(s => s.trim()).filter(Boolean) : restaurant.categories || []).slice(0, 3).map(specialty => (
                  <Badge key={specialty} variant="secondary" className="px-3 py-1 font-normal">{specialty}</Badge>
                ))}
                {restaurant.preference && (
                  <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">{restaurant.preference}</Badge>
                )}
                <Badge variant="outline" className="px-3 py-1 text-green-600 border-green-200 bg-green-50 uppercase text-[10px] font-black">Verified Expert</Badge>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" className="rounded-xl px-6" onClick={handleScrollToBooking}>Book Now</Button>
                <Button size="lg" variant="outline" className="rounded-xl px-6" onClick={handleScrollToSignature}>Signature Dishes</Button>
                <Button size="lg" variant="ghost" className="rounded-xl flex items-center gap-2">
                  Send Enquiry
                </Button>
              </div>
            </div>

            <div className="relative w-full aspect-square md:w-32 md:h-32 rounded-2xl overflow-hidden order-first md:order-last border-4 border-background shadow-xl">
              <Image
                src={chefAvatar}
                alt={chefName}
                fill
                priority
                className="object-cover"
              />
              <Badge className="absolute bottom-1 right-1 text-[10px] px-1 py-0 bg-primary/90">TOP RATED</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
