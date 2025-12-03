'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MenuNavProps {
  menuCategories: string[];
  hasChef?: boolean;
}

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export function MenuNav({ menuCategories }: MenuNavProps) {
  const [active, setActive] = React.useState<string | null>('Deals & Discounts');

  const baseItems: { label: string; id: string }[] = [
    { label: 'Deals & Discounts', id: 'deals-and-discounts' },
    { label: 'Reviews', id: 'reviews' },
  ];

  const categoryItems = menuCategories.map((title) => ({
    label: title,
    id: slugify(title),
  }));

  const items = [...baseItems, ...categoryItems];

  const handleClick = (item: { label: string; id: string }) => {
    setActive(item.label);
    const el = document.getElementById(item.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Desktop vertical nav */}
      <nav
        aria-label="Restaurant sections"
        className="space-y-1.5 hidden lg:block"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            className={cn(
              'w-full text-left text-sm font-semibold rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 border',
              'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200',
              active === item.label
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-black border-slate-200'
            )}
          >
            <span className="truncate">{item.label}</span>
            {active === item.label && (
              <span className="ml-2 h-2 w-2 rounded-full bg-white" />
            )}
          </button>
        ))}
      </nav>

      {/* Mobile horizontal chips */}
      <nav
        aria-label="Restaurant sections mobile"
        className="mt-2 flex lg:hidden gap-1.5 overflow-x-auto pb-1 no-scrollbar"
      >
        {items.map((item) => (
          <button
            key={`m-${item.label}`}
            type="button"
            onClick={() => handleClick(item)}
            className={cn(
              'flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border font-semibold transition-all duration-200',
              'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200',
              active === item.label
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-black border-slate-200'
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
