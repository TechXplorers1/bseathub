'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Flame,
} from 'lucide-react';
import { Cart } from './Cart';
import { useCart } from '@/context/CartProvider';

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
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
                  <Button>Sign In</Button>
                  <Button variant="secondary">Sign Up</Button>
                </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <Flame className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">SwiftDash</span>
          </Link>

          <div className="hidden lg:flex items-center ml-6 bg-gray-100 rounded-full px-4 py-2 text-sm font-medium">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <span>Now · 123 Main St</span>
              <ChevronDown className="h-4 w-4 ml-2" />
          </div>
        </div>
        
        <div className="relative flex-1 mx-4 max-w-lg hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search food, restaurants..."
            className="pl-9 rounded-full bg-gray-100 border-none focus-visible:ring-primary"
          />
        </div>
        
        <nav className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden ml-2 text-sm font-medium md:block">Cart</span>
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-5 min-w-[1.25rem] justify-center rounded-full px-1 text-xs"
                    >
                      {itemCount}
                    </Badge>
                  )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Cart />
            </SheetContent>
          </Sheet>

          <Button className='hidden md:flex'>
            <User className="h-5 w-5 md:mr-2" />
            <span className="hidden md:block">Sign In</span>
          </Button>
          <Button variant="secondary" className="hidden md:flex">Sign Up</Button>
        </nav>
      </div>
    </header>
  );
}
