'use client';

import { Suspense } from 'react';
import NearbyMapView from '@/components/home/NearbyMapView';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NearbyPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Discover Nearby</h1>
          <p className="text-muted-foreground text-sm">Find the best food and services around your current location.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-border/50 p-6">
        <Suspense fallback={
          <div className="h-[600px] flex flex-col items-center justify-center bg-muted/20 rounded-2xl gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Loading Discovery Map...</p>
          </div>
        }>
          <NearbyMapView />
        </Suspense>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
           <h3 className="font-bold text-blue-900 mb-2">Verified Restaurants</h3>
           <p className="text-sm text-blue-700">Explore top-rated restaurants with lightning fast delivery in your area.</p>
        </div>
        <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
           <h3 className="font-bold text-orange-900 mb-2">Home Cooked Magic</h3>
           <p className="text-sm text-orange-700">Experience authentic home-cooked meals from talented local home food providers.</p>
        </div>
        <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100">
           <h3 className="font-bold text-purple-900 mb-2">Private Chefs</h3>
           <p className="text-sm text-purple-700">Transform your dining experience by booking a professional private chef for your next event.</p>
        </div>
      </div>
    </div>
  );
}
