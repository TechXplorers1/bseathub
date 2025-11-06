
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
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  Utensils,
  Building2,
  ChefHat,
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
import { useDeliveryMode } from '@/context/DeliveryModeProvider';
import { Notifications } from './Notifications';
import { useUser, useAuth } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';

export function Header() {
  const { itemCount } = useCart();
  const { headerTitle } = useHeader();
  const { location, setLocation } = useLocation();
  const [newLocation, setNewLocation] = useState(location);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { deliveryMode, setDeliveryMode } = useDeliveryMode();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();


  const handleLocationSave = () => {
    setLocation(newLocation);
    setIsDialogOpen(false);
  };

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const hasNotifications = true; // Placeholder for notification state

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden" />
          <Link href="/" className="hidden md:flex items-center space-x-2">
            {headerTitle ? (
              <span className="text-xl font-bold">{headerTitle}</span>
            ) : (
              <>
                <Flame className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">Eat Hub</span>
              </>
            )}
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex relative">
                <Bell />
                {hasNotifications && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary" />}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Notifications />
            </SheetContent>
          </Sheet>

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

          {isUserLoading && <Skeleton className="h-10 w-10 rounded-full" />}
          
          {!isUserLoading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                 <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                     <Link href="/admin/dashboard">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/home-food-dashboard">
                      <Utensils className="mr-2 h-4 w-4" />
                      <span>Home Food</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/restaurant-dashboard">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Restaurant</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/chef-dashboard">
                      <ChefHat className="mr-2 h-4 w-4" />
                      <span>Chef</span>
                    </Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ): (
             <Button variant="outline" className="hidden md:inline-flex" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
