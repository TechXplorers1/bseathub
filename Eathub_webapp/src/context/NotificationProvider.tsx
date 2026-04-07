'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { updateFcmToken, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: string; 
  referenceId?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadHistory = async (uid: string) => {
    try {
        const history = await getNotifications(uid);
        const mapped = history.map((n: any) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            time: new Date(n.createdAt).toLocaleTimeString(),
            read: n.read,
            type: n.type,
            referenceId: n.referenceId
        }));
        setNotifications(mapped);
    } catch (err) {
        console.warn("Failed to load history", err);
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
        setUserId(localStorage.getItem('userId'));
    };
    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
        window.removeEventListener('auth-change', handleAuthChange);
        window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
        setNotifications([]);
        return;
    }

    loadHistory(userId);

    const setupFCM = async () => {
      const token = await requestForToken();
      if (token) {
        try {
          await updateFcmToken(token);
          console.log("FCM Synced successfully.");
        } catch (err) {
          console.warn("FCM Sync error", err);
        }
      }
    };

    setupFCM();

    // REGISTER LIVE LISTENER (NO REFRESH REQUIRED)
    const unsubscribe = onMessageListener((payload: any) => {
        console.log("🔥 NEW LIVE MESSAGE RECEIVED:", payload);
        
        const data = payload.data || {};
        const notification = payload.notification || {};

        if (data.id) {
            // 1. Construct the new notification item locally from the FCM payload
            const newItem: NotificationItem = {
                id: data.id,
                title: notification.title || "New Alert",
                description: notification.body || "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                type: data.type,
                referenceId: data.referenceId
            };

            // 2. Prepend it to the list for instant visibility
            setNotifications(prev => {
                // Prevent duplicate if loadHistory also triggered (though it's unlikely to have finished yet)
                if (prev.some(n => n.id === newItem.id)) return prev;
                return [newItem, ...prev];
            });
        } else {
            // Fallback: Re-sync history if structured data is missing
            // ADD DELAY: Wait for backend transaction to commit
            setTimeout(() => {
                loadHistory(userId);
            }, 1000);
        }

        // 3. Show instant UI Feedback (Toast)
        toast({
            title: notification.title || "New Message",
            description: notification.body || "",
        });
    });

    return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
    };

  }, [userId, toast]);

  useEffect(() => {
      if (!userId) return;

      // AUTOMATIC POLLING: Refresh history every 10 seconds to ensure no state is missed
      const pollInterval = setInterval(() => {
          loadHistory(userId);
      }, 10000);

      return () => clearInterval(pollInterval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
        await markNotificationAsRead(id);
    } catch (err) {
        console.error("Fail mark read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
        await markAllNotificationsAsRead(userId);
    } catch (err) {
        console.error("Fail mark all read", err);
    }
  };

  const removeNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
        await deleteNotification(id);
    } catch (err) {
        console.error("Fail set notification delete", err);
    }
  };

  const clearNotifications = async () => {
    if (!userId) return;
    setNotifications([]);
    try {
        await clearAllNotifications(userId);
    } catch (err) {
        console.error("Fail clear all notifications", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        removeNotification,
        clearNotifications,
        refreshNotifications: () => userId && loadHistory(userId)
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
