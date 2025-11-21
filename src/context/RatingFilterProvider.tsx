'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface RatingFilterContextType {
  ratingFilter: number;
  setRatingFilter: (rating: number) => void;
}

const RatingFilterContext = createContext<RatingFilterContextType | undefined>(undefined);

export function RatingFilterProvider({ children }: { children: ReactNode }) {
  const [ratingFilter, setRatingFilter] = useState<number>(0);

  return (
    <RatingFilterContext.Provider value={{ ratingFilter, setRatingFilter }}>
      {children}
    </RatingFilterContext.Provider>
  );
}

export function useRatingFilter() {
  const context = useContext(RatingFilterContext);
  if (context === undefined) {
    throw new Error('useRatingFilter must be used within a RatingFilterProvider');
  }
  return context;
}
