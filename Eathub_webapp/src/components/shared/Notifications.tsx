'use client';

import {
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flame } from 'lucide-react';

const notifications = [
  {
    id: '1',
    title: '50% Off Your Next Order!',
    description: 'Use code 50TREAT to get 50% off your next order of $15 or more. Don\'t miss out!',
    time: '15m ago',
    read: false,
    icon: <Flame className="h-6 w-6 text-primary" />,
  },
  {
    id: '2',
    title: 'Your order is on its way',
    description: 'Your order from The Golden Spoon is out for delivery and should arrive soon.',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    title: 'New restaurant added',
    description: 'Check out "The Noodle Bar", a new Vietnamese place just added near you.',
    time: '3h ago',
    read: true,
  },
  {
    id: '4',
    title: 'Review your recent order',
    description: 'How was your meal from Burger Bonanza? Leave a review and earn points.',
    time: '1d ago',
    read: true,
  },
];

export function Notifications() {
  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="px-6">
        <SheetTitle>Notifications</SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-1">
        <div className="mt-4 divide-y divide-border">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-4 p-6 ${
                !notification.read ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <Avatar>
                  {notification.icon ? (
                    <AvatarFallback className="bg-transparent">{notification.icon}</AvatarFallback>
                  ) : (
                    <AvatarFallback>
                      {notification.title.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                    <p className="font-medium leading-tight">{notification.title}</p>
                    {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground/70 pt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
