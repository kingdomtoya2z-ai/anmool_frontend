'use client';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ButtonLoader } from '@/components/Loader';
import SmartImage from '@/components/SmartImage';
import {
  IconCard,
  IconCash,
  IconCheckCircle,
  IconCopy,
  IconLock,
  IconPin,
} from '@/components/icons';

export default function Checkout() {
  const { cart, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName:'', phone:'', address:'', city:'', state:'', pincode:'' });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [placed, setPlaced] = useState(null);
  const [autoFilled, setAutoFilled] = useState(false);

  const formFromSaved = () => ({
    fullName: user?.address?.fullName || user?.name || '',
    phone: user?.address?.phone || user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  // Auto-fill delivery details from the saved profile address (runs when user loads)
  useEffect(() => {
    if (!user) return;
    const saved = formFromSaved();
    if (saved.address || saved.city) {
      setForm(saved);
      setAutoFilled(true);
    } else {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.name || '',
        phone: f.phone || user.phone || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border p-10">
          <h2 className="text-xl font-bold">Please login to checkout</h2>
          <p className="text-sm text-gray-500 mt-2">You need to be logged in to place an order.</p>
          <Link href="/login?redirect=/checkout" className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold">Login</Link>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 text-center shadow-lg">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
            <IconCheckCircle className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold mt-5">
            {placed.paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {placed.paymentMethod === 'cod'
              ? 'Your COD order is placed. Our team will confirm it shortly.'
              : 'Your order is confirmed and being processed.'}
          </p>
          <div className="mt-6 bg-cream border border-accent/20 rounded-2xl p-5">
            <div className="text-[11px] font-bold tracking-[0.2em] text-primary">YOUR ORDER ID</div>
            <div className="text-3xl font-bold text-primary tracking-wide mt-1">
              {placed.orderNumber}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Total ₹{placed.total} · Save this ID to track your order anytime — no login needed.
            </div>
            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(placed.orderNumber);
                  toast.success('Order ID copied!');
                } catch {}
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold border border-gray-200 bg-white rounded-full px-4 py-2 hover:border-primary hover:text-primary transition"
            >
              <IconCopy className="w-3.5 h-3.5" /> Copy Order ID
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 mt-6">
            <Link
              href={`/track-order?order=${placed.orderNumber}`}
              className="inline-flex items-center justify-center gap-1.5 bg-primary text-white rounded-full py-3 text-sm font-bold hover:bg-primary-dark transition"
            >
              <IconPin className="w-4 h-4" /> Track Order
            </Link>
            <Link
              href="/orders"
              className="border border-gray-200 rounded-full py-3 text-sm font-bold hover:border-primary hover:text-primary transition"
            >
              My Orders
            </Link>
            <Link
              href="/"
              className="border border-gray-200 rounded-full py-3 text-sm font-bold hover:border-primary hover:text-primary transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length===0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border p-10">
          <h2 className="text-xl font-bold">Cart is empty</h2>
          <Link href="/" className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold">Shop Now</Link>
        </div>
      </div>
    );
  }

  const handlePay = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) { toast.error('Enter valid phone'); return; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter valid 6-digit pincode'); return; }
    setLoading(true);
    try {
      // Simulate payment
      let paymentId = 'COD';
      if (paymentMethod === 'online') {
        const payRes = await api.post('/orders/payment/simulate', { amount: total });
        paymentId = payRes.data.paymentId;
        toast.success('Payment successful!');
      }
      const orderRes = await api.post('/orders', {
        items: cart.map(c=> ({ product: c.product, quantity: c.quantity })),
        shippingAddress: form,
        paymentMethod,
        paymentId,
      });
      clearCart();
      toast.success('Order placed!');
      setPlaced(orderRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl font-serif font-bold">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Free shipping on orders above ₹300 — Pay securely</p>

        {user?.address?.address ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs">
            <span className="font-bold text-green-800 flex items-center gap-1.5"><IconPin className="w-4 h-4" /> Address auto-filled from your profile</span>
            <button
              type="button"
              onClick={() => { setForm(formFromSaved()); toast.success('Saved address applied'); }}
              className="font-bold text-green-800 underline underline-offset-2 hover:text-green-900"
            >
              Use saved address
            </button>
            <Link href="/account?tab=profile" className="ml-auto font-bold text-gray-500 hover:text-primary">
              Edit in profile →
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-smoke-50 px-4 py-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5"><IconPin className="w-4 h-4 text-sacred-saffron" /> Tip: save a delivery address in your profile and checkout fills itself next time.</span>
            <Link href="/account?tab=profile" className="ml-auto font-bold text-sacred-maroon hover:underline">
              Save address →
            </Link>
          </div>
        )}

        <form onSubmit={handlePay} className="mt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Full Name *</label>
              <input required value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-semibold">Phone *</label>
              <input required value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} maxLength={10} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="10 digit mobile" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Full Address *</label>
            <textarea required value={form.address} onChange={e=>setForm({...form, address:e.target.value})} rows={3} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="House no, street, landmark, village..." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="text-sm font-semibold">City *</label><input required value={form.city} onChange={e=>setForm({...form, city:e.target.value})} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Karnal" /></div>
            <div><label className="text-sm font-semibold">State *</label><input required value={form.state} onChange={e=>setForm({...form, state:e.target.value})} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Haryana" /></div>
            <div><label className="text-sm font-semibold">Pincode *</label><input required value={form.pincode} onChange={e=>setForm({...form, pincode:e.target.value})} maxLength={6} className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="132001" /></div>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="font-bold mb-3">Payment Method</div>
            <div className="grid grid-cols-2 gap-3">
              <label className={`border-2 rounded-2xl p-4 cursor-pointer flex items-center gap-3 ${paymentMethod==='online'?'border-primary bg-primary/5':'border-gray-100'}`}>
                <input type="radio" checked={paymentMethod==='online'} onChange={()=>setPaymentMethod('online')} className="accent-primary" />
                <div><div className="font-bold text-sm">Pay Online</div><div className="text-xs text-gray-500">Card / UPI (Simulated)</div></div>
                <span className="ml-auto text-primary"><IconCard className="w-5 h-5" /></span>
              </label>
              <label className={`border-2 rounded-2xl p-4 cursor-pointer flex items-center gap-3 ${paymentMethod==='cod'?'border-primary bg-primary/5':'border-gray-100'}`}>
                <input type="radio" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} className="accent-primary" />
                <div><div className="font-bold text-sm">Cash on Delivery</div><div className="text-xs text-gray-500">Pay on delivery</div></div>
                <span className="ml-auto text-primary"><IconCash className="w-5 h-5" /></span>
              </label>
            </div>
            <div className="text-xs text-gray-500 mt-2">Order will be confirmed once payment is successful. Admin gets email notification instantly.</div>
          </div>

          <button disabled={loading} className="w-full bg-primary text-white rounded-full py-4 font-bold text-lg hover:bg-primary-dark disabled:opacity-60 mt-6 flex items-center justify-center gap-2">
            {loading ? <ButtonLoader /> : `Pay ₹${total} & Confirm Order →`}
          </button>
          <div className="text-xs text-center text-gray-400">Shipping: {shipping===0?'FREE':`₹${shipping}`} • {subtotal<300? `Add ₹${300-subtotal} more for free shipping` : 'You got free shipping!'}</div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 h-fit sticky top-24">
        <h3 className="font-bold">Your Order</h3>
        <div className="space-y-3 mt-4 max-h-[300px] overflow-auto pr-1">
          {cart.map(item=> (
            <div key={item.product} className="flex gap-3 text-sm">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border" />
              <div className="flex-1 min-w-0"><div className="font-medium line-clamp-1">{item.name}</div><div className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</div></div>
              <div className="font-bold">₹{item.price*item.quantity}</div>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{subtotal}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={`font-semibold ${shipping===0?'text-green-600':''}`}>{shipping===0?'FREE':`₹${shipping}`}</span></div>
          <div className="flex justify-between text-[16px] font-bold border-t pt-2"><span>Total</span><span className="text-primary text-xl">₹{total}</span></div>
        </div>
        <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-3 text-xs text-accent-dark flex items-start gap-2"><IconLock className="w-4 h-4 shrink-0 mt-px" /><span>Secure payment • Admin notified by email instantly • Order confirmed after payment</span></div>
      </div>
    </div>
  );
}
