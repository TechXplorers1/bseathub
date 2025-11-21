// app/admin/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Users,
  ClipboardList,
  ChefHat,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/dashboard?tab=overview', icon: Home, label: 'Overview', tab: 'overview' },
  { href: '/admin/dashboard?tab=registrations', icon: Users, label: 'Registrations', tab: 'registrations' },
  { href: '/admin/dashboard?tab=orders', icon: ClipboardList, label: 'Orders', tab: 'orders' },
  { href: '/admin/dashboard?tab=bookings', icon: ChefHat, label: 'Chef Bookings', tab: 'bookings' },
];

const accountItems = [
  { href: '/admin/dashboard?tab=settings', icon: Settings, label: 'Settings' },
  { href: '#', icon: LifeBuoy, label: 'Support' },
  { href: '#', icon: LogOut, label: 'Logout' },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setHeaderTitle } = useHeader();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    setHeaderTitle('Admin');
    return () => setHeaderTitle(null);
  }, [setHeaderTitle]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, searchParams]);

  const isActive = (tab: string) => currentTab === tab;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 pb-4">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage your platform</p>
        </div>

        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => {
            const active = isActive(item.tab);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    active ? 'text-orange-600' : 'text-muted-foreground'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-2 lg:my-3" />

        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
          {accountItems.map((item) => {
            const active =
              item.href === '/admin/dashboard?tab=settings' && currentTab === 'settings';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    active ? 'text-orange-600' : 'text-muted-foreground'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row overflow-hidden">
      {/* ===== Mobile Header ===== */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b">
        <h1 className="text-xl font-bold text-foreground">Admin</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* ===== Mobile Sidebar (Overlay) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-250 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Close button on mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <SidebarContent />
      </div>

      {/* ===== Main Content Area ===== */}
      <main className="flex flex-1 flex-col overflow-auto bg-muted/40">
        <div className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1920px] min-w-0">
            {/* Ensure child content never overflows */}
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}