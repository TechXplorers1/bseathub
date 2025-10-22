'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MenuNavProps {
  menuCategories: string[];
  hasChef: boolean;
  className?: string;
}

export function MenuNav({ menuCategories, hasChef, className }: MenuNavProps) {
  const baseNavItems = ["Deals & Discounts", "Featured Items", "Reviews", "Most Ordered"];
  const chefNavItems = ["About", "Signature Dishes", "Book a Chef"];
  const navItems = hasChef ? [...baseNavItems.slice(0,1), ...chefNavItems, ...baseNavItems.slice(1), ...menuCategories] : [...baseNavItems, ...menuCategories];
  const [activeItem, setActiveItem] = React.useState(navItems[0]);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        const yOffset = -120; // Adjust this value to account for the sticky header
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const handleScroll = React.useCallback(() => {
    let currentCategory = '';
    const yOffset = 130; // A bit more than the sticky header height
    
    const elements = navItems.map(item => document.getElementById(item)).filter(Boolean);

    for (const element of elements) {
      if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= yOffset && rect.bottom > yOffset) {
              currentCategory = element.id;
              break;
          }
      }
    }

    // If no category is in view, check if we've scrolled past the first one
    if (!currentCategory && elements.length > 0 && elements[0]) {
      if (elements[0].getBoundingClientRect().top > yOffset) {
        currentCategory = elements[0].id;
      }
    }
    
    // If we've scrolled to the bottom, the last item should be active
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) { // 2px buffer
        currentCategory = navItems[navItems.length - 1];
    }


    if (currentCategory && currentCategory !== activeItem) {
        setActiveItem(currentCategory);
    }

  }, [activeItem, navItems]);


  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className={cn('h-full', className)}>
        <ScrollArea className="h-[calc(100vh-250px)]">
            <nav className="flex flex-col space-y-1 pr-4">
            {navItems.map((item) => (
                <Button
                    key={item}
                    variant="ghost"
                    onClick={() => {
                        // setActiveItem(item); // This is handled by the scroll listener
                        scrollToCategory(item);
                    }}
                    className={cn(
                        'justify-start text-left h-auto py-2 px-3',
                        activeItem === item
                        ? 'font-bold text-foreground'
                        : 'text-muted-foreground'
                    )}
                >
                {item}
                </Button>
            ))}
            </nav>
        </ScrollArea>
    </div>
  );
}
