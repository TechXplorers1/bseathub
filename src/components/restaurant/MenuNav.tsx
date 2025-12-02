'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MenuNavProps {
  navItems: string[]; // Changed from menuCategories to navItems to be more generic
  hasChef: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function MenuNav({
  navItems, // Use navItems
  hasChef,
  className,
  orientation = 'vertical',
}: MenuNavProps) {
  const [activeItem, setActiveItem] = React.useState(''); // Initialize as empty
  const isMounted = React.useRef(false); // To prevent scroll-spy from setting active item before mount

  // Smooth scroll function
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset matches the sticky header height plus some padding/margin
      const yOffset = -120; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleScroll = React.useCallback(() => {
    if (!isMounted.current || navItems.length === 0) return;

    let currentActiveId = '';
    // This offset is where the section ID should be considered 'active' (just below the sticky bar)
    const yOffset = 130; 

    // Get all relevant section elements
    const elements = navItems
      .map((item) => document.getElementById(item))
      .filter(Boolean) as HTMLElement[];

    // Find the section whose top edge is closest to but above or at the yOffset (scroll-spy logic)
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();
        // The element is 'active' if its top is above the yOffset line
        if (rect.top <= yOffset) {
            currentActiveId = element.id;
            break;
        }
    }

    // Special handling for the very bottom of the page (ensure last item is active if scrolled all the way)
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 5) { // -5 for buffer
        currentActiveId = navItems[navItems.length - 1];
    }
    
    // Set the initial active item if none is set and the user is at the top
    if (!currentActiveId && navItems.length > 0 && window.scrollY < 10) {
      currentActiveId = navItems[0];
    }


    if (currentActiveId && currentActiveId !== activeItem) {
      setActiveItem(currentActiveId);
    } 
  }, [activeItem, navItems]);

  React.useEffect(() => {
    isMounted.current = true; // Mark as mounted
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Set initial active item based on scroll position immediately after mount
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      isMounted.current = false; // Mark as unmounted
    };
  }, [handleScroll]); // Depend on handleScroll which is useCallback


  // Set the very first item as active on mount if no item is active (e.g., initial load at top)
  React.useEffect(() => {
    if (isMounted.current && !activeItem && navItems.length > 0) {
      setActiveItem(navItems[0]);
    }
  }, [navItems, activeItem]);


  // Use dynamic height for vertical, full width for horizontal scroll
  const containerClasses = cn(
    orientation === 'vertical' ? 'h-[calc(100vh_-_10rem)]' : 'w-full',
    className
  );

  const navClasses =
    orientation === 'vertical'
      ? 'flex flex-col space-y-1 pr-2 py-2'
      : 'flex items-center space-x-2 py-2 whitespace-nowrap';

  return (
    <div className={containerClasses}>
      <ScrollArea className={cn(orientation === 'horizontal' && 'w-full')}>
        <nav className={navClasses}>
          {navItems.map((item) => {
            const isActive = activeItem === item;

            // Vertical Button Styles (Desktop/Sidebar)
            const verticalClasses = cn(
                'justify-start text-left h-auto py-2 px-3 rounded-full text-sm transition-all duration-300',
                'hover:bg-muted hover:translate-x-[2px]',
                isActive
                    ? 'font-bold text-primary bg-primary/10 border border-primary/40 shadow-sm'
                    : 'text-muted-foreground font-medium'
            );

            // Horizontal Button Styles (Mobile/Top Bar)
            const horizontalClasses = cn(
                'h-8 px-4 rounded-full text-xs transition-all duration-300',
                'border hover:border-primary/50',
                isActive
                    ? 'font-bold bg-primary text-primary-foreground shadow-md border-primary'
                    : 'text-muted-foreground bg-background border-gray-300 hover:bg-gray-50'
            );


            return (
              <Button
                key={item}
                variant="ghost"
                size={orientation === 'vertical' ? 'default' : 'sm'}
                onClick={() => {
                    setActiveItem(item); // Optimistically set active item on click
                    scrollToCategory(item);
                }}
                className={orientation === 'vertical' ? verticalClasses : horizontalClasses}
              >
                {item}
              </Button>
            );
          })}
        </nav>
        {orientation === 'horizontal' && <ScrollBar orientation="horizontal" />}
      </ScrollArea>
    </div>
  );
}