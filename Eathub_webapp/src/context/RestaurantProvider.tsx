'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Restaurant } from '@/lib/types';

interface RestaurantContextType {
  restaurants: Restaurant[];
  homeFoods: Restaurant[];
  allItems: Restaurant[];
  loading: boolean;
  getRestaurantById: (id: string) => Restaurant | undefined;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [allItems, setAllItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch from both endpoints simultaneously
        const [resRestaurants, resHomeFood] = await Promise.all([
          fetch('http://localhost:8081/api/v1/restaurants'),
          fetch('http://localhost:8081/api/v1/home-food')
        ]);

        if (!resRestaurants.ok || !resHomeFood.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const restaurantsData = await resRestaurants.json();
        const homeFoodData = await resHomeFood.json();

        // 2. Map and Normalize Restaurant Data
        const mappedRestaurants = restaurantsData.map((item: any) => ({
          ...item,
          deliveryTime: item.avgDeliveryTime || 30,
          deliveryFee: item.baseDeliveryFee || 0,
          reviews: item.reviewsCount || 0,
          imageId: item.imageId || 'restaurant-1',
          services: item.services || ['delivery', 'pickup'],
          type: 'restaurant' // Force type for filtering
        }));

        // 3. Map and Normalize Home Food Data
        const mappedHomeFoods = homeFoodData.map((item: any) => ({
          ...item,
          // Use fields returned by your HomeFoodResponseDTO
          deliveryTime: item.deliveryTime || 45,
          deliveryFee: item.deliveryFee || 0,
          reviews: item.reviews || 0,
          imageId: item.imageId || 'food-1',
          services: item.services || ['delivery'],
          type: 'home-food' // Force type for filtering
        }));

        // 4. Combine into one state
        setAllItems([...mappedRestaurants, ...mappedHomeFoods]);
      } catch (error) {
        console.error("Database Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter logic remains the same, but now populates from combined data
  const restaurants = allItems.filter(item => item.type === 'restaurant');
  const homeFoods = allItems.filter(item => item.type === 'home-food');

  const getRestaurantById = (id: string) => {
    return allItems.find((r) => r.id === id);
  };

  return (
    <RestaurantContext.Provider value={{ restaurants, homeFoods, allItems, loading, getRestaurantById }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) throw new Error('useRestaurants must be used within a RestaurantProvider');
  return context;
}