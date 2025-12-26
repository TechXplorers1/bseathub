'use client';

import { Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function DealsAndDiscounts() {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4" id="Deals & Discounts">Deals & Discounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-50">
                <Tag className="h-6 w-6 text-primary" />
                <div>
                <h3 className="font-bold text-sm">50TREAT - 50% off your first order</h3>
                <p className="text-xs text-muted-foreground">50TREAT - 50% off your first order of $15+, up to $15</p>
                </div>
            </Card>
            <Card className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray.50">
                <Badge variant="outline">Eat Hub</Badge>
                <div>
                <h3 className="font-bold text-sm">Get $0 delivery fees with Eat Hub</h3>
                <p className="text-xs text-muted-foreground">Plus, low service fees. Sign up now.</p>
                </div>
                <Button size="sm" variant="secondary" className="ml-auto">Sign Up</Button>
            </Card>
            </div>
        </div>
    )
}
