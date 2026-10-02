'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import SmartImage from '@/components/SmartImage';
import {
  IconBox,
  IconCamera,
  IconCart,
  IconCash,
  IconCheckCircle,
  IconCloud,
  IconFlame,
  IconHome,
  IconLock,
  IconLogout,
  IconMail,
  IconPhone,
  IconPin,
  IconStore,
  IconTruck,
  IconUser,
} from '@/components/icons';
import {
  ORDER_FLOW,
  STATUS_META,
  OrderCard,
  OrderTimeline,
  StatusBadge,
  fmtDate,
  fmtRs,
  useOrderStats,
} from '@/components/UserDashboard';

const TABS = [
  { id: 'overview', label: 'Overview', icon: IconHome },
  { id: 'orders', label: 'My Orders', icon: IconBox },
  { id: 'track', label: 'Track Order', icon: IconPin },
  { id: 'profile', label: 'Profile', icon: IconUser },
];

function DashboardInner() {
  const { user, logout, updateUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = params.get('tab') || 'overview';
  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const tabParam = params.get('tab') || 'overview';
  useEffect(() => {
    setTab(tabParam);
  }, [tabParam]);

  // Fetch orders only once per visit to the dashboard (when you hop in),
  // not on every render / user-object identity change / background re-check.
  // Stable key (string) instead of the `user` object prevents refetch loops.
  const userKey = user?._id || user?.id || user?.email || null;
  const fetchedForRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    if (user.role === 'admin') {
      router.push('/admin');
      return;
    }
    if (fetchedForRef.current === userKey) return;
    fetchedForRef.current = userKey;
    let cancelled = false;
    setLoading(true);
    api
      .get('/orders/my')
      .then((r) => {
        if (cancelled) return;
        setOrders(r.data || []);
        if (r.data?.length) setOpenId((prev) => prev || r.data[0]._id);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, authLoading]);

  const stats = useOrderStats(orders);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') list = list.filter((o) => o.orderStatus === statusFilter);
    const s = query.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (o) =>
          (o.orderNumber || '').toLowerCase().includes(s) ||
          (o.items || []).some((it) => (it.name || '').toLowerCase().includes(s))
      );
    }
    return list;
  }, [orders, statusFilter, query]);

  if (authLoading || (loading && orders.length === 0)) return <Loader text="Loading your dashboard..." />;
  if (!user)
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-primary"><IconLock className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold mt-4">Please login</h2>
          <p className="text-sm text-gray-500 mt-2">Login to see your orders, tracking & profile.</p>
          <Link
            href="/login?redirect=/account"
            className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold"
          >
            Login / Register
          </Link>
        </div>
      </div>
    );

  const activeOrder = orders.find((o) => o._id === openId) || orders[0];
  const firstName = (user.name || 'Guest').split(' ')[0];
  const hour = new Date().getHours();
  const dayPart = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-6">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sacred-deepmaroon via-sacred-maroon to-[#142808] text-white shadow-[0_24px_60px_-24px_rgba(20,40,8,0.7)]">
        <div className="smoke-wisp-slow left-[20%] top-0 h-32 w-64" />
        <div className="om-watermark absolute -right-5 -top-9 text-[168px] hidden sm:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.22)', color: 'transparent' }}>
          ॐ
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sacred-diya/80 to-transparent" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.24em] text-sacred-diya">
              <span className="font-vedic text-sm leading-none">ॐ</span> MY DASHBOARD
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-[11px] font-semibold text-white/80">
              {todayLabel}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 md:gap-5">
            <div className="relative shrink-0">
              <img src={user.avatar || '/images/avatar-default.svg'} alt={user.name} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-sacred-diya/70 shadow-lg bg-white/10" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-[3px] border-[#142808]" title="Active" />
            </div>

            <div className="flex-1 min-w-[220px]">
              <p className="text-xs text-white/60">{dayPart}, welcome back</p>
              <h1 className="font-sacred text-[1.65rem] md:text-4xl leading-tight text-[#FFF6E5] mt-0.5">
                Namaste, <span className="text-sacred-diya">{firstName}</span>
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/85 max-w-full">
                  <IconMail className="w-3.5 h-3.5 text-sacred-diya shrink-0" />
                  <span className="truncate max-w-[180px] md:max-w-[260px]">{user.email}</span>
                </span>
                {user.phone ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/85">
                    <IconPhone className="w-3.5 h-3.5 text-sacred-diya shrink-0" />
                    {user.phone}
                  </span>
                ) : (
                  <button
                    onClick={() => setTab('profile')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-sacred-diya/60 px-3 py-1.5 text-[11px] font-bold text-sacred-diya hover:bg-white/10 transition"
                  >
                    <IconPhone className="w-3.5 h-3.5" /> Add phone number
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href="/"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-center text-xs font-bold bg-white/10 border border-white/20 rounded-full px-5 py-2.5 hover:bg-white/20 transition"
              >
                <IconStore className="w-4 h-4" /> Shop
              </Link>
              <Link
                href="/cart"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-center text-xs font-bold bg-sacred-diya text-sacred-deepmaroon rounded-full px-5 py-2.5 hover:brightness-105 transition shadow"
              >
                <IconCart className="w-4 h-4" /> Cart
              </Link>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex-1 sm:flex-none lg:hidden inline-flex items-center justify-center gap-1.5 text-center text-xs font-bold bg-white/10 border border-red-300/60 text-red-100 rounded-full px-5 py-2.5 hover:bg-red-500/20 transition"
              >
                <IconLogout className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-sacred-diya/70 to-transparent" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: IconBox, bg: 'bg-blue-50 border-blue-100' },
          { label: 'Active / In-progress', value: stats.active, icon: IconTruck, bg: 'bg-amber-50 border-amber-100' },
          { label: 'Delivered', value: stats.delivered, icon: IconCheckCircle, bg: 'bg-green-50 border-green-100' },
          { label: 'Total Spent', value: fmtRs(stats.spent), icon: IconCash, bg: 'bg-violet-50 border-violet-100' },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} border rounded-2xl p-4 md:p-5`}>
            <c.icon className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
            <div className="text-lg md:text-2xl font-bold mt-1">{c.value}</div>
            <div className="text-[11px] md:text-xs font-semibold text-gray-600">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-4 md:gap-6 mt-4 md:mt-6 items-start">
        {/* Sidebar (desktop) / tabs (mobile) */}
        <div className="lg:sticky lg:top-24">
          <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2.5 px-2 lg:px-4 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-sm font-bold transition lg:w-full ${
                  tab === t.id ? 'bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white shadow-md' : 'text-gray-600 hover:bg-cream'
                }`}
              >
                <span className="inline-flex items-center justify-center"><t.icon className="w-5 h-5 lg:w-4 lg:h-4" /></span>
                <span className="text-center lg:text-left leading-tight">{t.label}</span>
                {t.id === 'orders' && orders.length > 0 && (
                  <span
                    className={`lg:ml-auto text-[11px] px-2 py-0.5 rounded-full ${
                      tab === t.id ? 'bg-white/20 text-white' : 'bg-primary text-white'
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2.5 px-2 lg:px-4 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-sm font-bold text-red-600 hover:bg-red-50 transition lg:w-full"
            >
              <span className="inline-flex items-center justify-center"><IconLogout className="w-5 h-5 lg:w-4 lg:h-4" /></span>
              <span className="leading-tight">Logout</span>
            </button>
          </div>

          {/* Help card */}
          <div className="hidden lg:block mt-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="font-bold text-sm">Need help?</div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Keep your <b>Order ID</b> (e.g. ANM-000123) handy. You can track any order without
              login too.
            </p>
            <Link
              href="/track-order"
              className="inline-block mt-3 text-xs font-bold text-primary hover:underline"
            >
              Open public tracking →
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {tab === 'overview' && (
            <OverviewTab
              orders={orders}
              stats={stats}
              activeOrder={activeOrder}
              setTab={setTab}
              setOpenId={setOpenId}
            />
          )}
          {tab === 'orders' && (
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {['all', ...ORDER_FLOW, 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border capitalize ${
                        statusFilter === s
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                      }`}
                    >
                      {s === 'all' ? `All (${orders.length})` : STATUS_META[s].label}
                    </button>
                  ))}
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by Order ID or item…"
                    className="ml-auto w-full md:w-64 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mt-2 md:mt-0"
                  />
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {filtered.map((o) => (
                  <OrderCard
                    key={o._id}
                    order={o}
                    expanded={openId === o._id}
                    onToggle={() => setOpenId(openId === o._id ? null : o._id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <EmptyOrders onSearch={query || statusFilter !== 'all'} />
                )}
              </div>
            </div>
          )}
          {tab === 'track' && <TrackInline orders={orders} />}
          {tab === 'profile' && <ProfileTab user={user} logout={logout} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ orders, stats, activeOrder, setTab, setOpenId }) {
  const recent = orders.slice(0, 3);
  return (
    <div className="space-y-4">
      {activeOrder && ['pending', 'confirmed', 'shipped', 'out-for-delivery'].includes(activeOrder.orderStatus) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-primary">LATEST ACTIVE ORDER</div>
              <div className="font-bold text-lg">
                {activeOrder.orderNumber}{' '}
                <span className="text-xs font-normal text-gray-500">
                  · {fmtRs(activeOrder.total)}
                </span>
              </div>
            </div>
            <StatusBadge status={activeOrder.orderStatus} />
          </div>
          <OrderTimeline order={activeOrder} compact />
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => {
                setOpenId(activeOrder._id);
                setTab('orders');
              }}
              className="text-xs font-bold px-4 py-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition"
            >
              View details
            </button>
            <Link
              href={`/track-order?order=${activeOrder.orderNumber}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition"
            >
              <IconPin className="w-3.5 h-3.5" /> Track live →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold">Recent Orders</div>
          <button
            onClick={() => setTab('orders')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all ({orders.length}) →
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-2">
            {recent.map((o) => (
              <div
                key={o._id}
                className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-primary truncate">{o.orderNumber}</div>
                  <div className="text-[11px] text-gray-500">
                    {fmtDate(o.createdAt)} · {(o.items || []).length} item(s)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">{fmtRs(o.total)}</div>
                  <StatusBadge status={o.orderStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link
          href="/cart"
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition"
        >
          <IconCart className="w-6 h-6 text-primary" />
          <div className="font-bold mt-2 text-sm">Go to Cart</div>
          <div className="text-xs text-gray-500">Checkout & place a new order</div>
        </Link>
        <button
          onClick={() => setTab('track')}
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition text-left"
        >
          <IconPin className="w-6 h-6 text-primary" />
          <div className="font-bold mt-2 text-sm">Track any Order</div>
          <div className="text-xs text-gray-500">Enter Order ID to see live status</div>
        </button>
        <Link
          href="/"
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition"
        >
          <IconStore className="w-6 h-6 text-primary" />
          <div className="font-bold mt-2 text-sm">Continue Shopping</div>
          <div className="text-xs text-gray-500">Browse fresh products</div>
        </Link>
      </div>
    </div>
  );
}

function TrackInline({ orders }) {
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const track = async (raw) => {
    const value = (raw ?? id).trim();
    if (!value) return;
    setErr('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(value)}`);
      setResult(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Order not found. Check the Order ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
      <div className="font-bold text-lg">Track Order</div>
      <p className="text-xs text-gray-500 mt-1">
        Enter your Order ID (e.g. <b>ANM-000123</b>) — every order gets one at checkout.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          track();
        }}
        className="flex flex-col sm:flex-row gap-2 mt-4"
      >
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="ANM-000123"
          className="flex-1 border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
        />
        <button className="bg-primary text-white px-8 py-3 rounded-full font-bold text-sm shrink-0 disabled:opacity-60" disabled={loading}>
          {loading ? 'Tracking…' : 'Track'}
        </button>
      </form>
      {err && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {result && (
        <div className="mt-6 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-primary text-lg">{result.orderNumber}</div>
            <StatusBadge status={result.orderStatus} />
          </div>
          <div className="mt-4">
            <OrderTimeline order={result} />
          </div>
          <div className="mt-4 space-y-2 text-sm border rounded-xl p-4 bg-cream/40">
            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <b>{(result.items || []).length}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <b className="text-primary">{fmtRs(result.total)}</b>
            </div>
          </div>
        </div>
      )}
      {orders.length > 0 && !result && (
        <div className="mt-6">
          <div className="text-xs font-bold text-gray-500 mb-2">QUICK TRACK — YOUR ORDERS</div>
          <div className="flex flex-wrap gap-2">
            {orders.slice(0, 8).map((o) => (
              <button
                key={o._id}
                onClick={() => {
                  setId(o.orderNumber);
                  track(o.orderNumber);
                }}
                className="text-xs font-bold border border-gray-200 rounded-full px-3.5 py-1.5 hover:border-primary hover:text-primary transition"
              >
                {o.orderNumber}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, logout }) {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addr, setAddr] = useState({
    fullName: user.address?.fullName || user.name || '',
    phone: user.address?.phone || user.phone || '',
    address: user.address?.address || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
  });
  const [savingAddr, setSavingAddr] = useState(false);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadAvatar = async () => {
    if (!file) { toast.error('Choose a photo first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatarFile', file);
      const res = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data);
      setFile(null);
      setPreview('');
      toast.success('Profile photo updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Photo upload failed');
    } finally { setUploading(false); }
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const shown = preview || user.avatar || '/images/avatar-default.svg';

  const saveAddress = async (e) => {
    e.preventDefault();
    if (addr.phone && !/^[6-9]\d{9}$/.test(addr.phone)) { toast.error('Enter a valid 10-digit phone'); return; }
    if (addr.pincode && !/^\d{6}$/.test(addr.pincode)) { toast.error('Enter a valid 6-digit pincode'); return; }
    setSavingAddr(true);
    try {
      const res = await api.put('/auth/profile', { address: addr });
      updateUser(res.data);
      toast.success('Delivery address saved — it will auto-fill at checkout');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally { setSavingAddr(false); }
  };

  const setAddrField = (k, v) => setAddr((prev) => ({ ...prev, [k]: v }));
  const addrInputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-saffron/40 focus:border-sacred-saffron bg-white';

  return (
    <div className="space-y-4">
      {/* Photo card */}
      <div className="spiritual-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="sacred-divider max-w-[200px] mb-5"><span className="inline-flex items-center justify-center text-sacred-saffron"><IconFlame className="w-4 h-4" /></span></div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <img src={shown} alt={user.name} className="w-28 h-28 rounded-3xl object-cover border-2 border-sacred-saffron/50 shadow-lg bg-white" />
            <span className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-sacred-diya text-sacred-deepmaroon flex items-center justify-center shadow diya-glow"><IconFlame className="w-4 h-4" /></span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-sacred text-2xl text-sacred-deepmaroon">{user.name}</div>
            <div className="text-sm text-stone-500">{user.email}</div>
            <div className="text-sm text-stone-500">{user.phone || 'No phone added'}</div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold border border-sacred-maroon/25 rounded-full px-5 py-2.5 hover:border-sacred-saffron hover:text-sacred-maroon transition text-center">
                <IconCamera className="w-4 h-4" /> {file ? 'Change photo…' : 'Choose photo…'}
                <input type="file" accept="image/*" onChange={pickFile} className="hidden" />
              </label>
              {file && (
                <button onClick={uploadAvatar} disabled={uploading} className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white rounded-full px-6 py-2.5 hover:opacity-90 disabled:opacity-50 shadow">
                  {uploading ? 'Uploading to Cloudinary…' : (<><IconCloud className="w-4 h-4" /> Upload photo</>)}
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-2">JPG/PNG up to 5MB — stored securely on Cloudinary, shown across the site.</p>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm">
        <div className="font-sacred text-xl text-sacred-deepmaroon">Profile Details</div>
        <p className="text-xs text-stone-500 mt-1">Keep your name & phone updated for smooth delivery.</p>
        <form onSubmit={saveDetails} className="grid sm:grid-cols-2 gap-4 mt-5">
          <label className="block">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Full Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-saffron/40 focus:border-sacred-saffron bg-white" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Phone (10-digit)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={10} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-saffron/40 focus:border-sacred-saffron bg-white" />
          </label>
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
            <button disabled={saving} className="flex-1 bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white rounded-full py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 shadow">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => { logout(); router.push('/'); }}
              className="inline-flex items-center justify-center gap-1.5 px-8 rounded-full border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition py-3"
            >
              <IconLogout className="w-4 h-4" /> Logout safely
            </button>
          </div>
        </form>
        <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
          <div className="border border-stone-200/70 rounded-xl p-4 bg-smoke-50">
            <div className="text-xs font-bold text-stone-500">EMAIL</div>
            <div className="font-semibold mt-1 break-all text-sacred-deepmaroon">{user.email}</div>
          </div>
          <div className="border border-stone-200/70 rounded-xl p-4 bg-smoke-50">
            <div className="text-xs font-bold text-stone-500">MEMBER SINCE</div>
            <div className="font-semibold mt-1 text-sacred-deepmaroon">{user.createdAt ? fmtDate(user.createdAt) : '—'}</div>
          </div>
        </div>
      </div>

      {/* Delivery address card — auto-fills at checkout */}
      <div className="bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-sacred text-xl text-sacred-deepmaroon flex items-center gap-2">
            <IconPin className="w-5 h-5 text-sacred-saffron" /> Delivery Address
          </div>
          <span className="text-[11px] font-bold bg-sacred-sandal border border-sacred-saffron/30 text-sacred-deepmaroon rounded-full px-3 py-1">
            Auto-fills at checkout
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1">Save it once — checkout picks it up automatically. You can still edit it per order.</p>
        <form onSubmit={saveAddress} className="grid sm:grid-cols-2 gap-4 mt-5">
          <label className="block">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Full Name *</span>
            <input required value={addr.fullName} onChange={(e) => setAddrField('fullName', e.target.value)} placeholder="Receiver's name" className={addrInputCls} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Phone (10-digit) *</span>
            <input required value={addr.phone} onChange={(e) => setAddrField('phone', e.target.value)} maxLength={10} placeholder="Delivery phone" className={addrInputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">Full Address *</span>
            <textarea required value={addr.address} onChange={(e) => setAddrField('address', e.target.value)} rows={2} placeholder="House no, street, landmark, village…" className={addrInputCls} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-600 mb-1 block">City *</span>
            <input required value={addr.city} onChange={(e) => setAddrField('city', e.target.value)} placeholder="Karnal" className={addrInputCls} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-stone-600 mb-1 block">State *</span>
              <input required value={addr.state} onChange={(e) => setAddrField('state', e.target.value)} placeholder="Haryana" className={addrInputCls} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-stone-600 mb-1 block">Pincode *</span>
              <input required value={addr.pincode} onChange={(e) => setAddrField('pincode', e.target.value)} maxLength={6} placeholder="132001" className={addrInputCls} />
            </label>
          </div>
          <div className="sm:col-span-2">
            <button disabled={savingAddr} className="w-full sm:w-auto bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white rounded-full px-8 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 shadow">
              {savingAddr ? 'Saving…' : 'Save Delivery Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyOrders({ onSearch }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-primary mb-3"><IconBox className="w-6 h-6" /></div>
      <div className="font-bold">{onSearch ? 'No orders match' : 'No orders yet'}</div>
      <p className="text-sm text-gray-500 mt-1">
        {onSearch
          ? 'Try a different Order ID or status filter.'
          : 'Your orders will appear here with a trackable Order ID.'}
      </p>
      {!onSearch && (
        <Link
          href="/"
          className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold"
        >
          Shop now
        </Link>
      )}
    </div>
  );
}

export default function Account() {
  return (
    <Suspense fallback={<Loader text="Loading dashboard..." />}>
      <DashboardInner />
    </Suspense>
  );
}
