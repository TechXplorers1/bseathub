
'use client';

import { useEffect, useState } from 'react';
import { useRestaurants } from '@/context/RestaurantProvider';
import { ChefCard, ChefCardSkeleton } from '@/components/home/ChefCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Chef } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type Preference = 'all' | 'veg' | 'non-veg' | 'veg & non-veg';

export default function ChefsPage() {
  const { chefs, loading } = useRestaurants();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Preference>('all');

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64 mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4,5,6,7,8].map(i => <ChefCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100 max-w-md">
          <p className="text-red-600 font-semibold mb-2">Failed to load chefs</p>
          <p className="text-red-500/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const filteredChefs = chefs.filter(chef => {
    if (filter === 'all') return true;
    if (!chef.preference) return false;
    if (filter === 'veg') return chef.preference === 'Veg';
    if (filter === 'non-veg') return chef.preference === 'Non-Veg';
    if (filter === 'veg & non-veg') return chef.preference === 'Veg & Non-Veg';
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Book a Private Chef</h1>
          <p className="text-muted-foreground">Hire professional chefs for your special occasions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/50 rounded-2xl">
          <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-xl px-4" onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'veg' ? 'default' : 'ghost'} size="sm" className="rounded-xl px-4" onClick={() => setFilter('veg')}>Veg</Button>
          <Button variant={filter === 'non-veg' ? 'default' : 'ghost'} size="sm" className="rounded-xl px-4" onClick={() => setFilter('non-veg')}>Non-Veg</Button>
          <Button variant={filter === 'veg & non-veg' ? 'default' : 'ghost'} size="sm" className="rounded-xl px-4" onClick={() => setFilter('veg & non-veg')}>Veg & Non-Veg</Button>
        </div>
      </div>

      {filteredChefs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredChefs.map((chef, idx) => (
            <ChefCard key={chef.id || chef.name} chef={chef} priority={idx < 4} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
          <p className="text-muted-foreground">No chefs matching your filter were found.</p>
        </div>
      )}
    </div>
  );
}
