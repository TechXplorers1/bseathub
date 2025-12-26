
'use client';

import { allHomeFoods } from '@/lib/data';
import { ChefCard } from './ChefCard';
import { ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';


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


const INITIAL_VISIBLE_COUNT = 8;

export function ChefsCarousel() {
  const visibleChefs = uniqueChefs.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Book a Private Chefs</h2>
            {uniqueChefs.length > INITIAL_VISIBLE_COUNT && (
                <Link href="/chefs" className={cn(buttonVariants({ variant: 'ghost' }))}>
                    See all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleChefs.map((chef) => (
                <ChefCard key={chef.name} chef={chef} />
            ))}
        </div>
    </div>
  );
}
