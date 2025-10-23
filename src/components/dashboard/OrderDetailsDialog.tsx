'use client';

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

interface OrderDetailsDialogProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder: (orderId: string) => void;
}

export function OrderDetailsDialog({ order, isOpen, onClose, onCancelOrder }: OrderDetailsDialogProps) {
  const canCancel = order.status === 'Preparing' || order.status === 'Confirmed';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id} from {order.restaurant} on {order.date}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <h4 className="font-semibold">Status: {order.status}</h4>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Amount: ${order.amount.toFixed(2)}</h4>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Items:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {order.items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <div>
            {canCancel && (
                <Button variant="destructive" onClick={() => onCancelOrder(order.id)}>
                    Cancel Order
                </Button>
            )}
          </div>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
