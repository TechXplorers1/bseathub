// components/layout/SiteLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Menu,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUser } from '@/firebase';
import { usePathname } from 'next/navigation';
import { useHeader } from '@/context/HeaderProvider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Sidebar as MobileSidebar,
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

  // where to show sidebar
  const isHome = pathname === '/';
  const isCategory = pathname?.startsWith('/category');
  const isRestaurantsList = pathname === '/restaurants';
  const isHomeFoodList = pathname === '/home-food';
  const isChefsList = pathname === '/chefs';
  const isFavorites = pathname === '/favorites';

  // where to HIDE sidebar (individual detail pages)
  const isRestaurantDetail = pathname?.startsWith('/restaurant/');
  const isHomeFoodDetail = pathname?.startsWith('/home-food/');

  // final rule:
  const showSidebar =
    (isHome || isCategory || isRestaurantsList || isHomeFoodList || isChefsList || isFavorites) &&
    !isRestaurantDetail &&
    !isHomeFoodDetail;

  const isWidePage = isRestaurantDetail || isHomeFoodDetail || isRestaurantsList || isHomeFoodList;

  const { isSidebarOpen: isMobileSidebarOpen, setIsSidebarOpen: setIsMobileSidebarOpen } = useHeader();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contentAnimate, setContentAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showMenuTrigger, setShowMenuTrigger] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const HEADER_H = 64;
  const SIDEBAR_W = isCollapsed ? 80 : 240;
  const isMdUp = (windowWidth ?? 1024) >= 768;

  useEffect(() => {
    setIsMounted(true);
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();

    // Show for 4s on mount, then auto-hide only if scrolled down
    const initialTimer = setTimeout(() => {
      if (window.scrollY > 100) {
        setShowMenuTrigger(false);
      }
    }, 4000);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY) {
        // Scrolling UP - show immediately
        setShowMenuTrigger(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 64) {
        // Scrolling DOWN - hide
        setShowMenuTrigger(false);
      }

      setLastScrollY(currentScrollY);

      // Auto-hide after 3 seconds of inactivity if currently shown
      clearTimeout((window as any).menuTriggerTimer);
      if (currentScrollY < 100) {
        setShowMenuTrigger(true); // Keep shown at top
      } else {
        (window as any).menuTriggerTimer = setTimeout(() => {
           // Optional: you can auto-hide here if you want it to disappear when idle
           // setShowMenuTrigger(false); 
        }, 3000);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(initialTimer);
    };
  }, [lastScrollY]);

  useEffect(() => {
    setContentAnimate(true);
    const t = setTimeout(() => setContentAnimate(false), 320);
    return () => clearTimeout(t);
  }, [pathname, isMobileSidebarOpen]);

  const toggleCollapse = () => setIsCollapsed((p) => !p);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const handleLogout = async () => {
    const { signOut } = await import('@/firebase');
    if (signOut) signOut();
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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const ORANGE = 'hsl(25, 95%, 53%)';
  const HIGHLIGHT_GREEN = 'rgb(29, 125, 125)';
  const DARK_GREEN = '#007575';
  const SIDEBAR_BG = 'var(--sidebar, #fff)';
  const SIDEBAR_BORDER = 'var(--sidebar-border, #e6e6e6)';

  return (
    <div className="min-h-screen flex">
      <style>{`
        .sidebar-inner { -ms-overflow-style: none; scrollbar-width: none; }
        .sidebar-inner::-webkit-scrollbar { display: none; }

        .hub-label { font-weight: 800; color: ${ORANGE}; font-size: 0.95rem; }

        .sidebar-link { 
          display: inline-flex; 
          align-items: center; 
          gap: 12px; 
          text-decoration: none; 
          color: inherit; 
          padding: 8px 14px; 
          transition: background .15s, color .15s; 
          height: 40px; 
          font-size: 14px; 
          width: 100%;
          box-sizing: border-box;
          border-radius: 8px;
        }
        
        .sidebar-list { 
          list-style: none; 
          margin: 0; 
          padding: 6px 8px;
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }

        .sidebar-link[aria-current="page"] { 
          background: ${ORANGE}; 
          color: white; 
          box-shadow: none; 
        }
        
        .sidebar-link:not([aria-current="page"]):hover { 
          background: ${DARK_GREEN}; 
          color: white; 
          transform: none;
        }

        .sidebar-collapsed .sidebar-list {
          padding: 8px;
          align-items: center;
        }

        .sidebar-collapsed .sidebar-link { 
          justify-content: center; 
          padding: 0; 
          width: 48px; 
          height: 48px; 
          border-radius: 14px;
          margin: 4px auto; 
        }

        .sidebar-collapsed .sidebar-link span {
          display: none;
        }

        .logout-link, .login-button {
          display: inline-flex; 
          align-items: center; 
          gap: 10px; 
          background: transparent; 
          border: none; 
          cursor: pointer; 
          padding: 8px 12px; 
          width: 100%; 
          text-align: left;
          border-radius: 8px;
          transition: background .15s;
        }
        .logout-link:hover, .login-button:hover {
          background: ${SIDEBAR_BORDER};
        }

        .toggle-button-container {
           display: flex;
           align-items: center;
           padding: 12px 16px;
           height: 60px;
           box-sizing: border-box;
        }
        .toggle-icon-btn { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; border: none; padding: 4px; }
        .toggle-icon-visual { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: rgba(0,0,0,0.04); font-weight: 700; font-size: 18px; color: ${ORANGE}; }
        .toggle-icon-visual:hover { background: rgba(0,0,0,0.08); }

        .mobile-sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 60;
        }

        .mobile-sidebar-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(340px, 86%);
          background: #ffffff;
          z-index: 61;
          display: flex;
          flex-direction: column;
          padding: 12px;
          transition: transform 180ms ease;
        }

        .content-body { will-change: transform, opacity; }
        .content-body.animate { animation: fadeUp .32s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {isMounted && showSidebar && isMdUp && (
        <aside
          className={cn(
            "fixed left-0 border-r z-40 bg-white transition-all duration-300 ease-in-out",
            isCollapsed ? "w-[80px] sidebar-collapsed" : "w-[260px]"
          )}
          style={{ top: HEADER_H, height: `calc(100vh - ${HEADER_H}px)` }}
          aria-label="Main navigation"
        >
          <div className="h-full overflow-y-auto sidebar-inner">
            <div className="toggle-button-container" style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}>
              {!isCollapsed && <span className="hub-label">Menu</span>}
              <button onClick={toggleCollapse} className="toggle-icon-btn">
                <span className="toggle-icon-visual">{isCollapsed ? '≡' : '‹'}</span>
              </button>
            </div>
            <nav className="flex flex-col h-full">
              <ul className="sidebar-list">
                {sidebarNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="sidebar-link" aria-current={isActive(item.href) ? 'page' : undefined}>
                      <item.icon size={20} />
                      {!isCollapsed && <span className="font-medium tracking-tight">{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              <div style={{ padding: 8 }}><SidebarSeparator /></div>
              <ul className="sidebar-list">
                {categoriesNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="sidebar-link">
                      <item.icon size={20} />
                      {!isCollapsed && <span className="font-medium tracking-tight">{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      )}

      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{
          marginLeft: (isMounted && isMdUp && showSidebar) ? (isCollapsed ? '80px' : '260px') : 0,
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header
          className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300"
          style={{}}
        />

        {/* Floating Hamburger Trigger */}
        {true && !isMobileSidebarOpen && (
          <div
            className={cn(
              "fixed left-4 z-[60] transition-all duration-700 ease-in-out",
              showMenuTrigger ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
            )}
            style={{ top: HEADER_H + 12 }}
          >
            <Button
              onClick={toggleMobileSidebar}
              className="h-10 w-10 rounded-full shadow-lg border border-white/40 flex items-center justify-center p-0 overflow-hidden group transition-transform active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(12px) saturate(180%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Menu className="h-5 w-5 text-orange-500 relative z-10 drop-shadow-sm" />
            </Button>
          </div>
        )}

        <main
          id="main-scroll-container"
          className="flex-1 relative w-full"
          style={{
            paddingTop: HEADER_H,
            minHeight: '100vh',
          }}
        >
          <div
            className={`content-body ${contentAnimate ? 'animate' : ''} w-full max-w-none`}
            style={{
              padding: isWidePage ? 0 : (isMdUp ? 16 : (isMounted ? 8 : 12)),
              width: '100%'
            }}
          >
            {children}
          </div>
        </main>

        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <div className="flex flex-col h-full bg-white">
              <div className="p-6 border-b">
                <span className="hub-label">Eat Hub Menu</span>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="sidebar-list">
                  {sidebarNav.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="sidebar-link"
                        onClick={() => setIsMobileSidebarOpen(false)}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                        <item.icon size={20} />
                        <span className="font-bold">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Footer />
      </div>
    </div>
  );
}