'use client';

import * as React from 'react';
import { OffersManagement } from '@/components/dashboard/OffersManagement';

export default function RestaurantOffersPage() {
    const [restaurantId, setRestaurantId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("restaurant") || "{}");
        if (stored?.id) {
            setRestaurantId(stored.id);
        }
    }, []);

    return (
        <div className="container mx-auto">
            <OffersManagement providerId={restaurantId} type="restaurant" />
        </div>
    );
}
