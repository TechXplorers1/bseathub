'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { getImageById } from '@/lib/placeholder-images';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart, itemCount } = useCart();

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="px-6">
        <SheetTitle>Your Cart ({itemCount})</SheetTitle>
      </SheetHeader>
      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <div className="mt-4 divide-y divide-border px-6">
              {cartItems.map((item) => {
                const image = getImageById(item.imageId);
                return (
                  <div key={item.id} className="flex items-center space-x-4 py-4">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover h-16 w-16"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium leading-tight">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <SheetFooter className="mt-auto flex flex-col space-y-4 p-6 bg-background border-t">
            <div className="space-y-2">
                <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                Taxes and delivery fee calculated at checkout.
                </p>
            </div>
            <div className="flex flex-col space-y-2">
                <SheetClose asChild>
                    <Link href="/track-order" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                        Checkout
                    </Link>
                </SheetClose>
                <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={clearCart}>Clear Cart</Button>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 px-6">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm text-muted-foreground text-center">
            Add items from a restaurant to get started.
          </p>
          <SheetClose asChild>
            <Button>Start Shopping</Button>
          </SheetClose>
        </div>
      )}
    </div>
  );
}
