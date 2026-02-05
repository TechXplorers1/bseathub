'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, ShoppingCart, Flame, LogOut, LayoutDashboard } from 'lucide-react';

import { Cart } from './Cart';
import { useCart } from '@/context/CartProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [auth, setAuth] = useState<{
    email: string | null;
    role: string | null;
    token: string | null;
  }>({ email: null, role: null, token: null });

  // ✅ FIX: load auth + react instantly to login/logout
  useEffect(() => {
    const loadAuth = () => {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');

      setAuth({ email, role, token });
      setIsLoading(false);
    };

    loadAuth();

    // Listen to localStorage changes (cross-tab) + custom event (same tab)
    window.addEventListener('storage', loadAuth);
    window.addEventListener('auth-change', loadAuth);
    return () => {
      window.removeEventListener('storage', loadAuth);
      window.removeEventListener('auth-change', loadAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ email: null, role: null, token: null });
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
    router.refresh();
  };

  // ✅ SAFE role → dashboard mapping
  const getDashboardInfo = () => {
    if (!auth.role) return null;

    const map: Record<string, { label: string; href: string }> = {
      USER: { label: 'User Dashboard', href: '/dashboard' },
      HOMEFOOD: { label: 'Homefood Dashboard', href: '/home-food-dashboard' },
      RESTAURANT: { label: 'Restaurant Dashboard', href: '/restaurant-dashboard' },
      CHEF: { label: 'Chef Dashboard', href: '/chef-dashboard' },
    };

    return map[auth.role] || null;
  };

  const dashboard = getDashboardInfo();
  const isLoggedIn = !!auth.token;

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background shadow-md">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">

        {/* LOGO */}
        <Link href="/" className="flex items-center space-x-2">
          <Flame className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Eat Hub</span>
        </Link>

        {/* SEARCH */}
        <div className="hidden sm:flex relative max-w-md w-full mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search Eat Hub"
            className="pl-9 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* RIGHT NAV */}
        <nav className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Cart />
            </SheetContent>
          </Sheet>

          {/* AUTH SECTION */}
          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {auth.email ? auth.email[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{auth.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {auth.role?.toLowerCase()}
                    </p>
                  </div>
                </DropdownMenuLabel>

                {/* ✅ FIX: show dashboard ONLY if it exists */}
                {dashboard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={dashboard.href}
                        className="cursor-pointer w-full flex items-center"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {dashboard.label}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
