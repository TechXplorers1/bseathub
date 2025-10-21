'use client';

import { Flame, Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    'Get to Know Us': [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
    ],
    'Let Us Help You': [
      { name: 'Your Account', href: '#' },
      { name: 'Your Orders', href: '#' },
      { name: 'Help', href: '#' },
    ],
    'Doing Business': [
      { name: 'Sell on Eat Hub', href: '#' },
      { name: 'Be a Delivery Partner', href: '#' },
      { name: 'Advertise Your Products', href: '#' },
    ],
  };

  return (
    <footer className="bg-muted text-muted-foreground border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-primary hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
