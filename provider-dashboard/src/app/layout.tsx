import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { BookingProvider } from '@/lib/booking';
import PieMenu from '@/components/PieMenu';
import QuickPie from '@/components/QuickPie';

export const metadata: Metadata = {
  icons: { icon: '/logo.png', apple: '/logo.png' },
  title: 'RepairEase — Service Provider Dashboard',
  description: 'Manage your RepairEase service provider account, jobs, and customers in one place.',
  keywords: 'RepairEase, service provider, dashboard, jobs, mechanics, handymen, professionals',
  openGraph: {
    title: 'RepairEase — Service Provider Dashboard',
    description: 'Professional service management platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <BookingProvider>
            {children}
            <PieMenu />
            <QuickPie />
            </BookingProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
