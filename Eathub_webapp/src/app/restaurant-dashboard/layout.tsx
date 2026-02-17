'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ShoppingCart,
  Utensils,
  Star,
  LineChart,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';

const navItems = [
  { href: '/restaurant-dashboard', icon: Home, label: 'Overview' },
  {
    href: '/restaurant-dashboard/orders',
    icon: ShoppingCart,
    label: 'Orders',
    badge: '12',
  },
  { href: '/restaurant-dashboard/menu', icon: Utensils, label: 'Menu' },
  { href: '/restaurant-dashboard/feedback', icon: Star, label: 'Feedback' },
  { href: '/restaurant-dashboard/analytics', icon: LineChart, label: 'Analytics' },
];

const accountItems = [
  { href: '/restaurant-dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '#', icon: LifeBuoy, label: 'Support' },
  { href: '#', icon: LogOut, label: 'Logout' },
];

export default function RestaurantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setHeaderTitle, setHeaderPath } = useHeader();
  const restaurantName = 'The Golden Spoon';

  useEffect(() => {
    setHeaderTitle(restaurantName);
    setHeaderPath('/restaurant-dashboard');

    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
    };
  }, [setHeaderTitle, setHeaderPath]);

  const toggleSidebar = () => {
    document
      .getElementById('mobile-sidebar')
      ?.classList.toggle('-translate-x-full');
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* ===== DESKTOP SIDEBAR (FIXED & UNSCROLLABLE) ===== */}
      <aside className="hidden md:block w-[260px] border-r bg-white h-screen fixed left-0 top-0">
        <div className="h-full flex flex-col py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto flex h-6 w-6 items-center justify-center rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />

          <nav className="grid items-start px-4 text-sm font-medium">
            {accountItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* ===== MOBILE SIDEBAR (HAMBURGER DRAWER) ===== */}
      <aside
        id="mobile-sidebar"
        className="fixed inset-y-0 left-0 w-[260px] bg-white border-r shadow-lg transform -translate-x-full transition-transform duration-300 md:hidden z-50"
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="font-semibold">Dashboard Menu</h2>
          <button onClick={toggleSidebar}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="grid items-start px-4 text-sm font-medium mt-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={toggleSidebar}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        <nav className="grid items-start px-4 text-sm font-medium">
          {accountItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={toggleSidebar}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ===== MAIN CONTENT (ONLY THIS SCROLLS) ===== */}
      <div className="flex-1 md:ml-[260px]">
        <main className="h-screen overflow-y-auto p-4 lg:p-6">
          {/* Hamburger button only on mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden mb-3 inline-flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded"
          >
            <Menu className="h-5 w-5" /> Menu
          </button>

          {children}
        </main>
      </div>
    </div>
  );
}
