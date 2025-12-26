'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface SpecialtiesCardProps {
  categories: string[];
}

export function SpecialtiesCard({ categories }: SpecialtiesCardProps) {
  const specialties = [
    'Pasta', 'Wood-fired Pizza', 'Tiramisu', 'Seafood Risotto', 'Gnocchi', ...categories
  ].filter((value, index, self) => self.indexOf(value) === index).slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specialties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <Badge key={specialty} variant="outline" className="text-base py-1 px-3">
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
