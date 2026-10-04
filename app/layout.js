import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpiritualBackground from '@/components/SpiritualBackground';
import { AuthProvider } from '@/lib/authContext';
import { CartProvider } from '@/lib/cartContext';
import { Toaster } from 'react-hot-toast';
import BackButtonHandler from '@/components/BackButtonHandler';
import BhajanPlayer from '@/components/BhajanPlayer';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.anmooldairy.com'),
  title: 'Anmool Dairy & DhenuVera — Pavitra Products. Honest Promise. ॐ',
  description: 'Anmool Dairy brings genuine products to your family with purity, care & trust. Pure Desi Ghee, Milk, Cow Dung products & DhenuVera sacred incense — Sambrani Cups, Cone Dhoop & Dhoop Sticks from Karnal, Haryana.',
  keywords: 'Anmool Dairy, DhenuVera, Sambrani Cup, Cone Dhoop, Dhoop Stick, Desi Ghee, Karnal, sacred incense, pooja',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '1050x1050' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <BackButtonHandler />
            <BhajanPlayer />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style:{ fontSize:'14px' } }} />
            <SpiritualBackground />
            <div className="relative z-10">
              <Header />
              <main className="min-h-[60vh]">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
