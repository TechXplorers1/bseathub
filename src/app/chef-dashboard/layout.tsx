
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
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  const { setHeaderTitle } = useHeader();
  const chefName = 'Chef Maria';
  const pathname = usePathname();

  useEffect(() => {
    setHeaderTitle(chefName);
    // Cleanup function to reset the title when the component unmounts
    return () => {
      setHeaderTitle(null);
    };
  }, [setHeaderTitle, chefName]);

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return(
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      isActive && "bg-accent text-accent-foreground hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge className={cn("ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full", isActive ? "bg-accent-foreground text-accent" : "")}>
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  )
                })}
              </nav>
              <Separator className="my-4" />
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {accountItems.map((item) => {
                  const isActive = pathname === item.href;
                  return(
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      isActive && "bg-accent text-accent-foreground hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-auto">
            {children}
          </main>
        </div>
      </div>
  );
}
