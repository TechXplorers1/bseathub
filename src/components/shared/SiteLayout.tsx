'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  Utensils,
  ShoppingBag,
  Ticket,
  Building,
  Heart,
  Landmark,
  Search,
  Book,
  User,
  ShoppingBasket,
  Truck
} from 'lucide-react';
import { Header } from './Header';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const sidebarNav = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Grocery', icon: ShoppingBasket, href: '#' },
    { name: 'Retail', icon: ShoppingBag, href: '#' },
    { name: 'Convenience', icon: Utensils, href: '#' },
    { name: 'DashMart', icon: Building, href: '#' },
    { name: 'Drugstore', icon: Heart, href: '#' },
    { name: 'Home Goods', icon: Landmark, href: '#' },
    { name: 'Office', icon: Building, href: '#' },
    { name: 'Browse All', icon: Search, href: '#' },
  ];

  const accountNav = [
    { name: 'Orders', icon: Book, href: '/track-order' },
    { name: 'Account', icon: User, href: '#' },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
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
             {accountNav.map((item) => (
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
      <SidebarInset>
        <Header />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </>
  );
}
