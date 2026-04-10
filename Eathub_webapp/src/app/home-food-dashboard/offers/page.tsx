'use client';

import * as React from 'react';
import { OffersManagement } from '@/components/dashboard/OffersManagement';

export default function HomeFoodOffersPage() {
    const [providerId, setProviderId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const id = localStorage.getItem('homeFoodId');
        if (id) {
            setProviderId(id);
        }
    }, []);

    return (
        <div className="container mx-auto">
            <OffersManagement providerId={providerId} type="home-food" />
        </div>
    );
}
