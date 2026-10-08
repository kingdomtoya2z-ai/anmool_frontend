import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Shipping Policy — Anmool Dairy',
  description: 'Delivery areas, timelines and shipping charges at Anmool Dairy.',
};

const BLOCKS = [
  {
    h: 'Where we deliver',
    p: 'We deliver across India through trusted courier partners. A few remote pin codes may be unserviceable — if yours is, we will tell you before dispatch and refund the order in full.',
  },
  {
    h: 'Timelines',
    p: 'Orders are packed within 1–2 working days and usually delivered in 3–7 working days depending on your city. You can follow every stage from My Dashboard or the Track Order page using your Order ID (e.g. ANM-000123).',
  },
  {
    h: 'Shipping charges',
    p: 'Shipping is FREE on orders above ₹300. A flat ₹100 shipping applies below that. Charges, if any, are always shown clearly before you pay.',
  },
  {
    h: 'Packing',
    p: 'Food and pooja items are packed hygienically to survive transit. If your parcel arrives visibly damaged, refuse it or photograph it immediately and contact us within 48 hours.',
  },
];

export default function ShippingPolicy() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="LEGAL"
        title="Shipping Policy"
        description="How your order travels from Karnal to your doorstep."
        breadcrumb={[{ label: 'Shipping Policy' }]}
      />
      <div className="mt-6 space-y-4">
        {BLOCKS.map((b) => (
          <div key={b.h} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
            <div className="font-sacred text-lg text-sacred-deepmaroon">{b.h}</div>
            <p className="text-sm text-stone-600 leading-relaxed mt-2">{b.p}</p>
          </div>
        ))}
        <div className="bg-cream/60 rounded-2xl border border-accent/20 p-5 md:p-6 text-sm text-stone-600">
          Track any order <Link href="/track-order" className="font-bold text-sacred-maroon hover:underline">here</Link> — keep your Order ID handy.
        </div>
      </div>
    </div>
  );
}
