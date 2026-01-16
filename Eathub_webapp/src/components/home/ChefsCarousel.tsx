'use client';

import { useEffect, useState } from 'react';
import { ChefCard } from './ChefCard';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Chef } from '@/lib/types';

export function ChefsCarousel() {
    const [chefs, setChefs] = useState<Chef[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChefs = async () => {
            try {
                // Note: Using the port 8081 from your backend setup
                const response = await fetch('http://localhost:8081/api/v1/chefs');
                if (!response.ok) throw new Error('Failed to fetch chefs');
                const data = await response.json();
                setChefs(data);
            } catch (error) {
                console.error("Error loading chefs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChefs();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center">Loading Chefs...</div>;
    if (chefs.length === 0) return null;

    const INITIAL_VISIBLE_COUNT = 8;
    const visibleChefs = chefs.slice(0, INITIAL_VISIBLE_COUNT);

    return (
        <div className="py-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold">Book a Private Chef</h2>
                {chefs.length > INITIAL_VISIBLE_COUNT && (
                    <Link href="/chefs" className={cn(buttonVariants({ variant: 'ghost' }))}>
                        See all <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleChefs.map((chef) => (
                    <ChefCard key={chef.id} chef={chef} />
                ))}
            </div>
        </div>
    );
}