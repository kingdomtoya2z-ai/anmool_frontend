'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PageHero from '@/components/PageHero';
import { IconMail, IconPhone, IconPin, IconArrowRight, IconCheckCircle, IconBox } from '@/components/icons';

const CHANNELS = [
  {
    icon: IconPin,
    label: 'VISIT US',
    title: 'Village Budhanpur, Karnal',
    desc: 'Haryana – 132001, India',
    href: null,
  },
  {
    icon: IconPhone,
    label: 'CALL US',
    title: '90342-39674',
    desc: 'Also on 70784-20222',
    href: 'tel:9034239674',
  },
  {
    icon: IconMail,
    label: 'EMAIL US',
    title: 'anmooldairy@gmail.com',
    desc: 'Replies within a few hours',
    href: 'mailto:anmooldairy@gmail.com',
  },
  {
    icon: IconBox,
    label: 'ORDER HELP',
    title: 'Track your parcel',
    desc: 'Live status with your Order ID',
    href: '/track-order',
  },
];

const FAQS = [
  { q: 'How do I track my order?', a: 'Every order gets an Order ID (e.g. ANM-000123) at checkout. Enter it on the Track Order page — no login needed. You can also watch live status from Account → My Orders.' },
  { q: 'Do I need an account to order?', a: 'Yes. Only logged-in customers can place orders — it keeps your parcels secure. Register with your name, email and 10-digit mobile number in under a minute.' },
  { q: 'What are the shipping charges?', a: 'Shipping is FREE on orders above ₹300, and a flat ₹100 below that. Delivery timelines depend on your pincode and are confirmed on your order.' },
  { q: 'Do you take bulk or festive orders?', a: 'Yes — for weddings, festivals, temples or resale, choose “Bulk / festive order” in the form or WhatsApp us directly with quantities.' },
];

const TOPICS = ['Order support', 'Product enquiry', 'Bulk / festive order', 'Feedback', 'Other'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', topic: TOPICS[0], message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { toast.error('Enter a valid 10-digit phone'); return; }
    if (!form.message.trim()) { toast.error('Please write your message'); return; }
    setSending(true);
    const text = `Namaste Anmool,%0AName: ${encodeURIComponent(form.name)}%0APhone: ${form.phone}%0ATopic: ${encodeURIComponent(form.topic)}%0AMessage: ${encodeURIComponent(form.message)}`;
    window.open(`https://wa.me/919034239674?text=${text}`, '_blank');
    toast.success('Opening WhatsApp with your message');
    setSending(false);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = 'w-full mt-1 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-saffron/40 focus:border-sacred-saffron bg-white';

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <PageHero
        eyebrow="CONTACT"
        title="We'd Love to Hear From You"
        description="Questions about products, orders or bulk enquiries — reach us on any channel below. We typically reply within a few hours."
        breadcrumb={[{ label: 'Contact' }]}
        actions={
          <>
            <a href="https://wa.me/919034239674" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-sacred-diya text-sacred-deepmaroon text-sm font-bold rounded-full px-6 py-3 hover:brightness-105 transition shadow">
              WhatsApp Us
            </a>
            <a href="tel:9034239674" className="inline-flex items-center gap-2 border border-white/30 text-white text-sm font-bold rounded-full px-6 py-3 hover:bg-white/10 transition">
              <IconPhone className="w-4 h-4" /> Call Now
            </a>
          </>
        }
      />

      {/* Channels */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {CHANNELS.map((c) => {
          const inner = (
            <>
              <span className="w-11 h-11 rounded-2xl bg-sacred-sandal border border-sacred-saffron/30 text-sacred-maroon flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.2em] text-sacred-saffron">{c.label}</div>
                <div className="text-sm font-bold text-sacred-deepmaroon mt-0.5 break-words">{c.title}</div>
                <div className="text-xs text-stone-500">{c.desc}</div>
              </div>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="spiritual-card rounded-2xl p-4 flex gap-3 hover:shadow-md hover:border-sacred-saffron/40 transition">
              {inner}
            </Link>
          ) : (
            <div key={c.label} className="spiritual-card rounded-2xl p-4 flex gap-3">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mt-6 items-start">
        {/* Form — sends via WhatsApp */}
        <form onSubmit={submit} className="lg:col-span-3 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm">
          <div className="font-sacred text-xl text-sacred-deepmaroon">Send Us a Message</div>
          <p className="text-xs text-stone-500 mt-1">Fill this in — it opens WhatsApp with your message ready to send. No account needed.</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <label className="block">
              <span className="text-xs font-semibold text-stone-600 mb-1 block">Name *</span>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-stone-600 mb-1 block">Phone *</span>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} maxLength={10} placeholder="10-digit mobile" className={inputCls} />
            </label>
          </div>
          <label className="block mt-4">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Topic</span>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('topic', t)}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition ${form.topic === t ? 'bg-sacred-maroon text-white border-sacred-maroon' : 'border-stone-200 text-stone-600 hover:border-sacred-saffron'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </label>
          <label className="block mt-4">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Message *</span>
            <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={4} placeholder="How can we help you? Include your Order ID for order queries." className={inputCls} />
          </label>
          <button disabled={sending} className="w-full mt-5 bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white rounded-full py-3.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 shadow">
            {sending ? 'Opening…' : 'Send via WhatsApp'}
          </button>
          <p className="text-[11px] text-stone-400 text-center mt-3 flex items-center justify-center gap-1.5">
            <IconCheckCircle className="w-3.5 h-3.5" /> Your message goes straight to our team phone — nothing stored here.
          </p>
        </form>

        {/* FAQ + help */}
        <div className="lg:col-span-2 space-y-4">
          <div className="spiritual-card rounded-3xl p-6">
            <div className="font-sacred text-xl text-sacred-deepmaroon">Quick Answers</div>
            <div className="mt-4 space-y-2.5">
              {FAQS.map((f) => (
                <details key={f.q} className="group border border-sacred-maroon/10 rounded-2xl bg-white/70 px-4 py-3 open:shadow-sm">
                  <summary className="text-sm font-bold text-sacred-deepmaroon cursor-pointer list-none flex items-center justify-between gap-2">
                    {f.q}
                    <span className="text-sacred-saffron group-open:rotate-45 transition text-lg leading-none">+</span>
                  </summary>
                  <p className="text-[13px] text-stone-600 mt-2 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sacred-deepmaroon to-[#142808] text-white p-6 relative overflow-hidden">
            <div className="om-watermark absolute -right-3 -top-6 text-[110px] hidden sm:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.25)', color: 'transparent' }}>ॐ</div>
            <div className="relative">
              <div className="font-sacred text-lg text-[#FFF6E5]">Bulk or festive order?</div>
              <p className="text-xs text-white/65 mt-1 leading-relaxed">Weddings, temples, festivals or resale — tell us quantities on WhatsApp for the best rate.</p>
              <Link href="/search?q=dhenuvera" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold bg-sacred-diya text-sacred-deepmaroon rounded-full px-5 py-2.5 hover:brightness-105 transition">
                Browse DhenuVera <IconArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
