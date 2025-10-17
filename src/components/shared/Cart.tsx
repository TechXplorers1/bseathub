'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <SheetHeader>
        <SheetTitle>Your Cart ({itemCount})</SheetTitle>
      </SheetHeader>
      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1 pr-4">
            <div className="mt-4 space-y-6">
              {cartItems.map((item) => {
                const image = getImageById(item.imageId);
                return (
                  <div key={item.id} className="flex items-start space-x-4">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
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
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0) }
                          className="h-7 w-12 text-center mx-2"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <SheetFooter className="mt-auto flex flex-col space-y-4 pt-4 pr-4">
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes and delivery fee calculated at checkout.
            </p>
            <div className="flex space-x-2">
                <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
                <SheetClose asChild>
                    <Link href="/track-order" className={cn(buttonVariants(), "w-full")}>
                        Checkout
                    </Link>
                </SheetClose>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
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
