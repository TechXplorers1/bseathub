'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Search,
  ShoppingCart,
  MapPin,
  ChevronDown,
  Flame,
  Bell,
} from 'lucide-react';
import { Cart } from './Cart';
import { useCart } from '@/context/CartProvider';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden" />
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <Flame className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold text-red-500">Eat Hub</span>
          </Link>
        </div>
        
        <div className="relative flex-1 mx-4 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Eat Hub"
            className="pl-9 rounded-full bg-gray-100 border-none focus-visible:ring-primary"
          />
        </div>
        
        <nav className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm font-medium">
              <MapPin className="h-5 w-5 mr-2" />
              <span>7300182 Canada Inc.</span>
              <ChevronDown className="h-4 w-4 ml-2" />
          </div>

          <div className="hidden md:flex">
            <Button variant="secondary" className="rounded-full">Delivery</Button>
            <Button variant="ghost" className="rounded-full">Pickup</Button>
          </div>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="relative rounded-full">
                  <ShoppingCart className="h-5 w-5" />
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
        </nav>
      </div>
    </header>
  );
}
