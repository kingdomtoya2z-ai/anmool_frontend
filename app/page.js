'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import DhenuVeraSection from '@/components/DhenuVeraSection';
import ProductCarousel from '@/components/ProductCarousel';
import CategoryCard from '@/components/CategoryCard';
import Loader, { CardSkeleton } from '@/components/Loader';
import Link from 'next/link';
import { IconFlame, IconTruck, IconLock, IconSupport, IconBox } from '@/components/icons';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catProducts, setCatProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/products?limit=12').then(r => setProducts(r.data.products || r.data)).catch(() => { }),
      api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // One product section per top-level category (dynamic — N categories = N sections)
  useEffect(() => {
    const mains = categories.filter(c => !c.parent);
    if (!mains.length) { setCatProducts({}); return; }
    setCatsLoading(true);
    Promise.all(
      mains.map(c =>
        api.get(`/products?category=${c.slug}&limit=4`)
          .then(r => ({ slug: c.slug, list: r.data.products || r.data || [] }))
          .catch(() => ({ slug: c.slug, list: [] }))
      )
    )
      .then(arr => {
        const m = {};
        arr.forEach(({ slug, list }) => { m[slug] = list; });
        setCatProducts(m);
      })
      .finally(() => setCatsLoading(false));
  }, [categories]);

  // Everything below is derived from REAL data — no hardcoded fallbacks.
  const mainCats = categories.filter(c => !c.parent);
  const subCats = categories.filter(c => c.parent);
  const catsWithProducts = mainCats.filter(c => (catProducts[c.slug] || []).length > 0);

  const trustItems = [
    { Icon: IconFlame, title: 'Pavitra & Sacred Products', desc: 'Made for Pooja & Home' },
    { Icon: IconTruck, title: 'Fast Shipping Across India', desc: 'Quick & Reliable' },
    { Icon: IconLock, title: 'Login-Protected Ordering', desc: 'Safe & Secure' },
    { Icon: IconSupport, title: '24×7 Customer Support', desc: "We're Always Here" },
  ];

  return (
    <div>
      <HeroSlider />

      {/* Sacred blessing strip */}
      <div className="text-center pt-8 pb-1 px-4">
        <div className="font-vedic italic text-sacred-maroon/80 text-base md:text-lg">॥ शुभम् भूयात् — may auspiciousness fill your home ॥</div>
      </div>

      {/* Trust strip - infinite moving loop */}
      <div className="bg-[#FFFDF8]/80 border-y border-sacred-maroon/10 py-3 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {[...trustItems, ...trustItems, ...trustItems].map((t, i) => (
            <div key={i} className="flex items-center gap-3 mx-6 md:mx-10 shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-sacred-sandal border border-sacred-saffron/30 flex items-center justify-center shrink-0 text-sacred-maroon"><t.Icon className="w-5 h-5" /></div>
              <div className="text-left">
                <div className="text-xs md:text-sm font-bold leading-none whitespace-nowrap text-sacred-deepmaroon">{t.title}</div>
                <div className="text-[11px] text-stone-500 whitespace-nowrap">{t.desc}</div>
              </div>
              <span className="hidden md:inline ml-6 text-sacred-saffron/60 text-lg leading-none">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shop by Category — auto-generated from admin-uploaded categories */}
      <section className="bg-gradient-to-b from-smoke-100 via-[#F5EEE1] to-smoke-100 py-10 relative overflow-hidden">
        <div className="smoke-wisp left-[5%] top-[20%] h-56 w-56" />
        <div className="max-w-[1400px] mx-auto px-4 relative">
          <div className="text-center mb-8">
            <div className="sacred-divider max-w-xs mx-auto mb-4"><span className="text-sacred-saffron flex items-center justify-center"><IconFlame className="w-5 h-5 animate-flicker" /></span></div>
            <h2 className="font-sacred text-3xl md:text-4xl tracking-[0.12em] text-sacred-deepmaroon">SHOP BY CATEGORY</h2>
            <p className="font-vedic italic text-sacred-maroon/70 mt-1">apni shraddha ke anusaar chuniye</p>
            {subCats.length > 0 && <p className="text-sm text-stone-500 mt-2">{mainCats.length} categories · {subCats.length} sub-categories · {products.length} products</p>}
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-3xl border animate-pulse h-[420px]" />)}
            </div>
          ) : mainCats.length === 0 ? (
            <div className="spiritual-card rounded-3xl p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-smoke-100 border border-sacred-maroon/10 flex items-center justify-center text-stone-400"><IconBox className="w-7 h-7" /></div>
              <div className="font-bold text-lg font-sacred">No categories yet</div>
              <p className="text-sm text-stone-500 mt-2">The admin will add categories with images and they will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {mainCats.map(cat => <CategoryCard key={cat._id || cat.slug} category={cat} />)}
            </div>
          )}
        </div>
      </section>

      {/* DhenuVera sacred brand — right after categories */}
      <DhenuVeraSection />

      {/* Products by top-level category — one section per category */}
      {loading || catsLoading ? (
        <section className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}</div>
        </section>
      ) : catsWithProducts.length === 0 ? (
        <section className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="spiritual-card rounded-3xl p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-smoke-100 border border-sacred-maroon/10 flex items-center justify-center text-stone-400"><IconBox className="w-7 h-7" /></div>
            <div className="font-bold font-sacred text-lg">No products yet</div>
            <p className="text-sm text-stone-500 mt-1">Products uploaded by the admin will show up here, category by category.</p>
          </div>
        </section>
      ) : (
        catsWithProducts.map(cat => (
          <section key={cat._id || cat.slug} className="max-w-[1400px] mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-sacred text-2xl md:text-3xl flex items-center gap-3 text-sacred-deepmaroon">
                <span className="w-1 h-8 bg-gradient-to-b from-sacred-saffron to-sacred-maroon rounded-full"></span>
                {cat.name}
              </h2>
              <Link href={`/category/${cat.slug}`} className="text-sm font-semibold text-sacred-maroon hover:underline shrink-0">View All →</Link>
            </div>
            <ProductCarousel products={catProducts[cat.slug] || []} />
          </section>
        ))
      )}

      {/* Browse all categories — small dynamic chips */}
      {categories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-4 pb-8">
          <h3 className="font-sacred text-xl mb-4 text-sacred-deepmaroon">Browse Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(c => (
              <Link key={c._id} href={`/category/${c.slug}`} className="bg-[#FFFDF8] border border-sacred-maroon/15 hover:border-sacred-saffron hover:shadow-md transition rounded-full px-5 py-2.5 text-sm font-semibold text-stone-700 hover:text-sacred-maroon">
                {c.name}
                {c.parent && <span className="text-stone-400 font-normal"> · {c.parent?.name}</span>}
                {typeof c.productCount === 'number' && <span className="ml-2 text-[11px] text-stone-400">({c.productCount})</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why Anmool */}
      <section className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="sacred-divider max-w-[220px] mx-auto mb-4"><span className="text-sacred-saffron">ॐ</span></div>
          <div className="text-xs font-bold tracking-[0.24em] text-sacred-saffron">WHY ANMOOL?</div>
          <h2 className="font-sacred text-3xl md:text-4xl mt-2 text-sacred-deepmaroon">Why Devotees Choose Us</h2>
          <p className="font-vedic italic text-stone-500 mt-2">vishwas hi hamari sabse badi poonji hai</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: 'Pavitra Sourcing', d: 'Cow-dung & herbs from trusted village sources, handled with respect.' },
            { t: 'Temple-grade Fragrance', d: 'Guggal, Mogra, Rose & Sandal — slow-burning, long-lasting dhoop.' },
            { t: 'Honest Pricing', d: 'No fake claims, no inflated MRPs. Fair price for sacred craft.' },
            { t: 'Hygienic Packing', d: 'Clean, careful packing so every cup & stick reaches you intact.' },
            { t: 'Login-safe Ordering', d: 'Only registered devotees can order — your parcels stay yours.' },
            { t: 'Seva-minded Support', d: 'Real humans on call — 24×7 help for orders & rituals.' },
          ].map(f => (
            <div key={f.t} className="spiritual-card rounded-3xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sacred-saffron to-sacred-maroon text-white flex items-center justify-center diya-glow"><IconFlame className="w-5 h-5" /></div>
              <div className="font-bold mt-4 font-sacred text-lg text-sacred-deepmaroon">{f.t}</div>
              <div className="text-sm text-stone-500 mt-1 leading-relaxed">{f.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
