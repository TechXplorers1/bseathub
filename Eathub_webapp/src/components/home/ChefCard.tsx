
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight, ChefHat, UserCircle2, MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { getDisplayImage } from '@/lib/image-utils';
import type { Chef } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/shared/FavoriteButton';

interface ChefCardProps {
    chef: Chef;
    priority?: boolean;
}

export function ChefCard({ chef, priority = false }: ChefCardProps) {
    const displayImage = getDisplayImage(chef.avatarUrl, 'chef-1');

    return (
        <Link
            href={`/restaurant/${chef.slug || chef.id}?chef=${encodeURIComponent(chef.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex"
        >
            <Card className="overflow-hidden transition-all hover:shadow-lg w-full flex flex-col group relative">
                <div className="relative h-96 w-full bg-muted/20 flex items-center justify-center">
                    {!chef.avatarUrl ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                            <UserCircle2 className="h-20 w-20 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">No Portrait</span>
                        </div>
                    ) : (
                        <Image
                            src={displayImage}
                            alt={chef.name}
                            fill
                            className="object-cover"
                            priority={priority}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    )}
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                        <FavoriteButton 
                            targetId={chef.id || ''} 
                            targetType="CHEF" 
                        />
                        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full flex items-center justify-center">
                            <ChefHat className="h-5 w-5 text-primary" />
                        </div>
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
                                {chef.distanceKm != null && (
                                    <Badge variant="secondary" className="bg-primary/90 text-white border-none flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{chef.distanceKm < 1 ? `${(chef.distanceKm * 1000).toFixed(0)}m` : `${chef.distanceKm.toFixed(1)}km`}</span>
                                    </Badge>
                                )}
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

export function ChefCardSkeleton() {
    return (
        <Card className="overflow-hidden w-full flex flex-col relative animate-pulse">
            <div className="h-96 w-full bg-muted" />
            <div className="absolute bottom-4 left-0 w-full p-4 space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/2 bg-slate-200" />
                    <Skeleton className="h-6 w-12 bg-slate-200" />
                </div>
                <Skeleton className="h-4 w-1/3 bg-slate-200" />
                <Skeleton className="h-10 w-full bg-slate-200" />
            </div>
        </Card>
    );
}
