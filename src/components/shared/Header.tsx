'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { useHeader } from '@/context/HeaderProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLocation } from '@/context/LocationProvider';
import { useState } from 'react';

export function Header() {
  const { itemCount } = useCart();
  const { headerTitle } = useHeader();
  const { location, setLocation } = useLocation();
  const [newLocation, setNewLocation] = useState(location);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLocationSave = () => {
    setLocation(newLocation);
    setIsDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden" />
          <Link href="/" className="hidden md:flex items-center space-x-2">
            {headerTitle ? (
              <span className="text-xl font-bold">{headerTitle}</span>
            ) : (
              <>
                <Flame className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">SwiftDash</span>
              </>
            )}
          </Link>
        </div>

        <div className="relative flex-1 mx-4 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search SwiftDash"
            className="pl-9 rounded-full bg-gray-100 border-none focus-visible:ring-primary"
          />
        </div>

        <nav className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm font-medium cursor-pointer">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="truncate">{location}</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogDescription>
                  Update your delivery address here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleLocationSave}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="hidden md:flex">
            <Button variant="secondary" className="rounded-full">
              Delivery
            </Button>
            <Button variant="ghost" className="rounded-full">
              Pickup
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="relative rounded-full bg-primary-red hover:bg-red-500">
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
