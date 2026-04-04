
'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { OrderResponse } from '@/lib/types';
import { Star, MapPin, Receipt, Clock, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { ReviewDialog } from './ReviewDialog';
import { useRouter } from 'next/navigation';
import { checkAlreadyReviewed } from '@/services/api';
import { useEffect } from 'react';

interface OrderDetailsDialogProps {
    order: OrderResponse;
    isOpen: boolean;
    onClose: () => void;
    onCancelOrder?: (orderId: string) => void;
}

export function OrderDetailsDialog({
    order,
    isOpen,
    onClose,
    onCancelOrder,
}: OrderDetailsDialogProps) {
    const router = useRouter();
    const canCancel = ['Pending Approval', 'Approved', 'Confirmed'].includes(order.currentStatusId);
    const isDelivered = order.currentStatusId === 'Delivered';
    const isActive = !['Delivered', 'Cancelled'].includes(order.currentStatusId);

    const [showReview, setShowReview] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);

    useEffect(() => {
        if (!isOpen || !isDelivered) return;

        const checkStatus = async () => {
            const customerId = localStorage.getItem('userId') || localStorage.getItem('customerId') || localStorage.getItem('userEmail');
            if (!customerId) return;
            try {
                const reviewed = await checkAlreadyReviewed(customerId, order.sourceId, undefined, order.id);
                setIsReviewed(reviewed);
            } catch (err) {
                console.error("Failed to check if order reviewed", err);
            }
        };
        checkStatus();
    }, [isOpen, isDelivered, order.id, order.sourceId]);

    const handleRateNow = () => {
        onClose();
        setTimeout(() => setShowReview(true), 150);
    };

    const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        'Delivered': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
        'Preparing': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
        'Confirmed': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
        'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
        'Pending Approval': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
        'Approved': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
        'Out for Delivery': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    };

    const config = statusConfig[order.currentStatusId] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-card">

                    {/* Header Section */}
                    <div className="bg-slate-900 px-8 pt-8 pb-6 text-white relative">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tighter uppercase">Order #{order.id.slice(0, 8)}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                    <ShoppingBag className="h-4 w-4" />
                                    {order.sourceName}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Placed On</p>
                                <p className="text-sm font-black">{new Date(order.orderPlacedAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <span className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full border shadow-sm uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}>
                                <span className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`} />
                                {order.currentStatusId}
                            </span>
                            {order.paymentStatus === 'Paid' && (
                                <Badge variant="outline" className="rounded-full border-green-500/50 text-green-400 font-black text-[10px] bg-green-500/10">PAID</Badge>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

                        {/* Cancellation Info */}
                        {order.currentStatusId === 'Cancelled' && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-2">
                                <h4 className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Cancellation Details
                                </h4>
                                <p className="text-sm font-bold text-red-700 leading-relaxed italic">
                                    "{order.cancellationReason || "No reason provided."}"
                                </p>
                                <p className="text-[10px] font-black uppercase text-red-400">
                                    Cancelled By: <span className="text-red-600">{order.cancelledBy || 'User'}</span>
                                </p>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div className="flex gap-4 items-start">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Delivery Address</h4>
                                <p className="text-sm font-bold text-foreground leading-relaxed">{order.deliveryAddress}</p>
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* Items Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Order Items
                                </h4>
                                <span className="text-[10px] font-bold text-muted-foreground">{(order.items || []).length} items</span>
                            </div>
                            <div className="space-y-3">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-muted/20 p-3 rounded-2xl group hover:bg-muted/40 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{item.itemName}</span>
                                                <span className="text-[10px] font-black opacity-60 uppercase">{item.itemType}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-muted-foreground">x{item.quantity}</span>
                                                <span className="text-sm font-black">${item.totalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-muted/10 rounded-2xl border border-dashed border-muted">
                                        <p className="text-xs font-bold text-muted-foreground">No items found for this order</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* Summary Section */}
                        <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
                            <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${order.subtotalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <span>Fees & Taxes</span>
                                    <Clock className="h-3 w-3" />
                                </div>
                                <span>${(order.deliveryFee + order.taxAmount + order.platformFee).toFixed(2)}</span>
                            </div>
                            <Separator className="bg-border" />
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grand Total</span>
                                    <span className="text-2xl font-black text-foreground">${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</span>
                                    <span className="text-xs font-bold">{order.paymentMethod}</span>
                                </div>
                            </div>
                        </div>

                        {/* Review CTA */}
                        {isDelivered && (
                            <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-[1px] shadow-xl shadow-orange-500/20">
                                <div className="bg-white rounded-[15px] px-6 py-5 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">How was the food?</p>
                                        <p className="text-xs text-muted-foreground font-medium">Rate your experience at {order.sourceName}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleRateNow}
                                        disabled={isReviewed}
                                        className={cn(
                                            "rounded-full text-xs px-6 font-black h-10 shadow-lg",
                                            isReviewed
                                                ? "bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed"
                                                : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30"
                                        )}
                                    >
                                        {isReviewed ? 'Already Rated ✅' : 'Rate Now ⭐'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 pt-2 bg-card flex items-center gap-4">
                        {isActive && (
                            <Button
                                className="flex-1 bg-primary text-white hover:bg-primary/90 font-black rounded-2xl h-12 shadow-lg shadow-primary/25 uppercase tracking-wider text-xs"
                                onClick={() => {
                                    onClose();
                                    router.push(`/track-order?orderId=${order.id}`);
                                }}
                            >
                                Track Live Status
                            </Button>
                        )}
                        {canCancel && onCancelOrder && (
                            <Button
                                variant="destructive"
                                onClick={() => onCancelOrder(order.id)}
                                className="font-black rounded-2xl h-12 px-6 uppercase tracking-wider text-xs"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button variant="ghost" className="font-bold text-muted-foreground" onClick={onClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Step 2: Review Dialog */}
            <ReviewDialog
                isOpen={showReview}
                onClose={() => setShowReview(false)}
                targetId={order.sourceId}
                targetType={order.sourceType as any}
                providerName={order.sourceName}
                orderedItems={order.items.map(i => ({ id: i.itemRefId, name: i.itemName }))}
                orderTotal={order.totalAmount}
                orderDate={new Date(order.orderPlacedAt).toLocaleDateString()}
                orderId={order.id}
            />
        </>
    );
}
