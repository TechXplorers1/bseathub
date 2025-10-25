'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { Restaurant, MenuItem, MenuCategory } from '@/lib/types';
import { allRestaurants, allHomeFoods } from '@/lib/data';

interface RestaurantContextType {
  restaurants: Restaurant[];
  homeFoods: Restaurant[];
  allItems: Restaurant[];
  getRestaurantById: (id: string) => Restaurant | undefined;
  addDishToRestaurant: (restaurantId: string, dish: Omit<MenuItem, 'id' | 'imageId'> & { category: string }) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(allRestaurants);
  const [homeFoods, setHomeFoods] = useState<Restaurant[]>(allHomeFoods);

  const getRestaurantById = (id: string) => {
    return [...restaurants, ...homeFoods].find((r) => r.id === id);
  };

  const addDishToRestaurant = (restaurantId: string, dish: Omit<MenuItem, 'id' | 'imageId'> & { category: string }) => {
    const newDish: MenuItem = {
      ...dish,
      id: `new-${Date.now()}`,
      imageId: 'food-1', // placeholder
    };

    const updateRestaurants = (prevRestaurants: Restaurant[]) => {
      return prevRestaurants.map(r => {
        if (r.id === restaurantId) {
          const newMenu = [...r.menu];
          let categoryExists = false;

          for (let i = 0; i < newMenu.length; i++) {
            if (newMenu[i].title === dish.category) {
              newMenu[i] = {
                ...newMenu[i],
                items: [...newMenu[i].items, newDish],
              };
              categoryExists = true;
              break;
            }
          }

          if (!categoryExists) {
            newMenu.push({
              title: dish.category,
              items: [newDish],
            });
          }

          return { ...r, menu: newMenu };
        }
        return r;
      });
    };

    setRestaurants(updateRestaurants);
    setHomeFoods(updateRestaurants);
  };
  
  const allItems = [...restaurants, ...homeFoods];

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        homeFoods,
        allItems,
        getRestaurantById,
        addDishToRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
}
