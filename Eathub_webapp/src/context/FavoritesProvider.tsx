'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFavoriteIds } from '@/services/api';

interface FavoritesContextType {
  favoriteIds: Record<string, string[]>;
  refreshFavorites: () => Promise<void>;
  isFavorite: (id: string, type: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Record<string, string[]>>({});

  const refreshFavorites = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const ids = await getFavoriteIds();
      setFavoriteIds(ids);
    } catch (err) {
      console.error('Failed to fetch favorite IDs', err);
    }
  };

  useEffect(() => {
    refreshFavorites();
    
    // Listen for local storage changes (login/logout)
    const handleStorage = () => refreshFavorites();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isFavorite = (id: string, type: string) => {
    const typeIds = favoriteIds[type] || [];
    return typeIds.includes(id);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, refreshFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
