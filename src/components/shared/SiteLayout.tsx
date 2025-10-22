'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Home,
  Ticket,
  Heart,
  Search,
  Book,
  User,
  Gift,
  LayoutDashboard,
  Utensils,
  Building2,
  ChefHat,
  LogOut,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const sidebarNav = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Home Food', icon: Utensils, href: '/home-food' },
    { name: 'Restaurant', icon: Building2, href: '/restaurants' },
    { name: 'Chefs', icon: ChefHat, href: '/chefs' },
    { name: 'Orders', icon: Book, href: '/track-order' },
    { name: 'Favorites', icon: Heart, href: '#' },
    { name: 'Dashboards', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Promotions', icon: Ticket, href: '#' },
    { name: 'Invite Friends', icon: Gift, href: '#' },
  ];

  const categoriesNav = [
    { name: 'Best of Eat Hub', icon: Heart, href: '#' },
    { name: 'Account', icon: User, href: '#' },
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
            <SidebarHeader>
                <SidebarTrigger />
            </SidebarHeader>
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
           <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Logout">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
