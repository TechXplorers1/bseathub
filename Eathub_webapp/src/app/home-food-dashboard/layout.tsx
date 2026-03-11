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
  Menu,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/context/HeaderProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { fetchHomeFoodById } from '@/services/api';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const homeFoodId = localStorage.getItem('homeFoodId');
      if (homeFoodId) {
        try {
          const profile = await fetchHomeFoodById(homeFoodId);
          if (profile && profile.name) {
            setKitchenName(profile.name);
            setHeaderTitle(profile.name);
          }
        } catch (error) {
          console.error("Failed to fetch homefood profile:", error);
          // Fallback to name in localStorage or default
          const storedName = localStorage.getItem('userName');
          const finalName = storedName ? `${storedName}'s Kitchen` : "Maria's Kitchen";
          setKitchenName(finalName);
          setHeaderTitle(finalName);
        }
      } else {
        const storedName = localStorage.getItem('userName');
        const finalName = storedName ? `${storedName}'s Kitchen` : "Maria's Kitchen";
        setKitchenName(finalName);
        setHeaderTitle(finalName);
      }
    };

    loadProfile();
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

  const NavContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex-1 py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
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
              onClick={() => setIsMobileMenuOpen(false)}
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
  );

  return (
    <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar (Desktop) */}
      <div className="hidden border-r bg-muted/40 md:block">
        <NavContent />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
              <SheetHeader className="p-4 border-b text-left">
                <SheetTitle className="text-lg font-bold text-primary">{kitchenName}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-auto">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:hidden truncate">{kitchenName}</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
