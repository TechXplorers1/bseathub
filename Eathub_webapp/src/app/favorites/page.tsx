'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDetailedFavorites } from '@/services/api';
import { RestaurantCard } from '@/components/home/RestaurantCard';
import { ChefCard } from '@/components/home/ChefCard';
import { MenuItem } from '@/components/restaurant/MenuItem';
import { Loader2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MenuItemDialog } from '@/components/restaurant/MenuItemDialog';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState('RESTAURANT');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const { toast } = useToast();

  const loadFavorites = async (type: string) => {
    setLoading(true);
    try {
      const results = await getDetailedFavorites(type);
      setData(results);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites(activeType);
  }, [activeType]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 rounded-full">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Your Favourites</h1>
      </div>

      <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-muted/50 p-1 h-auto gap-2">
          <TabsTrigger value="RESTAURANT" className="rounded-md font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="HOME_FOOD" className="rounded-md font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Home Food
          </TabsTrigger>
          <TabsTrigger value="CHEF" className="rounded-md font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Chefs
          </TabsTrigger>
          <TabsTrigger value="MENU_ITEM" className="rounded-md font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Items
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-bold animate-pulse">Fetching your favourites...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                <p className="text-muted-foreground font-black text-xl">No favourites found in this category</p>
                <p className="text-muted-foreground mt-2">Start hearting things to see them here!</p>
              </div>
            ) : (
              data.map((item) => {
                if (activeType === 'RESTAURANT' || activeType === 'HOME_FOOD') {
                  return <RestaurantCard key={item.id} restaurant={item} />;
                }
                if (activeType === 'CHEF') {
                  return <ChefCard key={item.id} chef={item} />;
                }
                if (activeType === 'MENU_ITEM') {
                  return (
                    <MenuItem 
                      key={item.id} 
                      item={item} 
                      showProviderInfo={true}
                      onClick={() => {
                        if (item.providerSlug || item.providerId) {
                          const typePrefix = item.providerType === 'home-food' ? 'home-food' : 'restaurant';
                          router.push(`/${typePrefix}/${item.providerSlug || item.providerId}`);
                        }
                      }} 
                    />
                  );
                }
                return null;
              })
            )}
          </div>
        )}
      </Tabs>

      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
