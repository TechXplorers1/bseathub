'use client';

import { Flame, Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Eat Hub, Inc. All rights reserved.</p>
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
      </div>
    </footer>
  );
}
