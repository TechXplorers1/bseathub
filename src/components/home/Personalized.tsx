'use client';

import { useState, useEffect } from 'react';
import { personalizedMealRecommendations } from '@/ai/flows/personalized-meal-recommendations';
import { RestaurantCard } from './RestaurantCard';
import { allRestaurants, allHomeFoods } from '@/lib/data';
import { Restaurant } from '@/lib/types';
import { Button, buttonVariants } from '../ui/button';
import { ArrowRight, ArrowUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocation } from '@/context/LocationProvider';

const INITIAL_VISIBLE_COUNT = 8;

export function Personalized() {
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { location } = useLocation();

  useEffect(() => {
    async function getRecommendations() {
      try {
        setLoading(true);
        // Mock user data for demonstration
        const mockInput = {
          userId: 'user-123',
          orderHistory: JSON.stringify([
            {
              orderId: 'order-1',
              restaurant: 'The Golden Spoon',
              items: ['Spaghetti Carbonara'],
              date: '2024-07-20',
            },
            {
              orderId: 'order-2',
              restaurant: 'Sushi Palace',
              items: ['California Roll', 'Spicy Tuna Roll'],
              date: '2024-07-18',
            },
          ]),
          preferences: JSON.stringify({
            dietary: ['none'],
            likes: ['Italian', 'Japanese', 'Homemade'],
            dislikes: ['spicy'],
          }),
        };

        const result = await personalizedMealRecommendations(mockInput);
        
        const allItems = [...allRestaurants, ...allHomeFoods];

        // This is a simplified logic. In a real app, you'd match meal names to restaurants.
        // Here we just find restaurants whose cuisine matches the recommendations.
        let recommendedItems = allItems.filter((restaurant) =>
            result.recommendations.some(recommendation => 
                restaurant.name.toLowerCase().includes(recommendation.toLowerCase()) || 
                restaurant.cuisine.toLowerCase().includes(recommendation.toLowerCase()) ||
                restaurant.categories.some(cat => cat.toLowerCase().includes(recommendation.toLowerCase()))
            )
        );
        
        // Ensure a mix of home food and restaurants
        const hasHomeFood = recommendedItems.some(item => item.type === 'home-food');
        const hasRestaurant = recommendedItems.some(item => item.type === 'restaurant');

        // If not enough recommendations, fill with popular items, ensuring a mix
        if (recommendedItems.length < INITIAL_VISIBLE_COUNT) {
            const needed = INITIAL_VISIBLE_COUNT - recommendedItems.length;
            
            let fillItems: Restaurant[] = [];
            if (!hasHomeFood) {
                const homeFoodToAdd = allHomeFoods
                    .filter(hf => !recommendedItems.find(r => r.id === hf.id))
                    .slice(0, 2);
                fillItems.push(...homeFoodToAdd);
            }

            const popular = allItems
                .sort((a,b) => b.rating - a.rating)
                .filter(p => !recommendedItems.find(r => r.id === p.id) && !fillItems.find(f => f.id === p.id))
                .slice(0, needed - fillItems.length);
            
            fillItems.push(...popular);
            recommendedItems.push(...fillItems);
        }

        // Shuffle to make it look more organic
        recommendedItems.sort(() => Math.random() - 0.5);

        setRecommendations(recommendedItems.slice(0, INITIAL_VISIBLE_COUNT));

      } catch (error) {
        console.error('Failed to get personalized recommendations:', error);
        // Fallback to popular restaurants on error
        const mixedItems = [
            ...allRestaurants.sort((a,b) => b.rating - a.rating).slice(0, 4),
            ...allHomeFoods.sort((a,b) => b.rating - a.rating).slice(0, 4)
        ].sort(() => Math.random() - 0.5);

        setRecommendations(mixedItems);
      } finally {
        setLoading(false);
      }
    }

    getRecommendations();
  }, []);
  
  const visibleRestaurants = recommendations.slice(0, INITIAL_VISIBLE_COUNT);


  if (loading) {
    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Picked from your location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <div className="bg-gray-200 h-40 w-full rounded-md animate-pulse"></div>
                        <div className="mt-4 bg-gray-200 h-6 w-3/4 rounded-md animate-pulse"></div>
                        <div className="mt-2 bg-gray-200 h-4 w-1/2 rounded-md animate-pulse"></div>
                    </div>
                ))}
            </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Picked from your location</h2>
        {recommendations.length > INITIAL_VISIBLE_COUNT && (
          <Link href="/restaurants" className={cn(buttonVariants({ variant: 'ghost' }))}>
              See all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
