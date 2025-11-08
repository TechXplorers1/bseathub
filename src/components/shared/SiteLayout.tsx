
'use client';

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
  Shield,
  ClipboardList,
  Users,
  LogIn,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUser, useAuth } from '@/firebase';
import { usePathname } from 'next/navigation';
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

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const sidebarNav = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Home Food', icon: Utensils, href: '/home-food' },
    { name: 'Restaurant', icon: Building2, href: '/restaurants' },
    { name: 'Chefs', icon: ChefHat, href: '/chefs' },
    { name: 'Promotions', icon: Ticket, href: '#' },
    { name: 'Invite Friends', icon: Gift, href: '#' },
  ];

  const categoriesNav = [
    { name: 'Best of Eat Hub', icon: Heart, href: '#' },
  ];
  
  const isDashboardPage = pathname.startsWith('/admin') || 
                          pathname.startsWith('/chef-dashboard') || 
                          pathname.startsWith('/home-food-dashboard') || 
                          pathname.startsWith('/restaurant-dashboard');

  const showSidebar = pathname === '/';


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && !isDashboardPage && (
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="group hidden md:flex text-sidebar-foreground sticky top-0 h-full"
          >
            <SidebarHeader>
                <SidebarTrigger />
            </SidebarHeader>
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
             <SidebarFooter>
              <SidebarMenu>
                {!isUserLoading && user ? (
                   <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                      <LogOut />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : !isUserLoading && !user ? (
                   <SidebarMenuItem>
                    <SidebarMenuButton href="/login" tooltip="Sign In">
                      <LogIn />
                      <span>Sign In</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}
        <div className="flex flex-col overflow-y-auto w-full">
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
