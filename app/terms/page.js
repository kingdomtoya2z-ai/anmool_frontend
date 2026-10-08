import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Terms & Conditions — Anmool Dairy',
  description: 'Terms of use for ordering from Anmool Dairy.',
};

const BLOCKS = [
  {
    h: 'Ordering & accounts',
    p: 'Only registered (logged-in) customers can place orders. You are responsible for keeping your login safe and for the accuracy of the name, phone number and delivery address on every order.',
  },
  {
    h: 'Prices & availability',
    p: 'Prices and offers on the site apply at checkout. If an item sells out or a price was listed incorrectly, we will inform you and refund or adjust the order — you are never charged more than the confirmed order total.',
  },
  {
    h: 'Delivery',
    p: 'We ship across India. Delivery timelines shown at checkout are estimates; delays from couriers, weather or festivals will be communicated on your registered phone number.',
  },
  {
    h: 'Correct use',
    p: 'Please use the site lawfully — no misuse of accounts, reviews, offers or support channels. We may suspend accounts involved in fraud, abuse or repeated false orders.',
  },
  {
    h: 'Changes',
    p: 'We may update these terms as the store grows; the version on this page always applies. Continued use of the site means you accept the current terms.',
  },
];

export default function Terms() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="LEGAL"
        title="Terms & Conditions"
        description="Fair rules that protect both you and us."
        breadcrumb={[{ label: 'Terms & Conditions' }]}
      />
      <div className="mt-6 space-y-4">
        {BLOCKS.map((b) => (
          <div key={b.h} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
            <div className="font-sacred text-lg text-sacred-deepmaroon">{b.h}</div>
            <p className="text-sm text-stone-600 leading-relaxed mt-2">{b.p}</p>
          </div>
        ))}
        <div className="bg-cream/60 rounded-2xl border border-accent/20 p-5 md:p-6 text-sm text-stone-600">
          Also see our <Link href="/shipping-policy" className="font-bold text-sacred-maroon hover:underline">Shipping Policy</Link> and <Link href="/refund-policy" className="font-bold text-sacred-maroon hover:underline">Refund Policy</Link>.
        </div>
      </div>
    </div>
  );
}
