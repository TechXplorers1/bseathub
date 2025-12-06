'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Award, Soup, Map } from 'lucide-react';

interface AboutCardProps {
  chefName: string;
}

export function AboutCard({ chefName }: AboutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Chef {chefName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          With a passion for fresh, local ingredients, Chef {chefName} brings a taste of authentic tradition to your table. Every dish is a story, every meal an experience.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">15+ Years</p>
              <p className="text-muted-foreground">of culinary experience</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Soup className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Signature Pasta</p>
              <p className="text-muted-foreground">Famous for handmade pasta dishes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Map className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Serves Tri-City Area</p>
              <p className="text-muted-foreground">Available for in-home events</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
