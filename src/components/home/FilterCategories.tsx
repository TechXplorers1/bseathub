'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const categories = [
  'All', 'Pizza', 'Sushi', 'Burgers', 'Mexican', 'Italian', 'Indian', 'Chinese', 'Healthy', 'Vegan'
];

export function FilterCategories() {
  return (
    <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4">
                {categories.map((category) => (
                <Button key={category} variant={category === 'All' ? 'default' : 'outline'} className="rounded-full px-6 py-3 text-base">
                    {category}
                </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
