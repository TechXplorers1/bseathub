'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderContextType {
  headerTitle: string | null;
  setHeaderTitle: (title: string | null) => void;
  headerPath: string | null;
  setHeaderPath: (path: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchPlaceholder: string;
  setSearchPlaceholder: (p: string) => void;
  localItems: any[] | null;
  setLocalItems: (items: any[] | null) => void;
  isAuthSuggestionOpen: boolean;
  setIsAuthSuggestionOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [headerPath, setHeaderPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search food, restaurants, chefs...');
  const [localItems, setLocalItems] = useState<any[] | null>(null);
  const [isAuthSuggestionOpen, setIsAuthSuggestionOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <HeaderContext.Provider 
      value={{ 
        headerTitle, setHeaderTitle, 
        headerPath, setHeaderPath,
        searchQuery, setSearchQuery,
        searchPlaceholder, setSearchPlaceholder,
        localItems, setLocalItems,
        isAuthSuggestionOpen, setIsAuthSuggestionOpen,
        isSidebarOpen, setIsSidebarOpen
      }}
    >
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
