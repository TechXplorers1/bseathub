
"use client";

import { useState, useEffect, use } from "react";
import { ProviderCard } from "@/components/discovery/ProviderCard";
import { MenuItem } from "@/components/restaurant/MenuItem";
import { MenuItemDialog } from "@/components/restaurant/MenuItemDialog";
import { Loader2, UtensilsCrossed, ChefHat, Store, Sparkles } from "lucide-react";
import { useRestaurants } from "@/context/RestaurantProvider";

type CategoryPageProps = {
  params: Promise<{ categoryName: string }>;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const categoryName = decodeURIComponent(resolvedParams.categoryName);

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [homeFoods, setHomeFoods] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { allItems: allVendors, loading: vendorsLoading } = useRestaurants();

  useEffect(() => {
    async function fetchProviders() {
      try {
        setLoading(true);
        const apiUrl = `http://localhost:8081/api/v1/discovery/category/${encodeURIComponent(categoryName)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch discovery results`);

        const data = await response.json();
        console.log("Discovery data received for category", categoryName, ":", data);

        let fetchedRestaurants = (data.restaurants || []).map((item: any) => ({ ...item, type: "RESTAURANT" as const }));
        let fetchedHomeFoods = (data.homeFoods || []).map((item: any) => ({ ...item, type: "HOME_FOOD" as const }));
        let fetchedChefs = (data.chefs || []).map((item: any) => ({ ...item, type: "CHEF" as const }));
        let fetchedItems = data.items || [];

        // FALLBACK: If backend finds nothing, perform a thorough local search
        if (allVendors.length > 0) {
          const query = categoryName.toLowerCase();
          const extraItems: any[] = [];
          const extraVendors = new Set<string>();

          allVendors.forEach(v => {
            // Check vendor metadata
            const isMatch = v.name?.toLowerCase().includes(query) ||
              v.cuisine?.toLowerCase().includes(query) ||
              v.categories?.some(c => c.toLowerCase().includes(query));

            if (isMatch) extraVendors.add(v.id);

            // Check items within vendor
            v.menu?.forEach((cat: any) => {
              const catMatch = cat.title?.toLowerCase().includes(query);
              cat.items?.forEach((item: any) => {
                const itemMatch = catMatch ||
                  item.name?.toLowerCase().includes(query) ||
                  item.description?.toLowerCase().includes(query);

                if (itemMatch && !fetchedItems.find((fi: any) => fi.id === item.id)) {
                  extraItems.push({
                    ...item,
                    providerName: v.name,
                    providerSlug: v.slug,
                    providerType: v.type,
                    providerId: v.id
                  });
                  extraVendors.add(v.id);
                }
              });
            });
          });

          fetchedItems = [...fetchedItems, ...extraItems];

          allVendors.forEach(v => {
            if (extraVendors.has(v.id)) {
              if (v.type === 'restaurant' && !fetchedRestaurants.find((r: any) => r.id === v.id)) {
                fetchedRestaurants.push({ ...v, type: "RESTAURANT" as const });
              } else if (v.type === 'home-food' && !fetchedHomeFoods.find((hf: any) => hf.id === v.id)) {
                fetchedHomeFoods.push({ ...v, type: "HOME_FOOD" as const });
              }
            }
          });
        }

        setRestaurants(fetchedRestaurants);
        setHomeFoods(fetchedHomeFoods);
        setChefs(fetchedChefs);
        setItems(fetchedItems);

      } catch (error) {
        console.error("Discovery error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!vendorsLoading) {
      fetchProviders();
    }
  }, [categoryName, allVendors, vendorsLoading]);

  const hasResults = restaurants.length > 0 || homeFoods.length > 0 || chefs.length > 0 || items.length > 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <header className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight capitalize">{categoryName}</h1>
            <p className="text-muted-foreground text-lg">
              Discover the best {categoryName} items and places near you.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-80 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="text-muted-foreground animate-pulse font-medium">Brewing Category Results...</p>
        </div>
      ) : hasResults ? (
        <div className="space-y-16">
          {/* Top Items Section - Prioritized per user request */}
          {items.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Delicious {categoryName} Dishes</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-muted to-transparent" />
                <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full">{items.length} ITEMS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    showProviderInfo={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Restaurants Section */}
          {restaurants.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Store className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Top Restaurants</h2>
                <div className="h-px flex-1 bg-muted/60" />
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{restaurants.length} AVAILABLE</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map((provider) => (
                  <ProviderCard key={`res-${provider.id}`} provider={provider} />
                ))}
              </div>
            </section>
          )}

          {/* Home Food Section */}
          {homeFoods.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <UtensilsCrossed className="h-6 w-6 text-teal-600" />
                <h2 className="text-2xl font-bold">Kitchens & Home Food</h2>
                <div className="h-px flex-1 bg-muted/60" />
                <span className="text-xs font-bold bg-teal-100 text-teal-700 px-3 py-1 rounded-full">{homeFoods.length} KITCHENS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {homeFoods.map((provider) => (
                  <ProviderCard key={`hf-${provider.id}`} provider={provider} />
                ))}
              </div>
            </section>
          )}

          {/* Chefs Section */}
          {chefs.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <ChefHat className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold">Culinary Experts</h2>
                <div className="h-px flex-1 bg-muted/60" />
                <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{chefs.length} CHEFS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {chefs.map((provider) => (
                  <ProviderCard key={`chef-${provider.id}`} provider={provider} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed rounded-[2rem] bg-muted/20 border-muted">
          <div className="mb-4 inline-flex p-5 rounded-full bg-orange-50">
            <UtensilsCrossed className="h-12 w-12 text-orange-200" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">No results found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-lg">
            We couldn't find any restaurants or chefs for "{categoryName}" in your area yet.
          </p>
        </div>
      )}

      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
    </div>
  );
}