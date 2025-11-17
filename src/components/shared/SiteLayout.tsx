'use client';

import React, { useEffect, useState } from 'react';
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

  // track window width so we only apply percentage margins on md+ screens
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const toggleCollapse = () => setIsCollapsed((p) => !p);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((p) => !p);

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

  // desired percentages
  const OPEN_SIDEBAR_PCT = 0.20; // 20%
  const COLLAPSED_SIDEBAR_PCT = 0.10; // 10%
  const sidebarPct = isCollapsed ? COLLAPSED_SIDEBAR_PCT : OPEN_SIDEBAR_PCT;

  // Only apply percentage based sizing for md+ screens
  const isMdUp = (windowWidth ?? 1024) >= 768 && typeof window !== 'undefined';

  // clamp sidebar width percent between 8% and 30% for safety
  const sidebarPercentClamped = Math.max(Math.min(sidebarPct * 100, 30), 8);

  // Header/footer pixel heights (match your Header/Footer components)
  const HEADER_HEIGHT_PX = 64; // h-16 = 4rem = 64px
  const FOOTER_HEIGHT_PX = 56; // h-14 = 3.5rem = 56px
  const innerScrollHeight = `calc(100vh - ${HEADER_HEIGHT_PX}px - ${FOOTER_HEIGHT_PX}px)`;

  // Inline styles for sidebar and main (desktop only)
  const sidebarStyle: React.CSSProperties =
    isMdUp && showSidebar && !isDashboardPage
      ? {
          width: `${sidebarPercentClamped}%`,
          minWidth: '80px',
          maxWidth: '360px',
          height: innerScrollHeight,
          transition: 'width 240ms ease',
          overflow: 'hidden',
        }
      : { width: undefined };

  const mainStyle: React.CSSProperties =
    isMdUp && showSidebar && !isDashboardPage
      ? {
          marginLeft: `${sidebarPercentClamped}%`,
          height: innerScrollHeight,
          transition: 'margin-left 240ms ease',
          overflowY: 'auto',
          overflowX: 'hidden',
        }
      : {
          marginLeft: undefined,
          height: `calc(100vh - ${HEADER_HEIGHT_PX}px - ${FOOTER_HEIGHT_PX}px)`,
          overflowY: 'auto',
          overflowX: 'hidden',
        };

  // Sidebar inner content style to allow it to scroll independently
  const sidebarInnerStyle: React.CSSProperties =
    isMdUp && showSidebar && !isDashboardPage
      ? { height: '100%', overflowY: 'auto' }
      : {};

  return (
    // Make the top-level container non-scrollable; inner main/sidebar will scroll.
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Fixed Header */}
      <Header className="fixed top-0 left-0 w-full z-40 h-16 bg-white shadow-sm" />

      {/* Mobile toggle (hamburger) */}
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

      {/* Desktop Sidebar (outer container uses inline percent width & fixed inner height) */}
      {showSidebar && !isDashboardPage && (
        <aside style={sidebarStyle} className="hidden md:block fixed top-16 left-0 z-10 border-r border-sidebar-border bg-sidebar">
          <div style={sidebarInnerStyle}>
            <Sidebar className="h-full">
              <SidebarContent className="py-3">
                <SidebarHeader className={cn('py-2 px-5', isCollapsed && 'justify-center')}>
                  <button
                    onClick={toggleCollapse}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className={cn(
                      'flex items-center p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sidebar-menu-button font-bold text-lg',
                      isCollapsed ? 'w-10 justify-center' : 'w-full justify-start'
                    )}
                  >
                    {isCollapsed ? (
                      <span className="text-sm" style={{ color: 'hsl(25, 95%, 53%)' }}>EH</span>
                    ) : (
                      <span style={{ color: 'hsl(25, 95%, 53%)' }}>HUB Filters</span>
                    )}
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
                          {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
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
                          {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
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
          </div>
        </aside>
      )}

      {/* Mobile Sidebar (sheet) */}
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
                    <a href={item.href} onClick={() => setIsMobileSidebarOpen(false)}>
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
                    <a href={item.href} onClick={() => setIsMobileSidebarOpen(false)}>
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
                  <a href="/login" onClick={() => setIsMobileSidebarOpen(false)}>
                    <LogIn size={18} className="mr-2" /> Sign In
                  </a>
                </Button>
              )
            )}
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Main content area (the only scrollable area) */}
      <main
        className="fixed top-[64px] left-0 right-0 z-0 transition-all duration-300"
        style={mainStyle}
      >
        <div style={{ height: '100%', boxSizing: 'border-box', padding: '1rem' }}>
          {children}
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full z-20 bg-white shadow-inner h-14">
        <Footer />
      </div>
    </div>
  );
}
