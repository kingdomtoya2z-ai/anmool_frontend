'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SmartImage from '@/components/SmartImage';
import {
  IconChevronDown,
  IconCopy,
  IconPhone,
  IconPin,
  IconXCircle,
} from '@/components/icons';

export const ORDER_FLOW = ['pending', 'confirmed', 'shipped', 'out-for-delivery', 'delivered'];

export const STATUS_META = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  shipped: { label: 'Shipped', color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
  delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const fmtRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${meta.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function OrderTimeline({ order, compact = false }) {
  const history =
    order.statusHistory && order.statusHistory.length
      ? order.statusHistory
      : [{ status: order.orderStatus, timestamp: order.createdAt, note: '' }];
  const currentIdx = ORDER_FLOW.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === 'cancelled';

  if (cancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-white border border-red-200 flex items-center justify-center text-red-600"><IconXCircle className="w-5 h-5" /></div>
        <div className="font-bold text-red-700 text-sm mt-2">Order Cancelled</div>
        <div className="text-xs text-red-600 mt-1">Contact support if you need help.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress steps */}
      <div className="flex items-start">
        {ORDER_FLOW.map((s, i) => {
          const done = currentIdx >= 0 && i <= currentIdx;
          const current = i === currentIdx;
          return (
            <div key={s} className="flex-1 flex flex-col items-center relative min-w-0">
              {i < ORDER_FLOW.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-1 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`}
                />
              )}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  done
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-200 text-gray-300'
                } ${current ? 'ring-4 ring-primary/15' : ''}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div
                className={`text-[10px] md:text-[11px] font-semibold mt-2 text-center leading-tight ${
                  done ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {STATUS_META[s].label}
              </div>
            </div>
          );
        })}
      </div>

      {!compact && history.length > 0 && (
        <div className="mt-5 space-y-0">
          {history
            .slice()
            .reverse()
            .map((h, i, arr) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 ${STATUS_META[h.status]?.dot || 'bg-gray-300'}`}
                  />
                  {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-gray-200" />}
                </div>
                <div className="pb-3">
                  <div className="text-[13px] font-semibold text-gray-800">
                    {STATUS_META[h.status]?.label || h.status}
                  </div>
                  <div className="text-[11px] text-gray-400">{fmtDate(h.timestamp)}</div>
                  {h.note && <div className="text-xs text-gray-600 mt-0.5">{h.note}</div>}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export function OrderCard({ order, expanded, onToggle }) {
  const [copied, setCopied] = useState(false);
  const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber || order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex flex-wrap items-center gap-3 text-left hover:bg-gray-50/50 transition"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-center text-primary text-[11px] font-bold shrink-0">
            {(order.orderNumber || 'ORD').slice(-3)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary truncate">
                {order.orderNumber || `#${(order._id || '').slice(-6).toUpperCase()}`}
              </span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {fmtDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
              {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-primary">{fmtRs(order.total)}</div>
          <div className="text-[10px] text-gray-400">
            {order.shippingCharge ? `incl. ₹${order.shippingCharge} shipping` : 'FREE shipping'}
          </div>
        </div>
        <span
          className={`w-8 h-8 rounded-full border border-gray-200 hidden sm:flex items-center justify-center text-gray-500 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <IconChevronDown className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-cream/30 p-4 md:p-5 animate-fadeIn">
          <OrderTimeline order={order} />
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary transition"
            >
              <IconCopy className="w-3.5 h-3.5" /> {copied ? '✓ Copied!' : 'Copy Order ID'}
            </button>
            <Link
              href={`/track-order?order=${order.orderNumber || order._id}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary-dark transition"
            >
              <IconPin className="w-3.5 h-3.5" /> Track live →
            </Link>
          </div>
          <div className="mt-4">
            <div className="text-[13px] font-bold mb-2">Items</div>
            <div className="divide-y divide-gray-100 border rounded-xl bg-white overflow-hidden">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 text-sm">
                  <SmartImage
                    src={it.image}
                    alt={it.name}
                    className="w-10 h-10 rounded-lg object-cover border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.name}</div>
                    <div className="text-xs text-gray-500">
                      Qty {it.quantity} × {fmtRs(it.price)}
                    </div>
                  </div>
                  <div className="font-bold shrink-0">{fmtRs(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-xl border p-3 text-gray-600">
              <div className="font-bold text-gray-800 text-[13px] mb-1">Deliver to</div>
              {order.shippingAddress?.fullName} · {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              <br /><span className="inline-flex items-center gap-1"><IconPhone className="w-3.5 h-3.5" /> {order.shippingAddress?.phone}</span>
            </div>
            <div className="bg-white rounded-xl border p-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <b>{fmtRs(order.subtotal)}</b>
              </div>
              <div className="flex justify-between text-gray-600 mt-1">
                <span>Shipping</span>
                <b>{order.shippingCharge ? fmtRs(order.shippingCharge) : 'FREE'}</b>
              </div>
              <div className="flex justify-between border-t mt-2 pt-2">
                <span>Total</span>
                <b className="text-primary">{fmtRs(order.total)}</b>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function useOrderStats(orders) {
  return useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) =>
      ['pending', 'confirmed', 'shipped', 'out-for-delivery'].includes(o.orderStatus)
    ).length;
    const delivered = orders.filter((o) => o.orderStatus === 'delivered').length;
    const spent = orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((s, o) => s + (o.total || 0), 0);
    return { total, active, delivered, spent };
  }, [orders]);
}
