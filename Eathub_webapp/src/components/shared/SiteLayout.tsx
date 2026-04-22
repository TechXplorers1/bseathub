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
  const isChefsList = pathname === '/chefs';

  // where to HIDE sidebar (individual detail pages)
  const isRestaurantDetail = pathname?.startsWith('/restaurant/');
  const isHomeFoodDetail = pathname?.startsWith('/home-food/');

  // final rule:
  // - show on home, category, restaurants list, home-food list, chefs list
  // - hide on individual restaurant + home food pages
  const showSidebar =
    (isHome || isCategory || isRestaurantsList || isHomeFoodList || isChefsList) &&
    !isRestaurantDetail &&
    !isHomeFoodDetail;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [contentAnimate, setContentAnimate] = useState(false);

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const HEADER_H = 64;
  const SIDEBAR_W = isCollapsed ? 80 : 240;
  const isMdUp = (windowWidth ?? 1024) >= 768;

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

      {showSidebar && isMdUp && (
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
          marginLeft: (isMdUp && showSidebar) ? (isCollapsed ? '80px' : '260px') : 0,
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header 
          className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300" 
          style={{ 
            paddingLeft: (isMdUp && showSidebar) ? (isCollapsed ? '80px' : '260px') : 0 
          }}
        />
        
        <main
          id="main-scroll-container"
          className="flex-1 relative"
          style={{
            paddingTop: HEADER_H,
            minHeight: '100vh'
          }}
        >
          <div
            className={`content-body ${contentAnimate ? 'animate' : ''}`}
            style={{ 
              padding: isRestaurantDetail || isHomeFoodDetail ? 0 : (isMdUp ? 16 : 12) 
            }}
          >
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}