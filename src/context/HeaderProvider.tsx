'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderContextType {
  headerTitle: string | null;
  setHeaderTitle: (title: string | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);

  return (
    <HeaderContext.Provider value={{ headerTitle, setHeaderTitle }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
