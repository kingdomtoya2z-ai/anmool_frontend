import Link from 'next/link';
import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Refund & Return Policy — Anmool Dairy',
  description: 'Refunds, replacements and cancellations at Anmool Dairy.',
};

const BLOCKS = [
  {
    h: 'Order cancellation',
    p: 'You can cancel any order that has not yet shipped — from My Dashboard, or by calling 90342-39674. Prepaid cancelled orders are refunded in full to the original payment method within 5–7 working days.',
  },
  {
    h: 'Damaged, wrong or expired items',
    p: 'If you receive a damaged, incorrect or expired item, tell us within 48 hours of delivery with your Order ID and a photo. We will reship a replacement or refund you — your choice. Return pickup is arranged by us where possible.',
  },
  {
    h: 'Food & pooja items',
    p: 'Because our products are food and worship items, we cannot accept returns for change-of-mind once delivered. Quality issues are always covered as above — just reach out with proof.',
  },
  {
    h: 'Refund timelines',
    p: 'Approved refunds go to the original payment method: UPI/cards within 5–7 working days, Cash on Delivery orders via bank transfer (we will ask for your UPI ID or account details on call).',
  },
];

export default function RefundPolicy() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="LEGAL"
        title="Refund & Return Policy"
        description="Something wrong with your order? We make it right."
        breadcrumb={[{ label: 'Refund Policy' }]}
      />
      <div className="mt-6 space-y-4">
        {BLOCKS.map((b) => (
          <div key={b.h} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
            <div className="font-sacred text-lg text-sacred-deepmaroon">{b.h}</div>
            <p className="text-sm text-stone-600 leading-relaxed mt-2">{b.p}</p>
          </div>
        ))}
        <div className="bg-cream/60 rounded-2xl border border-accent/20 p-5 md:p-6 text-sm text-stone-600">
          Start here: <Link href="/contact" className="font-bold text-sacred-maroon hover:underline">Contact us</Link> or call 90342-39674 with your Order ID.
        </div>
      </div>
    </div>
  );
}
