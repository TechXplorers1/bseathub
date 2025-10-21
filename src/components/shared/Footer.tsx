'use client';

import { Flame, Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Flame className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-foreground">
              Eat Hub
            </span>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-primary">
              <Facebook className="h-6 w-6" />
            </Link>
            <Link href="#" className="hover:text-primary">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="hover:text-primary">
              <Instagram className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Eat Hub, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
