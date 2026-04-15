'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, CookingPot, Bike, Home, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const statuses = [
    { id: 'Confirmed', name: 'Order Confirmed', icon: CheckCircle2 },
    { id: 'Preparing', name: 'Preparing', icon: CookingPot },
    { id: 'Preparation Completed', name: 'Cooking Finished', icon: PartyPopper },
    { id: 'Out for Delivery', name: 'Out for Delivery', icon: Bike },
    { id: 'Delivered', name: 'Delivered', icon: Home },
];

interface OrderStatusTrackerProps {
    currentStatusId?: string;
    onDelivered?: () => void;
}

export function OrderStatusTracker({ currentStatusId, onDelivered }: OrderStatusTrackerProps) {
    const statusIndex = statuses.findIndex(s => s.id === currentStatusId);
    const currentStatusIndex = statusIndex === -1 ? 0 : statusIndex;
    const [deliveredFired, setDeliveredFired] = useState(false);

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

            <div className="flex flex-row justify-between items-start w-full relative px-0 sm:px-2">
                {statuses.map((status, index) => {
                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                        <div key={status.id} className="flex flex-col items-center gap-1.5 w-14 sm:w-24 break-words">
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500',
                                    isActive
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                                        : 'bg-muted border-border text-muted-foreground'
                                )}
                            >
                                <status.icon className={cn('h-5 w-5', isCurrent && isActive && 'animate-bounce')} />
                            </div>
                            <p className={cn(
                                'text-[10px] font-bold leading-tight transition-colors',
                                isActive ? 'text-orange-600' : 'text-muted-foreground'
                            )}>
                                {status.name}
                            </p>
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
