'use client';

import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

interface ModernChefHeroProps {
  restaurant: Restaurant;
  chefName: string;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function ModernChefHero({ restaurant, chefName, activeTab, onTabChange }: ModernChefHeroProps) {

  const chefAvatar = `https://i.pravatar.cc/150?u=${restaurant.id}`;

  const handleScrollToSignature = () => {
    const section = document.getElementById('Signature Dishes');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToBooking = () => {
    const section = document.getElementById('Book a Chef');
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
              <h1 className="text-2xl font-bold tracking-tight">Chef {chefName}</h1>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <span>{restaurant.cuisine}</span>
                <span className="text-gray-300">·</span>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{restaurant.rating} ({restaurant.reviews} reviews)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {restaurant.categories.slice(0, 3).map(category => (
                  <Badge key={category} variant="secondary">{category}</Badge>
                ))}
                <Badge variant="outline">Vegetarian-friendly</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={handleScrollToBooking}>Book this Chef</Button>
                <Button size="sm" variant="outline" onClick={handleScrollToSignature}>Signature Dishes</Button>
                <Button size="sm" variant="ghost">Send Enquiry</Button>
              </div>
            </div>

            <div className="relative w-full h-40 md:h-full md:w-auto rounded-lg overflow-hidden order-first md:order-last">
              <Image
                src={chefAvatar}
                alt={chefName}
                width={150}
                height={150}
                className="object-cover"
              />
              <Badge className="absolute top-1 right-1 text-xs px-1 py-0.5">Top Rated</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
