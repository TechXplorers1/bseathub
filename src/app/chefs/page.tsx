

'use client';

import { useState } from 'react';
import { allHomeFoods } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChefCard } from '@/components/home/ChefCard';

type Preference = 'all' | 'veg' | 'non-veg' | 'veg & non-veg';

const chefs = allHomeFoods.map(food => {
    const hasVeg = food.menu.some(cat => !cat.title.includes('(Non-Veg)') && cat.items.length > 0);
    const hasNonVeg = food.menu.some(cat => cat.title.includes('(Non-Veg)'));
    let preference: 'Veg' | 'Non-Veg' | 'Veg & Non-Veg' = 'Veg';
    if (hasVeg && hasNonVeg) {
        preference = 'Veg & Non-Veg';
    } else if (hasNonVeg && !hasVeg) {
        preference = 'Non-Veg';
    }

    return {
        name: food.name.split("'s")[0],
        specialty: food.cuisine,
        avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
        restaurantName: food.name,
        restaurantImageId: food.imageId,
        slug: food.slug,
        bio: `The heart and soul behind ${food.name}, bringing authentic ${food.cuisine} flavors to your table.`,
        preference: preference,
        categories: food.categories,
        rating: food.rating,
        reviews: food.reviews,
    };
});

// Create a unique list of chefs based on their name
const uniqueChefs = chefs.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
        acc.push(current);
    }
    return acc;
}, [] as typeof chefs);


export default function ChefsPage() {
  const [filter, setFilter] = useState<Preference>('all');
  
  const filteredChefs = uniqueChefs.filter(chef => {
    if (filter === 'all') return true;
    if (filter === 'veg') return chef.preference === 'Veg';
    if (filter === 'non-veg') return chef.preference === 'Non-Veg';
    if (filter === 'veg & non-veg') return chef.preference === 'Veg & Non-Veg';
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Book a Private Chef</h1>
        <div className="flex items-center gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'veg' ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter('veg')}>Veg</Button>
            <Button variant={filter === 'non-veg' ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter('non-veg')}>Non-Veg</Button>
            <Button variant={filter === 'veg & non-veg' ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter('veg & non-veg')}>Veg & Non-Veg</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredChefs.map((chef) => (
            <ChefCard key={chef.name} chef={chef} />
        ))}
      </div>
    </div>
  );
}
