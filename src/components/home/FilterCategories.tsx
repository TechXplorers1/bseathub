'use client';

import {
  Pizza,
  Fish,
  Beef,
  Beer,
  Sandwich,
  Vegan,
  Zap,
  Star,
  Shell,
  CakeSlice,
  Grape,
  Salad,
  Soup,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tag, ChevronDown, Check } from 'lucide-react';

const mainCategories = [
  { name: 'Breakfast', icon: Zap }, // Using Zap as a placeholder for Breakfast
  { name: 'Fast Food', icon: Beef },
  { name: 'Burgers', icon: Beef },
  { name: 'Coffee', icon: Beer }, // Using Beer as a placeholder for Coffee
  { name: 'Pizza', icon: Pizza },
  { name: 'Halal', icon: Shell }, // Placeholder
  { name: 'Chicken', icon: Beef }, // Placeholder
  { name: 'Bubble Tea', icon: Grape }, // Placeholder
  { name: 'Indian', icon: Soup }, // Placeholder
  { name: 'Desserts', icon: CakeSlice },
  { name: 'Mexican', icon: Vegan },
  { name: 'Greek', icon: Salad }, // Placeholder
  { name: 'Healthy', icon: Vegan },
  { name: 'Sandwiches', icon: Sandwich },
  { name: 'Noodle', icon: Soup }, // Placeholder
];

const filterButtons = [
  { name: 'Deals', icon: Tag },
  { name: 'Pickup', icon: null },
  { name: 'Over 4.5', icon: Star, hasDropdown: true },
  { name: 'Under 30 min', icon: null },
  { name: 'Price', icon: null, hasDropdown: true },
  { name: 'DashPass', icon: Check },
];

export function FilterCategories() {
  return (
    <div className="py-8">
      <div className="flex justify-center space-x-6 overflow-x-auto pb-4">
        {mainCategories.map((category) => (
          <div
            key={category.name}
            className="flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0"
          >
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors">
              <category.icon className="h-7 w-7 text-gray-700 group-hover:text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
              {category.name}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-start items-center space-x-2 overflow-x-auto pt-4">
        {filterButtons.map((button) => (
          <Button
            key={button.name}
            variant="outline"
            className="rounded-full flex-shrink-0"
          >
            {button.icon && <button.icon className="mr-2 h-4 w-4" />}
            {button.name}
            {button.hasDropdown && <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
