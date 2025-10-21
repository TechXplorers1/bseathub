'use client';

import { allHomeFoods } from '@/lib/data';
import { ChefCard } from './ChefCard';
import { ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';


const chefs = allHomeFoods.map(food => ({
    name: food.name.split("'s")[0],
    specialty: food.cuisine,
    avatarUrl: `https://i.pravatar.cc/150?u=${food.id}`,
    slug: food.slug
}));

// Create a unique list of chefs based on their name
const uniqueChefs = chefs.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
        acc.push(current);
    }
    return acc;
}, [] as typeof chefs);


const INITIAL_VISIBLE_COUNT = 4;

export function ChefsCarousel() {
  const visibleChefs = uniqueChefs.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="py-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Our Chefs</h2>
            {uniqueChefs.length > INITIAL_VISIBLE_COUNT && (
                <Link href="/chefs" className={cn(buttonVariants({ variant: 'ghost' }))}>
                    See all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleChefs.map((chef) => (
                <ChefCard key={chef.name} chef={chef} />
            ))}
        </div>
    </div>
  );
}
