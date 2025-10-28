'use client';

import { Button } from '@/components/ui/button';
import { useDeliveryMode } from '@/context/DeliveryModeProvider';

export function DeliveryModeToggle() {
  const { deliveryMode, setDeliveryMode } = useDeliveryMode();

  return (
    <div className="flex justify-center py-4">
      <div className="flex bg-gray-100 rounded-full p-1">
        <Button
          variant={deliveryMode === 'all' ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => setDeliveryMode('all')}
        >
          All
        </Button>
        <Button
          variant={deliveryMode === 'delivery' ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => setDeliveryMode('delivery')}
        >
          Delivery
        </Button>
        <Button
          variant={deliveryMode === 'pickup' ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => setDeliveryMode('pickup')}
        >
          Pickup
        </Button>
      </div>
    </div>
  );
}
