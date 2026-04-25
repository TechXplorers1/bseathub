'use client';

import {
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flame, BellOff, CheckCheck, Trash2, ShoppingBag, ChefHat, Star, Info } from 'lucide-react';
import { useNotifications } from '@/context/NotificationProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Notifications({ onClose }: { onClose?: () => void }) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, removeNotification } = useNotifications();
  const router = useRouter();

  const getIcon = (type?: string, title?: string) => {
    const t = type?.toUpperCase();
    if (t === 'ORDER') return <ShoppingBag className="h-5 w-5 text-blue-600" />;
    if (t === 'BOOKING') return <ChefHat className="h-5 w-5 text-emerald-600" />;
    if (t === 'REVIEW') return <Star className="h-5 w-5 text-amber-600" />;
    if (title?.toLowerCase().includes('offer')) return <Flame className="h-5 w-5 text-orange-600" />;
    return <Info className="h-5 w-5 text-slate-600" />;
  };

  const getBg = (type?: string) => {
    const t = type?.toUpperCase();
    if (t === 'ORDER') return 'bg-blue-50';
    if (t === 'BOOKING') return 'bg-emerald-50';
    if (t === 'REVIEW') return 'bg-amber-50';
    return 'bg-slate-50';
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    // REDIRECTION LOGIC
    const role = localStorage.getItem('userRole');
    const type = notification.type?.toUpperCase();

    let navigateUrl = '';
    if (type === 'ORDER') {
      if (role === 'USER') {
        navigateUrl = `/track-order?orderId=${notification.referenceId || ''}`;
      } else if (role === 'RESTAURANT') {
        navigateUrl = '/restaurant-dashboard/orders';
      } else if (role === 'HOMEFOOD') {
        navigateUrl = '/home-food-dashboard/orders';
      } else {
        navigateUrl = '/dashboard';
      }
    } else if (type === 'BOOKING') {
      if (role === 'CHEF') {
        navigateUrl = '/chef-dashboard/bookings';
      } else {
        navigateUrl = '/dashboard?tab=bookings';
      }
    } else if (type === 'REVIEW') {
      if (role === 'CHEF') {
        navigateUrl = '/chef-dashboard/reviews';
      } else if (role === 'RESTAURANT') {
        navigateUrl = '/restaurant-dashboard/feedback';
      } else if (role === 'HOMEFOOD') {
        navigateUrl = '/home-food-dashboard/feedback';
      } else {
        navigateUrl = '/dashboard';
      }
    }

    if (navigateUrl) {
      removeNotification(notification.id);
      router.push(navigateUrl);
      if (onClose) onClose();
    } else {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="px-6 flex flex-row items-center justify-between border-b pb-4 pt-4">
        <SheetTitle className="text-2xl font-black uppercase tracking-tighter">Notifications</SheetTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={markAllAsRead} title="Mark all as read">
            <CheckCheck className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={clearNotifications} title="Clear all">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </SheetHeader>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {notifications.length > 0 ? notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start space-x-4 p-6 transition-colors cursor-pointer hover:bg-muted/50 ${!notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
            >
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarFallback className={`${getBg(notification.type)}`}>
                    {getIcon(notification.type, notification.title)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <p className={`text-sm leading-tight ${!notification.read ? 'font-black' : 'font-medium opacity-70'}`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                  )}
                </div>
                <p className={`text-xs ${!notification.read ? 'text-slate-800' : 'text-slate-400'} font-medium`}>
                  {notification.description}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">{notification.time}</p>
                  {notification.type && (
                    <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded-full border ${getBg(notification.type)} opacity-60`}>
                      {notification.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-32 text-center px-10 gap-4 text-slate-400">
              <div className="bg-muted p-6 rounded-full opacity-50">
                <BellOff className="h-12 w-12" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-600">All caught up!</h3>
                <p className="text-sm">New orders, bookings, and reviews will appear here in real-time.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
