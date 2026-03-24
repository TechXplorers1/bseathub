'use client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, DollarSign, Clock } from 'lucide-react';

const quickInfo = [
    { icon: Users, text: 'Serves groups of 2-20' },
    { icon: Calendar, text: 'Available weekends' },
    { icon: DollarSign, text: 'Starting from $75/person' },
    { icon: Clock, text: 'Min. 48-hour notice' },
];

interface QuickInfoCardProps {
  workingHours?: string;
  preference?: string;
}

export function QuickInfoCard({ workingHours, preference }: QuickInfoCardProps) {
  // Parse working hours if it is a JSON string
  let displayedAvailability = 'Available Weekends';
  if (workingHours) {
    try {
      if (workingHours.startsWith('[') || workingHours.startsWith('{')) {
        const parsed = JSON.parse(workingHours);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const openDays: string[] = [];
        const closedDays: string[] = [];

        if (Array.isArray(parsed)) {
            // Handle array structure
            parsed.forEach(d => {
                if (d.isOpen || d.active) openDays.push(d.day);
                else closedDays.push(d.day);
            });
        } else if (typeof parsed === 'object') {
            // Handle object structure: {"Monday": {"active": true, ...}}
            days.forEach(day => {
                const info = parsed[day];
                if (info && (info.active === true || info.isOpen === true)) {
                    openDays.push(day);
                } else {
                    closedDays.push(day);
                }
            });
        }

        if (openDays.length === 7) {
            displayedAvailability = 'Available Daily';
        } else if (openDays.length === 6 && closedDays.length === 1) {
            displayedAvailability = `Daily except ${closedDays[0]}`;
        } else if (openDays.length === 5 && openDays.includes('Monday') && openDays.includes('Friday') && !openDays.includes('Saturday') && !openDays.includes('Sunday')) {
            displayedAvailability = 'Monday to Friday';
        } else if (openDays.length === 6 && !closedDays.includes('Sunday')) {
            // This is "Monday to Saturday" if Sunday is the only one closed but wait, logic above handles 6 open 1 closed.
            displayedAvailability = `Monday to Saturday`; // Defaulting to this for 6 days if sensible
        } else if (openDays.length > 0) {
            displayedAvailability = `Available ${openDays.map(d => d.substring(0, 3)).join(', ')}`;
        }
      } else {
          displayedAvailability = workingHours;
      }
    } catch (e) {
      displayedAvailability = workingHours;
    }
  }

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
