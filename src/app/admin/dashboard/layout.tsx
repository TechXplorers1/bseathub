'use client';

import Link from 'next/link';
import {
  Home,
  Users,
  ClipboardList,
  ChefHat,
  Settings,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard?tab=overview', icon: Home, label: 'Overview', tab: 'overview' },
  {
    href: '/admin/dashboard?tab=registrations',
    icon: Users,
    label: 'Registrations',
    tab: 'registrations',
  },
  { href: '/admin/dashboard?tab=orders', icon: ClipboardList, label: 'Orders', tab: 'orders' },
  { href: '/admin/dashboard?tab=bookings', icon: ChefHat, label: 'Chef Bookings', tab: 'bookings' },
];

const accountItems = [
  { href: '#', icon: Settings, label: 'Settings' },
  { href: '#', icon: LifeBuoy, label: 'Support' },
  { href: '#', icon: LogOut, label: 'Logout' },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setHeaderTitle } = useHeader();
  const adminTitle = 'Admin';
  const pathname = usePathname();

  useEffect(() => {
    setHeaderTitle(adminTitle);
    return () => {
      setHeaderTitle(null);
    };
  }, [setHeaderTitle, adminTitle]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1 py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
