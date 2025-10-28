'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Menu as MenuIcon,
  Utensils,
  Settings,
  Star,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';
import { useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const navItems = [
    { href: "/home-food-dashboard", icon: Home, label: "Overview" },
    { href: "/home-food-dashboard/orders", icon: ShoppingCart, label: "Orders", badge: "6" },
    { href: "/home-food-dashboard/menu", icon: Utensils, label: "Menu" },
    { href: "/home-food-dashboard/feedback", icon: Star, label: "Feedback" },
    { href: "/home-food-dashboard/analytics", icon: LineChart, label: "Analytics" },
];

const accountItems = [
    { href: "/home-food-dashboard/settings", icon: Settings, label: "Settings" },
    { href: "#", icon: LifeBuoy, label: "Support" },
    { href: "#", icon: LogOut, label: "Logout" },
];

export default function HomeFoodDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setHeaderTitle } = useHeader();
  const kitchenName = "Maria's Kitchen";

  useEffect(() => {
    setHeaderTitle(kitchenName);
    // Cleanup function to reset the title when the component unmounts
    return () => {
      setHeaderTitle(null);
    };
  }, [setHeaderTitle, kitchenName]);

  return (
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  {navItems.map(item => (
                      <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                          {item.badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{item.badge}</Badge>}
                      </Link>
                  ))}
              </nav>
              <Separator className="my-4" />
               <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  {accountItems.map(item => (
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
          </div>
        </div>
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
            {children}
          </main>
        </div>
      </div>
  );
}
