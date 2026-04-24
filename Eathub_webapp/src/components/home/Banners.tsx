'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDisplayImage } from '@/lib/image-utils';

export function Banners() {
  const banner1Image1 = getDisplayImage('food-21', 'food-1');
  const banner1Image2 = getDisplayImage('food-10', 'food-2');
  const banner2Image = getDisplayImage('food-16', 'food-3');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 sm:py-8 px-4 sm:px-0">
      <Card className="overflow-hidden bg-primary text-primary-foreground border-none shadow-xl w-full max-w-full">
        <CardContent className="flex items-center justify-between p-5 sm:p-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              Enjoy 50% off your first order!
            </h3>
            <p className="opacity-90">Use code 50TREAT on delivery orders of $15+</p>
            <Button variant="secondary" className="mt-2 text-primary rounded-full px-6">
              Learn more
            </Button>
          </div>
          <div className="hidden sm:flex space-x-2 -mr-4 opacity-80 rotate-3">
              <Image
                src={banner1Image1}
                alt="Feature Food 1"
                width={100}
                height={100}
                className="rounded-2xl object-cover h-24 w-24 border-4 border-white/20"
              />
              <Image
                src={banner1Image2}
                alt="Feature Food 2"
                width={100}
                height={100}
                className="rounded-2xl object-cover h-24 w-24 border-4 border-white/20 -translate-x-4 translate-y-4"
              />
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden bg-orange-600 text-white border-none shadow-xl">
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              Get unlimited $0 delivery fees on Eat Hub orders*
            </h3>
            <p className="text-sm opacity-90 text-orange-50">Plus exclusive offers and savings</p>
            <Button variant="secondary" className="mt-2 bg-white text-orange-600 hover:bg-orange-50 rounded-full px-6">
              Try it Free for 30 Days
            </Button>
          </div>
          <div className="hidden sm:block -mr-2 opacity-90 -rotate-6">
            <Image
                src={banner2Image}
                alt="Feature Food 3"
                width={140}
                height={140}
                className="rounded-3xl object-cover h-32 w-32 border-4 border-white/30"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
