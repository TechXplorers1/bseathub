'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface SpecialtiesCardProps {
  specialty?: string;
}

export function SpecialtiesCard({ specialty }: SpecialtiesCardProps) {
  // Parse the comma-separated string from user profile
  const specialtiesArr = specialty 
    ? specialty.split(',').map(s => s.trim()).filter(Boolean)
    : ['All-round Chef', 'Private Dining', 'Event Catering'];

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-black">Specialties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 pb-2">
          {specialtiesArr.map((item) => (
            <Badge 
              key={item} 
              variant="secondary" 
              className="text-sm font-bold py-2 px-4 rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all cursor-default"
            >
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
