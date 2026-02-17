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
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUser } from '@/firebase';
import { usePathname } from 'next/navigation';
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

  // where to HIDE sidebar (individual detail pages)
  const isRestaurantDetail = pathname?.startsWith('/restaurants/');
  const isHomeFoodDetail = pathname?.startsWith('/home-food/');

  // final rule:
  // - show on home, category, restaurants list, home-food list
  // - hide on individual restaurant + home food pages
  const showSidebar =
    (isHome || isCategory || isRestaurantsList || isHomeFoodList) &&
    !isRestaurantDetail &&
    !isHomeFoodDetail;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [contentAnimate, setContentAnimate] = useState(false);

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setContentAnimate(true);
    const t = setTimeout(() => setContentAnimate(false), 320);
    return () => clearTimeout(t);
  }, [pathname, isMobileSidebarOpen]);

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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const OPEN_PCT = 0.18;
  const COLLAPSED_PCT = 0.07;
  const sidebarPct = isCollapsed ? COLLAPSED_PCT : OPEN_PCT;
  const isMdUp = (windowWidth ?? 1024) >= 768;
  const sidebarPercentClamped = Math.max(Math.min(sidebarPct * 100, 30), 6);

  const HEADER_H = 64;
  const FOOTER_H = 56;
  const innerScrollHeight = `calc(100vh - ${HEADER_H}px - ${FOOTER_H}px)`;

  const ORANGE = 'hsl(25, 95%, 53%)';
  const HIGHLIGHT_GREEN = 'rgb(29, 125, 125)';
  const DARK_GREEN = '#007575';
  const SIDEBAR_BG = 'var(--sidebar, #fff)';
  const SIDEBAR_BORDER = 'var(--sidebar-border, #e6e6e6)';

  const asideStyle: React.CSSProperties =
    isMdUp && showSidebar
      ? {
        position: 'fixed',
        top: `${HEADER_H}px`,
        left: 0,
        width: `${sidebarPercentClamped}%`,
        minWidth: isCollapsed ? '60px' : '72px', // Slightly wider min-width for collapsed state
        maxWidth: '320px',
        height: innerScrollHeight,
        overflow: 'hidden',
        background: SIDEBAR_BG,
        transition: 'width 200ms ease',
        boxSizing: 'border-box',
        zIndex: 40,
      }
      : { display: 'none' };

  const innerStyle: React.CSSProperties = {
    height: '100%',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <style>{`
        .sidebar-inner { -ms-overflow-style: none; scrollbar-width: none; }
        .sidebar-inner::-webkit-scrollbar { display: none; }

        .hub-label { font-weight: 800; color: ${ORANGE}; font-size: 0.95rem; }
        /* Removed .collapsed-eh class as it's no longer needed */

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

        .sidebar-collapsed .sidebar-link { 
          justify-content: center; 
          padding: 8px 0; 
          width: 44px; /* Slightly smaller width for collapsed items */
          height: 44px; 
          border-radius: 12px;
          margin: 0 auto; /* Center items horizontally */
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

        /* Updated toggle button styles */
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
          top: ${HEADER_H}px;
          left: 0;
          bottom: ${FOOTER_H}px;
          width: min(340px, 86%);
          max-width: 360px;
          background: #ffffff;
          border-top-right-radius: 14px;
          border-bottom-right-radius: 14px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.28);
          z-index: 61;
          display: flex;
          flex-direction: column;
          padding: 12px;
          transform: translateX(-4px);
          transition: transform 180ms ease, opacity 180ms ease;
          overflow: hidden;
        }

        .mobile-sheet-header {
          display:flex;
          align-items:center;
          justify-content:flex-end;
          padding: 8px;
          position: sticky;
          top: 0;
          background: transparent;
          color: inherit;
          border-radius: 6px;
        }

        .mobile-sidebar-panel .sidebar-menu a {
          display:flex;
          gap:14px;
          align-items:center;
          padding: 12px;
          border-radius: 10px;
          text-decoration:none;
          color: inherit;
          font-size: 16px;
          height: 52px;
          transition: background .12s;
        }
        .mobile-sidebar-panel .sidebar-menu a:hover { background: ${ORANGE}; color: white; }
        .mobile-sidebar-panel .sidebar-menu a[aria-current="page"] { background: ${ORANGE}; color: white; }

        .content-body { will-change: transform, opacity; }
        .content-body.animate { animation: fadeUp .32s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-50" />

      {showSidebar && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation"
          className="md:hidden"
          style={{
            position: 'fixed',
            top: `${HEADER_H + 8}px`,
            left: 12,
            zIndex: 70,
          }}
        >
          <div className="h-4 w-4" style={{ fontSize: 18 }}>
            ☰
          </div>
        </Button>
      )}

      {showSidebar && (
        <aside
          style={asideStyle}
          className={cn(isCollapsed && 'sidebar-collapsed')}
          aria-label="Main navigation"
        >
          <div style={innerStyle} className="sidebar-inner">
            {/* REDESIGNED SIDEBAR HEADER */}
            <div
              className="toggle-button-container"
              style={{
                // Center content if collapsed, spread if expanded
                justifyContent: isCollapsed ? 'center' : 'space-between',
              }}
            >
              {!isCollapsed && <span className="hub-label">Menu</span>}

              <button
                onClick={toggleCollapse}
                aria-expanded={!isCollapsed}
                className="toggle-icon-btn"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                <span className="toggle-icon-visual" aria-hidden>
                  {isCollapsed ? (
                    // Hamburger menu when collapsed
                    <span>≡</span>
                  ) : (
                    // Arrow pointing LEFT when open (&lsaquo; is left single arrow)
                    <span style={{ position: 'relative', top: '-1px' }}>
                      &lsaquo;
                    </span>
                  )}
                </span>
              </button>
            </div>

            <nav
              aria-label="Sidebar links"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <ul
                className="sidebar-list"
                style={{ flex: isCollapsed ? 'none' : '0 0 auto' }}
              >
                {sidebarNav.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="sidebar-link"
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      {/* UPDATED: Icon size decreased to 18 */}
                      <item.icon size={18} />
                      {!isCollapsed && (
                        <span style={{ marginLeft: 6, cursor: 'pointer' }}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              <div style={{ padding: 8 }}>
                <SidebarSeparator />
              </div>

              <ul
                className="sidebar-list"
                style={{ marginTop: 8, paddingBottom: 12 }}
              >
                {categoriesNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="sidebar-link">
                      {/* UPDATED: Icon size decreased to 18 */}
                      <item.icon size={18} />
                      {!isCollapsed && (
                        <span style={{ marginLeft: 6, cursor: 'pointer' }}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', padding: 12 }}>
                {!isUserLoading &&
                  (user ? (
                    <button onClick={handleLogout} className="logout-link">
                      <LogOut size={18} />
                      {!isCollapsed && <span>Logout</span>}
                    </button>
                  ) : (
                    <Link href="/login" className="login-button">
                      <LogIn size={18} />
                      {!isCollapsed && (
                        <span style={{ marginLeft: 6, cursor: 'pointer' }}>
                          Sign In
                        </span>
                      )}
                    </Link>
                  ))}
              </div>
            </nav>
          </div>
        </aside>
      )}

      {/* mobile sheet */}
      {showSidebar && (
        <>
          {isMobileSidebarOpen && (
            <div
              className="mobile-sidebar-backdrop"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <div
            role="dialog"
            aria-modal="true"
            className="mobile-sidebar-panel md:hidden"
            style={{
              transform: isMobileSidebarOpen
                ? 'translateX(0)'
                : 'translateX(-110%)',
              opacity: isMobileSidebarOpen ? 1 : 0,
              pointerEvents: isMobileSidebarOpen ? 'auto' : 'none',
            }}
          >
            <div className="mobile-sheet-header">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close navigation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'currentColor',
                  fontSize: 22,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 8, overflowY: 'auto' }}>
              <SidebarMenu className="mt-1">
                {sidebarNav.map((item) => (
                  <SidebarMenuItem key={`m-${item.name}`}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 10,
                          textDecoration: 'none',
                          background: isActive(item.href)
                            ? HIGHLIGHT_GREEN
                            : 'transparent',
                          color: isActive(item.href) ? 'white' : 'inherit',
                          height: 52,
                        }}
                      >
                        <item.icon size={20} />
                        <span style={{ fontSize: 16 }}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              <div style={{ margin: '10px 0' }}>
                <SidebarSeparator />
              </div>

              <SidebarMenu>
                {categoriesNav.map((item) => (
                  <SidebarMenuItem key={`m-cat-${item.name}`}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 10,
                          textDecoration: 'none',
                          height: 52,
                        }}
                      >
                        <item.icon size={20} />
                        <span style={{ fontSize: 16 }}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            <div style={{ marginTop: 'auto', padding: 12 }}>
              {!isUserLoading &&
                (user ? (
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileSidebarOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ height: 48 }}
                  >
                    <LogOut size={18} className="mr-2" /> Logout
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full justify-start"
                    style={{ height: 48 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsMobileSidebarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <LogIn size={18} /> Sign In
                    </Link>
                  </Button>
                ))}
            </div>
          </div>
        </>
      )}

      {/* main content */}
      <main
        id="main-scroll-container"
        style={{
          position: 'fixed',
          top: `${HEADER_H}px`,
          right: 0,
          left: isMdUp && showSidebar ? `${sidebarPercentClamped}%` : 0,
          height: innerScrollHeight,
          overflowY: 'auto',
          boxSizing: 'border-box',
          transition: 'left 200ms ease',
        }}
      >
        <div
          className={`content-body ${contentAnimate ? 'animate' : ''}`}
          style={{ padding: 16 }}
        >
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}