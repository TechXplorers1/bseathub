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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100/50">
            <Award className="h-6 w-6 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-black text-lg text-orange-950 leading-tight">{experience || '0 Years'}</p>
              <p className="text-orange-700/60 text-[10px] uppercase font-black tracking-widest mt-1">CULINARY EXPERIENCE</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
            <Soup className="h-6 w-6 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-black text-lg text-indigo-950 leading-tight line-clamp-1">{specialty?.split(',')[0] || 'General'}</p>
              <p className="text-indigo-700/60 text-[10px] uppercase font-black tracking-widest mt-1">SIGNATURE STYLE</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
            <Map className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-black text-lg text-emerald-950 leading-tight">{city || 'Available Locally'}</p>
              <p className="text-emerald-700/60 text-[10px] uppercase font-black tracking-widest mt-1">PRIMARY LOCATION</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
