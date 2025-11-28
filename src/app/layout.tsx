// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/CartProvider';
import { Toaster } from '@/components/ui/toaster';
import { SiteLayout } from '@/components/shared/SiteLayout';
import { HeaderProvider } from '@/context/HeaderProvider';
import { LocationProvider } from '@/context/LocationProvider';
import { DeliveryModeProvider } from '@/context/DeliveryModeProvider';
import { RestaurantProvider } from '@/context/RestaurantProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
// ✅ Import RatingFilterProvider
import { RatingFilterProvider } from '@/context/RatingFilterProvider';
import { FirebaseClientProvider } from '@/firebase';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Eat Hub',
  description: 'Your favorite food, delivered fast.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full scroll-smooth">
      <body
        className={cn(
          'relative h-full font-sans antialiased',
          inter.variable
        )}
      >
        <FirebaseClientProvider>
          <LocationProvider>
            <DeliveryModeProvider>
              <RestaurantProvider>
                <CartProvider>
                  <HeaderProvider>
                    <SidebarProvider>
                      {/* ✅ Wrap SiteLayout with RatingFilterProvider */}
                      <RatingFilterProvider>
                        <SiteLayout>{children}</SiteLayout>
                      </RatingFilterProvider>
                    </SidebarProvider>
                  </HeaderProvider>
                  <Toaster />
                </CartProvider>
              </RestaurantProvider>
            </DeliveryModeProvider>
          </LocationProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}