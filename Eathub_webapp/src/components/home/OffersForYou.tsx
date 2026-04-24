'use client';

import * as React from 'react';
import {
  Percent,
  PackagePlus,
  Truck,
  Wallet,
  Home,
  Clock,
  Repeat2,
  Crown,
  CalendarDays,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────── */
interface OfferType {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  /** optional: show a live countdown */
  hasCountdown?: boolean;
  /** orange/energetic highlight colour for the ring */
  highlight?: boolean;
}

/* ── Offer data matching the reference image ────────────────── */
const OFFERS: OfferType[] = [
  { id: 'pct',   label: 'Percentage',   sublabel: 'Discount',        icon: Percent      },
  { id: 'combo', label: 'Combo Deals',                               icon: PackagePlus  },
  { id: 'free',  label: 'Free Delivery',                             icon: Truck        },
  { id: 'cash',  label: 'Cashback',                                  icon: Wallet       },
  { id: 'home',  label: 'Home Specials',                             icon: Home         },
  { id: 'happy', label: 'Happy Hours',  sublabel: '2PM–6PM',         icon: Clock        },
  { id: 'bogo',  label: 'BOGO Offers',                               icon: Repeat2      },
  { id: 'pro',   label: 'Pro Offers',   sublabel: 'Exclusive',       icon: Crown,   highlight: true },
  { id: 'meal',  label: 'Meal Plans',   sublabel: 'Weekly / Monthly', icon: CalendarDays },
  { id: 'flash', label: 'Flash Deals',  hasCountdown: true,          icon: Zap,    highlight: true },
];

/* ── Countdown hook ─────────────────────────────────────────── */
function useCountdown(initialSeconds: number) {
  const [secs, setSecs] = React.useState(initialSeconds);
  React.useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/* ── Single offer pill ──────────────────────────────────────── */
function OfferPill({ offer }: { offer: OfferType }) {
  const countdown = useCountdown(offer.hasCountdown ? 3764 : 0); // ~1h 02m 44s

  return (
    <Link href={`/offers/${offer.id}`} className="group flex-shrink-0 focus:outline-none">
      <div
        className="flex flex-col items-center gap-1.5 cursor-pointer"
        aria-label={offer.label}
      >
        {/* Circle */}
        <div
          className={cn(
            'relative flex items-center justify-center',
            'w-16 h-16 rounded-full border-2 transition-all duration-200',
            offer.highlight
              ? 'border-orange-400 bg-orange-50 group-hover:bg-orange-100'
              : 'border-gray-300 bg-white group-hover:border-orange-400 group-hover:bg-orange-50'
          )}
        >
          <offer.icon
            className={cn(
              'w-7 h-7 transition-colors duration-200',
              offer.highlight
                ? 'text-orange-500'
                : 'text-gray-600 group-hover:text-orange-500'
            )}
            strokeWidth={1.6}
          />

          {/* Flash badge on highlight pills */}
          {offer.highlight && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Label */}
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] font-semibold text-gray-700 group-hover:text-orange-500 transition-colors text-center whitespace-nowrap">
            {offer.label}
          </span>
          {offer.hasCountdown ? (
            <span className="text-[10px] font-mono font-bold text-orange-500 tabular-nums">
              -{countdown}
            </span>
          ) : offer.sublabel ? (
            <span className="text-[10px] text-gray-400 text-center">{offer.sublabel}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export function OffersForYou() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft]   = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });

  return (
    <section className="mb-6 overflow-hidden px-4 sm:px-0">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Offers For You</h2>

      <div className="relative group/scroll">
        <div
          ref={scrollRef}
          className="flex flex-nowrap items-center gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {OFFERS.map((offer) => (
            <OfferPill key={offer.id} offer={offer} />
          ))}
        </div>

        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-8 -translate-x-3 -translate-y-1/2 z-10
                       w-7 h-7 rounded-full bg-white shadow-md border border-gray-200
                       flex items-center justify-center opacity-0 group-hover/scroll:opacity-100
                       transition-opacity hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Right arrow */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-8 translate-x-3 -translate-y-1/2 z-10
                       w-7 h-7 rounded-full bg-white shadow-md border border-gray-200
                       flex items-center justify-center opacity-0 group-hover/scroll:opacity-100
                       transition-opacity hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </section>
  );
}
