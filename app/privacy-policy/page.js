import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Privacy Policy — Anmool Dairy',
  description: 'How Anmool Dairy collects, uses and protects your personal information.',
};

const BLOCKS = [
  {
    h: 'Information we collect',
    p: 'When you register, order or contact us, we collect your name, phone number, email address, delivery address and order details. Payment details are processed by our payment partners — we never see or store your card, UPI PIN or bank credentials.',
  },
  {
    h: 'How we use it',
    p: 'Your details are used only to create your account, process and deliver orders, share order updates on call/SMS/WhatsApp/email, and improve our products and service. We do not sell, rent or share your data with third parties for marketing.',
  },
  {
    h: 'Cookies & login sessions',
    p: 'We use essential cookies and secure login tokens to keep you signed in and your cart saved. No advertising trackers are used.',
  },
  {
    h: 'Data protection',
    p: 'Account passwords are stored encrypted, and access to customer data is limited to the people who fulfil your orders. While no online system is 100% secure, we take reasonable steps to protect your information.',
  },
  {
    h: 'Your choices',
    p: 'You can update your name, phone and address anytime from My Dashboard, and ask us to correct or delete your account data by contacting us below.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="LEGAL"
        title="Privacy Policy"
        description="Simple and honest — what we collect, why, and how it stays safe."
        breadcrumb={[{ label: 'Privacy Policy' }]}
      />
      <div className="mt-6 space-y-4">
        {BLOCKS.map((b) => (
          <div key={b.h} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
            <div className="font-sacred text-lg text-sacred-deepmaroon">{b.h}</div>
            <p className="text-sm text-stone-600 leading-relaxed mt-2">{b.p}</p>
          </div>
        ))}
        <div className="bg-cream/60 rounded-2xl border border-accent/20 p-5 md:p-6 text-sm text-stone-600">
          Questions about your data? <Link href="/contact" className="font-bold text-sacred-maroon hover:underline">Contact us</Link> — anmooldairy@gmail.com · 90342-39674.
        </div>
      </div>
    </div>
  );
}
