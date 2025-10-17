import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/CartProvider';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SiteLayout } from '@/components/shared/SiteLayout';
import { HeaderProvider } from '@/context/HeaderProvider';
import { LocationProvider } from '@/context/LocationProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SwiftDash',
  description: 'Your favorite food, delivered fast.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          'relative h-full font-sans antialiased',
          inter.variable
        )}
      >
        <LocationProvider>
          <CartProvider>
            <SidebarProvider>
              <HeaderProvider>
                <SiteLayout>{children}</SiteLayout>
              </HeaderProvider>
              <Toaster />
            </SidebarProvider>
          </CartProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
