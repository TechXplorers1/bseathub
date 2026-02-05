'use client';

import Link from 'next/link';
import {
  Home,
  LineChart,
  ShoppingCart,
  Utensils,
  Settings,
  Star,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
];

export default function HomeFoodDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setHeaderTitle, setHeaderPath } = useHeader();
  const router = useRouter();

  // Use state to manage the display name from localstorage
  const [kitchenName, setKitchenName] = useState("Maria's Kitchen");

  useEffect(() => {
    // 1. Retrieve the name stored during the default login process
    const storedName = localStorage.getItem('userName');
    const finalName = storedName ? `${storedName}'s Kitchen` : "Maria's Kitchen";

    setKitchenName(finalName);
    setHeaderTitle(finalName);
    setHeaderPath('/home-food-dashboard');

    return () => {
      setHeaderTitle(null);
      setHeaderPath(null);
    };
  }, [setHeaderTitle, setHeaderPath]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
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
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}