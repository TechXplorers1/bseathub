'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import type { Restaurant } from '@/lib/types';

const API_BASE = "http://localhost:8081/api/v1";

interface RestaurantContextType {
  restaurants: Restaurant[];
  homeFoods: Restaurant[];
  allItems: Restaurant[];
  loading: boolean;
  getRestaurantById: (id: string) => Restaurant | undefined;
  addDishToRestaurant: (
    restaurantId: string,
    dishData: any
  ) => Promise<void>;
}

const RestaurantContext =
  createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({
  children
}: { children: ReactNode }) {

  const [allItems, setAllItems] =
    useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);

    try {
      const [restaurantsRes, homeFoodRes] =
        await Promise.all([
          fetch(`${API_BASE}/restaurants`),
          fetch(`${API_BASE}/home-food`)
        ]);

      const restaurantsData =
        restaurantsRes.ok
          ? await restaurantsRes.json()
          : [];

      const homeFoodData =
        homeFoodRes.ok
          ? await homeFoodRes.json()
          : [];

      const mappedRestaurants =
        restaurantsData.map((item: any) => ({
          ...item,
          type: 'restaurant',
          deliveryTime: item.avgDeliveryTime ?? 30,
          deliveryFee: item.baseDeliveryFee ?? 0,
          reviews: item.reviewsCount ?? 0,
          services: item.services ?? ['delivery', 'pickup'],
          menu: item.menuCategories?.map((cat: any) => ({
            id: cat.id,
            name: cat.title,
            items: cat.items ?? []
          })) ?? []
        }));

      const mappedHomeFoods =
        homeFoodData.map((item: any) => ({
          ...item,
          type: 'home-food',
          menu: item.menuCategories?.map((cat: any) => ({
            id: cat.id,
            name: cat.title,
            items: cat.items ?? []
          })) ?? []
        }));

      setAllItems([
        ...mappedRestaurants,
        ...mappedHomeFoods
      ]);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const addDishToRestaurant = async (
    restaurantId: string,
    dishData: any
  ) => {

    if (!restaurantId)
      throw new Error("Invalid restaurant ID");

    const response =
      await fetch(
        `${API_BASE}/restaurants/${restaurantId}/menu-items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dishData),
        }
      );

    if (!response.ok)
      throw new Error("Failed to add dish");

    await fetchAllData();
  };

  const restaurants =
    allItems.filter(i => i.type === 'restaurant');

  const homeFoods =
    allItems.filter(i => i.type === 'home-food');

  const getRestaurantById =
    (id: string) =>
      allItems.find(r => r.id === id);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        homeFoods,
        allItems,
        loading,
        getRestaurantById,
        addDishToRestaurant
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (!context)
    throw new Error(
      'useRestaurants must be used inside Provider'
    );
  return context;
}
