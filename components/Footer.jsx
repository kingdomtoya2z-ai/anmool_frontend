'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { IconFlame, IconShield, IconTruck, IconPin, IconPhone, IconMail, IconCheck } from '@/components/icons';

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  const topCats = categories.filter((c) => !c.parent).slice(0, 8);

  return (
    <footer className="bg-gradient-to-b from-sacred-deepmaroon to-[#101F06] text-sacred-sandal relative overflow-hidden">
      <div className="smoke-wisp-slow left-[20%] -top-10 h-40 w-72" />
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: 'radial-gradient(600px 80px at 50% -30px, rgba(245,165,36,0.2), transparent 70%)' }}
      />
      {/* Top strip */}
      <div className="border-b border-white/10 relative">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-wrap justify-center md:justify-between gap-3 text-xs md:text-sm font-medium">
          <span className="flex items-center gap-2"><IconFlame className="w-4 h-4 text-sacred-diya" /> Pavitra Products — Made for Pooja and Home</span>
          <span className="hidden md:flex items-center gap-2"><IconShield className="w-4 h-4 text-sacred-diya" /> Login-protected ordering</span>
          <span className="flex items-center gap-2"><IconTruck className="w-4 h-4 text-sacred-diya" /> Fast Shipping Across India</span>
          <span className="hidden lg:flex items-center gap-2 font-vedic italic text-sacred-diya/80">Pavitrata hi parampara</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 relative">
        <div>
          <div className="flex items-center gap-3 mb-4 bg-[#FFFDF8] rounded-2xl px-3 py-2 w-fit shadow">
            <img src="/logo.png" alt="Anmool" className="h-10 w-auto object-contain" width={140} height={45} />
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Bringing Pavitra Products to Your Family — With Purity, Care and Trust. From Karnal, Haryana:
            Pure Desi Ghee, Cow Dung crafts and <b className="text-sacred-diya">DhenuVera</b> sacred incense.
          </p>
          <Link href="/search?q=dhenuvera" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-dhenu-saffron text-white text-xs font-bold hover:opacity-90 shadow">
            <IconFlame className="w-4 h-4" /> Shop DhenuVera
          </Link>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            <div className="flex items-start gap-2"><IconPin className="w-4 h-4 mt-0.5 shrink-0 text-sacred-diya" /> Village Budhanpur, Karnal, Haryana - 132001</div>
            <div className="flex items-center gap-2"><IconPhone className="w-4 h-4 shrink-0 text-sacred-diya" /> 90342-39674 | 70784-20222</div>
            <div className="flex items-center gap-2"><IconMail className="w-4 h-4 shrink-0 text-sacred-diya" /> anmooldairy@gmail.com</div>
          </div>
        </div>

        <div>
          <h4 className="font-sacred text-lg mb-4 text-sacred-diya">Shop Categories</h4>
          {topCats.length > 0 ? (
            <ul className="space-y-2.5 text-sm text-white/75">
              {topCats.map((c) => (
                <li key={c._id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-sacred-diya transition">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-white/50 leading-relaxed">
              Categories added by the admin will appear here automatically.
            </p>
          )}
        </div>

        <div>
          <h4 className="font-sacred text-lg mb-4 text-sacred-diya">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li><Link href="/about" className="hover:text-sacred-diya transition">About Us</Link></li>
            <li><Link href="/our-journey" className="hover:text-sacred-diya transition">Our Journey</Link></li>
            <li><Link href="/contact" className="hover:text-sacred-diya transition">Contact Us</Link></li>
            <li><Link href="/search" className="hover:text-sacred-diya transition">Search Products</Link></li>
            <li><Link href="/cart" className="hover:text-sacred-diya transition">Cart</Link></li>
            <li><Link href="/login" className="hover:text-sacred-diya transition">Login / Register</Link></li>
            <li><Link href="/track-order" className="hover:text-sacred-diya transition">Track Order</Link></li>
            <li><Link href="/account" className="hover:text-sacred-diya transition">My Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sacred text-lg mb-4 text-sacred-diya">Why Anmool?</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex gap-2"><IconFlame className="w-4 h-4 mt-0.5 shrink-0 text-sacred-diya" /> Temple-grade dhoop, honestly crafted</li>
            <li className="flex gap-2"><IconCheck className="w-4 h-4 mt-0.5 shrink-0 text-sacred-diya" /> Trusted sourcing and hygienic packing</li>
            <li className="flex gap-2"><IconShield className="w-4 h-4 mt-0.5 shrink-0 text-sacred-diya" /> Secure ordering for registered customers</li>
            <li className="flex gap-2"><IconPhone className="w-4 h-4 mt-0.5 shrink-0 text-sacred-diya" /> Responsive 24×7 customer support</li>
          </ul>
          <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-sacred-diya/30">
            <div className="text-xs font-bold text-sacred-diya tracking-wide">FREE SHIPPING</div>
            <div className="text-sm mt-1">On orders above ₹300. ₹100 shipping otherwise.</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 relative">
        <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col md:flex-row justify-between gap-4 items-center text-xs text-white/50">
          <div>© {new Date().getFullYear()} Anmool and DhenuVera. All rights reserved. Crafted with care in Karnal, Haryana.</div>
          <div className="flex gap-4">
            <span>Privacy Policy</span><span>Terms</span><span>Shipping Policy</span><span>Refund</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
