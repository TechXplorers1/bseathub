'use client';

import React, { useState } from 'react';
import {
  Home,
  Ticket,
  Heart,
  Gift,
  Utensils,
  Building2,
  ChefHat,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUser } from '@/firebase';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    const { signOut } = await import('@/firebase');
    signOut();
  };

  const sidebarNav = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Home Food', icon: Utensils, href: '/home-food' },
    { name: 'Restaurant', icon: Building2, href: '/restaurants' },
    { name: 'Chefs', icon: ChefHat, href: '/chefs' },
    { name: 'Promotions', icon: Ticket, href: '#' },
    { name: 'Invite Friends', icon: Gift, href: '#' },
  ];

  const categoriesNav = [{ name: 'Best of Eat Hub', icon: Heart, href: '#' }];

  const isDashboardPage =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/chef-dashboard') ||
    pathname?.startsWith('/home-food-dashboard') ||
    pathname?.startsWith('/restaurant-dashboard');

  const showSidebar = pathname === '/';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-44';
  const mainPadding = showSidebar && !isDashboardPage
    ? (isCollapsed ? 'md:ml-16' : 'md:ml-44')
    : 'md:ml-0';

  // Ensure footer height is respected
  const footerHeight = 'h-14'; // 3.5rem

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Fixed Header */}
      <Header className="fixed top-0 left-0 w-full z-40 h-16 bg-white shadow-sm" />

      {/* Mobile Toggle Button */}
      {showSidebar && !isDashboardPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation"
          className="fixed top-16 left-0 z-30 md:hidden h-10 w-10 p-2 rounded-none bg-background/90 backdrop-blur-sm border-r border-b"
        >
          <div className="h-4 w-4">☰</div>
        </Button>
      )}

      {/* Desktop Sidebar */}
      {showSidebar && !isDashboardPage && (
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className={cn(
            'hidden md:flex fixed top-16 left-0 z-10 h-[calc(100vh-4rem-3.5rem)] overflow-y-auto bg-sidebar border-r border-sidebar-border transition-all duration-300',
            sidebarWidth
          )}
        >
          <SidebarContent className="py-3">
            <SidebarHeader className="py-2 flex items-center justify-center">
              <button
                onClick={toggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="flex items-center justify-center w-10 h-10 p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sidebar-menu-button"
              >
                <div className="h-4 w-4">‹</div>
              </button>
            </SidebarHeader>

            <SidebarMenu className="mt-1">
              {sidebarNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={isCollapsed ? item.name : undefined}
                    className={cn(
                      'group flex items-center py-2 rounded-md sidebar-menu-button transition-all',
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
                    )}
                  >
                    <a href={item.href} className={isActive(item.href) ? 'active' : ''}>
                      <item.icon size={18} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm truncate">{item.name}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarSeparator className="my-2" />

            <SidebarMenu>
              {categoriesNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={isCollapsed ? item.name : undefined}
                    className={cn(
                      'group flex items-center py-2 rounded-md sidebar-menu-button',
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
                    )}
                  >
                    <a href={item.href} className={isActive(item.href) ? 'active' : ''}>
                      <item.icon size={18} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm truncate">{item.name}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="py-3">
            <SidebarMenu>
              {!isUserLoading &&
                (user ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      tooltip={isCollapsed ? 'Logout' : undefined}
                      className={cn(
                        'group flex items-center py-2 rounded-md sidebar-menu-button',
                        isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
                      )}
                    >
                      <LogOut size={18} />
                      {!isCollapsed && <span className="text-sm">Logout</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? 'Sign In' : undefined}
                      className={cn(
                        'group flex items-center py-2 rounded-md sidebar-menu-button',
                        isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
                      )}
                    >
                      <a href="/login">
                        <LogIn size={18} />
                        {!isCollapsed && <span className="text-sm">Sign In</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Mobile Sidebar (Sheet) */}
      {showSidebar && !isDashboardPage && (
        <Sidebar
          variant="sheet"
          open={isMobileSidebarOpen}
          onOpenChange={setIsMobileSidebarOpen}
          className="md:hidden"
        >
          <SidebarContent className="py-3">
            <SidebarHeader className="text-xl font-bold py-4 px-6">Navigation</SidebarHeader>
            <SidebarMenu className="mt-1 px-2">
              {sidebarNav.map((item) => (
                <SidebarMenuItem key={`mobile-${item.name}`}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-md sidebar-menu-button text-base',
                      isActive(item.href) ? 'active' : ''
                    )}
                  >
                    <a
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarSeparator className="my-2" />

            <SidebarMenu className="px-2">
              {categoriesNav.map((item) => (
                <SidebarMenuItem key={`mobile-${item.name}`}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-md sidebar-menu-button text-base',
                      isActive(item.href) ? 'active' : ''
                    )}
                  >
                    <a
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4">
            {!isUserLoading && (
              user ? (
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileSidebarOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <LogOut size={18} className="mr-2" /> Logout
                </Button>
              ) : (
                <Button asChild className="w-full justify-start">
                  <a
                    href="/login"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <LogIn size={18} className="mr-2" /> Sign In
                  </a>
                </Button>
              )
            )}
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Main Content - Full width, respects sidebar & footer */}
      <div className={`min-h-screen pt-16 pb-14 ${footerHeight}`}>
        <main
          className={cn(
            'min-w-0 w-full px-4 md:px-6 lg:px-8 transition-all duration-300',
            mainPadding
          )}
        >
          {children}
        </main>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-inner">
        <Footer />
      </div>
    </div>
  );
}