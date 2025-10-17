import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from './RestaurantCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface RestaurantCarouselProps {
  title: string;
  restaurants: Restaurant[];
}

export function RestaurantCarousel({ title, restaurants }: RestaurantCarouselProps) {
  return (
    <div className="py-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Button variant="ghost">
                See all <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
            {restaurants.map((restaurant, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                    <div className="p-1">
                        <RestaurantCard restaurant={restaurant} />
                    </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    </div>
  );
}
