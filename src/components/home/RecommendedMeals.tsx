'use client';

import { useEffect, useState } from 'react';
import { personalizedMealRecommendations } from '@/ai/flows/personalized-meal-recommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { allRestaurants } from '@/lib/data';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import { useCart } from '@/context/CartProvider';

const MOCK_USER_DATA = {
  userId: 'user-123',
  orderHistory: JSON.stringify([
    { orderId: 'order-1', items: ['Spaghetti Carbonara', 'Bruschetta'], restaurant: 'The Golden Spoon' },
    { orderId: 'order-2', items: ['Classic Cheeseburger'], restaurant: 'Burger Bonanza' },
  ]),
  preferences: JSON.stringify({
    dietaryRestrictions: ['none'],
    favoriteCuisines: ['Italian', 'American'],
  }),
};

export function RecommendedMeals() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function getRecommendations() {
      try {
        setLoading(true);
        const result = await personalizedMealRecommendations(MOCK_USER_DATA);
        // Let's create a more diverse list for UI purposes
        const exampleRecommendations = [
            "Margherita Pizza", "Spicy Tuna Roll", "Bacon Avocado Burger", "Chicken Tikka Masala", "Cobb Salad"
        ];
        setRecommendations(result.recommendations.length > 0 ? result.recommendations : exampleRecommendations);
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        // Fallback recommendations
        setRecommendations(["Margherita Pizza", "Spicy Tuna Roll", "Bacon Avocado Burger"]);
      } finally {
        setLoading(false);
      }
    }
    getRecommendations();
  }, []);
  
  const recommendedItems = recommendations.map(rec => {
    for (const restaurant of allRestaurants) {
        for (const category of restaurant.menu) {
            const item = category.items.find(i => i.name === rec);
            if(item) return item;
        }
    }
    return null;
  }).filter(Boolean);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
            {recommendedItems.map((item, index) => {
                if (!item) return null;
                const image = getImageById(item.imageId);
                return (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                    <div className="p-1">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-0">
                            {image && (
                                <Image
                                    src={image.imageUrl}
                                    alt={item.name}
                                    width={400}
                                    height={300}
                                    className="h-40 w-full object-cover"
                                    data-ai-hint={image.imageHint}
                                />
                            )}
                        </CardHeader>
                        <CardContent className="p-4">
                            <h3 className="font-semibold truncate">{item.name}</h3>
                            <p className="text-sm text-muted-foreground truncate h-10">{item.description}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold">${item.price.toFixed(2)}</span>
                                <Button size="sm" onClick={() => addToCart(item)}>Add</Button>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </CarouselItem>
                );
            })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    </div>
  );
}
