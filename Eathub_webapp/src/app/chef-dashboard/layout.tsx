'use client';

import Link from 'next/link';
import {
  Home,
  LineChart,
  Settings,
  Star,
  LifeBuoy,
  LogOut,
  Calendar,
  DollarSign,
  Briefcase,
  Menu,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useHeader } from '@/context/HeaderProvider';
import { useEffect, useState } from 'react';
import { fetchChefById, fetchChefBookingsByOwner } from '@/services/api';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/chef-dashboard', icon: Home, label: 'Overview' },
  { href: '/chef-dashboard/bookings', icon: Calendar, label: 'Bookings' },
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
  const { setHeaderTitle, setHeaderPath } = useHeader();
  const [chefName, setChefName] = useState('Chef Maria');
  const [newBookingsCount, setNewBookingsCount] = useState<number>(0);

  useEffect(() => {
    const chefId = localStorage.getItem('chefId');
    const userId = localStorage.getItem('userId');

    const loadProfile = async () => {
      if (chefId) {
        try {
          const profile = await fetchChefById(chefId);
          if (profile && profile.name) {
            setChefName(profile.name);
          }
        } catch (error) {
          console.error("Failed to fetch chef profile:", error);
        }
      }
    };

    const fetchBookingsCount = async () => {
      if (userId) {
        try {
          const bookings = await fetchChefBookingsByOwner(userId);
          const count = bookings.filter(b => b.status === 'Pending').length;
          setNewBookingsCount(count);
        } catch (err) {
          console.warn("Failed to fetch new bookings count:", err);
        }
      }
    };

    loadProfile();
    fetchBookingsCount();

    const interval = setInterval(fetchBookingsCount, 30000);

    setHeaderPath('/chef-dashboard');
    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
      clearInterval(interval);
    };
  }, [setHeaderTitle, setHeaderPath]);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden border-r bg-background md:block w-[220px] lg:w-[280px]">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="">Chef Dashboard</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.label === 'Bookings' && newBookingsCount > 0 && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-[10px]">
                      {newBookingsCount}
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
      </aside>

      <div className="flex flex-col flex-1">
        {/* Mobile Header with Hamburger */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px] p-0">
              <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <span>Chef Dashboard</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid gap-1 px-4 text-sm font-medium">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {item.label === 'Bookings' && newBookingsCount > 0 && (
                        <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-[10px]">
                          {newBookingsCount}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
                <Separator className="my-4" />
                <nav className="grid gap-1 px-4 text-sm font-medium">
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
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:hidden">Chef Hub</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
