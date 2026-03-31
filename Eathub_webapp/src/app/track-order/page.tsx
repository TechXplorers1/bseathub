'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusTracker } from '@/components/tracking/OrderStatusTracker';
import { getImageById } from '@/lib/placeholder-images';
import { ReviewDialog } from '@/components/dashboard/ReviewDialog';
import { useCart } from '@/context/CartProvider';

// Fallback demo order info if the cart is empty (for demo purposes)
const DEMO_ORDER = {
    id: 'SW' + Math.floor(Math.random() * 90000 + 10000),
    restaurant: 'The Golden Spoon',
    restaurantId: '1',
    items: ['Spaghetti Carbonara'],
    amount: 32.50,
    date: new Date().toLocaleDateString('en-IN'),
};

export default function TrackOrderPage() {
    const mapImage = getImageById('track-order-map');
    const [showReview, setShowReview] = useState(false);
    const { cartItems, cartTotal } = useCart();
    
    // Dynamically calculate what the user *actually* ordered from the cart
    const dynamicItems = cartItems.length > 0 ? cartItems.map(item => item.name) : DEMO_ORDER.items;
    const dynamicTotal = cartItems.length > 0 ? cartTotal : DEMO_ORDER.amount;
    const dynamicRestaurant = cartItems.length > 0 ? (cartItems[0].restaurantName || 'Eathub Restaurant') : DEMO_ORDER.restaurant;
    const dynamicOrderId = DEMO_ORDER.id; // Just generate a random one for the demo flow

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex items-center justify-center">
                <div className='w-full'>
                    <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
                    <Card className="mx-auto max-w-4xl">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Order #{dynamicOrderId}</CardTitle>
                                    <p className="text-muted-foreground">From {dynamicRestaurant}</p>
                                </div>
                                <p className="text-lg font-semibold">Estimated Arrival: 8:30 PM</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {mapImage && (
                                <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8">
                                    <Image
                                        src={mapImage.imageUrl}
                                        alt={mapImage.description}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        data-ai-hint={mapImage.imageHint}
                                    />
                                </div>
                            )}

                            {/* Pass onDelivered callback — triggers review dialog */}
                            <OrderStatusTracker
                                onDelivered={() => {
                                    // Small delay so the "Delivered" animation finishes first
                                    setTimeout(() => setShowReview(true), 800);
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Review dialog — pops up automatically once order is delivered */}
            <ReviewDialog
                isOpen={showReview}
                onClose={() => setShowReview(false)}
                targetId={DEMO_ORDER.restaurantId}
                targetType="Restaurant"
                providerName={dynamicRestaurant}
                orderedItems={dynamicItems}
                orderTotal={dynamicTotal}
                orderDate={DEMO_ORDER.date}
                orderId={dynamicOrderId}
            />
        </>
    );
}
