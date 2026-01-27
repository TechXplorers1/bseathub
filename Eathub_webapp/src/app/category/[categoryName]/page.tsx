"use client";

import { useState, useEffect, use } from "react";
// Ensure this path matches where you created the ProviderCard
import { ProviderCard } from "@/components/discovery/ProviderCard";

type CategoryPageProps = {
  params: Promise<{ categoryName: string }>;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const categoryName = decodeURIComponent(resolvedParams.categoryName);

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        setLoading(true);

        // This calls the DiscoveryController we created
        const apiUrl = `http://localhost:8081/api/v1/discovery/category/${encodeURIComponent(categoryName)}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch providers (${response.status})`);
        }

        const data = await response.json();

        /**
         * GROUND LEVEL LOGIC:
         * The backend returns: { restaurants: [...], homeFoods: [...] }
         * We merge them into one array so the .map() function below works.
         */
        const combined = [
          ...(data.restaurants || []).map((item: any) => ({
            ...item,
            type: "RESTAURANT" as const,
          })),
          ...(data.homeFoods || []).map((item: any) => ({
            ...item,
            type: "HOME_FOOD" as const,
          })),
          ...(data.chefs || []).map((item: any) => ({
            ...item,
            type: "CHEF" as const,
          })),
        ];


        setProviders(combined);
      } catch (error) {
        console.error("Discovery error:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [categoryName]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
        <p className="text-muted-foreground mt-2">
          Explore top-rated places offering {categoryName} near you.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.length > 0 ? (
            providers.map((provider) => (
              <ProviderCard
                key={`${provider.type}-${provider.id}`}
                provider={provider}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-gray-50">
              <p className="text-lg text-muted-foreground">
                No restaurants or chefs currently found for "{categoryName}".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}