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
import type { Order } from '@/lib/types';
import { Separator } from '../ui/separator';
import { Star } from 'lucide-react';
import { ReviewDialog } from './ReviewDialog';

interface OrderDetailsDialogProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onCancelOrder: (orderId: string) => void;
}

export function OrderDetailsDialog({
    order,
    isOpen,
    onClose,
    onCancelOrder,
}: OrderDetailsDialogProps) {
    const canCancel = order.status === 'Preparing' || order.status === 'Confirmed';
    const isDelivered = order.status === 'Delivered';

    // ── Fix: no nested dialogs. Use a 2-step flow instead.
    //    Step 1 → OrderDetailsDialog (isOpen=true, showReview=false)
    //    Step 2 → Close step-1, open ReviewDialog   (showReview=true)
    const [showReview, setShowReview] = useState(false);

    const handleRateNow = () => {
        // Close the order details dialog first, THEN open the review dialog
        onClose();
        // Small delay so Radix fully unmounts the first dialog before opening the second
        setTimeout(() => setShowReview(true), 150);
    };

    const statusColors: Record<string, string> = {
        Delivered: 'bg-green-100 text-green-700 border-green-200',
        Preparing: 'bg-amber-100 text-amber-700 border-amber-200',
        Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        Cancelled: 'bg-red-100 text-red-700 border-red-200',
        Pickup: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const dotColors: Record<string, string> = {
        Delivered: 'bg-green-500',
        Preparing: 'bg-amber-500',
        Confirmed: 'bg-blue-500',
        Cancelled: 'bg-red-500',
        Pickup: 'bg-purple-500',
    };

    return (
        <>
            {/* ── Step 1: Order Details ── */}
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">

                    {/* Gradient header */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-5 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white">
                                Order #{order.id}
                            </DialogTitle>
                            <DialogDescription className="text-slate-300 mt-0.5 text-sm">
                                {order.restaurant} · {order.date}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${dotColors[order.status] ?? 'bg-gray-400'}`} />
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4 bg-white">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <span className="text-lg font-bold text-slate-800">₹{order.amount.toFixed(2)}</span>
                        </div>

                        <Separator />

                        {/* Items ordered */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-700">Items Ordered</h4>
                            <ul className="space-y-1.5">
                                {order.items.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Rate your experience CTA — only for delivered orders */}
                        {isDelivered && (
                            <>
                                <Separator />
                                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-3.5 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`h-3.5 w-3.5 ${s <= 3 ? 'fill-amber-400 text-amber-400' : 'text-amber-200 fill-amber-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm font-semibold text-amber-900">How was your experience?</p>
                                        <p className="text-xs text-amber-700">Your review helps others decide!</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleRateNow}
                                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs px-4 flex-shrink-0 shadow-md shadow-orange-200"
                                    >
                                        Rate Now ⭐
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 pb-5 bg-white border-t border-gray-100 gap-2 sm:gap-0">
                        {canCancel && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onCancelOrder(order.id)}
                                className="rounded-full"
                            >
                                Cancel Order
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" className="rounded-full ml-auto">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Step 2: Review Dialog (opens AFTER step-1 closes) ── */}
            <ReviewDialog
                isOpen={showReview}
                onClose={() => setShowReview(false)}
                targetId={order.restaurantId}
                targetType="Restaurant"
                providerName={order.restaurant}
                orderedItems={order.items}
                orderTotal={order.amount}
                orderDate={order.date}
                orderId={order.id}
            />
        </>
    );
}
