
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { OrderResponse } from '@/lib/types';

interface OrderDetailsDialogProps {
  order: OrderResponse;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDialog({ order, isOpen, onClose }: OrderDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Order Details</DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground/80">
            ID: #{order.id.slice(0, 12)} • {new Date(order.orderPlacedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-border/50" />
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border/50">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{order.customerName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-foreground">{order.customerName}</p>
              <p className="text-xs text-muted-foreground font-bold truncate max-w-[200px]">{order.deliveryAddress}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-primary">Items Ordered</h4>
            <div className="space-y-3 bg-muted/10 rounded-xl p-4 border border-border/20">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm items-center">
                  <div className="flex flex-col">
                      <span className="font-bold text-foreground">{item.itemName}</span>
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{item.itemType}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                      <span className="bg-muted px-2 py-0.5 rounded-md text-[10px] font-black">x{item.quantity}</span>
                      <span className="font-black text-secondary-foreground">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-xl p-4 space-y-2 border border-primary/10">
             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.subtotalAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Delivery & Tax</span>
                <span>₹{(order.deliveryFee + order.taxAmount).toFixed(2)}</span>
             </div>
             <Separator className="my-2 bg-primary/20" />
             <div className="flex justify-between font-black text-lg text-primary">
                <span>Total Earned</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
             </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full rounded-xl font-bold shadow-sm transition-all active:scale-95">
              Close Preview
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
