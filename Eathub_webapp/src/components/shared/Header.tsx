'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import {
  Search,
  ShoppingCart,
  Flame,
  LogOut,
  LayoutDashboard,
  MapPin,
  ChevronDown,
  Bell,
  Utensils,
  Store,
  ChefHat,
  User
} from 'lucide-react';

import { Cart } from './Cart';
import { Notifications } from './Notifications';
import { useCart } from '@/context/CartProvider';
import { useLocation } from '@/context/LocationProvider';
import { useHeader } from '@/context/HeaderProvider';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';

import { useRestaurants } from '@/context/RestaurantProvider';
import type { Chef } from '@/lib/types';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {

  const { itemCount } = useCart();
  const { location, setLocation } = useLocation();
  const { headerTitle, headerPath } = useHeader();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newLocation, setNewLocation] = useState(location);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Search States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [auth, setAuth] = useState<{
    email: string | null;
    role: string | null;
    token: string | null;
    avatarUrl: string | null;
  }>({ email: null, role: null, token: null, avatarUrl: null });

  const [chefData, setChefData] = useState<any>(null);

  useEffect(() => {
    const loadAuth = () => {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');
      const avatarUrl = localStorage.getItem('userAvatar');
      
      setAuth({ email, role, token, avatarUrl });
      setIsLoading(false);

      // 1. If role is CHEF, fetch chef-specific data
      if (role === 'CHEF') {
        const chefId = localStorage.getItem('chefId');
        if (chefId) {
          fetch(`http://localhost:8081/api/v1/chefs/${chefId}`)
            .then(res => res.json())
            .then(data => setChefData(data))
            .catch(err => console.error("Header fetch chef error:", err));
        }
      } else {
        setChefData(null);
      }

      // 2. For ANY logged-in role, if avatar is missing in local storage, try fetching from profile
      if (token && !avatarUrl) {
        fetch('http://localhost:8081/api/v1/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.avatarUrl) {
                try {
                    localStorage.setItem('userAvatar', data.avatarUrl);
                } catch (e) {
                    console.warn("Storage quota exceeded, could not save avatar.");
                }
                setAuth(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
            }
        })
        .catch(err => console.error("Header profile sync error:", err));
      }
    };

    loadAuth();
    window.addEventListener('storage', loadAuth);
    window.addEventListener('auth-change', loadAuth);
    window.addEventListener('chef-profile-updated', loadAuth);

    const fetchChefs = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/v1/chefs');
        if (response.ok) {
          const data = await response.json();
          setChefs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Search fetch error", err);
      }
    };
    fetchChefs();

    return () => {
      window.removeEventListener('storage', loadAuth);
      window.removeEventListener('auth-change', loadAuth);
    };
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ email: null, role: null, token: null, avatarUrl: null });
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
    router.refresh();
  };

  const handleLocationSave = () => {
    setLocation(newLocation);
    setIsLocationOpen(false);
  };

  const { restaurants: allRestaurantsData, homeFoods: allHomeFoodsData } = useRestaurants();

  const pathname = usePathname();

  // --- Unified Search Logic Fix ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;

    const query = searchQuery.toLowerCase();

    // 1. Search Restaurants & Homefoods
    let vendors = [...allRestaurantsData, ...allHomeFoodsData].filter(v => {
      const nameMatch = v.name?.toLowerCase().includes(query);
      const typeMatch = v.type?.toLowerCase().includes(query);

      // FIX: Handle cuisine whether it is a string or an array
      let cuisineMatch = false;
      if (Array.isArray(v.cuisine)) {
        cuisineMatch = v.cuisine.some((c: string) => c.toLowerCase().includes(query));
      } else if (typeof v.cuisine === 'string') {
        cuisineMatch = v.cuisine.toLowerCase().includes(query);
      }

      return nameMatch || typeMatch || cuisineMatch;
    });

    // Context-aware filtering for vendors
    if (pathname.includes('/restaurants')) {
      vendors = vendors.sort((a, b) => (a.type === 'restaurant' ? -1 : 1));
    } else if (pathname.includes('/home-food')) {
      vendors = vendors.sort((a, b) => (a.type === 'home-food' ? -1 : 1));
    }

    // 2. Search Menu Items
    const items = [...allRestaurantsData, ...allHomeFoodsData].flatMap(v =>
      v.menu?.flatMap((cat: any) =>
        cat.items?.filter((item: any) => item.name?.toLowerCase().includes(query))
          .map((item: any) => ({ ...item, vendorName: v.name, vendorSlug: v.slug }))
      ) || []
    );

    // 3. Search Chefs
    let foundChefs = chefs.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.specialty?.toLowerCase().includes(query)
    );

    // Context-aware: If we are on /chefs, maybe prioritize them? (Though they have their own section)

    // 4. Search Categories
    const categoriesSet = new Set<string>();
    const foundCategories: any[] = [];
    [...allRestaurantsData, ...allHomeFoodsData].forEach(v => {
        v.menu?.forEach((cat: any) => {
            if (cat.title?.toLowerCase().includes(query) && !categoriesSet.has(cat.title.toLowerCase())) {
                categoriesSet.add(cat.title.toLowerCase());
                foundCategories.push({ title: cat.title, type: v.type, vendorSlug: v.slug });
            }
        });
    });

    return { vendors, items, chefs: foundChefs, categories: foundCategories };
  }, [searchQuery, chefs, allRestaurantsData, allHomeFoodsData, pathname]);

  const dashboard = (() => {
    if (!auth.role) return null;
    const role = auth.role.toUpperCase();
    const map: Record<string, { label: string; href: string }> = {
      USER: { label: 'User Dashboard', href: '/dashboard' },
      HOMEFOOD: { label: 'Homefood Dashboard', href: '/home-food-dashboard' },
      RESTAURANT: { label: 'Restaurant Dashboard', href: '/restaurant-dashboard' },
      CHEF: { label: 'Chef Dashboard', href: '/chef-dashboard' },
      PARTNER: { label: 'Partner Dashboard', href: '/partner-dashboard' },
    };
    return map[role] || null;
  })();

  const isLoggedIn = !!auth.token;
  const hasNotifications = true;

  return (
    <header className={cn("fixed top-0 w-full z-50 border-b bg-background shadow-md", className)}>

      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto gap-2">

        {/* LOGO & DYNAMIC TITLE */}
        <div className="flex items-center gap-2 shrink-0 overflow-hidden max-w-[150px] sm:max-w-none">
          {headerTitle ? (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (headerPath) {
                  router.push(headerPath);
                }
              }}
              className="flex items-center space-x-2 group hover:opacity-80 transition-all duration-300"
            >
              <Flame className="h-8 w-8 text-primary shrink-0" />
              <span className="text-xl font-bold text-primary truncate">
                {headerTitle}
              </span>
            </button>
          ) : (
            <Link href="/" className="flex items-center space-x-2">
              <Flame className="h-8 w-8 text-primary" />
              <span className="hidden md:inline text-xl font-bold text-primary">Eat Hub</span>
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 relative max-w-md ml-4" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search food, restaurants, chefs..."
            className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />

          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults && (
            <div className="absolute top-full mt-2 w-full bg-card border rounded-xl shadow-2xl max-h-[75vh] overflow-y-auto z-[60] p-2">

              {/* CATEGORY: FOOD ITEMS */}
              {searchResults.items.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase">
                    <Utensils className="mr-2 h-3 w-3" /> Dishes
                  </div>
                  {searchResults.items.slice(0, 5).map((item, idx) => (
                    <button
                      key={`item-${idx}`}
                      onClick={() => { router.push(`/restaurant/${item.vendorSlug}`); setIsSearchFocused(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg"
                    >
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">from {item.vendorName}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: MENU CATEGORIES */}
              {searchResults.categories && searchResults.categories.length > 0 && (
                <div className="mb-3 border-t pt-2">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase">
                    <LayoutDashboard className="mr-2 h-3 w-3" /> Categories
                  </div>
                  {searchResults.categories.slice(0, 5).map((cat: any, idx: number) => (
                    <button
                      key={`cat-${idx}`}
                      onClick={() => { router.push(`/restaurant/${cat.vendorSlug}`); setIsSearchFocused(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg"
                    >
                      <p className="text-sm font-medium">{cat.title}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">Browse in {cat.type}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: VENDORS */}
              {searchResults.vendors.length > 0 && (
                <div className="mb-3 border-t pt-2">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase">
                    <Store className="mr-2 h-3 w-3" /> Places
                  </div>
                  {searchResults.vendors.slice(0, 4).map(v => (
                    <Link
                      key={v.id}
                      href={`/restaurant/${v.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="block px-3 py-2 hover:bg-muted rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{v.name}</p>
                        <Badge variant="outline" className="text-[10px] h-4 text-primary bg-primary/5">{v.type === 'restaurant' ? 'Restaurant' : 'Home Kitchen'}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* CATEGORY: CHEFS */}
              {searchResults.chefs.length > 0 && (
                <div className="border-t pt-2">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase">
                    <ChefHat className="mr-2 h-3 w-3" /> Private Chefs
                  </div>
                  {searchResults.chefs.slice(0, 3).map(chef => (
                    <Link
                      key={chef.id}
                      href={`/restaurant/${chef.slug}?chef=${encodeURIComponent(chef.name)}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="block px-3 py-2 hover:bg-muted rounded-lg"
                    >
                      <p className="text-sm font-medium">{chef.name}</p>
                      <p className="text-[11px] text-muted-foreground">{chef.specialty}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* NO RESULTS */}
              {searchResults.items.length === 0 && searchResults.vendors.length === 0 && searchResults.chefs.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">No results for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT NAV (CART/NOTIF/AUTH) */}
        <nav className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10"><Bell className="h-6 w-6" />
                {hasNotifications && <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />}
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0"><Notifications /></SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10"><ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && <Badge className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-[10px] rounded-full">{itemCount}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent><SheetHeader><SheetTitle className="mb-4">Your Cart</SheetTitle></SheetHeader><Cart /></SheetContent>
          </Sheet>

          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0 border border-border overflow-hidden">
                  <Avatar className="h-full w-full object-cover">
                    {(chefData?.avatarUrl || auth.avatarUrl) ? (
                        <AvatarImage src={chefData?.avatarUrl || auth.avatarUrl || undefined} alt={chefData?.name || auth.email || ''} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {auth.email ? auth.email[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{auth.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{auth.role?.toLowerCase()}</p>
                  </div>
                </DropdownMenuLabel>
                {dashboard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboard.href} className="cursor-pointer w-full flex items-center py-2 text-sm">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        {dashboard.label}
                      </Link>
                    </DropdownMenuItem>
                    {auth.role === 'USER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer w-full flex items-center py-2 text-sm">
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator /><DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer py-2"><LogOut className="mr-3 h-5 w-5" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild className="rounded-full px-5 h-10"><Link href="/login">Sign In</Link></Button>
          )}
        </nav>
      </div>
    </header>
  );
}