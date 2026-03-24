'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Award, Soup, Map } from 'lucide-react';

interface AboutCardProps {
  chefName: string;
  bio?: string;
  experience?: string;
  specialty?: string;
  city?: string;
}

export function AboutCard({ chefName, bio, experience, specialty, city }: AboutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Chef {chefName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {bio || `With a passion for fresh, local ingredients, Chef ${chefName} brings a taste of authentic tradition to your table. Every dish is a story, every meal an experience.`}
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Award className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-base">{experience || '10+'}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Culinary Experience</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Soup className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-base line-clamp-1">{specialty || 'Global Cuisine'}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Signature Style</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Map className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-base">{city || 'Available Locally'}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Primary Location</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
