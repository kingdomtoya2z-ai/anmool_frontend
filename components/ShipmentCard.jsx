'use client';

import { useState } from 'react';
import { IconCopy, IconTruck } from '@/components/icons';

/** Only allow real web links — never render javascript:/data: URLs. */
export function safeTrackingUrl(url) {
  const value = String(url || '').trim();
  return /^https?:\/\/\S+$/i.test(value) ? value : '';
}

/**
 * Customer-facing shipment box. Shows the consignment (AWB) id chosen by the
 * admin and sends the customer to the courier's own tracking page.
 */
export default function ShipmentCard({ order, className = '' }) {
  const [copied, setCopied] = useState(false);
  const consignmentId = String(order?.consignmentId || '').trim();
  const courierPartner = String(order?.courierPartner || '').trim();
  const trackingUrl = safeTrackingUrl(order?.trackingUrl);

  if (!consignmentId && !courierPartner && !trackingUrl) return null;

  const copyId = async () => {
    if (!consignmentId) return;
    try {
      await navigator.clipboard.writeText(consignmentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className={`rounded-2xl border border-primary/15 bg-white p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
          <IconTruck className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold tracking-widest text-primary">SHIPMENT TRACKING</div>
          <div className="text-sm font-bold text-gray-800">
            {courierPartner || 'Courier partner'}
          </div>
        </div>
      </div>

      {consignmentId && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-cream/60 border border-accent/15 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold tracking-widest text-gray-500">CONSIGNMENT ID</div>
            <div className="font-bold text-sm text-gray-800 break-all">{consignmentId}</div>
          </div>
          <button
            type="button"
            onClick={copyId}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary transition shrink-0"
          >
            <IconCopy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy ID'}
          </button>
        </div>
      )}

      {trackingUrl ? (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition"
        >
          <IconTruck className="w-4 h-4" /> Track your product ↗
        </a>
      ) : (
        consignmentId && (
          <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
            Open your courier partner&apos;s tracking page and enter the consignment ID above.
          </p>
        )
      )}

      {trackingUrl && (
        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
          You&apos;ll be taken to {courierPartner || "the courier partner's"} tracking page. Enter the consignment ID there to see live updates.
        </p>
      )}
    </div>
  );
}
