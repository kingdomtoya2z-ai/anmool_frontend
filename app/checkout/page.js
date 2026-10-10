'use client';
import { useCallback, useEffect, useState } from 'react';
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

const EMPTY_FORM = { fullName: '', phone: '', address: '', city: '', state: '', pincode: '' };

const inputCls =
  'w-full min-w-0 mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function Checkout() {
  const { cart, hydrated, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [placed, setPlaced] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState(null); // { code, discount }
  const [suggest, setSuggest] = useState([]);
  const [couponBusy, setCouponBusy] = useState(false);

  /* ---------------------------------------------------------------------
   * Everything below runs on EVERY render. No hook may live after one of
   * the early returns further down — React counts hooks per render, and a
   * conditional hook throws "Rendered fewer hooks than expected"
   * (minified error #300) the moment a branch like `!user` flips.
   * ------------------------------------------------------------------- */

  const cartItems = useCallback(
    () => cart.map((c) => ({ product: c.product, quantity: c.quantity })),
    [cart]
  );

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
    } else {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.name || '',
        phone: f.phone || user.phone || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Cart changed → drop the old coupon, refresh eligible-coupon suggestions
  useEffect(() => {
    setApplied(null);
    if (!cart.length) {
      setSuggest([]);
      return;
    }
    let cancelled = false;
    api
      .post('/coupons/suggest', { items: cartItems() })
      .then((r) => !cancelled && setSuggest(r.data || []))
      .catch(() => !cancelled && setSuggest([]));
    return () => {
      cancelled = true;
    };
  }, [cart, cartItems]);

  // Signing out must leave nothing of the previous session on screen.
  useEffect(() => {
    if (user) return;
    setForm(EMPTY_FORM);
    setPlaced(null);
    setApplied(null);
    setCouponInput('');
    setSuggest([]);
    setCouponBusy(false);
    setPaymentMethod('online');
  }, [user]);

  const payable = Math.max(0, total - (applied?.discount || 0));

  const applyCoupon = async (code) => {
    const c = String(code ?? couponInput).trim().toUpperCase();
    if (!c) {
      toast.error('Enter a coupon code');
      return;
    }
    setCouponBusy(true);
    try {
      const r = await api.post('/coupons/validate', { code: c, items: cartItems() });
      setApplied({ code: r.data.code, discount: r.data.discount });
      setCouponInput('');
      toast.success(`Coupon ${r.data.code} applied — you save ₹${r.data.discount}!`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponBusy(false);
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error('Could not load Razorpay — check your internet'));
      document.body.appendChild(s);
    });

  const placeOrder = async (method, payId) => {
    const orderRes = await api.post('/orders', {
      items: cartItems(),
      shippingAddress: form,
      paymentMethod: method,
      paymentId: payId,
      couponCode: applied?.code || '',
    });
    clearCart();
    toast.success('Order placed!');
    setPlaced(orderRes.data);
  };

  // Real Razorpay flow: server creates the order (server-side total) →
  // Razorpay modal collects payment → signature verified → order placed.
  // If the modal is closed or payment fails, NO order is created.
  const payOnlineWithRazorpay = async () => {
    await loadRazorpay();
    const { data } = await api.post('/orders/payment/razorpay/order', {
      items: cartItems(),
      couponCode: applied?.code || '',
    });
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Anmool Dairy',
        description: 'Order payment',
        order_id: data.orderId,
        prefill: {
          name: form.fullName || user.name || '',
          email: user.email || '',
          contact: form.phone || '',
        },
        theme: { color: '#5C1A1B' },
        modal: { ondismiss: () => reject(new Error('Payment cancelled — order was not placed')) },
        handler: async (resp) => {
          try {
            const v = await api.post('/orders/payment/razorpay/verify', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            if (!v.data?.verified) throw new Error('Payment verification failed');
            toast.success('Payment successful!');
            await placeOrder('online', v.data.paymentId);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
      });
      rzp.on('payment.failed', (r) =>
        reject(new Error(r.error?.description || 'Payment failed — order was not placed'))
      );
      rzp.open();
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Enter valid phone');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error('Enter valid 6-digit pincode');
      return;
    }
    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        await placeOrder('cod', 'COD');
      } else {
        await payOnlineWithRazorpay();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------- early returns (hooks are all above) ---------- */

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border p-6 sm:p-10">
          <h2 className="text-xl font-bold">Please login to checkout</h2>
          <p className="text-sm text-gray-500 mt-2">
            You need to be logged in to place an order.
          </p>
          <Link
            href="/login?redirect=/checkout"
            className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-8 md:p-10 text-center shadow-lg">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
            <IconCheckCircle className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold mt-5 break-words">
            {placed.paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {placed.paymentMethod === 'cod'
              ? 'Your COD order is placed. Our team will confirm it shortly.'
              : 'Your order is confirmed and being processed.'}
          </p>
          <div className="mt-6 bg-cream border border-accent/20 rounded-2xl p-4 sm:p-5">
            <div className="text-[11px] font-bold tracking-[0.2em] text-primary">
              YOUR ORDER ID
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-primary tracking-wide mt-1 break-all">
              {placed.orderNumber}
            </div>
            <div className="text-xs text-gray-500 mt-2 break-words">
              Total ₹{placed.total}
              {placed.discountAmount ? (
                <span className="text-green-700 font-bold">
                  {' '}
                  · You saved ₹{placed.discountAmount} with {placed.couponCode}
                </span>
              ) : null}
              {' · Save this ID to track your order anytime — no login needed.'}
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
              className="inline-flex items-center justify-center border border-gray-200 rounded-full py-3 text-sm font-bold hover:border-primary hover:text-primary transition"
            >
              My Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-gray-200 rounded-full py-3 text-sm font-bold hover:border-primary hover:text-primary transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hydrated || cart.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border p-6 sm:p-10">
          <h2 className="text-xl font-bold">Cart is empty</h2>
          <Link
            href="/"
            className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------ render ------------------------------- */

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-6 grid md:grid-cols-3 gap-4 sm:gap-6">
      <div className="md:col-span-2 min-w-0 bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl font-serif font-bold">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Free shipping on orders above ₹300 — Pay securely
        </p>

        {user?.address?.address ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs">
            <span className="font-bold text-green-800 flex items-center gap-1.5 min-w-0">
              <IconPin className="w-4 h-4 shrink-0" /> Address auto-filled from your profile
            </span>
            <button
              type="button"
              onClick={() => {
                setForm(formFromSaved());
                toast.success('Saved address applied');
              }}
              className="font-bold text-green-800 underline underline-offset-2 hover:text-green-900"
            >
              Use saved address
            </button>
            <Link
              href="/account?tab=profile"
              className="w-full sm:w-auto sm:ml-auto font-bold text-gray-500 hover:text-primary"
            >
              Edit in profile →
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-stone-200 bg-smoke-50 px-4 py-3 text-xs text-gray-600">
            <span className="flex items-start gap-1.5 min-w-0">
              <IconPin className="w-4 h-4 shrink-0 mt-px text-sacred-saffron" />
              Tip: save a delivery address in your profile and checkout fills
              itself next time.
            </span>
            <Link
              href="/account?tab=profile"
              className="w-full sm:w-auto sm:ml-auto font-bold text-sacred-maroon hover:underline"
            >
              Save address →
            </Link>
          </div>
        )}

        <form onSubmit={handlePay} className="mt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="text-sm font-semibold">Full Name *</label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputCls}
                placeholder="Your name"
              />
            </div>
            <div className="min-w-0">
              <label className="text-sm font-semibold">Phone *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                inputMode="numeric"
                maxLength={10}
                className={inputCls}
                placeholder="10 digit mobile"
              />
            </div>
          </div>
          <div className="min-w-0">
            <label className="text-sm font-semibold">Full Address *</label>
            <textarea
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder="House no, street, landmark, village..."
            />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className="text-sm font-semibold">City *</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputCls}
                placeholder="Karnal"
              />
            </div>
            <div className="min-w-0">
              <label className="text-sm font-semibold">State *</label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={inputCls}
                placeholder="Haryana"
              />
            </div>
            <div className="min-w-0 sm:col-span-2 md:col-span-1">
              <label className="text-sm font-semibold">Pincode *</label>
              <input
                required
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                inputMode="numeric"
                maxLength={6}
                className={inputCls}
                placeholder="132001"
              />
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="font-bold mb-3">Discount Coupon</div>
            {applied ? (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <span className="text-sm font-bold text-green-800 break-all min-w-0">
                  🎟 {applied.code} — you save ₹{applied.discount}
                </span>
                <button
                  type="button"
                  onClick={() => setApplied(null)}
                  className="ml-auto text-xs font-bold text-red-600 hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    aria-label="Coupon code"
                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    disabled={couponBusy}
                    onClick={() => applyCoupon()}
                    className="shrink-0 bg-sacred-deepmaroon text-white rounded-xl px-5 sm:px-6 text-sm font-bold disabled:opacity-50"
                  >
                    {couponBusy ? '…' : 'Apply'}
                  </button>
                </div>
                {suggest.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-bold text-green-700 mb-2 break-words">
                      🎉 You qualify for {suggest.length} coupon
                      {suggest.length === 1 ? '' : 's'} — tap to apply:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggest.map((s) => (
                        <button
                          key={s.code}
                          type="button"
                          disabled={couponBusy}
                          onClick={() => applyCoupon(s.code)}
                          className="max-w-full text-xs font-bold border-2 border-dashed border-green-300 bg-green-50 text-green-800 rounded-xl px-3.5 py-2 hover:border-green-500 transition break-all text-left"
                        >
                          {s.code} · save ₹{s.discount}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="font-bold mb-3">Payment Method</div>
            {/* Stacks on phones — two columns of long copy used to push the
                page wider than the viewport. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`min-w-0 border-2 rounded-2xl p-4 cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'online'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="accent-primary shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm">Pay Online</div>
                  <div className="text-xs text-gray-500">
                    UPI / Card / Netbanking via Razorpay
                  </div>
                </div>
                <span className="ml-auto text-primary shrink-0">
                  <IconCard className="w-5 h-5" />
                </span>
              </label>
              <label
                className={`min-w-0 border-2 rounded-2xl p-4 cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-primary shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm">Cash on Delivery</div>
                  <div className="text-xs text-gray-500">Pay on delivery</div>
                </div>
                <span className="ml-auto text-primary shrink-0">
                  <IconCash className="w-5 h-5" />
                </span>
              </label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Order will be confirmed once payment is successful. Admin gets
              email notification instantly.
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary text-white rounded-full py-4 px-4 font-bold text-base sm:text-lg hover:bg-primary-dark disabled:opacity-60 mt-6 flex items-center justify-center gap-2 break-words"
          >
            {loading ? <ButtonLoader /> : `Pay ₹${payable} & Confirm Order →`}
          </button>
          <div className="text-xs text-center text-gray-400 break-words">
            Shipping: {shipping === 0 ? 'FREE' : `₹${shipping}`} •{' '}
            {subtotal < 300
              ? `Add ₹${300 - subtotal} more for free shipping`
              : 'You got free shipping!'}
          </div>
        </form>
      </div>

      <div className="min-w-0 bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 h-fit md:sticky md:top-24">
        <h3 className="font-bold">Your Order</h3>
        <div className="space-y-3 mt-4 max-h-[300px] overflow-auto pr-1">
          {cart.map((item) => (
            <div key={item.product} className="flex gap-3 text-sm">
              <SmartImage
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-contain border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium line-clamp-2 break-words">{item.name}</div>
                <div className="text-xs text-gray-500">
                  Qty: {item.quantity} × ₹{item.price}
                </div>
              </div>
              <div className="font-bold shrink-0">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold shrink-0">₹{subtotal}</span>
          </div>
          {applied && (
            <div className="flex justify-between gap-2">
              <span className="text-green-700 min-w-0 break-all">Coupon {applied.code}</span>
              <span className="font-semibold text-green-700 shrink-0">
                −₹{applied.discount}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Shipping</span>
            <span
              className={`font-semibold shrink-0 ${shipping === 0 ? 'text-green-600' : ''}`}
            >
              {shipping === 0 ? 'FREE' : `₹${shipping}`}
            </span>
          </div>
          <div className="flex justify-between text-[16px] font-bold border-t pt-2 gap-2">
            <span>Total</span>
            <span className="text-primary text-xl shrink-0">₹{payable}</span>
          </div>
        </div>
        <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-3 text-xs text-accent-dark flex items-start gap-2">
          <IconLock className="w-4 h-4 shrink-0 mt-px" />
          <span className="break-words">
            Secure payment • Admin notified by email instantly • Order confirmed
            after payment
          </span>
        </div>
      </div>
    </div>
  );
}