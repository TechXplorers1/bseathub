"use client";

import { useState, useEffect, use } from "react";
import { ProviderCard } from "@/components/discovery/ProviderCard";
import { Loader2, UtensilsCrossed, ChefHat, Store } from "lucide-react";

type CategoryPageProps = {
  params: Promise<{ categoryName: string }>;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const categoryName = decodeURIComponent(resolvedParams.categoryName);

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [homeFoods, setHomeFoods] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        setLoading(true);
        const apiUrl = `http://localhost:8081/api/v1/discovery/category/${encodeURIComponent(categoryName)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch providers`);

        const data = await response.json();

        setRestaurants((data.restaurants || []).map((item: any) => ({ ...item, type: "RESTAURANT" as const })));
        setHomeFoods((data.homeFoods || []).map((item: any) => ({ ...item, type: "HOME_FOOD" as const })));
        setChefs((data.chefs || []).map((item: any) => ({ ...item, type: "CHEF" as const })));

      } catch (error) {
        console.error("Discovery error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [categoryName]);

  const hasResults = restaurants.length > 0 || homeFoods.length > 0 || chefs.length > 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <header className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          <UtensilsCrossed className="h-8 w-8 text-orange-500" />
          <h1 className="text-4xl font-extrabold tracking-tight capitalize">{categoryName}</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore top {categoryName} providers from Restaurants and Home Kitchens.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-80 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="text-muted-foreground animate-pulse font-medium">Brewing Category Results...</p>
        </div>
      ) : hasResults ? (
        <div className="space-y-16">
          {/* Restaurants Section */}
          {restaurants.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Store className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-bold">Top Restaurants</h2>
                <div className="h-px flex-1 bg-muted/60" />
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">{restaurants.length} AVAILABLE</span>
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
    </div>
  );
}