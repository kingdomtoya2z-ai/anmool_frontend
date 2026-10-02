'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Loader, { CardSkeleton } from '@/components/Loader';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import SmartImage from '@/components/SmartImage';
import { IconBox } from '@/components/icons';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [allCats, setAllCats] = useState([]);
  const [sort, setSort] = useState('');

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.get(`/categories/${slug}`).then(r=> setCategory(r.data)).catch(()=>{}),
      api.get(`/products?category=${slug}&limit=50&sort=${sort}`).then(r=> setProducts(r.data.products || r.data)).catch(()=>{}),
      api.get('/categories').then(r=> setAllCats(r.data || [])).catch(()=>{})
    ]).finally(()=> setLoading(false));
  }, [slug, sort]);

  const name = category?.name || slug;
  const children = category
    ? allCats.filter((c) => String(c.parent?._id || c.parent || '') === String(category._id))
    : [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <PageHero
        eyebrow="CATEGORY"
        title={name}
        description={category?.description || 'Explore authentic products carefully sourced with purity and trust.'}
        breadcrumb={[{ label: name }]}
        meta={
          <span className="inline-block text-xs bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
            {products.length} Product{products.length === 1 ? '' : 's'} • Free shipping above ₹300
          </span>
        }
        actions={
          <select value={sort} onChange={e=>setSort(e.target.value)} className="bg-white text-gray-800 rounded-full px-4 py-2.5 text-sm font-medium">
            <option value="">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        }
        image={category?.image || null}
        imageAlt={name}
      />

      {/* Sub-categories */}
      {!loading && children.length > 0 && (
        <div className="mt-6">
          <h2 className="font-sacred text-xl text-sacred-deepmaroon mb-3">Explore Sub-categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {children.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="group spiritual-card rounded-2xl overflow-hidden hover:shadow-lg transition">
                <div className="overflow-hidden">
                  <SmartImage src={c.image} alt={c.name} className="w-full h-28 md:h-36 object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-3 text-center">
                  <div className="font-bold text-sm text-sacred-deepmaroon group-hover:text-sacred-maroon transition">{c.name}</div>
                  {typeof c.productCount === 'number' && (
                    <div className="text-[11px] text-stone-400 mt-0.5">{c.productCount} product{c.productCount === 1 ? '' : 's'}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[1,2,3,4,5,6,7,8].map(i=> <CardSkeleton key={i} />)}
        </div>
      ) : products.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mt-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-primary mb-4"><IconBox className="w-6 h-6" /></div>
          <div className="font-bold">No products found in this category</div>
          <div className="text-sm text-gray-500 mt-1">Try browsing other categories</div>
          <Link href="/" className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold">Back to Home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {products.map(p=> <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
