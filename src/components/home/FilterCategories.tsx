'use client';

import * as React from 'react';
import Link from 'next/link';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tag, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { name: 'Price', icon: null, hasDropdown: true },
  { name: 'Eat Hub', icon: Check },
];

export function FilterCategories() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = React.useState(false);
  const [showRightButton, setShowRightButton] = React.useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth -1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="py-8">
      <div className="relative group">
        <div 
          ref={scrollContainerRef}
          className="flex justify-start space-x-6 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mainCategories.map((category) => (
            <Link
                href={`/category/${encodeURIComponent(category.name)}`}
                key={category.name}
                className="flex flex-col items-center space-y-2 cursor-pointer group/item flex-shrink-0"
            >
              <div className="p-3 bg-gray-100 rounded-full group-hover/item:bg-primary/10 transition-colors">
                <category.icon className="h-7 w-7 text-gray-700 group-hover/item:text-primary" />
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover/item:text-primary">
                {category.name}
              </p>
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full h-8 w-8 bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity',
            !showLeftButton && 'hidden'
          )}
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full h-8 w-8 bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity',
            !showRightButton && 'hidden'
          )}
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
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
