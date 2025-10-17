'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  ShoppingBag,
  Ticket,
  Building,
  Heart,
  Landmark,
  Search,
  Book,
  User,
  ShoppingBasket,
} from 'lucide-react';
import { Header } from './Header';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const sidebarNav = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Browse', icon: Search, href: '#' },
    { name: 'Orders', icon: Book, href: '/track-order' },
    { name: 'Favorites', icon: Heart, href: '#' },
    { name: 'Wallet', icon: User, href: '#' },
    { name: 'Promotions', icon: Ticket, href: '#' },
    { name: 'Invite Friends', icon: Building, href: '#' },
  ];

  const categoriesNav = [
    { name: 'Grocery', icon: ShoppingBasket, href: '#' },
    { name: 'Convenience', icon: ShoppingBag, href: '#' },
    { name: 'Alcohol', icon: Landmark, href: '#' },
    { name: 'Retail', icon: Heart, href: '#' },
    { name: 'DashMart', icon: Building, href: '#' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="group hidden md:flex text-sidebar-foreground sticky top-0 h-full"
        >
          <SidebarContent>
            <SidebarMenu>
              {sidebarNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton href={item.href} tooltip={item.name}>
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarSeparator />
            <SidebarMenu>
              {categoriesNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton href={item.href} tooltip={item.name}>
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
