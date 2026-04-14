'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import type { Restaurant } from '@/lib/types';
import { getCuisinePlaceholder } from '@/lib/image-utils';

const API_BASE = "http://localhost:8081/api/v1";

interface RestaurantContextType {
  restaurants: Restaurant[];
  homeFoods: Restaurant[];
  chefs: any[];
  allItems: Restaurant[];
  loading: boolean;
  getRestaurantById: (id: string) => Restaurant | undefined;
  getRestaurantByOwnerId: (ownerId: string) => Restaurant | undefined;
  fetchFullRestaurantData: (id: string) => Promise<Restaurant>;
  addDishToRestaurant: (
    providerId: string,
    dishData: any,
    type: 'restaurant' | 'home-food'
  ) => Promise<any>;
  refreshAll: () => Promise<void>;
}

const RestaurantContext =
  createContext<RestaurantContextType | undefined>(undefined);

// Simple global cache to persist between page navigations without re-renders
let cachedData: { restaurants: Restaurant[], homeFoods: Restaurant[], chefs: any[] } | null = null;

export function RestaurantProvider({
  children
}: { children: ReactNode }) {

  const [allItems, setAllItems] = useState<Restaurant[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async (forceUpdate = false) => {
    // If not a forced update and we have cached data, use it immediately
    if (!forceUpdate && cachedData) {
      setAllItems([...cachedData.restaurants, ...cachedData.homeFoods]);
      setChefs(cachedData.chefs);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [restaurantsRes, homeFoodRes, chefsRes] =
        await Promise.all([
          fetch(`${API_BASE}/restaurants`),
          fetch(`${API_BASE}/home-food`),
          fetch(`${API_BASE}/chefs`)
        ]);

      const [rawRestaurantsData, homeFoodData, rawChefsData] = await Promise.all([
        restaurantsRes.ok ? restaurantsRes.json() : [],
        homeFoodRes.ok ? homeFoodRes.json() : [],
        chefsRes.ok ? chefsRes.json() : []
      ]);

      const restaurantsData = rawRestaurantsData.filter((item: any) => 
        item.businessModel !== 'HOME_KITCHEN' && 
        item.restaurantType !== 'Home Food' && 
        item.type !== 'home-food'
      );

      const mappedRestaurants =
        restaurantsData.map((item: any) => {
          const cuisine = item.cuisineType || item.cuisine || "Multi-cuisine";
          return {
            ...item,
            type: 'restaurant',
            cuisine,
            categories: item.restaurantType ? [item.restaurantType] : (item.categories || ["General"]),
            deliveryTime: item.avgDeliveryTime ?? 30,
            deliveryFee: item.baseDeliveryFee ?? 0,
            reviews: item.reviewsCount ?? item.reviews ?? 0,
            services: item.services ?? ['delivery', 'pickup'],
            imageId: item.imageId || getCuisinePlaceholder(cuisine),
            menu: item.menuCategories?.map((cat: any) => ({
              id: cat.id,
              title: cat.title,
              items: cat.items ?? []
            })) ?? []
          };
        });

      const mappedHomeFoods =
        homeFoodData.map((item: any) => ({
          ...item,
          type: 'home-food',
          cuisine: item.foodType || "Home-made",
          categories: item.foodType ? [item.foodType] : ["Home Food"],
          reviews: item.reviews ?? 0,
          isOpen: item.isActive ?? true,
          imageId: item.imageId || getCuisinePlaceholder(item.foodType || "Home-made"),
          menu: item.menuCategories?.map((cat: any) => ({
            id: cat.id,
            title: cat.title,
            items: cat.items ?? []
          })) ?? []
        }));

      setAllItems([...mappedRestaurants, ...mappedHomeFoods]);
      setChefs(rawChefsData);
      
      // Update global cache
      cachedData = {
        restaurants: mappedRestaurants,
        homeFoods: mappedHomeFoods,
        chefs: rawChefsData
      };

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
  ): Promise<any> => {

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

    const newItem = await response.json();
    // Re-fetch all in background to keep other parts of the app in sync
    fetchAllData();
    return newItem;
  };


  const refreshAll = () => fetchAllData(true);

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
    const cuisine = item.cuisineType || item.cuisine || "Multi-cuisine";
    const mapped = {
      ...item,
      type: item.type || 'restaurant',
      cuisine,
      deliveryTime: item.avgDeliveryTime ?? 30,
      deliveryFee: item.baseDeliveryFee ?? 0,
      reviews: item.reviewsCount ?? 0,
      services: item.services ?? ['delivery', 'pickup'],
      imageId: item.imageId || getCuisinePlaceholder(cuisine),
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
        chefs,
        allItems,
        loading,
        getRestaurantById,
        getRestaurantByOwnerId,
        fetchFullRestaurantData,
        addDishToRestaurant,
        refreshAll
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
