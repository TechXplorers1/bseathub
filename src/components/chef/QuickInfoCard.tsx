'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, DollarSign, Clock } from 'lucide-react';

const quickInfo = [
    { icon: Users, text: 'Serves groups of 2-20' },
    { icon: Calendar, text: 'Available weekends' },
    { icon: DollarSign, text: 'Starting from $75/person' },
    { icon: Clock, text: 'Min. 48-hour notice' },
];

export function QuickInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Info</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
            {quickInfo.map(info => (
                 <li key={info.text} className="flex items-center gap-3 text-muted-foreground">
                    <info.icon className="h-5 w-5" />
                    <span>{info.text}</span>
                 </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
