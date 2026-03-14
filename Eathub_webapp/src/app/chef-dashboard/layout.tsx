
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
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';
import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useState } from 'react';
import { fetchChefById } from '@/services/api';
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
  const { setHeaderTitle, setHeaderPath } = useHeader();
  const [chefName, setChefName] = useState('Chef Maria');

  useEffect(() => {
    const loadProfile = async () => {
      const chefId = localStorage.getItem('chefId');
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

    loadProfile();
    setHeaderPath('/chef-dashboard');
    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
    };
  }, [setHeaderTitle, setHeaderPath, chefName]);

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
      </aside>

      <div className="flex flex-col flex-1">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

