'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import SmartImage from '@/components/SmartImage';
import { IconLock } from '@/components/icons';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : null;

  const requireLogin = (redirect) => {
    router.push(`/login?redirect=${encodeURIComponent(redirect || '/cart')}`);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!user) {
      requireLogin('/cart');
      return;
    }
    addToCart(product, 1);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group spiritual-card rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(20,40,8,0.5)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative bg-white aspect-square overflow-hidden">
        <SmartImage src={product.images?.[0]} alt={product.name} className="w-full h-full object-contain bg-white transition duration-500" />
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
        {discount && (
          <span className="absolute top-3 left-3 bg-sacred-maroon text-sacred-diya text-xs font-bold px-2.5 py-1 rounded-full shadow">-{discount}% OFF</span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-sacred-saffron/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">Only {product.stock} left</span>
        )}
        {!product.isActive ? <span className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-stone-500">Out of Stock</span> : null}
        {user ? (
          <button onClick={handleAdd} aria-label="Add to cart" className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-sacred-maroon hover:bg-sacred-maroon hover:text-white transition opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        ) : null}
      </div>
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <div className="text-[11px] font-bold tracking-[0.18em] text-sacred-saffron uppercase">{product.category?.name || product.weight || product.unit}</div>
        <h3 className="font-semibold text-[13px] sm:text-[14px] leading-tight line-clamp-2 mt-1 min-h-[32px] sm:min-h-[36px] group-hover:text-sacred-maroon transition font-sacred">{product.name}</h3>
        <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-base sm:text-[18px] font-bold text-sacred-deepmaroon">₹{product.price}</span>
          {product.comparePrice && <span className="text-xs line-through text-stone-400">₹{product.comparePrice}</span>}
          {product.stock > 0 && <span className="ml-auto text-[11px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">✓ In Stock</span>}
          {product.stock <= 0 && <span className="ml-auto text-[11px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full whitespace-nowrap">Out of Stock</span>}
        </div>
        <div className="mt-2 sm:mt-3 grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
          {user ? (
            <button onClick={handleAdd} className="bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-sacred-sandal rounded-full py-2 sm:py-2.5 text-xs font-bold hover:opacity-90 transition shadow">Add to Cart</button>
          ) : (
            <button onClick={(e) => { e.preventDefault(); requireLogin(`/product/${product.slug}`); }} className="bg-gradient-to-br from-sacred-saffron to-sacred-flame text-white rounded-full py-2 sm:py-2.5 text-xs font-bold hover:opacity-90 transition shadow flex items-center justify-center gap-1.5"><IconLock className="w-3.5 h-3.5" /> Login to Order</button>
          )}
          <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/product/${product.slug}`); }} className="border border-sacred-maroon/20 rounded-full py-2 sm:py-2.5 text-xs font-bold text-center hover:bg-sacred-sandal transition text-sacred-deepmaroon cursor-pointer">View</span>
        </div>
        {!user && <div className="text-[10px] text-center text-stone-400 mt-2 italic font-vedic">Only logged-in devotees can order</div>}
      </div>
    </Link>
  );
}
