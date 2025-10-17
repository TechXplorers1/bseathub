'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Flame,
  Menu,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Cart } from './Cart';
import { useCart } from '@/context/CartProvider';

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">SwiftDash</span>
          </Link>
        </div>
        
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
             <Link href="/" className="mr-6 flex items-center space-x-2 mb-4">
                <Flame className="h-6 w-6 text-primary" />
                <span className="font-bold sm:inline-block">SwiftDash</span>
              </Link>
              <div className="flex flex-col space-y-3">
                <Link href="/">Home</Link>
                <Link href="/track-order">Track Order</Link>
              </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search food & restaurants..."
                  className="pl-9"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <Cart />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
