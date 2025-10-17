import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getImageById } from '@/lib/placeholder-images';

export function Hero() {
  const heroImage = getImageById('hero-background');

  return (
    <div className="relative h-[400px] w-full">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          layout="fill"
          objectFit="cover"
          className="brightness-50"
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
        <h1 className="text-4xl font-bold md:text-6xl">
          Your favorite food, delivered.
        </h1>
        <p className="mt-4 max-w-2xl text-lg">
          Discover local restaurants that deliver to your doorstep.
        </p>
        <form className="mt-8 w-full max-w-2xl px-4">
          <div className="relative flex">
            <Input
              type="text"
              placeholder="Enter your delivery address"
              className="h-14 rounded-full bg-white pr-32 text-black text-lg"
            />
            <Button
              type="submit"
              size="lg"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 rounded-full px-6"
            >
              <Search className="mr-2 h-5 w-5" /> Find Food
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
