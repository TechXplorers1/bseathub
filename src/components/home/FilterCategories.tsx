'use client';

import {
  Pizza,
  Fish,
  Beef,
  Beer,
  Sandwich,
  Soup,
  Vegan,
  Zap,
  Utensils,
  Sprout,
  Star,
} from 'lucide-react';

const categories = [
  { name: 'Deals', icon: Zap },
  { name: 'Restaurants', icon: Utensils },
  { name: 'Grocery', icon: Sprout },
  { name: 'Pizza', icon: Pizza },
  { name: 'Sushi', icon: Fish },
  { name: 'Burgers', icon: Beef },
  { name: 'Alcohol', icon: Beer },
  { name: 'Best overall', icon: Star },
];

export function FilterCategories() {
  return (
    <div className="py-8">
      <div className="flex justify-start space-x-6 overflow-x-auto pb-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className="flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0"
          >
            <div className="p-4 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors">
              <category.icon className="h-8 w-8 text-gray-700 group-hover:text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
