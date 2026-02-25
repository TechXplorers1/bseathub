
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight, ChefHat } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Chef, Restaurant } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChefCardProps {
    chef: Chef;
}

export function ChefCard({ chef }: ChefCardProps) {

    return (
        <Link href={`/restaurant/${chef.slug}?chef=${encodeURIComponent(chef.name)}`} className="flex">
            <Card className="overflow-hidden transition-all hover:shadow-lg w-full flex flex-col group relative">
                <div className="relative h-96 w-full">
                    <Image
                        src={chef.avatarUrl}
                        alt={chef.name}
                        fill
                        className="object-cover"
                        data-ai-hint="chef portrait"
                    />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full">
                        <ChefHat className="h-5 w-5 text-primary" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <CardContent className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end text-white">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">Chef {chef.name}</h3>
                                <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span>
                                        {chef.rating != null ? chef.rating.toFixed(1) : "0.0"}
                                    </span>
                                </Badge>
                            </div>
                            <p className="text-sm text-white/90">{chef.specialty}</p>
                            <p className="text-sm text-white/80 mt-2 line-clamp-2">{chef.bio}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {chef.preference && (
                                    <Badge variant="outline" className="text-white border-white/50">{chef.preference}</Badge>
                                )}
                                <span className="text-sm text-white/80">{chef.reviews} reviews</span>
                            </div>
                        </div>
                    </CardContent>
                </div>

                <div className={cn(
                    "absolute bottom-0 left-0 w-full bg-primary/80 backdrop-blur-sm transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0 flex items-center justify-center",
                    "h-12"
                )}>
                    <div className="flex items-center justify-center whitespace-nowrap">
                        <span className="text-primary-foreground font-semibold tracking-wider text-sm uppercase">Book a Chef</span>
                        <ArrowRight className="ml-2 h-4 w-4 text-primary-foreground" />
                    </div>
                </div>
            </Card>
        </Link>
    );
}
