'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  LineChart,
  Users,
  Menu as MenuIcon,
  Utensils,
  Settings,
  Star,
  LifeBuoy,
  LogOut,
  ChefHat,
  Calendar,
  DollarSign,
  Briefcase,
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const navItems = [
  { href: '/chef-dashboard', icon: Home, label: 'Overview' },
  { href: '/chef-dashboard/bookings', icon: Calendar, label: 'Bookings', badge: '2' },
  { href: '/chef-dashboard/services', icon: Briefcase, label: 'Services' },
  { href: '/chef-dashboard/reviews', icon: Star, label: 'Reviews' },
  { href: '/chef-dashboard/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/chef-dashboard/analytics', icon: LineChart, label: 'Analytics' },
];

const accountItems = [
  { href: '/chef-dashboard/settings', icon: Settings, label: 'Profile & Settings' },
  { href: '#', icon: LifeBuoy, label: 'Support' },
  { href: '#', icon: LogOut, label: 'Logout' },
];

export default function ChefDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
              <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex-1 overflow-auto py-2">
                  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        {item.badge && (
                          <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </nav>
                  <Separator className="my-4" />
                  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
              </div>
            </div>
            <div className="flex flex-col">
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
                {children}
              </main>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
}