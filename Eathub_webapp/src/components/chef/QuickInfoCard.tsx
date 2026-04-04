'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, DollarSign, Clock } from 'lucide-react';

const quickInfo = [
    { icon: Users, text: 'Serves groups of 2-20' },
    { icon: Calendar, text: 'Available weekends' },
    { icon: DollarSign, text: 'Starting from $75/person' },
    { icon: Clock, text: 'Min. 48-hour notice' },
];

import { formatWorkingHours } from '@/lib/hours-utils';

interface QuickInfoCardProps {
  workingHours?: string | null;
  preference?: string;
}

export function QuickInfoCard({ workingHours, preference }: QuickInfoCardProps) {
  const displayedAvailability = formatWorkingHours(workingHours);

  const quickInfo = [
    { icon: Users, text: 'Serves groups of 2-20' },
    { icon: Calendar, text: displayedAvailability },
    { icon: DollarSign, text: 'Custom Pricing' },
    { icon: Clock, text: 'Min. 48-hour notice' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Info</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
            {quickInfo.map(info => (
                 <li key={info.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <info.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{info.text}</span>
                 </li>
            ))}
            {preference && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Prefered: {preference}</span>
              </li>
            )}
        </ul>
      </CardContent>
    </Card>
  );
}
