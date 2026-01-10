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
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/v1/restaurants');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const mappedData = data.map((item: any) => ({
          ...item,
          // Handle field name differences between Java Backend and Next.js Frontend
          type: item.type || 'restaurant', // Fallback if DB column is empty
          deliveryTime: item.avgDeliveryTime || 30,
          reviews: item.reviewsCount || 0,
          rating: item.rating || 0,
          // CRITICAL: Ensure services is an array so .includes() doesn't crash
          services: Array.isArray(item.services) && item.services.length > 0
            ? item.services
            : ['delivery', 'pickup'],
          imageId: item.imageId || 'restaurant-1'
        }));

        setAllItems(mappedData);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter logic
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