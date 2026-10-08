'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import ProductCard from '@/components/ProductCard';
import SmartImage from '@/components/SmartImage';
import Loader from '@/components/Loader';
import Link from 'next/link';
import {
  IconCheck,
  IconLock,
  IconStar,
  IconSupport,
  IconTruck,
  IconXCircle,
} from '@/components/icons';

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProduct = () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    api.get(`/products/${slug}`).then(r=> {
      setProduct(r.data);
      setImgIdx(0);
      api.get(`/products?category=${r.data.category?.slug}&limit=4`).then(rr=>{
        setRelated((rr.data.products||rr.data).filter(p=>p._id!==r.data._id).slice(0,4));
      }).catch(()=>{});
    }).catch((e)=> {
      setError(e.response?.status === 404 ? 'Product not found.' : 'Could not load this product. Check your internet and retry.');
    }).finally(()=> setLoading(false));
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <Loader text="Loading product..." fullScreen={false} />;

  if (error || !product) return (
    <div className="max-w-[600px] mx-auto px-4 py-10 text-center">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="font-bold text-lg">Something went wrong</div>
        <p className="text-sm text-gray-500 mt-2">{error || 'Product not found.'}</p>
        <div className="flex gap-2 justify-center mt-6">
          <button onClick={loadProduct} className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold">Retry</button>
          <button onClick={() => router.back()} className="border border-gray-200 px-6 py-2.5 rounded-full text-sm font-bold text-gray-600">Go Back</button>
        </div>
      </div>
    </div>
  );

  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price)/product.comparePrice)*100) : null;

  const handleAdd = () => {
    if (!user) { router.push(`/login?redirect=/product/${slug}`); return; }
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    if (!user) { router.push(`/login?redirect=/checkout`); return; }
    addToCart(product, qty);
    router.push('/checkout');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="text-xs text-gray-500 mb-4 flex gap-2">
        <Link href="/">Home</Link> / <Link href={`/category/${product.category?.slug}`}>{product.category?.name}</Link> / <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
        <div>
          <div className="aspect-square bg-cream rounded-2xl overflow-hidden border border-accent/15 relative">
            <SmartImage src={product.images?.[imgIdx]} alt={product.name} className="w-full h-full object-contain" />
            {discount && <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">-{discount}%</span>}
          </div>
          <div className="flex gap-3 mt-4">
            {product.images?.map((img,i)=> (
              <button key={i} onClick={()=>setImgIdx(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${i===imgIdx?'border-primary':'border-gray-100'}`}><img src={img} className="w-full h-full object-contain" /></button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold tracking-widest text-primary">{product.category?.name?.toUpperCase()} {product.unit ? `• ${product.unit}` : ''}</div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold mt-2 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <span className="flex items-center gap-0.5 text-accent">{[1,2,3,4,5].map(i => <IconStar key={i} className="w-3.5 h-3.5" />)}</span><span className="text-sm font-bold">{product.rating}</span>
            {product.reviewsCount > 0 && <span className="text-xs text-gray-400">({product.reviewsCount} reviews)</span>}
            {product.stock > 0 ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full"><IconCheck className="w-3 h-3" /> In Stock: {product.stock}</span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-full"><IconXCircle className="w-3 h-3" /> Out of Stock</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-bold text-primary">₹{product.price}</span>
            {product.comparePrice && <span className="text-lg line-through text-gray-400">₹{product.comparePrice}</span>}
            {product.weight && <span className="text-sm text-gray-500">• {product.weight}</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">Inclusive of all taxes • Shipping: Free above ₹300, else ₹100</div>

          <p className="text-sm text-gray-600 leading-relaxed mt-6 border-t pt-6">{product.description}</p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 border rounded-full px-2 py-1">
              <button onClick={()=> setQty(Math.max(1, qty-1))} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">−</button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button onClick={()=> setQty(qty+1)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">+</button>
            </div>
            <span className="text-xs text-gray-500">Unit: {product.unit}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {user ? (
              <>
                <button onClick={handleAdd} disabled={product.stock <= 0} className="bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-sandal rounded-full py-3.5 font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow">Add to Cart</button>
                <button onClick={handleBuyNow} disabled={product.stock <= 0} className="bg-gradient-to-br from-sacred-saffron to-sacred-flame text-white rounded-full py-3.5 font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow">Buy Now</button>
              </>
            ) : (
              <>
                <button onClick={handleAdd} disabled={product.stock <= 0} className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-sacred-saffron to-sacred-flame text-white rounded-full py-3.5 font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"><IconLock className="w-4 h-4" /> Login to Order</button>
                <button onClick={handleBuyNow} disabled={product.stock <= 0} className="border-2 border-sacred-maroon/25 text-sacred-deepmaroon rounded-full py-3.5 font-bold hover:bg-sacred-sandal transition disabled:opacity-50 disabled:cursor-not-allowed">Login to Buy</button>
              </>
            )}
          </div>
          {!user && (
            <div className="mt-4 rounded-2xl border border-sacred-saffron/30 bg-sacred-sandal/60 p-4 text-center">
              <div className="text-sm font-bold text-sacred-deepmaroon">Only logged-in devotees can place orders</div>
              <div className="text-xs text-stone-500 mt-1">Login (or create an account) to add this to your cart & checkout.</div>
              <Link href={`/login?redirect=/product/${slug}`} className="inline-block mt-3 px-6 py-2.5 rounded-full bg-sacred-maroon text-white text-xs font-bold hover:bg-sacred-deepmaroon transition">Login / Register →</Link>
            </div>
          )}

          <div className="mt-6 bg-cream rounded-2xl p-4 border border-accent/15 grid grid-cols-3 gap-3 text-center">
            <div><div className="flex justify-center text-primary"><IconTruck className="w-5 h-5" /></div><div className="text-xs font-bold mt-1">Fast Delivery</div><div className="text-[11px] text-gray-500">Across India</div></div>
            <div><div className="flex justify-center text-primary"><IconCheck className="w-5 h-5" /></div><div className="text-xs font-bold mt-1">Pure & Honest</div><div className="text-[11px] text-gray-500">Trusted sourcing</div></div>
            <div><div className="flex justify-center text-primary"><IconSupport className="w-5 h-5" /></div><div className="text-xs font-bold mt-1">Easy Support</div><div className="text-[11px] text-gray-500">24×7 help</div></div>
          </div>

          <div className="text-xs text-gray-500 mt-4">SKU: {product.sku || '—'} • Category: <Link href={`/category/${product.category?.slug}`} className="text-primary font-semibold">{product.category?.name}</Link></div>
        </div>
      </div>

      {related.length>0 && (
        <div className="mt-10">
          <h3 className="text-xl font-serif font-bold mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p=> <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
