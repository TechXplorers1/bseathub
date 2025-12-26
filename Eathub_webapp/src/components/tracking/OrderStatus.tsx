'use client'

import { useState, useEffect } from 'react';
import { CheckCircle2, CookingPot, Bike, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const statuses = [
  { name: 'Order Confirmed', icon: CheckCircle2, time: '8:05 PM' },
  { name: 'Preparing', icon: CookingPot, time: '8:10 PM' },
  { name: 'Out for Delivery', icon: Bike, time: '8:20 PM' },
  { name: 'Delivered', icon: Home, time: '' },
];

export function OrderStatus() {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    // Simulate order progress
    const interval = setInterval(() => {
      setCurrentStatusIndex((prevIndex) => {
        if (prevIndex < statuses.length - 1) {
          return prevIndex + 1;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, 5000); // Progress every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const progressValue = (currentStatusIndex / (statuses.length - 1)) * 100;

  return (
    <div>
      <Progress value={progressValue} className="mb-8 h-2" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {statuses.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          return (
            <div key={status.name} className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2',
                  isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border'
                )}
              >
                <status.icon className="h-6 w-6" />
              </div>
              <p
                className={cn(
                  'mt-2 font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {status.name}
              </p>
              {isCurrent && status.name !== 'Delivered' && (
                 <p className="text-sm text-muted-foreground animate-pulse">In Progress...</p>
              )}
              {isActive && status.time && (
                <p className="text-sm text-muted-foreground">{status.time}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
