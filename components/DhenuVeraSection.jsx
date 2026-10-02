'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { CardSkeleton } from '@/components/Loader';
import { IconFlame } from '@/components/icons';

/**
 * DhenuVera — sacred cow-dung incense brand section.
 * Shown right after "Shop by Category" on the homepage.
 * Brand assets come from /public/images (logo + posters);
 * categories & products are live data from the backend.
 */
export default function DhenuVeraSection() {
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/categories').then(r => r.data || []).catch(() => []),
      api.get('/search?q=dhenuvera').then(r => r.data?.products || []).catch(() => []),
    ])
      .then(([allCats, dhenuProducts]) => {
        const pool = [...(allCats || [])];
        const score = (c) => {
          const n = `${c.name || ''} ${c.slug || ''} ${c.description || ''}`.toLowerCase();
          if (/dhenu/.test(n)) return 0;
          if (/sambrani|cup/.test(n)) return 1;
          if (/cone.*dhoop|dhoop.*cone/.test(n)) return 2;
          if (/stick.*dhoop|dhoop.*stick|agarbatti/.test(n)) return 3;
          return 9;
        };
        const relevant = pool.filter(c => score(c) < 9).sort((a, b) => score(a) - score(b)).slice(0, 4);
        setCats(relevant);
        // Prefer live DhenuVera products; top-up with sambrani/dhoop products if few
        let list = [...(dhenuProducts || [])];
        if (list.length < 4) {
          const extra = pool.length ? [] : [];
          list = [...list, ...extra];
        }
        setProducts(list.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-b from-dhenu-deepmaroon via-[#4A1213] to-dhenu-deepmaroon text-dhenu-sandal relative">
        {/* smoke + glow */}
        <div className="smoke-wisp left-[12%] top-[10%] h-64 w-64" />
        <div className="smoke-wisp-slow right-[8%] top-[30%] h-80 w-80" style={{ animationDelay: '-6s' }} />
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(600px 140px at 50% -40px, rgba(245,165,36,0.25), transparent 70%)' }}
        />
        <div className="om-watermark absolute right-4 top-6 text-[160px] !text-transparent opacity-60 hidden md:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.25)' }}>ॐ</div>

        <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Brand story */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-dhenu-diya/40 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.24em] text-dhenu-diya">
                <IconFlame className="w-3.5 h-3.5 animate-flicker" /> SACRED INCENSE · COW-DUNG CRAFT
              </div>
              <div className="mt-5 flex justify-center lg:justify-start">
                <img
                  src="/images/DhenuVera Logo.png"
                  alt="DhenuVera — Sacred Incense"
                  className="h-20 md:h-24 w-auto object-contain rounded-2xl bg-[#FFFDF8] px-4 py-2 shadow-[0_0_50px_-10px_rgba(245,165,36,0.6)]"
                />
              </div>
              <h2 className="font-sacred text-3xl md:text-5xl mt-5 text-[#FFF6E5] leading-tight">
                DhenuVera
                <span className="block text-lg md:text-2xl text-dhenu-diya/90 font-vedic italic mt-1">pavitra dhoop, shuddh vaayu, divya anubhav</span>
              </h2>
              <p className="text-sm md:text-[15px] text-white/70 leading-relaxed mt-4 max-w-xl mx-auto lg:mx-0">
                Handcrafted Sambrani Cups, Cone Dhoop & Dhoop Sticks made from sacred cow-dung and natural
                herbs — for pooja, meditation and a home that smells like a temple. Slow-burning, long-lasting,
                honestly made in Karnal.
              </p>
              <div className="dhenu-divider my-6 max-w-md mx-auto lg:mx-0">
                <span className="text-dhenu-diya flex items-center justify-center"><IconFlame className="w-5 h-5 animate-flicker" /></span>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                {cats.map(c => (
                  <Link
                    key={c._id}
                    href={`/category/${c.slug}`}
                    className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm font-semibold hover:bg-dhenu-saffron hover:border-dhenu-saffron hover:text-white transition"
                  >
                    {c.name} →
                  </Link>
                ))}
                {cats.length === 0 && !loading && (
                  <Link href="/search?q=dhoop" className="px-5 py-2.5 rounded-full bg-dhenu-saffron text-white text-sm font-bold hover:opacity-90 transition">
                    Explore Dhoop Collection →
                  </Link>
                )}
              </div>
              {/* Ritual line */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-2 mt-6 text-xs text-white/60">
                <span>Sambrani Cups</span>
                <span className="text-dhenu-diya/70">•</span>
                <span>Cone Dhoop</span>
                <span className="text-dhenu-diya/70">•</span>
                <span>Dhoop Sticks</span>
                <span className="text-dhenu-diya/70">•</span>
                <span>Guggal • Mogra • Rose • Sandal</span>
              </div>
            </div>

            {/* Posters */}
            <div className="grid grid-cols-2 gap-4">
              {['/images/Poster1.png', '/images/Poster2.png'].map((src, i) => (
                <div key={src} className={`rounded-3xl overflow-hidden border border-white/15 shadow-2xl ${i === 1 ? 'mt-6' : ''}`}>
                  <img src={src} alt={`DhenuVera sacred collection ${i + 1}`} className="w-full h-44 sm:h-64 md:h-[320px] object-cover hover:scale-105 transition duration-700" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Live products */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-sacred text-xl md:text-2xl text-[#FFF6E5] flex items-center gap-3">
                <span className="w-1 h-7 bg-dhenu-diya rounded-full diya-glow"></span>
                DhenuVera Bestsellers
              </h3>
              <Link href="/search?q=dhenuvera" className="text-xs md:text-sm font-bold text-dhenu-diya hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/25 p-10 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><IconFlame className="w-7 h-7 text-dhenu-diya animate-flicker" /></div>
                <div className="font-bold text-[#FFF6E5]">DhenuVera products are on their way</div>
                <p className="text-xs text-white/60 mt-2 max-w-md mx-auto">
                  The admin will upload Sambrani Cups, Cone Dhoop & Sticks — they will appear here automatically.
                  Meanwhile browse the posters above or search the collection.
                </p>
                <Link href="/search?q=sambrani" className="inline-block mt-4 bg-dhenu-saffron text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90">Search Sambrani →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id || p.slug} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
