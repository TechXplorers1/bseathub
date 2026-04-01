'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, MenuItem, OrderRequest, OrderItemRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createOrder, fetchUserProfile, createRazorpayOrder } from '@/services/api';
import { useRouter } from 'next/navigation';
import { loadRazorpay } from '@/lib/razorpay';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { updateFcmToken } from '@/services/api';

interface CartContextType {
  cartItems: CartItem[];
  providerInfo: { id: string; type: 'Restaurant' | 'HomeFood'; name: string } | null;
  addToCart: (item: MenuItem, provider: { id: string; type: 'Restaurant' | 'HomeFood'; name: string }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (customAddress?: string) => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [providerInfo, setProviderInfo] = useState<{ id: string; type: 'Restaurant' | 'HomeFood'; name: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedProvider = localStorage.getItem('cartProvider');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    if (savedProvider) {
      try {
        setProviderInfo(JSON.parse(savedProvider));
      } catch (e) {
        console.error('Failed to parse provider info', e);
      }
    }

    // Initialize Firebase Notifications
    const initNotifications = async () => {
      const token = await requestForToken();
      if (token) {
        await updateFcmToken(token);
      }
    };

    // Only init if logged in
    if (localStorage.getItem('token')) {
      initNotifications();
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      if (providerInfo) {
        localStorage.setItem('cartProvider', JSON.stringify(providerInfo));
      } else {
        localStorage.removeItem('cartProvider');
      }
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
      // If quota exceeded, we just log it and the cart will be lost on refresh
    }
  }, [cartItems, providerInfo]);

  const addToCart = (item: MenuItem, provider: { id: string; type: 'Restaurant' | 'HomeFood'; name: string }) => {
    // Check if adding from a different provider
    if (providerInfo && providerInfo.id !== provider.id) {
      toast({
        variant: 'destructive',
        title: 'Different Restaurant',
        description: `Your cart contains items from ${providerInfo.name}. Clear it to add from ${provider.name}.`,
      });
      return;
    }

    if (!providerInfo) {
      setProviderInfo(provider);
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });

    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== itemId);
      if (newItems.length === 0) {
        setProviderInfo(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setProviderInfo(null);
  };

  const checkout = async (customAddress?: string) => {
    if (cartItems.length === 0 || !providerInfo) return;

    setIsCheckingOut(true);
    try {
      // 1. Get user profile for ID and Address
      const userProfile = await fetchUserProfile();

      const profileAddress = `${userProfile.houseNumber}, ${userProfile.street}, ${userProfile.area}, ${userProfile.city}, ${userProfile.state}, ${userProfile.country}`;
      const finalAddress = customAddress || profileAddress;

      const orderItems: OrderItemRequest[] = cartItems.map(item => ({
        itemName: item.name,
        itemType: item.type === 'home-food' ? 'HomeFoodItem' : 'MenuItem',
        itemRefId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }));

      const subtotal = cartTotal;
      const tax = subtotal * 0.05; // 5% tax
      const deliveryFee = 25.00;
      const platformFee = 5.00;
      const discount = 0.00;
      const totalAmount = subtotal + tax + deliveryFee + platformFee - discount;

      const orderPayload: OrderRequest = {
        customerId: userProfile.id,
        sourceType: providerInfo.type,
        sourceId: providerInfo.id,
        deliveryAddress: finalAddress,
        subtotalAmount: subtotal,
        taxAmount: tax,
        deliveryFee: deliveryFee,
        platformFee: platformFee,
        discountAmount: discount,
        totalAmount: totalAmount,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Awaiting Payment',
        orderNotes: 'Pending provider approval',
        items: orderItems
      };

      const backendOrder = await createOrder(orderPayload);

      toast({
        title: 'Order Placed!',
        description: `Your order from ${providerInfo.name} is pending approval from the provider.`,
      });

      clearCart();
      router.push(`/track-order?orderId=${backendOrder.id}`);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Failed',
        description: error.message || 'Something went wrong while placing your order.',
      });

      if (error.message === 'Failed to fetch profile' || error.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        providerInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        cartTotal,
        itemCount,
        isCheckingOut,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
