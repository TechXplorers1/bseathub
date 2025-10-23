'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type DeliveryMode = 'all' |'delivery' | 'pickup';

interface DeliveryModeContextType {
  deliveryMode: DeliveryMode;
  setDeliveryMode: (mode: DeliveryMode) => void;
}

const DeliveryModeContext = createContext<DeliveryModeContextType | undefined>(undefined);

export function DeliveryModeProvider({ children }: { children: ReactNode }) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('all');

  return (
    <DeliveryModeContext.Provider value={{ deliveryMode, setDeliveryMode }}>
      {children}
    </DeliveryModeContext.Provider>
  );
}

export function useDeliveryMode() {
  const context = useContext(DeliveryModeContext);
  if (context === undefined) {
    throw new Error('useDeliveryMode must be used within a DeliveryModeProvider');
  }
  return context;
}
