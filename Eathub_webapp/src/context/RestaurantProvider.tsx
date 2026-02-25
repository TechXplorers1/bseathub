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
  getRestaurantByOwnerId: (ownerId: string) => Restaurant | undefined;
  fetchFullRestaurantData: (id: string) => Promise<Restaurant>;
  addDishToRestaurant: (
    providerId: string,
    dishData: any,
    type: 'restaurant' | 'home-food'
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
            title: cat.title,

            items: cat.items ?? []
          })) ?? []
        }));

      const mappedHomeFoods =
        homeFoodData.map((item: any) => ({
          ...item,
          type: 'home-food',
          menu: item.menuCategories?.map((cat: any) => ({
            id: cat.id,
            title: cat.title,

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
    providerId: string,
    dishData: any,
    type: 'restaurant' | 'home-food' = 'restaurant'
  ) => {

    if (!providerId)
      throw new Error(`Invalid ${type} ID`);

    const path = type === 'restaurant' ? 'restaurants' : 'home-food';
    const response =
      await fetch(
        `${API_BASE}/${path}/${providerId}/menu-items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dishData),
        }
      );

    if (!response.ok)
      throw new Error(`Failed to add dish to ${type}`);

    // Re-fetch all to pick up the new menu item safely
    await fetchAllData();
  };


  const restaurants =
    allItems.filter(i => i.type === 'restaurant');

  const homeFoods =
    allItems.filter(i => i.type === 'home-food');

  const getRestaurantById =
    (id: string) =>
      allItems.find(r => r.id === id);

  const getRestaurantByOwnerId =
    (ownerId: string) =>
      allItems.find(r => r.owner?.id === ownerId);

  const fetchFullRestaurantData = async (id: string): Promise<Restaurant> => {
    const response = await fetch(`${API_BASE}/restaurants/id/${id}`);
    if (!response.ok) throw new Error("Failed to fetch full restaurant data");
    const item = await response.json();

    // Map the response to our frontend Restaurant type
    const mapped = {
      ...item,
      type: item.type || 'restaurant',
      deliveryTime: item.avgDeliveryTime ?? 30,
      deliveryFee: item.baseDeliveryFee ?? 0,
      reviews: item.reviewsCount ?? 0,
      services: item.services ?? ['delivery', 'pickup'],
      menu: item.menuCategories?.map((cat: any) => ({
        id: cat.id,
        title: cat.title,
        items: cat.items ?? []
      })) ?? []
    };

    // Update local state if it's already in the list
    setAllItems(prev => prev.map(r => r.id === id ? mapped : r));

    return mapped;
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        homeFoods,
        allItems,
        loading,
        getRestaurantById,
        getRestaurantByOwnerId,
        fetchFullRestaurantData,
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
