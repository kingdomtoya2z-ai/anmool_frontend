'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import SmartImage from '@/components/SmartImage';
import { IconCart, IconCheckCircle, IconLock } from '@/components/icons';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, subtotal, shipping, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (cart.length===0) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-100 p-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-primary mb-4"><IconCart className="w-7 h-7" /></div>
          <h2 className="text-2xl font-serif font-bold">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mt-2">Add products to get free shipping above ₹300</p>
          <Link href="/" className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold">Continue Shopping →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-serif font-bold mb-4">Shopping Cart ({cart.length})</h1>
        <div className="space-y-4">
          {cart.map(item=> (
            <div key={item.product} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <SmartImage src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover border shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm line-clamp-1">{item.name}</div>
                <div className="text-xs text-gray-500">₹{item.price} each</div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 border rounded-full px-1 py-0.5">
                    <button onClick={()=>updateQty(item.product, item.quantity-1)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center">−</button>
                    <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={()=>updateQty(item.product, item.quantity+1)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center">+</button>
                  </div>
                  <button onClick={()=>removeFromCart(item.product)} className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">₹{item.price * item.quantity}</div>
                <div className="text-xs text-gray-400 line-through"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 h-fit sticky top-24">
        <h3 className="font-bold text-lg">Order Summary</h3>
        <div className="space-y-3 mt-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{subtotal}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={`font-semibold ${shipping===0?'text-green-600':''}`}>{shipping===0 ? 'FREE' : `₹${shipping}`}</span></div>
          {subtotal<300 && subtotal>0 && <div className="text-xs bg-accent/5 border border-accent/20 rounded-xl p-3 text-accent-dark">Add ₹{300-subtotal} more for <b>FREE shipping</b>!</div>}
          {subtotal>=300 && <div className="text-xs bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 flex items-center gap-1.5"><IconCheckCircle className="w-4 h-4 shrink-0" /> You got FREE shipping!</div>}
          <div className="border-t pt-3 flex justify-between text-[16px] font-bold"><span>Total</span><span className="text-primary text-xl">₹{total}</span></div>
          <div className="text-xs text-gray-400">Inclusive of all taxes</div>
        </div>

        {!user ? (
          <div className="mt-6 rounded-2xl border border-sacred-saffron/30 bg-gradient-to-b from-[#FFFDF8] to-sacred-sandal/70 p-5 text-center spiritual-card">
            <div className="w-10 h-10 mx-auto rounded-full bg-white border border-sacred-saffron/30 flex items-center justify-center text-sacred-maroon"><IconLock className="w-5 h-5" /></div>
            <div className="text-sm font-bold text-sacred-deepmaroon mt-2 font-sacred text-base">Login required to order</div>
            <div className="text-xs text-stone-500 mt-1">Only logged-in devotees can place orders. Your cart is saved — login to checkout.</div>
            <Link href="/login?redirect=/checkout" className="block mt-3 bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white rounded-full py-2.5 text-sm font-bold hover:opacity-90">Login to Checkout</Link>
            <Link href="/register?redirect=/checkout" className="block mt-2 text-sm font-semibold text-sacred-maroon">Create account</Link>
          </div>
        ) : (
          <button onClick={()=>router.push('/checkout')} className="w-full mt-6 bg-primary text-white rounded-full py-3.5 font-bold hover:bg-primary-dark transition">Proceed to Checkout →</button>
        )}
        <Link href="/" className="block text-center mt-3 text-sm font-semibold text-gray-600 hover:text-primary">← Continue Shopping</Link>
        <div className="mt-6 bg-cream rounded-xl p-3 border border-accent/15 text-xs text-gray-600">
          <div className="font-bold text-gray-800">Why Anmool Dairy?</div>
          <div className="mt-1">✓ Genuine products • ✓ Trusted sourcing • ✓ Hygienic packaging • ✓ 24×7 support</div>
        </div>
      </div>
    </div>
  );
}
