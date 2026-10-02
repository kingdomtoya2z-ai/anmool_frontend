'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import SmartImage from '@/components/SmartImage';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import {
  IconBox,
  IconCheck,
  IconClock,
  IconPin,
  IconTruck,
  IconXCircle,
} from '@/components/icons';

const STATUS_META = {
  pending:           { label: 'Pending',          icon: IconClock,   desc: 'Order placed, awaiting confirmation' },
  confirmed:         { label: 'Confirmed',        icon: IconCheck,   desc: 'We have confirmed your order' },
  shipped:           { label: 'Shipped',          icon: IconTruck,   desc: 'Your order is on the way' },
  'out-for-delivery': { label: 'Out for Delivery', icon: IconPin,   desc: 'Delivery partner is at your area' },
  delivered:         { label: 'Delivered',        icon: IconBox,     desc: 'Delivered — enjoy!' },
  cancelled:         { label: 'Cancelled',        icon: IconXCircle, desc: 'This order was cancelled' },
};
const FLOW = ['pending', 'confirmed', 'shipped', 'out-for-delivery', 'delivered'];

function TrackInner() {
  const params = useSearchParams();
  const [id, setId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const q = params.get('order');
    if (q) { setId(q); track(q); }
  }, []);

  const track = async (raw) => {
    const value = (raw ?? id).trim();
    if (!value) return;
    setErr(''); setOrder(null); setLoading(true);
    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(value)}`);
      setOrder(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Order not found. Please check the Order ID.');
    } finally { setLoading(false); }
  };

  const onSubmit = (e) => { e.preventDefault(); track(); };

  const currentIdx = order ? FLOW.indexOf(order.orderStatus) : -1;
  const cancelled = order?.orderStatus === 'cancelled';

  return (
    <div className="max-w-[760px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="SUPPORT"
        title="Track Your Order"
        description={<>Enter your Order ID (shown after checkout, e.g. <b>ANM-000123</b>)</>}
        breadcrumb={[{ label: 'Track Order' }]}
      />
      <form onSubmit={onSubmit} className="flex gap-3 mt-4">
        <input value={id} onChange={e => setId(e.target.value)} placeholder="ANM-000123" className="flex-1 border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase" required />
        <button className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shrink-0">
          {loading ? 'Tracking…' : 'Track'}
        </button>
      </form>

      {err && <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{err}</div>}

      {order && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
            <div>
              <div className="text-xs font-bold tracking-widest text-primary">ORDER ID</div>
              <div className="text-2xl font-bold">{order.orderNumber}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('en-IN')} · {order.paymentMethod?.toUpperCase()} · <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{order.paymentStatus}</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Order Total</div>
              <div className="text-3xl font-bold text-primary">₹{order.total}</div>
            </div>
          </div>

          {/* Status timeline */}
          {cancelled ? (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border border-red-200 flex items-center justify-center text-red-600"><IconXCircle className="w-6 h-6" /></div>
              <div className="font-bold text-red-700 mt-2">Order Cancelled</div>
              <p className="text-sm text-red-600 mt-1">This order was cancelled. For support, contact us.</p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex items-center">
                {FLOW.map((s, i) => {
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  const StepIcon = STATUS_META[s].icon;
                  return (
                    <div key={s} className="flex-1 flex flex-col items-center relative">
                      {i < FLOW.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-1 ${done && i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? 'bg-primary border-primary text-white' : current ? 'bg-white border-primary text-primary' : 'bg-white border-gray-200 text-gray-300'}`}>
                        {done ? <IconCheck className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      </div>
                      <div className={`text-[10px] md:text-xs font-semibold mt-2 text-center ${done ? 'text-primary' : 'text-gray-400'}`}>{STATUS_META[s].label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 bg-cream/60 border border-accent/15 rounded-2xl p-5 text-center">
                {(() => {
                  const StatusIcon = STATUS_META[order.orderStatus]?.icon || IconBox;
                  return <div className="w-11 h-11 mx-auto rounded-full bg-white border border-accent/20 flex items-center justify-center text-primary"><StatusIcon className="w-5 h-5" /></div>;
                })()}
                <div className="font-bold mt-2 text-lg">{STATUS_META[order.orderStatus]?.label}</div>
                <div className="text-sm text-gray-600">{STATUS_META[order.orderStatus]?.desc}</div>
              </div>
            </div>
          )}

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div className="mt-8">
              <div className="font-bold text-sm mb-3">Update history</div>
              <div className="space-y-0">
                {order.statusHistory.slice().reverse().map((h, i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full mt-1.5 bg-primary ring-4 ring-primary/10" />
                      {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-gray-200" />}
                    </div>
                    <div className="pb-4">
                      <div className="text-sm font-semibold text-gray-800">{STATUS_META[h.status]?.label || h.status}</div>
                      <div className="text-[11px] text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                      {h.note && <div className="text-xs text-gray-600 mt-0.5">{h.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="font-bold text-sm mb-3">Items ({order.items.length})</div>
            <div className="divide-y divide-gray-100">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 py-3">
                  <SmartImage src={it.image} alt={it.name} className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{it.name}</div>
                    <div className="text-xs text-gray-500">Qty {it.quantity} × ₹{it.price}</div>
                  </div>
                  <div className="font-bold text-sm">₹{it.price * it.quantity}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm mt-3 border-t border-gray-100 pt-4">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingCharge ? `₹${order.shippingCharge}` : 'FREE'}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">₹{order.total}</span></div>
            </div>
          </div>

          {/* Shipping */}
          <div className="mt-6 bg-cream/50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600">
            <div className="font-bold text-gray-800 text-sm mb-1">Deliver to</div>
            {order.shippingAddress.fullName} · {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            Need help? <Link href="/contact" className="text-primary font-semibold hover:underline">Contact us</Link> · <Link href="/orders" className="text-primary font-semibold hover:underline">View my orders</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return <Suspense fallback={<div className="py-16 text-center text-gray-400 text-sm">Loading…</div>}><TrackInner /></Suspense>;
}