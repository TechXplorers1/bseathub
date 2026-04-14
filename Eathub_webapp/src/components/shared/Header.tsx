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
  User,
  X
} from 'lucide-react';

import { Cart } from './Cart';
import { Notifications } from './Notifications';
import { useCart } from '@/context/CartProvider';
import { useLocation } from '@/context/LocationProvider';
import { useHeader } from '@/context/HeaderProvider';
import { useNotifications } from '@/context/NotificationProvider';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
import { AuthSuggestionDialog } from './AuthSuggestionDialog';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {

  const { itemCount } = useCart();
  const { setLocation } = useLocation();
  const { headerTitle, headerPath, searchQuery, setSearchQuery, searchPlaceholder, localItems } = useHeader();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Search States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

    const [auth, setAuth] = useState<{
    email: string | null;
    name: string | null;
    role: string | null;
    token: string | null;
    avatarUrl: string | null;
  }>({ email: null, name: null, role: null, token: null, avatarUrl: null });

  const [chefData, setChefData] = useState<any>(null);

  useEffect(() => {
    const loadAuth = () => {
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');
      const avatarUrl = localStorage.getItem('userAvatar');

      setAuth({ email, name, role, token, avatarUrl });
      setIsLoading(false);
      if (role === 'CHEF') {
        const chefId = localStorage.getItem('chefId');
        if (chefId) {
          fetch(`http://localhost:8081/api/v1/chefs/${chefId}`)
            .then(res => res.json())
            .then(data => {
              setChefData(data);
              const picUrl = data.avatarUrl || data.imageId;
              if (picUrl) {
                setAuth(prev => ({ ...prev, avatarUrl: picUrl }));
                localStorage.setItem('userAvatar', picUrl);
              }
            })
            .catch(err => console.error("Header fetch chef error:", err));
        }
      } else if (role === 'HOMEFOOD') {
        const providerId = localStorage.getItem('providerId') || localStorage.getItem('homeFoodId');
        if (providerId) {
          fetch(`http://localhost:8081/api/v1/home-food/${providerId}`)
            .then(res => res.json())
            .then(data => {
              setChefData(data);
              const picUrl = data.avatarUrl || data.imageId;
              if (picUrl) {
                setAuth(prev => ({ ...prev, avatarUrl: picUrl }));
                localStorage.setItem('userAvatar', picUrl);
              }
            })
            .catch(err => console.error("Header fetch homefood error:", err));
        }
      } else {
        setChefData(null);
      }

      if (token && !avatarUrl) {
        fetch('http://localhost:8081/api/v1/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            const picUrl = data.avatarUrl || data.imageId;
            if (picUrl) {
              try {
                localStorage.setItem('userAvatar', picUrl);
              } catch (e) {
                console.warn("Storage quota exceeded, could not save avatar.");
              }
              setAuth(prev => ({ ...prev, avatarUrl: picUrl }));
            }
          })
          .catch(err => console.error("Header profile sync error:", err));
      }
    };

    loadAuth();
    window.addEventListener('storage', loadAuth);
    window.addEventListener('auth-change', loadAuth);
    window.addEventListener('chef-profile-updated', loadAuth);
    window.addEventListener('home-food-profile-updated', loadAuth);
    window.addEventListener('restaurant-profile-updated', loadAuth);
    return () => {
      window.removeEventListener('storage', loadAuth);
      window.removeEventListener('auth-change', loadAuth);
      window.removeEventListener('chef-profile-updated', loadAuth);
      window.removeEventListener('home-food-profile-updated', loadAuth);
      window.removeEventListener('restaurant-profile-updated', loadAuth);
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

  // Clear search on route change (unless going to the same provider/dashboard)
  useEffect(() => {
    setIsSearchFocused(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ email: null, name: null, role: null, token: null, avatarUrl: null });
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
    router.refresh();
  };

  const { restaurants: allRestaurantsData, homeFoods: allHomeFoodsData, chefs } = useRestaurants();

  // --- Context-Aware Unified Search Logic ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) return null;

    const isDashboard = pathname.includes('-dashboard') || (pathname.startsWith('/dashboard') && !pathname.includes('-dashboard'));
    const isProviderPage = pathname.startsWith('/restaurant/') || pathname.startsWith('/home-food/');

    if (isDashboard) return null;

    const query = searchQuery.toLowerCase();

    let vendors = [...allRestaurantsData, ...allHomeFoodsData];
    let items: any[] = [];

    if (isProviderPage && localItems && localItems.length > 0) {
      items = localItems;
    } else {
      items = vendors.flatMap(v =>
        v.menu?.flatMap((cat: any) =>
          cat.items?.map((item: any) => ({
            ...item,
            vendorName: v.name,
            vendorSlug: v.slug,
            vendorType: v.type
          }))
        ) || []
      );
    }

    let chefList = chefs;

    if (isProviderPage) {
      if (!localItems) {
        const providerSlugFromUrl = pathname.split('/')[2].split('?')[0];
        items = items.filter(i => i.vendorSlug === providerSlugFromUrl);
      }
      vendors = [];
      chefList = [];
    }

    const foundVendors = vendors.filter(v => {
      const nameMatch = v.name?.toLowerCase().includes(query);
      let cuisineMatch = false;
      if (Array.isArray(v.cuisine)) cuisineMatch = v.cuisine.some((c: string) => c.toLowerCase().includes(query));
      else if (typeof v.cuisine === 'string') cuisineMatch = v.cuisine.toLowerCase().includes(query);
      return nameMatch || cuisineMatch;
    });

    const foundItems = items.filter(i =>
      i.name?.toLowerCase().includes(query) ||
      i.description?.toLowerCase().includes(query)
    );

    const foundChefs = chefList.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.specialty?.toLowerCase().includes(query)
    );

    const foundCategories: any[] = [];
    if (!isProviderPage) {
      const categoriesSet = new Set<string>();
      [...allRestaurantsData, ...allHomeFoodsData].forEach(v => {
        v.menu?.forEach((cat: any) => {
          if (cat.title?.toLowerCase().includes(query) && !categoriesSet.has(cat.title.toLowerCase())) {
            categoriesSet.add(cat.title.toLowerCase());
            foundCategories.push({ title: cat.title, type: v.type, vendorSlug: v.slug });
          }
        });
      });
    }

    return { vendors: foundVendors, items: foundItems, chefs: foundChefs, categories: foundCategories };
  }, [searchQuery, chefs, allRestaurantsData, allHomeFoodsData, pathname, localItems]);

  const isLoggedIn = !!auth.token;
  const hasNotifications = unreadCount > 0;

  const navigateToProvider = (slug: string, type: string, isChef = false, chefName = '', isItem = false) => {
    const prefix = type === 'home-food' ? 'home-food' : 'restaurant';
    let url = `/${prefix}/${slug}`;
    if (isChef && chefName) {
      url += `?chef=${encodeURIComponent(chefName)}`;
    }

    const isHomepage = pathname === '/';
    const isCurrentlyOnThisProvider = pathname.includes(slug);

    if (isItem) {
      if (isCurrentlyOnThisProvider) {
        setIsSearchFocused(false);
      } else {
        router.push(url);
        setIsSearchFocused(false);
      }
      return;
    }

    if (isHomepage) {
      window.open(url, '_blank');
    } else {
      router.push(url);
    }
    setIsSearchFocused(false);
  };

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

  return (
    <header className={cn("fixed top-0 w-full z-50 border-b bg-background shadow-md", className)}>
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto gap-2">

        {/* LOGO & DYNAMIC TITLE */}
        <div className="flex items-center gap-2 shrink-0 overflow-hidden max-w-[150px] sm:max-w-none">
          {headerTitle ? (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (headerPath) router.push(headerPath);
              }}
              className="flex items-center space-x-2 group hover:opacity-80 transition-all duration-300"
            >
              <Flame className="h-8 w-8 text-primary shrink-0" />
              <span className="text-xl font-bold text-primary truncate">{headerTitle}</span>
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
            placeholder={searchPlaceholder}
            className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults && (
            <div className="absolute top-full mt-2 w-full bg-card border rounded-xl shadow-2xl max-h-[75vh] overflow-y-auto z-[60] p-2">
              {/* CATEGORY: FOOD ITEMS */}
              {searchResults.items.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Utensils className="mr-2 h-3 w-3" /> Dishes
                  </div>
                  {searchResults.items.slice(0, 10).map((item, idx) => (
                    <button
                      key={`item-${idx}`}
                      onClick={() => navigateToProvider(item.vendorSlug, item.vendorType || 'restaurant', false, '', true)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors group"
                    >
                      <p className="text-sm font-semibold group-hover:text-primary">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">from {item.vendorName || 'this provider'}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: MENU CATEGORIES */}
              {searchResults.categories && searchResults.categories.length > 0 && (
                <div className="mb-3 border-t pt-2">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <LayoutDashboard className="mr-2 h-3 w-3" /> Categories
                  </div>
                  {searchResults.categories.slice(0, 5).map((cat: any, idx: number) => (
                    <button
                      key={`cat-${idx}`}
                      onClick={() => navigateToProvider(cat.vendorSlug, cat.type)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors group"
                    >
                      <p className="text-sm font-semibold group-hover:text-primary">{cat.title}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">Browse in {cat.type}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: VENDORS */}
              {searchResults.vendors.length > 0 && (
                <div className="mb-3 border-t pt-2">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Store className="mr-2 h-3 w-3" /> Places
                  </div>
                  {searchResults.vendors.slice(0, 4).map(v => (
                    <button
                      key={v.id}
                      onClick={() => navigateToProvider(v.slug, v.type)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold group-hover:text-primary">{v.name}</p>
                        <Badge variant="outline" className="text-[10px] h-4 text-primary bg-primary/5 uppercase font-black">{v.type === 'restaurant' ? 'Restaurant' : 'Home Kitchen'}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: CHEFS */}
              {searchResults.chefs.length > 0 && (
                <div className="border-t pt-2">
                  <div className="flex items-center px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <ChefHat className="mr-2 h-3 w-3" /> Private Chefs
                  </div>
                  {searchResults.chefs.slice(0, 3).map(chef => (
                    <button
                      key={chef.id}
                      onClick={() => navigateToProvider(chef.slug, 'restaurant', true, chef.name)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors group"
                    >
                      <p className="text-sm font-semibold group-hover:text-primary">Chef {chef.name}</p>
                      <p className="text-[11px] text-muted-foreground">{chef.specialty}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* EMPTY RESULTS */}
              {(searchResults.items.length === 0 && searchResults.vendors.length === 0 && searchResults.chefs.length === 0 && searchResults.categories.length === 0) && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No matches for <span className="font-bold text-foreground">"{searchQuery}"</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT NAV */}
        <nav className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-2">
          <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full animate-in zoom-in border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0">
              <Notifications onClose={() => setIsNotificationsOpen(false)} />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10"><ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && <Badge className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-[10px] rounded-full">{itemCount}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 sm:max-w-lg w-[90vw] md:w-[500px]">
              <Cart />
            </SheetContent>
          </Sheet>

          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0 border border-border overflow-hidden ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                  <Avatar className="h-full w-full object-cover">
                    {(chefData?.avatarUrl || auth.avatarUrl) ? (
                      <AvatarImage src={chefData?.avatarUrl || auth.avatarUrl || undefined} alt={chefData?.name || auth.email || ''} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {(auth.name || auth.email || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl p-1">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none truncate">{auth.name || auth.email}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{auth.role}</p>
                  </div>
                </DropdownMenuLabel>
                {dashboard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboard.href} className="cursor-pointer w-full flex items-center py-2.5 px-3 text-sm rounded-lg hover:bg-muted font-bold">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-orange-500" />
                        {dashboard.label}
                      </Link>
                    </DropdownMenuItem>
                    {auth.role === 'USER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer w-full flex items-center py-2.5 px-3 text-sm rounded-lg hover:bg-muted font-bold">
                          <User className="mr-3 h-4 w-4 text-blue-500" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator /><DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer py-2.5 px-3 text-sm rounded-lg hover:bg-red-50 font-bold"><LogOut className="mr-3 h-4 w-4" />Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild className="rounded-full px-5 h-10 font-bold"><Link href="/login">Sign In</Link></Button>
          )}
        </nav>
      </div>
      <AuthSuggestionDialog />
    </header>
  );
}