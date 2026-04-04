'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusTracker } from '@/components/tracking/OrderStatusTracker';
import { getImageById } from '@/lib/placeholder-images';
import { ReviewDialog } from '@/components/dashboard/ReviewDialog';
import { useCart } from '@/context/CartProvider';
import { fetchOrderById } from '@/services/api';
import type { OrderResponse } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createRazorpayOrder, fetchUserProfile } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const DEMO_ORDER = {
    id: 'SW' + Math.floor(Math.random() * 90000 + 10000),
    restaurant: 'The Golden Spoon',
    restaurantId: '1',
    items: ['Spaghetti Carbonara'],
    amount: 32.50,
    date: new Date().toLocaleDateString('en-IN'),
};

export default function TrackOrderPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { toast } = useToast();
    const mapImage = getImageById('track-order-map');
    
    const [showReview, setShowReview] = useState(false);
    const [loading, setLoading] = useState(!!orderId);
    const [orderDetail, setOrderDetail] = useState<OrderResponse | null>(null);

    useEffect(() => {
        if (!orderId) return;
        
        const getOrder = async () => {
            try {
                const data = await fetchOrderById(orderId);
                setOrderDetail(data);
            } catch (error) {
                console.error("Failed to fetch order for tracking:", error);
            } finally {
                setLoading(false);
            }
        };

        getOrder();
        
        // Polling every 10 seconds for status updates
        const interval = setInterval(getOrder, 10000);
        return () => clearInterval(interval);
    }, [orderId]);



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Fetching your order details...</p>
            </div>
        );
    }

    const dynamicItems = orderDetail 
        ? orderDetail.items.map(item => ({ id: item.itemRefId, name: item.itemName }))
        : (DEMO_ORDER.items.map(name => ({ id: 'demo-1', name: name })));

    const dynamicTotal = orderDetail ? orderDetail.totalAmount : DEMO_ORDER.amount;
    const dynamicRestaurant = orderDetail ? (orderDetail.sourceType + " " + orderDetail.sourceId) : DEMO_ORDER.restaurant;
    const dynamicRestaurantId = orderDetail ? orderDetail.sourceId : DEMO_ORDER.restaurantId;
    const dynamicRestaurantType = orderDetail ? orderDetail.sourceType : 'Restaurant';
    const dynamicOrderId = orderId || DEMO_ORDER.id;
    const displayRestaurantName = orderDetail?.sourceName || (orderDetail ? `${orderDetail.sourceType} ${orderDetail.sourceId}` : 'The Golden Spoon');

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex items-center justify-center">
                <div className='w-full'>
                    <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
                    <Card className="mx-auto max-w-4xl shadow-xl border-t-4 border-t-primary">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-green-600">Active Order</span>
                                    </div>
                                    <CardTitle className="text-2xl font-black">Order #{dynamicOrderId.slice(0, 8).toUpperCase()}</CardTitle>
                                    <p className="text-muted-foreground font-medium">From {displayRestaurantName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary">
                                        {orderDetail?.currentStatusId === 'Cancelled' ? 'Status' : 'Estimated Arrival'}
                                    </p>
                                    <p className={`text-xl font-black ${orderDetail?.currentStatusId === 'Cancelled' ? 'text-destructive animate-pulse' : ''}`}>
                                        {orderDetail?.currentStatusId === 'Cancelled' ? 'Cancelled' : '25 - 35 min'}
                                    </p>
                                </div>
                            </div>
                            {orderDetail?.currentStatusId === 'Cancelled' && (
                                <div className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 animate-in zoom-in-95 duration-500">
                                    <h3 className="text-destructive font-black uppercase text-xs tracking-widest mb-1 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                                        Important Order Update
                                    </h3>
                                    <p className="text-sm font-bold text-foreground">
                                        {orderDetail.cancelledBy || 'User'} has cancelled this order.
                                    </p>
                                    {orderDetail.cancellationReason && (
                                        <p className="text-xs text-muted-foreground mt-2 italic font-medium bg-white/50 p-2 rounded-lg">
                                            Reason: "{orderDetail.cancellationReason}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {mapImage && (
                                <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-10 shadow-inner group">
                                    <Image
                                        src={mapImage.imageUrl}
                                        alt={mapImage.description}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className="transition-transform duration-700 group-hover:scale-105"
                                        data-ai-hint={mapImage.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            )}

                            <OrderStatusTracker
                                currentStatusId={orderDetail?.currentStatusId}
                                onDelivered={() => {
                                    setTimeout(() => setShowReview(true), 1200);
                                }}
                            />


                        </CardContent>
                    </Card>
                </div>
            </div>

            <ReviewDialog
                isOpen={showReview}
                onClose={() => setShowReview(false)}
                targetId={dynamicRestaurantId}
                targetType={dynamicRestaurantType as any}
                providerName={displayRestaurantName}
                orderedItems={dynamicItems}
                orderTotal={dynamicTotal}
                orderDate={orderDetail ? new Date(orderDetail.orderPlacedAt || '').toLocaleDateString() : DEMO_ORDER.date}
                orderId={dynamicOrderId}
            />
        </>
    );
}
