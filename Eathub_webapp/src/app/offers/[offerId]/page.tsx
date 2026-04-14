'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { useRestaurants } from '@/context/RestaurantProvider';
import { OfferCard } from '@/components/offers/OfferCard';
import { OfferDetailsModal } from '@/components/offers/OfferDetailsModal';
import { Button } from '@/components/ui/button';

// Extracted from OffersForYou to map URL ID back to the display label
const OFFER_MAP: Record<string, string> = {
  pct: 'Percentage Discount',
  combo: 'Combo Deals',
  free: 'Free Delivery',
  cash: 'Cashback',
  home: 'Home Specials',
  happy: 'Happy Hours',
  bogo: 'BOGO Offers',
  pro: 'Pro Offers',
  meal: 'Meal Plans',
  flash: 'Flash Deals',
};

const FILTERS = ['All', 'Veg', 'Non-Veg', 'Rating', 'Price'];

export default function OffersPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { allItems } = useRestaurants();
  const [activeFilter, setActiveFilter] = React.useState('All');

  const rawOfferId = resolvedParams.offerId || '';
  const pageTitle = OFFER_MAP[rawOfferId] || 'Offers';
  const targetOfferType = OFFER_MAP[rawOfferId];

  const [itemsPool, setItemsPool] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedOffer, setSelectedOffer] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadOffers() {
      setLoading(true);
      try {
        const { fetchItemsOnOffer } = await import('@/services/api');
        const data = await fetchItemsOnOffer(targetOfferType);
        setItemsPool(data || []);
      } catch (err) {
        console.error("Failed to load offers", err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, [targetOfferType]);
  
  // Apply visual category filter (if itemType exists)
  const filteredItems = itemsPool.filter((item: any) => {
    if (activeFilter === 'Veg') return item.itemType === 'Veg' || item.itemType === 'Vegan';
    if (activeFilter === 'Non-Veg') return item.itemType === 'Non-Veg';
    return true; // All, Rating, Price fallback
  });

  // Calculate random-looking discount text for the demo based on the offer
  const getOfferDiscountText = () => {
    switch(rawOfferId) {
      case 'bogo': return 'BOGO';
      case 'free': return 'FREE DELIVERY';
      case 'cash': return '20% CASHBACK';
      case 'flash': return 'FLASH SALE';
      default: return '50% OFF';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 w-full flex flex-col pt-16">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 flex items-center p-3 h-16 shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <h1 className="font-bold text-base md:text-lg text-gray-900 mx-auto transform -translate-x-4">
          {pageTitle}
        </h1>
        
        <button 
          onClick={() => router.push('/')} 
          className="absolute right-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 fixed top-16 left-0 right-0 z-30 overflow-x-auto whitespace-nowrap flex gap-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {FILTERS.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            className={`rounded-full h-8 text-xs font-semibold flex-shrink-0 transition-all ${
               activeFilter === filter 
                ? 'bg-orange-500 hover:bg-orange-600 border-transparent' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="px-4 pt-16 max-w-[1400px] mx-auto w-full">
        {/* Info Text */}
        <p className="text-sm text-gray-500 mb-4 mt-6">
          Showing: <span className="font-bold text-gray-800">{pageTitle}</span> ({filteredItems.length} items)
        </p>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p>Fetching active deals...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredItems.map((item, idx) => (
              <OfferCard 
                key={item.id} 
                item={item} 
                discountText={getOfferDiscountText()} 
                rating={4 + (idx % 10) / 10} 
                timeMins={20 + (idx * 5)} 
                onClick={() => {
                  setSelectedOffer(item);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <p>No items found for this filter.</p>
            <Button variant="link" className="text-orange-500 mt-2" onClick={() => setActiveFilter('All')}>Clear filters</Button>
          </div>
        )}
      </div>

      <OfferDetailsModal
        item={selectedOffer}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedOffer(null), 300);
        }}
        discountText={getOfferDiscountText()}
      />
    </div>
  );
}
