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
  Menu, // Added Menu icon for better mobile trigger
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
import { useRouter } from 'next/navigation';
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

// ----------------------------------------------------
// NEW COMPONENT: Mobile Nav Sheet (consolidates menu items)
// ----------------------------------------------------
function MobileNavSheet({
  location,
  handleLocationDialog,
  hasNotifications,
  isUserLoading,
  user,
  handleLogout,
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <h3 className="text-lg font-semibold mb-6">Menu</h3>
        <div className="flex flex-col space-y-4">
          {/* Location Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-base"
            onClick={handleLocationDialog}
          >
            <MapPin className="h-5 w-5 mr-3" />
            <span>Delivery to:<br/> {location}</span>
          </Button>

          {/* Notifications Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-base relative">
                <Bell className="h-5 w-5 mr-3" />
                <span>Notifications</span>
                {hasNotifications && (
                  <span className="absolute left-8 top-3 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <Notifications />
            </SheetContent>
          </Sheet>

          <DropdownMenuSeparator />

          {/* User Section (re-using the dropdown logic for simplicity) */}
          {isUserLoading && <Skeleton className="h-10 w-full rounded-md" />}

          {!isUserLoading && user ? (
            <div className="p-2 border-t mt-4 pt-4">
              <p className="font-medium text-sm mb-2">{user.displayName || user.email}</p>
              <Link href="/dashboard" passHref>
                <Button variant="ghost" className="w-full justify-start text-base">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              {/* Additional Dashboards... (omitted for brevity) */}
              <Button
                variant="ghost"
                className="w-full justify-start text-base text-red-600 hover:bg-red-50 hover:text-red-600 mt-2"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Button>
            </div>
          ) : (
            <Link href="/login" passHref>
              <Button variant="default" className="w-full">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
// ----------------------------------------------------


export function Header() {
  const { itemCount } = useCart();
  const { headerTitle } = useHeader();
  const { location, setLocation } = useLocation();
  const [newLocation, setNewLocation] = useState(location);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false); // New state for mobile search
  const { deliveryMode, setDeliveryMode } = useDeliveryMode();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();


  const handleLocationSave = () => {
    setLocation(newLocation);
    setIsDialogOpen(false);
  };

  const handleLocationDialog = () => {
    setIsDialogOpen(true);
  };

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  const hasNotifications = true; // Placeholder for notification state

  return (
    // 👇 UPDATED: Fixed Header with high Z-index
    <header className="fixed top-0 left-0 w-full z-50 border-b bg-background shadow-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center">
          {/* Mobile Nav/Hamburger Menu */}
          <MobileNavSheet 
            location={location}
            handleLocationDialog={handleLocationDialog}
            hasNotifications={hasNotifications}
            isUserLoading={isUserLoading}
            user={user}
            handleLogout={handleLogout}
          />

          <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0"> {/* Adjusted margin for mobile menu */}
            {headerTitle ? (
              // Responsive Title size
              <span className="text-xl font-bold transition-colors duration-200 hover:text-primary/80">{headerTitle}</span>
            ) : (
              <>
                <Flame className="h-7 w-7 text-primary transition-transform duration-300 hover:rotate-6" />
                {/* Responsive Logo Text Size */}
                <span className="text-lg md:text-2xl font-bold text-primary">Eat Hub</span>
              </>
            )}
          </Link>
        </div>

        {/* Search Bar - Hidden on mobile by default, shown from 'sm' breakpoint */}
        {/* Or conditionally rendered for mobile if needed for a simple solution */}
        <div className="relative flex-1 mx-4 max-w-lg hidden sm:flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Eat Hub"
            className="pl-9 rounded-full bg-gray-100 border-none focus-visible:ring-primary transition-all duration-300 hover:bg-gray-200"
          />
        </div>

        <nav className="flex items-center space-x-2">
            
            {/* NEW: Mobile Search Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="sm:hidden transition-colors duration-200"
                onClick={() => setIsSearchVisible(true)} // A full implementation would use a state/modal here
            >
                <Search className="h-5 w-5" />
            </Button>
            {/* Note: The full mobile search overlay/modal is omitted for brevity. A simple component to show the search bar would be:
            {isSearchVisible && <MobileSearchModal onClose={() => setIsSearchVisible(false)} />}
            */}


          {/* Location Dialog Trigger (Desktop only) */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              {/* Location Picker is hidden on small screens, shown from 'lg' breakpoint */}
              <Button 
                variant="ghost" 
                className="hidden lg:flex items-center h-10 px-4 py-2 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <MapPin className="h-5 w-5 mr-2" />
                <span className="truncate max-w-[100px]">{location}</span>
                <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-200" />
              </Button>
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
                    className="col-span-3 transition-colors duration-200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleLocationSave} className="transition-all duration-200">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Notifications Sheet (Desktop only) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex relative transition-colors duration-200 hover:bg-gray-100">
                <Bell className="transition-transform duration-300 hover:scale-105" />
                {hasNotifications && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-ping-once" />}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Notifications />
            </SheetContent>
          </Sheet>

          {/* Cart Sheet (Visible on all screen sizes) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="relative rounded-full transition-all duration-200 hover:scale-[1.02]">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 min-w-[1.25rem] justify-center rounded-full px-1 text-xs transition-all duration-300"
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
          
          {/* User Dropdown Menu (Visible on all screen sizes) */}
          {!isUserLoading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full transition-all duration-200 hover:ring-2 hover:ring-primary/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                    <AvatarFallback className="transition-colors duration-200 bg-gray-200 hover:bg-gray-300">
                      {user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-gray-100">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Dashboards</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-gray-100">
                    <Link href="/admin/dashboard">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-gray-100">
                    <Link href="/home-food-dashboard">
                      <Utensils className="mr-2 h-4 w-4" />
                      <span>Home Food</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-gray-100">
                    <Link href="/restaurant-dashboard">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Restaurant</span>
                    </Link>
                  </DropdownMenuItem>
                    <DropdownMenuItem asChild className="transition-colors duration-150 hover:bg-gray-100">
                    <Link href="/chef-dashboard">
                      <ChefHat className="mr-2 h-4 w-4" />
                      <span>Chef</span>
                    </Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="transition-colors duration-150 hover:bg-red-50 hover:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ): (
            <Button variant="outline" className="hidden md:inline-flex transition-colors duration-200 hover:bg-gray-50" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          )}
        </nav>
      </div>
       {/* Mobile Search Input (Conditionally Rendered) */}
       {isSearchVisible && (
            <div className="px-4 pb-2 sm:hidden">
                <div className="relative flex w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search Eat Hub"
                        className="pl-9 pr-12 rounded-full bg-gray-100 border-none focus-visible:ring-primary w-full"
                    />
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors duration-200"
                        onClick={() => setIsSearchVisible(false)}
                    >
                        {/* A simple 'X' icon or similar for closing */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>

                    </Button>
                </div>
            </div>
        )}
    </header>
  );
}