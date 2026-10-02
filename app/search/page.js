'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, Suspense } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { IconSearch } from '@/components/icons';

const SORTS = [
  { id: '', label: 'Sort: Featured' },
  { id: 'new', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'name', label: 'Name: A to Z' },
];

const PRICE_BUCKETS = [
  { id: 'u100', label: 'Under ₹100', test: (p) => p < 100 },
  { id: '100-300', label: '₹100 – ₹300', test: (p) => p >= 100 && p <= 300 },
  { id: '300-500', label: '₹300 – ₹500', test: (p) => p > 300 && p <= 500 },
  { id: 'a500', label: 'Above ₹500', test: (p) => p > 500 },
];

function SearchInner() {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [sort, setSort] = useState('');
  const [selCats, setSelCats] = useState([]);
  const [priceId, setPriceId] = useState('');
  const [minP, setMinP] = useState('');
  const [maxP, setMaxP] = useState('');
  const [inStock, setInStock] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setSelCats([]); setPriceId(''); setMinP(''); setMaxP(''); setInStock(false); setSort('');
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const url = q.trim()
      ? `/search?q=${encodeURIComponent(q)}`
      : `/products?limit=100`;
    api
      .get(url)
      .then((r) => {
        setProducts(r.data.products || r.data || []);
        setCategories(r.data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  // Category facet with live counts
  const facets = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      const n = p.category?.name || 'Other';
      m[n] = (m[n] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selCats.length) {
      list = list.filter((p) => selCats.includes(p.category?.name || 'Other'));
    }
    const bucket = PRICE_BUCKETS.find((b) => b.id === priceId);
    if (bucket) list = list.filter((p) => bucket.test(Number(p.price) || 0));
    if (minP !== '' && !isNaN(Number(minP))) list = list.filter((p) => Number(p.price) >= Number(minP));
    if (maxP !== '' && !isNaN(Number(maxP))) list = list.filter((p) => Number(p.price) <= Number(maxP));
    if (inStock) list = list.filter((p) => (p.stock ?? 0) > 0);
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'new') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'name') list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return list;
  }, [products, selCats, priceId, minP, maxP, inStock, sort]);

  const toggleCat = (n) => setSelCats((prev) => (prev.includes(n) ? prev.filter((c) => c !== n) : [...prev, n]));
  const clearAll = () => { setSelCats([]); setPriceId(''); setMinP(''); setMaxP(''); setInStock(false); setSort(''); };
  const activeCount = selCats.length + (priceId || minP !== '' || maxP !== '' ? 1 : 0) + (inStock ? 1 : 0);

  const filterBody = (
    <div className="space-y-6">
      {/* Category */}
      {facets.length > 0 && (
        <div>
          <div className="text-xs font-bold tracking-[0.18em] text-sacred-deepmaroon mb-3">CATEGORY</div>
          <div className="space-y-1.5 max-h-56 overflow-auto pr-1">
            {facets.map(([n, c]) => (
              <label key={n} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selCats.includes(n)}
                  onChange={() => toggleCat(n)}
                  className="w-4 h-4 rounded accent-[#3E6B12]"
                />
                <span className="flex-1 text-stone-700 group-hover:text-sacred-deepmaroon truncate">{n}</span>
                <span className="text-[11px] text-stone-400 bg-smoke-100 rounded-full px-2 py-0.5">{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {/* Price */}
      <div>
        <div className="text-xs font-bold tracking-[0.18em] text-sacred-deepmaroon mb-3">PRICE</div>
        <div className="space-y-1.5">
          {PRICE_BUCKETS.map((b) => (
            <label key={b.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="price-bucket"
                checked={priceId === b.id}
                onChange={() => setPriceId(priceId === b.id ? '' : b.id)}
                onClick={() => { if (priceId === b.id) setPriceId(''); }}
                className="w-4 h-4 accent-[#3E6B12]"
              />
              <span className="text-stone-700">{b.label}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input value={minP} onChange={(e) => setMinP(e.target.value.replace(/\D/g, ''))} placeholder="Min ₹" inputMode="numeric"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <span className="text-stone-400">–</span>
          <input value={maxP} onChange={(e) => setMaxP(e.target.value.replace(/\D/g, ''))} placeholder="Max ₹" inputMode="numeric"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      {/* Availability */}
      <div>
        <div className="text-xs font-bold tracking-[0.18em] text-sacred-deepmaroon mb-3">AVAILABILITY</div>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 rounded accent-[#3E6B12]" />
          <span className="text-stone-700">In stock only</span>
        </label>
      </div>
      <button onClick={clearAll} className="w-full text-xs font-bold border border-stone-200 rounded-full py-2.5 hover:border-primary hover:text-primary transition">
        Clear all filters{activeCount ? ` (${activeCount})` : ''}
      </button>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <PageHero
        eyebrow="SEARCH"
        title={q ? `Results for "${q}"` : 'All Products'}
        description="Matching product names, descriptions, tags, prices and every level of categories"
        breadcrumb={[{ label: q ? `Search: ${q}` : 'All Products' }]}
        meta={
          <span className="inline-block text-xs bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
            {loading ? 'Searching…' : `${filtered.length} of ${products.length} product${products.length === 1 ? '' : 's'}`}
          </span>
        }
      />

      {loading ? (
        <Loader text="Searching products..." />
      ) : (
        <>
          {/* Matching categories */}
          {categories.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-bold mb-2">Matching categories</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/category/${c.slug}`}
                    className="bg-white border border-gray-200 hover:border-primary hover:text-primary hover:shadow-md transition rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {c.name} ›
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-3 mt-6">
            <button onClick={() => setDrawer(true)} className="lg:hidden flex items-center gap-2 border border-stone-200 bg-white rounded-full px-5 py-2.5 text-sm font-bold hover:border-primary">
              Filters{activeCount ? ` (${activeCount})` : ''}
            </button>
            <div className="text-sm text-stone-500">
              Showing <b className="text-stone-800">{filtered.length}</b> product{filtered.length === 1 ? '' : 's'}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto border border-stone-200 rounded-full px-4 py-2.5 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Sort products"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selCats.map((c) => (
                <button key={c} onClick={() => toggleCat(c)} className="text-xs font-bold bg-sacred-deepmaroon text-white rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
                  {c} <span aria-hidden>×</span>
                </button>
              ))}
              {(priceId || minP !== '' || maxP !== '') && (
                <button onClick={() => { setPriceId(''); setMinP(''); setMaxP(''); }} className="text-xs font-bold bg-sacred-deepmaroon text-white rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
                  Price <span aria-hidden>×</span>
                </button>
              )}
              {inStock && (
                <button onClick={() => setInStock(false)} className="text-xs font-bold bg-sacred-deepmaroon text-white rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
                  In stock <span aria-hidden>×</span>
                </button>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-6 mt-5 items-start">
            {/* Sidebar */}
            <aside className="hidden lg:block sticky top-28 spiritual-card rounded-2xl p-5">
              <div className="font-sacred text-lg text-sacred-deepmaroon mb-4">Filters</div>
              {filterBody}
            </aside>

            {/* Results */}
            <div className="min-w-0">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed">
                  <div className="w-14 h-14 mx-auto rounded-full bg-smoke-100 border border-sacred-saffron/30 flex items-center justify-center text-sacred-deepmaroon mb-3"><IconSearch className="w-6 h-6" /></div>
                  <div className="font-bold text-lg">No products match</div>
                  <div className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                    {products.length
                      ? 'Try removing a filter or two — the catalogue is wider than it looks.'
                      : q ? 'Try a different search term or browse categories.' : 'Products uploaded by the admin will show up here.'}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-5">
                    {activeCount > 0 && (
                      <button onClick={clearAll} className="bg-sacred-deepmaroon text-white px-6 py-2.5 rounded-full text-sm font-bold">
                        Clear filters
                      </button>
                    )}
                    <Link href="/" className="border border-stone-200 px-6 py-2.5 rounded-full text-sm font-bold hover:border-primary">
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-[#FFFDF8] shadow-2xl flex flex-col animate-slideDown overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <div className="font-sacred text-xl text-sacred-deepmaroon">Filters{activeCount ? ` (${activeCount})` : ''}</div>
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterBody}</div>
            <div className="p-4 border-t border-stone-200 bg-white">
              <button onClick={() => setDrawer(false)} className="w-full bg-sacred-deepmaroon text-white rounded-full py-3.5 text-sm font-bold">
                Show {filtered.length} product{filtered.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader text="Loading search..." />}>
      <SearchInner />
    </Suspense>
  );
}
