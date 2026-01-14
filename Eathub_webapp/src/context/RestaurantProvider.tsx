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
      setLoading(true);
      try {
        // 1. Use Promise.allSettled to allow one to fail while the other succeeds
        const [resRestaurants, resHomeFood] = await Promise.all([
          fetch('http://localhost:8081/api/v1/restaurants').catch(err => ({ ok: false, statusText: err.message })),
          fetch('http://localhost:8081/api/v1/home-food').catch(err => ({ ok: false, statusText: err.message }))
        ]);

        let mappedRestaurants: Restaurant[] = [];
        let mappedHomeFoods: Restaurant[] = [];

        // 2. Process Restaurants
        if (resRestaurants.ok) {
          const restaurantsData = await (resRestaurants as Response).json();
          mappedRestaurants = restaurantsData.map((item: any) => ({
            ...item,
            deliveryTime: item.avgDeliveryTime || 30,
            deliveryFee: item.baseDeliveryFee || 0,
            reviews: item.reviewsCount || 0,
            imageId: item.imageId || 'restaurant-1',
            services: item.services || ['delivery', 'pickup'],
            type: 'restaurant'
          }));
        } else {
          console.error(`Restaurants API Error: ${(resRestaurants as any).status} ${(resRestaurants as any).statusText}`);
        }

        // 3. Process Home Food
        if (resHomeFood.ok) {
          const homeFoodData = await (resHomeFood as Response).json();
          mappedHomeFoods = homeFoodData.map((item: any) => ({
            ...item,
            deliveryTime: item.deliveryTime || 45,
            deliveryFee: item.deliveryFee || 0,
            reviews: item.reviews || 0,
            imageId: item.imageId || 'food-1',
            services: item.services || ['delivery'],
            type: 'home-food'
          }));
        } else {
          console.error(`Home Food API Error: ${(resHomeFood as any).status} ${(resHomeFood as any).statusText}`);
        }

        // 4. Combine whatever data we successfully retrieved
        setAllItems([...mappedRestaurants, ...mappedHomeFoods]);

      } catch (error) {
        console.error("Critical Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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