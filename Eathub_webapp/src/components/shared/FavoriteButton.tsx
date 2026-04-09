'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavorite, getFavoriteIds } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

import { useFavorites } from '@/context/FavoritesProvider';

interface FavoriteButtonProps {
  targetId: string;
  targetType: 'MENU_ITEM' | 'RESTAURANT' | 'CHEF' | 'HOME_FOOD';
  className?: string;
  size?: number;
}

export function FavoriteButton({ targetId, targetType, className, size = 20 }: FavoriteButtonProps) {
  const { isFavorite: isFavoriteGlobal, refreshFavorites } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsFavorite(isFavoriteGlobal(targetId, targetType));
  }, [targetId, targetType, isFavoriteGlobal]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!localStorage.getItem('token')) {
      toast({
        title: "Authentication Required",
        description: "Please login to add favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newState = await toggleFavorite(targetId, targetType);
      setIsFavorite(newState);
      await refreshFavorites(); // Update global state
      toast({
        title: newState ? "Added to Favorites" : "Removed from Favorites",
        description: newState 
          ? "This item has been saved to your favorites list." 
          : "This item has been removed from your favorites list.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "group relative flex items-center justify-center rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-50",
        className
      )}
    >
      <Heart
        size={size}
        className={cn(
          "transition-colors duration-300",
          isFavorite 
            ? "fill-red-500 text-red-500" 
            : "text-gray-500 group-hover:text-red-400"
        )}
      />
    </button>
  );
}
