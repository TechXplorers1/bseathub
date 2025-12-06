
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

interface Chef {
    name: string;
    specialty: string;
    avatarUrl: string;
    slug: string;
    categories: string[];
    rating: number;
    reviews: number;
}

interface HorizontalChefCardProps {
  chef: Chef;
}

export function HorizontalChefCard({ chef }: HorizontalChefCardProps) {
    const isTopRated = chef.rating >= 4.8;
  return (
    <Link href={`/restaurant/${chef.slug}?chef=${encodeURIComponent(chef.name)}`} className="block">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-3">
                <h2 className="text-2xl font-bold tracking-tight">Chef {chef.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                    <span>{chef.specialty}</span>
                    <span className="text-gray-300">·</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{chef.rating} ({chef.reviews} reviews)</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {chef.categories.slice(0, 3).map(category => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                    <Badge variant="outline">Vegetarian-friendly</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <Button size="sm">Book this Chef</Button>
                    <Button size="sm" variant="outline">View Menu</Button>
                    <Button size="sm" variant="link">Send Enquiry</Button>
                </div>
            </div>
            
            <div className="relative h-40 w-full md:w-auto md:h-full rounded-lg overflow-hidden">
                <Image
                    src={chef.avatarUrl}
                    alt={chef.name}
                    fill
                    className="object-cover"
                />
                {isTopRated && <Badge className="absolute top-2 right-2">Top Rated</Badge>}
            </div>
            </div>
        </CardContent>
        </Card>
    </Link>
  );
}
