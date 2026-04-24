'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Heart,
  MapPin,
  Navigation,
  Utensils
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
import { useDistanceFilter, DISTANCE_OPTIONS } from '@/context/DistanceFilterProvider';
import { useLocation } from '@/context/LocationProvider';
import { useRestaurants } from '@/context/RestaurantProvider';

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

interface FilterCategoriesProps { }

export function FilterCategories({ }: FilterCategoriesProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = React.useState(false);
  const [showRightButton, setShowRightButton] = React.useState(true);

  const { deliveryMode, setDeliveryMode } = useDeliveryMode();
  const { ratingFilter, setRatingFilter } = useRatingFilter();
  const { selectedRadius, setSelectedRadius, isFetchingNearby, hasLocation } = useDistanceFilter();
  const { isLocating, requestLocation } = useLocation();

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

  const pathname = usePathname();

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
    <div className="py-3 sm:py-6 overflow-hidden">
      {/* Category pills (horizontal scroll) */}
      <div className="relative group mb-1">
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap items-center gap-x-6 sm:gap-x-10 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {mainCategories.map((category) => (
            <Link
              key={category.name}
              href={`/category/${encodeURIComponent(category.name)}`}
              className="flex flex-col items-center space-y-1.5 cursor-pointer group/item shrink-0"
            >
              <div className="p-2 sm:p-3 bg-gray-100 rounded-full group-hover/item:bg-primary/10 transition-colors">
                <category.icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700 group-hover/item:text-primary" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-gray-700 group-hover/item:text-primary">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-nowrap items-center gap-3 pt-2 overflow-x-auto no-scrollbar">
        {/* Delivery Modes */}
        <div className="flex bg-gray-100 rounded-full p-1 shrink-0">
          <Button variant={deliveryMode === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 text-[11px] px-3 font-bold shrink-0" onClick={() => setDeliveryMode('all')}>All</Button>
          <Button variant={deliveryMode === 'delivery' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 text-[11px] px-3 font-bold shrink-0" onClick={() => setDeliveryMode('delivery')}>Delivery</Button>
          <Button variant={deliveryMode === 'pickup' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 text-[11px] px-3 font-bold shrink-0" onClick={() => setDeliveryMode('pickup')}>Pickup</Button>
        </div>

        {/* Rating */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-10 px-4 text-[12px] whitespace-nowrap bg-white border-gray-200 font-extrabold shadow-sm shrink-0">
              <Star className="mr-1.5 h-4 w-4 text-yellow-500 fill-yellow-500" />
              {ratingFilter > 0 ? ratingOptions.find((o) => o.value === ratingFilter)?.label : 'Rating'}
              <ChevronDown className="ml-1.5 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent><div className="p-1">{ratingOptions.map((opt) => (<DropdownMenuItem key={opt.value} className="text-sm font-bold" onSelect={() => setRatingFilter(opt.value)}>{opt.label}</DropdownMenuItem>))}</div></DropdownMenuContent>
        </DropdownMenu>

        <Link href="/favorites" className="shrink-0">
          <Button variant="outline" size="sm" className={cn("rounded-full h-10 px-4 text-[12px] font-extrabold shadow-sm w-full", pathname === '/favorites' ? "bg-red-500 text-white border-red-500" : "bg-white border-gray-200")}>
            <Heart className={cn("mr-1.5 h-4 w-4", pathname === '/favorites' ? "fill-white" : "text-red-500")} /> Favourites
          </Button>
        </Link>

        <Link href="/nearby" className="shrink-0">
          <Button variant="outline" size="sm" className="rounded-full h-10 px-4 text-[12px] whitespace-nowrap bg-primary/5 text-primary border-primary/20 font-extrabold shadow-sm w-full"><Navigation className="mr-1.5 h-4 w-4" /> View in map</Button>
        </Link>
      </div>

      {/* Row 3: Distance Tabs (Horizontal Scroll) */}
      <div className="flex flex-nowrap items-center gap-3 pt-3 overflow-x-auto no-scrollbar">
        {/* Radius Info */}
        <div className="flex items-center bg-primary/5 rounded-full h-10 px-4 shrink-0 border border-primary/20 shadow-sm">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="ml-2 text-[11px] text-primary font-black uppercase tracking-widest">
            {selectedRadius ? `${selectedRadius / 1000}km` : 'Nearby'}
          </span>
        </div>

        {/* Radius Options */}
        {DISTANCE_OPTIONS.map(opt => (
          <button
            key={opt.label}
            onClick={() => { if (opt.value !== null && !hasLocation) requestLocation(); setSelectedRadius(opt.value); }}
            className={cn(
              'h-10 px-5 rounded-full text-[12px] font-extrabold whitespace-nowrap transition-all border shrink-0 shadow-sm',
              selectedRadius === opt.value ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-gray-100'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}