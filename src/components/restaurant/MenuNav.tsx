'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface MenuNavProps {
  menuCategories: string[];
  className?: string;
}

export function MenuNav({ menuCategories, className }: MenuNavProps) {
  const [activeItem, setActiveItem] = React.useState(menuCategories[0] || 'Featured Items');

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
    const yOffset = -120;
    
    for (const category of menuCategories) {
      const element = document.getElementById(category);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top + yOffset <= 1) {
          currentCategory = category;
        }
      }
    }
    if (currentCategory && currentCategory !== activeItem) {
        setActiveItem(currentCategory);
    } else if (!currentCategory && menuCategories.length > 0) {
        setActiveItem(menuCategories[0]);
    }
  }, [activeItem, menuCategories]);


  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const navItems = ["Featured Items", "Reviews", "Most Ordered", ...menuCategories];

  return (
    <div className={cn('sticky top-28', className)}>
        <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="flex flex-col space-y-1 pr-4">
            {navItems.map((item) => (
                <Button
                    key={item}
                    variant="ghost"
                    onClick={() => {
                        setActiveItem(item);
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
