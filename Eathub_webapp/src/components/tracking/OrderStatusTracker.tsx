'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, CookingPot, Bike, Home, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const statuses = [
    { name: 'Order Confirmed', icon: CheckCircle2, time: '8:05 PM' },
    { name: 'Preparing', icon: CookingPot, time: '8:10 PM' },
    { name: 'Out for Delivery', icon: Bike, time: '8:20 PM' },
    { name: 'Delivered', icon: Home, time: '' },
];

interface OrderStatusTrackerProps {
    /** Called once when status reaches "Delivered" */
    onDelivered?: () => void;
}

export function OrderStatusTracker({ onDelivered }: OrderStatusTrackerProps) {
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
    const [deliveredFired, setDeliveredFired] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStatusIndex((prev) => {
                if (prev < statuses.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Fire onDelivered once when we hit the last step
    useEffect(() => {
        if (
            currentStatusIndex === statuses.length - 1 &&
            !deliveredFired &&
            onDelivered
        ) {
            setDeliveredFired(true);
            onDelivered();
        }
    }, [currentStatusIndex, deliveredFired, onDelivered]);

    const progressValue = (currentStatusIndex / (statuses.length - 1)) * 100;
    const isDelivered = currentStatusIndex === statuses.length - 1;

    return (
        <div className="space-y-6">
            <Progress
                value={progressValue}
                className="h-2.5 rounded-full transition-all duration-700"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {statuses.map((status, index) => {
                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                        <div key={status.name} className="flex flex-col items-center gap-1">
                            <div
                                className={cn(
                                    'flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500',
                                    isActive
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'bg-muted border-border text-muted-foreground'
                                )}
                            >
                                <status.icon className={cn('h-6 w-6', isCurrent && isActive && 'animate-bounce')} />
                            </div>
                            <p className={cn(
                                'mt-1 text-sm font-semibold transition-colors',
                                isActive ? 'text-orange-600' : 'text-muted-foreground'
                            )}>
                                {status.name}
                            </p>
                            {isCurrent && !isDelivered && (
                                <p className="text-xs text-muted-foreground animate-pulse">In Progress…</p>
                            )}
                            {isActive && status.time && (
                                <p className="text-xs text-muted-foreground">{status.time}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Delivered celebration banner */}
            {isDelivered && (
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-5 py-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <PartyPopper className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-green-800 text-sm">Your order has been delivered! 🎉</p>
                            <p className="text-xs text-green-600">We hope you enjoyed your meal.</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => onDelivered?.()}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs px-4 flex-shrink-0 shadow shadow-orange-200"
                    >
                        Rate Order ⭐
                    </Button>
                </div>
            )}
        </div>
    );
}
