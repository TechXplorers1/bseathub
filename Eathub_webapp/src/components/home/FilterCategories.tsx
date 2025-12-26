// components/home/FilterCategories.tsx (or wherever it's located)

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Pizza,
  Fish,
  Beef,
  Coffee,
  Sandwich,
  Vegan,
  Sunrise,
  Star,
  Shell,
  CakeSlice,
  Grape,
  Salad,
  Soup,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeliveryMode } from '@/context/DeliveryModeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRatingFilter } from '@/context/RatingFilterProvider';

const mainCategories = [
  { name: 'Breakfast', icon: Sunrise },
  { name: 'Fast Food', icon: Beef },
  { name: 'Burgers', icon: Beef },
  { name: 'Coffee', icon: Coffee },
  { name: 'Pizza', icon: Pizza },
  { name: 'Halal', icon: Shell },
  { name: 'Chicken', icon: Beef },
  { name: 'Bubble Tea', icon: Grape },
  { name: 'Indian', icon: Soup },
  { name: 'Desserts', icon: CakeSlice },
  { name: 'Mexican', icon: Vegan },
  { name: 'Greek', icon: Salad },
  { name: 'Healthy', icon: Vegan },
  { name: 'Sandwiches', icon: Sandwich },
  { name: 'Noodle', icon: Soup },
];

const filterButtons = [{ name: 'Eat Hub', icon: Check }];

export function FilterCategories() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = React.useState(false);
  const [showRightButton, setShowRightButton] = React.useState(true);

  const { deliveryMode, setDeliveryMode } = useDeliveryMode();
  const { ratingFilter, setRatingFilter } = useRatingFilter();

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
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
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const ratingOptions = [
    { value: 0, label: 'Any Rating' },
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4 Stars & up' },
    { value: 3, label: '3 Stars & up' },
    { value: 2, label: '2 Stars & up' },
    { value: 1, label: '1 Star & up' },
  ];

  return (
    <div className="py-8">
      {/* Category pills (horizontal scroll) */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex justify-start space-x-6 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mainCategories.map((category) => (
            <Link
              key={category.name}
              href={`/category/${encodeURIComponent(category.name)}`}
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

        {/* left/right scroll buttons */}
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

      {/* delivery / rating / extra filter buttons */}
      <div className="flex justify-start items-center space-x-2 overflow-x-auto pt-4">
        <div className="flex bg-gray-100 rounded-full p-1 mr-2">
          <Button
            variant={deliveryMode === 'all' ? 'default' : 'ghost'}
            className="rounded-full flex-shrink-0 text-sm h-9"
            onClick={() => setDeliveryMode('all')}
          >
            All
          </Button>
          <Button
            variant={deliveryMode === 'delivery' ? 'default' : 'ghost'}
            className="rounded-full flex-shrink-0 text-sm h-9"
            onClick={() => setDeliveryMode('delivery')}
          >
            Delivery
          </Button>
          <Button
            variant={deliveryMode === 'pickup' ? 'default' : 'ghost'}
            className="rounded-full flex-shrink-0 text-sm h-9"
            onClick={() => setDeliveryMode('pickup')}
          >
            Pickup
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full flex-shrink-0">
              <Star className="mr-2 h-4 w-4" />
              {ratingFilter > 0
                ? ratingOptions.find((o) => o.value === ratingFilter)?.label
                : 'Rating'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ratingOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setRatingFilter(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filterButtons.map((button) => (
          <Button
            key={button.name}
            variant="outline"
            className="rounded-full flex-shrink-0"
          >
            {button.icon && <button.icon className="mr-2 h-4 w-4" />}
            {button.name}
          </Button>
        ))}
      </div>
    </div>
  );
}