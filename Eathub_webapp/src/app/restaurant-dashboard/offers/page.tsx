'use client';

import * as React from 'react';
import { OffersManagement } from '@/components/dashboard/OffersManagement';

export default function RestaurantOffersPage() {
    const [restaurantId, setRestaurantId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const id = localStorage.getItem("restaurantId");
        if (id) {
            setRestaurantId(id);
        }
    }, []);

    return (
        <div className="container mx-auto">
            <OffersManagement providerId={restaurantId} type="restaurant" />
        </div>
    );
}
