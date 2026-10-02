'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';
import SmartImage from '@/components/SmartImage';
import Link from 'next/link';
import {
  IconChart, IconBox, IconGrid, IconFlame, IconUsers, IconImage,
  IconAlert, IconTruck, IconCheckCircle, IconCash, IconStore,
  IconCloud, IconSearch, IconDownload, IconPhone, IconCopy, IconClock,
} from '@/components/icons';

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];
const STATUS_META = {
  pending:          { label: 'Pending',          color: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-500' },
  confirmed:        { label: 'Confirmed',        color: 'bg-blue-50 text-blue-700 border-blue-200',            dot: 'bg-blue-500' },
  shipped:          { label: 'Shipped',          color: 'bg-violet-50 text-violet-700 border-violet-200',      dot: 'bg-violet-500' },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-cyan-50 text-cyan-700 border-cyan-200',         dot: 'bg-cyan-500' },
  delivered:        { label: 'Delivered',        color: 'bg-green-50 text-green-700 border-green-200',         dot: 'bg-green-500' },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-50 text-red-700 border-red-200',               dot: 'bg-red-500' },
};
const FLOW = ['pending', 'confirmed', 'shipped', 'out-for-delivery', 'delivered'];

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} /> {meta.label}
    </span>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-gray-600 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white';

/* ------------------------------------------------------------------ */
/*  Admin Dashboard                                                    */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [cloud, setCloud] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (range) => {
    const q = new URLSearchParams();
    if (range?.from) q.set('from', range.from);
    if (range?.to) q.set('to', range.to);
    if (range?.from || range?.to) q.set('limit', '500');
    const suffix = q.toString() ? `?${q.toString()}` : '';
    try { const r = await api.get(`/orders${suffix}`); setOrders(r.data || []); } catch {}
    try { const r = await api.get('/admin/stats'); setStats(r.data); } catch {}
  };

  const loadAll = async () => {
    setLoading(true);
    const jobs = [
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/upload/status').then(r => setCloud(r.data)).catch(() => {}),
      api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {}),
      api.get('/products/admin/all').then(r => setProducts(r.data || [])).catch(() => {}),
      api.get('/orders').then(r => setOrders(r.data || [])).catch(() => {}),
      api.get('/admin/users').then(r => setUsers(r.data || [])).catch(() => {}),
      api.get('/banners/all').then(r => setBanners(r.data || [])).catch(() => {}),
    ];
    await Promise.all(jobs);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  // Real-time clock for the topbar (IST, ticks every second)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const reloadOrders = async (range) => {
    await fetchOrders(range);
  };

  const reloadBanners = async () => {
    try { const r = await api.get('/banners/all'); setBanners(r.data || []); } catch {}
  };

  if (!user) return <div className="p-10 text-center">Please login as admin — <Link href="/login" className="text-primary font-bold">Login</Link></div>;
  if (!isAdmin) return <div className="p-10 text-center">Access denied — admin only. Current user: {user.email}</div>;

  const NAV = [
    { id: 'overview', label: 'Overview', icon: IconChart, desc: 'Sales, funnel & alerts' },
    { id: 'orders', label: 'Orders', icon: IconBox, desc: 'Track & update status' },
    { id: 'dhenuvera', label: 'DhenuVera', icon: IconFlame, desc: 'Subcats & products' },
    { id: 'banners', label: 'Banners', icon: IconImage, desc: 'Homepage hero slider' },
    { id: 'categories', label: 'Categories', icon: IconGrid, desc: 'Homepage & menu' },
    { id: 'products', label: 'Products', icon: IconFlame, desc: 'Catalogue & stock' },
    { id: 'users', label: 'Users', icon: IconUsers, desc: 'Registered customers' },
  ];

  const pendingCount = orders.filter(o => o.orderStatus === 'pending').length;
  const todayStr = new Date().toDateString();
  const todayCount = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr).length;
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="max-w-[1500px] w-full mx-auto px-4 py-6 overflow-x-clip">
      {/* Welcome topbar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sacred-deepmaroon via-sacred-maroon to-[#142808] text-white shadow-[0_24px_60px_-24px_rgba(20,40,8,0.7)]">
        <div className="smoke-wisp-slow left-[30%] top-0 h-28 w-64" />
        <div className="om-watermark absolute -right-5 -top-9 text-[168px] hidden sm:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.22)', color: 'transparent' }}>
          ॐ
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sacred-diya/80 to-transparent" />

        <div className="relative p-6 md:p-7 flex flex-wrap items-center gap-4 md:gap-5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 border border-sacred-diya/40 flex items-center justify-center font-vedic text-3xl text-sacred-diya ring-2 ring-sacred-diya/20 shrink-0">
            ॐ
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="text-[11px] font-bold tracking-[0.24em] text-sacred-diya">ADMIN CONSOLE</div>
            <h1 className="font-sacred text-2xl md:text-[2rem] leading-tight text-[#FFF6E5] mt-0.5">Welcome back, Admin</h1>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/85">
                {todayLabel}
              </span>
              <button onClick={() => setTab('orders')} className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/20 transition">
                {todayCount} order{todayCount === 1 ? '' : 's'} today
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white tabular-nums">
              <IconClock className="w-4 h-4 text-sacred-diya" />
              {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button onClick={() => setTab('orders')} className={`text-xs font-bold px-4 py-2.5 rounded-full transition shadow flex items-center gap-1.5 ${pendingCount ? 'bg-sacred-diya text-sacred-deepmaroon animate-pulse' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}>
              <IconAlert className="w-4 h-4" /> {pendingCount} pending
            </button>
            <Link href="/" className="text-xs font-bold px-4 py-2.5 rounded-full bg-white text-sacred-deepmaroon hover:opacity-90 transition flex items-center gap-1.5"><IconStore className="w-4 h-4" /> View Store</Link>
          </div>
        </div>

        {!cloud?.configured && (
          <div className="relative mx-6 md:mx-7 mb-5 text-xs bg-amber-400/15 border border-sacred-diya/50 text-sacred-diya rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <IconAlert className="w-4 h-4 shrink-0" /> <span><b>Cloudinary cloud name not set.</b> Add <code>CLOUDINARY_CLOUD_NAME</code> in <code>backend/.env</code> to enable real image uploads.</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-sacred-diya/70 to-transparent" />
      </div>

      <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-4 md:gap-6 mt-4 md:mt-6 items-start">
        {/* Sidebar nav */}
        <div className="lg:sticky lg:top-24">
          <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2 spiritual-card rounded-2xl p-2">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-3 px-2 lg:px-4 py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-sm font-bold transition lg:w-full whitespace-nowrap ${tab === n.id ? 'bg-gradient-to-br from-sacred-maroon to-sacred-deepmaroon text-white shadow-md' : 'text-stone-600 hover:bg-sacred-sandal/70'}`}>
                <n.icon className="w-5 h-5 shrink-0" />
                <span className="text-center lg:text-left">
                  <span className="block leading-tight">{n.label}</span>
                  <span className={`hidden lg:block text-[10px] font-normal ${tab === n.id ? 'text-white/60' : 'text-stone-400'}`}>{n.desc}</span>
                </span>
                {n.id === 'orders' && <span className={`lg:ml-auto text-[11px] px-2 py-0.5 rounded-full ${tab === n.id ? 'bg-sacred-diya text-sacred-deepmaroon' : 'bg-sacred-maroon text-white'}`}>{orders.length}</span>}
              </button>
            ))}
          </div>
          <div className="hidden lg:block mt-4 spiritual-card rounded-2xl p-5">
            <div className="font-sacred text-base text-sacred-deepmaroon flex items-center gap-2"><IconFlame className="w-5 h-5 text-sacred-saffron" /> Sales Overview</div>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">Pending orders need attention first — confirm them quickly for satisfied customers.</p>
            <button onClick={() => setTab('orders')} className="mt-3 text-xs font-bold text-sacred-maroon hover:underline">Open order tracking →</button>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {loading && <div className="text-center py-16 text-stone-400 text-sm">Loading dashboard…</div>}

          {!loading && tab === 'overview' && <Overview stats={stats} orders={orders} products={products} setTab={setTab} />}
          {!loading && tab === 'orders' && <OrdersTab orders={orders} reload={reloadOrders} />}
          {!loading && tab === 'dhenuvera' && <DhenuVeraTab categories={categories} products={products} onChanged={loadAll} />}
          {!loading && tab === 'banners' && <BannersTab banners={banners} onChanged={reloadBanners} />}
          {!loading && tab === 'categories' && <CategoriesTab categories={categories} onChanged={loadAll} />}
          {!loading && tab === 'products' && <ProductsTab categories={categories} products={products} onChanged={loadAll} />}
          {!loading && tab === 'users' && <UsersTab users={users} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview                                                           */
/* ------------------------------------------------------------------ */

function Overview({ stats, orders, products, setTab }) {
  if (!stats) return null;
  const cards = [
    { label: 'Total Revenue', value: fmtRs(stats.totalRevenue), sub: 'from paid orders', icon: IconCash, grad: 'from-amber-500 to-sacred-saffron' },
    { label: 'Orders', value: stats.orders, sub: 'all time', icon: IconBox, grad: 'from-sacred-maroon to-sacred-deepmaroon' },
    { label: 'Products', value: stats.products, sub: 'live catalogue', icon: IconFlame, grad: 'from-emerald-600 to-teal-700' },
    { label: 'Categories', value: stats.categories, sub: 'incl. sub-categories', icon: IconGrid, grad: 'from-indigo-600 to-primary-dark' },
    { label: 'Users', value: stats.users, sub: 'registered customers', icon: IconUsers, grad: 'from-rose-600 to-sacred-maroon' },
  ];
  const statusCounts = stats.orderStatusCounts || {};

  // Last 7 days revenue bars (paid orders only)
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dayRevenue = days.map(d => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return (orders || [])
      .filter(o => o.paymentStatus === 'paid' && new Date(o.createdAt) >= d && new Date(o.createdAt) < next)
      .reduce((s, o) => s + (o.total || 0), 0);
  });
  const maxRev = Math.max(1, ...dayRevenue);

  const lowStock = (products || []).filter(p => (p.stock ?? 0) <= 10).slice(0, 5);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${c.grad} hover:scale-[1.02] transition`}>
            <c.icon className="w-6 h-6" />
            <div className="text-xl md:text-2xl font-bold mt-2">{c.value}</div>
            <div className="text-xs font-semibold opacity-90">{c.label}</div>
            <div className="text-[11px] opacity-60">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="spiritual-card rounded-2xl p-6 mt-4">
        <div className="flex items-center justify-between">
          <div className="font-sacred text-lg text-sacred-deepmaroon">Last 7 Days Revenue (paid)</div>
          <button onClick={() => setTab('orders')} className="text-xs font-bold text-sacred-maroon hover:underline">View orders →</button>
        </div>
        <div className="flex items-end gap-2 h-36 mt-4">
          {dayRevenue.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="text-[10px] font-bold text-sacred-deepmaroon hidden min-[400px]:block h-3">{v ? `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}` : ''}</div>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-sacred-maroon to-sacred-saffron min-h-[4px] transition-all"
                style={{ height: `${Math.max(3, Math.round((v / maxRev) * 100))}%` }}
                title={`${days[i].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ₹${v}`}
              />
              <div className="text-[10px] text-stone-500">{days[i].toLocaleDateString('en-IN', { weekday: 'narrow' })}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mt-4">
        {/* Order status funnel */}
        <div className="spiritual-card rounded-2xl p-6">
          <div className="font-sacred text-lg text-sacred-deepmaroon mb-4">Orders by Status</div>
          <div className="space-y-3">
            {ORDER_STATUSES.map(s => {
              const meta = STATUS_META[s];
              const count = statusCounts[s] || 0;
              const pct = stats.orders ? Math.round((count / stats.orders) * 100) : 0;
              return (
                <button key={s} onClick={() => setTab('orders')} className="block w-full text-left group">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5 group-hover:text-sacred-maroon"><span className={`w-2 h-2 rounded-full ${meta.dot}`} />{meta.label}</span>
                    <span className="text-stone-500 font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-stone-200/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${meta.dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
          <div className="font-sacred text-lg text-sacred-deepmaroon mb-1 flex items-center gap-2"><IconAlert className="w-5 h-5 text-red-500" /> Low Stock Alerts</div>
          <p className="text-[11px] text-stone-500 mb-3">10 or fewer left — refill soon</p>
          <div className="space-y-2">
            {lowStock.map(p => (
              <button key={p._id} onClick={() => setTab('products')} className="w-full flex flex-wrap items-center gap-3 border border-stone-100 rounded-xl p-2.5 hover:border-sacred-saffron transition text-left">
                <SmartImage src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{p.name}</div>
                  <div className="text-[11px] text-red-600 font-semibold">{p.stock} left · ₹{p.price}</div>
                </div>
              </button>
            ))}
            {lowStock.length === 0 && <div className="text-xs text-stone-400 py-6 text-center">All stocked up — nothing to refill.</div>}
          </div>
        </div>

        {/* Recent orders */}
        <div className="spiritual-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-sacred text-lg text-sacred-deepmaroon">Recent Orders</div>
            <button onClick={() => setTab('orders')} className="text-xs font-bold text-sacred-maroon hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {(orders || []).slice(0, 6).map(o => (
              <div key={o._id} className="flex items-center justify-between gap-3 border-b border-sacred-maroon/10 pb-2 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-sacred-maroon">{o.orderNumber || `#${(o._id || '').slice(-6)}`}</div>
                  <div className="text-[11px] text-stone-500 truncate">{o.user?.name || '—'} · {o.shippingAddress?.city}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">{fmtRs(o.total)}</div>
                  <StatusBadge status={o.orderStatus} />
                </div>
              </div>
            ))}
            {(orders || []).length === 0 && <div className="text-sm text-stone-400 py-6 text-center">No orders yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders tab — the heart of easy tracking                            */
/* ------------------------------------------------------------------ */

function OrdersTab({ orders, reload }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  // Calendar date-wise tracking (server-side via ?from=&to=)
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateLoading, setDateLoading] = useState(false);
  const firstDateRun = useRef(true);

  // Local YYYY-MM-DD (never UTC — toISOString() shifts the day for IST users)
  const toISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const activeRange = () => (from || to ? { from, to } : undefined);

  // Re-fetch from server whenever the calendar range changes (skip first render)
  useEffect(() => {
    if (firstDateRun.current) { firstDateRun.current = false; return; }
    setDateLoading(true);
    reload(activeRange()).finally(() => setDateLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const setPreset = (name) => {
    const now = new Date();
    const today = toISO(now);
    if (name === 'today') { setFrom(today); setTo(today); }
    else if (name === 'yesterday') { const y = new Date(now); y.setDate(y.getDate() - 1); setFrom(toISO(y)); setTo(toISO(y)); }
    else if (name === 'week') { const w = new Date(now); w.setDate(w.getDate() - 6); setFrom(toISO(w)); setTo(today); }
    else if (name === 'month') { const m = new Date(now); m.setDate(m.getDate() - 29); setFrom(toISO(m)); setTo(today); }
    else if (name === 'thisMonth') { const s = new Date(now.getFullYear(), now.getMonth(), 1); setFrom(toISO(s)); setTo(today); }
    else if (name === 'clear') { setFrom(''); setTo(''); }
  };

  const rangeLabel = from || to
    ? `${from ? new Date(from + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '…'} — ${to ? new Date(to + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '…'}`
    : 'All time';

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'all') list = list.filter(o => o.orderStatus === statusFilter);
    if (payFilter !== 'all') {
      if (payFilter === 'cod') list = list.filter(o => o.paymentMethod === 'cod');
      else if (payFilter === 'online') list = list.filter(o => o.paymentMethod !== 'cod');
      else list = list.filter(o => o.paymentStatus === payFilter);
    }
    if (dateFilter !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const cutoff = dateFilter === 'today' ? now - day : now - 7 * day;
      list = list.filter(o => new Date(o.createdAt).getTime() >= cutoff);
    }
    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(s) ||
        (o._id || '').toLowerCase().includes(s) ||
        (o.user?.name || '').toLowerCase().includes(s) ||
        (o.user?.email || '').toLowerCase().includes(s) ||
        (o.user?.phone || '').toLowerCase().includes(s) ||
        (o.shippingAddress?.phone || '').toLowerCase().includes(s) ||
        (o.shippingAddress?.fullName || '').toLowerCase().includes(s) ||
        (o.shippingAddress?.city || '').toLowerCase().includes(s) ||
        (o.items || []).some(it => (it.name || '').toLowerCase().includes(s))
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return (b.total || 0) - (a.total || 0);
      if (sortBy === 'lowest') return (a.total || 0) - (b.total || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [orders, statusFilter, payFilter, dateFilter, search, sortBy]);

  const updateStatus = async (order, newStatus, paymentStatus) => {
    setUpdatingId(order._id);
    try {
      await api.put(`/orders/${order._id}/status`, { orderStatus: newStatus, paymentStatus, note: notes[order._id] || '' });
      toast.success(`${order.orderNumber} → ${newStatus ? STATUS_META[newStatus].label : paymentStatus}`);
      setNotes(prev => ({ ...prev, [order._id]: '' }));
      await reload(activeRange());
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
    finally { setUpdatingId(null); }
  };

  const copyId = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success('Order ID copied'); } catch {}
  };

  const exportCSV = () => {
    const rows = [['Order ID', 'Date', 'Customer', 'Phone', 'City', 'Items', 'Total', 'Payment', 'PayStatus', 'Status']];
    filtered.forEach(o => {
      rows.push([
        o.orderNumber || o._id,
        new Date(o.createdAt).toLocaleString('en-IN'),
        o.user?.name || o.shippingAddress?.fullName || '',
        o.user?.phone || o.shippingAddress?.phone || '',
        o.shippingAddress?.city || '',
        (o.items || []).map(i => `${i.name} x${i.quantity}`).join(' | '),
        o.total, o.paymentMethod, o.paymentStatus, o.orderStatus,
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `orders-${toISO(new Date())}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const counts = {};
  ORDER_STATUSES.forEach(s => { counts[s] = orders.filter(o => o.orderStatus === s).length; });
  const needsAction = (counts.pending || 0) + (counts.confirmed || 0);
  const inTransit = (counts.shipped || 0) + (counts['out-for-delivery'] || 0);
  const deliveredToday = orders.filter(o => o.orderStatus === 'delivered' && (Date.now() - new Date(o.createdAt).getTime()) < 24 * 60 * 60 * 1000).length;
  const filteredRevenue = filtered.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="mt-6 min-w-0 max-w-full overflow-x-clip">
      {/* At-a-glance strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className={`rounded-2xl border p-3 sm:p-4 min-w-0 ${needsAction ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="text-[10px] sm:text-[11px] font-bold text-amber-700 tracking-wide flex items-center gap-1.5"><IconAlert className="w-4 h-4 shrink-0" /> <span className="truncate">NEEDS ACTION</span></div>
          <div className="text-xl sm:text-2xl font-bold mt-1 tabular-nums">{needsAction}</div>
          <div className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">pending + confirmed — confirm and ship fast</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 min-w-0">
          <div className="text-[10px] sm:text-[11px] font-bold text-cyan-700 tracking-wide flex items-center gap-1.5"><IconTruck className="w-4 h-4 shrink-0" /> <span className="truncate">IN TRANSIT</span></div>
          <div className="text-xl sm:text-2xl font-bold mt-1 tabular-nums">{inTransit}</div>
          <div className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">shipped + out for delivery</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 min-w-0">
          <div className="text-[10px] sm:text-[11px] font-bold text-green-700 tracking-wide flex items-center gap-1.5"><IconCheckCircle className="w-4 h-4 shrink-0" /> <span className="truncate">DELIVERED (24H)</span></div>
          <div className="text-xl sm:text-2xl font-bold mt-1 tabular-nums">{deliveredToday}</div>
          <div className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">completed in last 24 hours</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 min-w-0">
          <div className="text-[10px] sm:text-[11px] font-bold text-primary tracking-wide flex items-center gap-1.5"><IconCash className="w-4 h-4 shrink-0" /> <span className="truncate">FILTERED REVENUE</span></div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-primary break-words">{fmtRs(filteredRevenue)}</div>
          <div className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">{filtered.length} order(s) in view</div>
        </div>
      </div>

      {/* Date-wise tracking — calendar range */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm mt-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 shrink-0"><IconBox className="w-4 h-4 text-sacred-maroon" /> Orders by date</span>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 min-w-0">
              <span className="shrink-0">From</span>
              <input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)}
                className="border border-gray-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0 w-full sm:w-auto" />
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 min-w-0">
              <span className="shrink-0">To</span>
              <input type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)}
                className="border border-gray-200 rounded-full px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0 w-full sm:w-auto" />
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0">
            {['today', 'yesterday', 'week', 'month', 'thisMonth'].map(p => (
              <button key={p} onClick={() => setPreset(p)}
                className="shrink-0 whitespace-nowrap text-[11px] font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition capitalize">
                {p === 'week' ? 'Last 7 days' : p === 'month' ? 'Last 30 days' : p === 'thisMonth' ? 'This month' : p}
              </button>
            ))}
            {(from || to) && (
              <button onClick={() => setPreset('clear')}
                className="shrink-0 whitespace-nowrap text-[11px] font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition">
                Clear dates
              </button>
            )}
          </div>
          <span className="text-[11px] text-gray-500 sm:ml-auto shrink-0">
            {dateLoading ? 'Loading…' : <><b className="text-gray-800">{orders.length}</b> order(s) · {rangeLabel}</>}
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm mt-4 min-w-0">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0">
          <button onClick={() => setStatusFilter('all')}
            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}>
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}>
              {STATUS_META[s].label} ({counts[s] || 0})
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, name, phone, city, item…"
            className="w-full min-w-0 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="w-full min-w-0 border border-gray-200 rounded-full px-4 py-2 text-sm bg-white">
            <option value="all">All payments</option>
            <option value="cod">COD orders</option>
            <option value="online">Online orders</option>
            <option value="paid">Paid</option>
            <option value="pending">Payment pending</option>
            <option value="failed">Payment failed</option>
          </select>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full min-w-0 border border-gray-200 rounded-full px-4 py-2 text-sm bg-white">
            <option value="all">All time</option>
            <option value="today">Last 24 hours</option>
            <option value="week">Last 7 days</option>
          </select>
          <div className="flex gap-2 min-w-0">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 min-w-0 border border-gray-200 rounded-full px-4 py-2 text-sm bg-white">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest value</option>
              <option value="lowest">Lowest value</option>
            </select>
            <button onClick={exportCSV} className="shrink-0 text-xs font-bold border border-gray-200 rounded-full px-4 py-2 hover:border-primary hover:text-primary whitespace-nowrap flex items-center gap-1.5">
              <IconDownload className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Order list */}
      <div className="space-y-3 mt-4 min-w-0">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed p-12 text-center text-gray-400 text-sm">No orders match this filter.</div>
        )}
        {filtered.map(o => {
          const open = openId === o._id;
          const itemCount = (o.items || []).reduce((s, i) => s + i.quantity, 0);
          return (
            <div key={o._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden min-w-0 max-w-full ${o.orderStatus === 'pending' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}>
              {/* Header row — stacks vertically on mobile, side-by-side on sm+ */}
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 min-w-0">
                <button onClick={() => setOpenId(open ? null : o._id)} className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">{o.orderNumber?.slice(-3) || 'ORD'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-primary flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{o.orderNumber || `#${(o._id || '').slice(-6)}`}</span>
                      {o.orderStatus === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" title="Needs action" />}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{fmtDate(o.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'}</div>
                    {/* Customer line — visible on mobile (hidden on sm+ where the dedicated column shows) */}
                    <div className="text-[11px] text-gray-500 truncate sm:hidden">{o.user?.name || o.shippingAddress?.fullName || '—'} · {o.user?.phone || o.shippingAddress?.phone} · {o.shippingAddress?.city}</div>
                  </div>
                  {/* Price — inline on mobile, right-aligned column on sm+ */}
                  <div className="text-right shrink-0 sm:hidden">
                    <div className="font-bold text-primary text-sm">{fmtRs(o.total)}</div>
                    <div className="text-[10px] text-gray-400">{o.paymentMethod?.toUpperCase()} · <span className={o.paymentStatus === 'paid' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{o.paymentStatus}</span></div>
                  </div>
                </button>
                <div className="hidden sm:block text-xs text-gray-600 min-w-[150px] max-w-[200px] flex-1">
                  <div className="font-semibold truncate">{o.user?.name || o.shippingAddress?.fullName || '—'}</div>
                  <div className="text-gray-400 truncate">{o.user?.phone || o.shippingAddress?.phone} · {o.shippingAddress?.city}</div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <div className="font-bold text-primary">{fmtRs(o.total)}</div>
                  <div className="text-[10px] text-gray-400">{o.paymentMethod?.toUpperCase()} · <span className={o.paymentStatus === 'paid' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{o.paymentStatus}</span></div>
                </div>
                {/* Inline status update — full-width row on mobile */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={() => copyId(o.orderNumber || o._id)} title="Copy Order ID" className="w-8 h-8 shrink-0 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary text-xs">
                    ⧉
                  </button>
                  <select
                    value={o.orderStatus}
                    disabled={updatingId === o._id}
                    onChange={e => updateStatus(o, e.target.value)}
                    className="flex-1 sm:flex-none min-w-0 border border-gray-200 rounded-full px-3 py-2 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 cursor-pointer">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                  <button onClick={() => setOpenId(open ? null : o._id)} className="w-8 h-8 shrink-0 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-cream">
                    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>

              {/* Quick next-step actions */}
              {!open && o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled' && (
                <div className="px-3 sm:px-4 pb-3 flex gap-2 border-t border-gray-50 pt-3 overflow-x-auto sm:flex-wrap">
                  {FLOW.slice(FLOW.indexOf(o.orderStatus) + 1, FLOW.indexOf(o.orderStatus) + 2).map(ns => (
                    <button key={ns} onClick={() => updateStatus(o, ns)} disabled={updatingId === o._id}
                      className="shrink-0 whitespace-nowrap text-[11px] font-bold px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50">
                      {updatingId === o._id ? 'Saving…' : `Mark ${STATUS_META[ns].label} →`}
                    </button>
                  ))}
                  {FLOW.slice(FLOW.indexOf(o.orderStatus) + 1).map(ns => (
                    <button key={ns} onClick={() => updateStatus(o, ns)} disabled={updatingId === o._id}
                      className="shrink-0 whitespace-nowrap text-[11px] font-bold px-3 py-1.5 rounded-full border transition disabled:opacity-50 bg-white border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
                      {STATUS_META[ns].label}
                    </button>
                  ))}
                  {o.orderStatus !== 'cancelled' && (
                    <button onClick={() => updateStatus(o, 'cancelled')} disabled={updatingId === o._id}
                      className="shrink-0 whitespace-nowrap text-[11px] font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50 sm:ml-auto">
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {/* Expanded detail */}
              {open && (
                <div className="border-t border-gray-100 bg-cream/40 p-3 sm:p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 animate-fadeIn min-w-0">
                  {/* Timeline */}
                  <div className="md:col-span-2 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold">Order Timeline</div>
                      <StatusBadge status={o.orderStatus} />
                    </div>
                    <div className="space-y-0">
                      {(o.statusHistory && o.statusHistory.length ? o.statusHistory : [{ status: o.orderStatus, timestamp: o.createdAt, note: '' }])
                        .slice().reverse().map((h, i, arr) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span className={`w-3 h-3 rounded-full mt-1 ring-4 ring-white ${STATUS_META[h.status]?.dot || 'bg-gray-300'}`} />
                              {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-gray-200 my-1" />}
                            </div>
                            <div className="pb-4">
                              <div className="text-sm font-semibold text-gray-800">{STATUS_META[h.status]?.label || h.status}</div>
                              <div className="text-[11px] text-gray-500">{fmtDate(h.timestamp)}</div>
                              {h.note && <div className="text-xs text-gray-600 mt-0.5 break-words">{h.note}</div>}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Items */}
                    <div className="mt-2">
                      <div className="text-sm font-bold mb-2">Items</div>
                      <div className="divide-y divide-gray-100 border rounded-xl bg-white overflow-hidden">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 text-sm">
                            <SmartImage src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{it.name}</div>
                              <div className="text-xs text-gray-500">Qty {it.quantity} × {fmtRs(it.price)}</div>
                            </div>
                            <div className="font-bold shrink-0">{fmtRs(it.price * it.quantity)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Side: customer, address, totals, note */}
                  <div className="space-y-4 min-w-0">
                    <div className="bg-white rounded-xl border p-4">
                      <div className="text-sm font-bold mb-2">Customer</div>
                      <div className="text-xs space-y-1 text-gray-600 break-words">
                        <div className="break-all"><b>{o.user?.name || o.shippingAddress?.fullName || '—'}</b> {o.user?.email && `(${o.user.email})`}</div>
                        <div className="flex items-center gap-1"><IconPhone className="w-3.5 h-3.5" /> {o.user?.phone || o.shippingAddress?.phone}</div>
                        <div>{o.shippingAddress?.fullName}<br />{o.shippingAddress?.address}<br />{o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}</div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {(o.user?.phone || o.shippingAddress?.phone) && (
                          <a href={`tel:${o.user?.phone || o.shippingAddress?.phone}`} className="flex-1 text-center text-[11px] font-bold border border-gray-200 rounded-full py-1.5 hover:border-primary hover:text-primary flex items-center justify-center gap-1"><IconPhone className="w-3.5 h-3.5" /> Call</a>
                        )}
                        <button onClick={() => copyId(o.orderNumber || o._id)} className="flex-1 text-[11px] font-bold border border-gray-200 rounded-full py-1.5 hover:border-primary hover:text-primary flex items-center justify-center gap-1"><IconCopy className="w-3.5 h-3.5" /> Copy ID</button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border p-4 text-xs space-y-1.5">
                      <div className="text-sm font-bold mb-2">Payment</div>
                      <div className="flex justify-between text-gray-600"><span>Subtotal</span><b>{fmtRs(o.subtotal)}</b></div>
                      <div className="flex justify-between text-gray-600"><span>Shipping</span><b>{o.shippingCharge ? fmtRs(o.shippingCharge) : 'FREE'}</b></div>
                      <div className="flex justify-between border-t pt-1.5"><span>Total</span><b className="text-primary">{fmtRs(o.total)}</b></div>
                      <div className="text-gray-400">{o.paymentMethod?.toUpperCase()} · <span className={o.paymentStatus === 'paid' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{o.paymentStatus}</span></div>
                      {o.paymentId && <div className="text-gray-400 truncate">Ref: {o.paymentId}</div>}
                      {o.paymentStatus !== 'paid' && (
                        <button onClick={() => updateStatus(o, o.orderStatus, 'paid')} disabled={updatingId === o._id} className="w-full mt-1 text-[11px] font-bold bg-green-600 text-white rounded-full py-1.5 hover:bg-green-700 disabled:opacity-50">
                          Mark Paid
                        </button>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border p-4">
                      <div className="text-sm font-bold mb-2">Add note + update status</div>
                      <input value={notes[o._id] || ''} onChange={e => setNotes(prev => ({ ...prev, [o._id]: e.target.value }))}
                        placeholder="e.g. Delivery delayed by 1 day…" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2">
                        <select value={o.orderStatus} onChange={e => updateStatus(o, e.target.value)} disabled={updatingId === o._id} className="w-full min-w-0 border border-gray-200 rounded-full px-3 py-2 text-xs font-semibold bg-white disabled:opacity-50 max-w-full">
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                        </select>
                        <button onClick={() => updateStatus(o, o.orderStatus)} disabled={updatingId === o._id}
                          className="text-xs font-bold bg-primary text-white rounded-full py-2 disabled:opacity-50">
                          {updatingId === o._id ? 'Saving…' : 'Save note'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories tab                                                     */
/* ------------------------------------------------------------------ */

function CategoriesTab({ categories, onChanged }) {
  const [form, setForm] = useState({ name: '', description: '', parent: '', image: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const topCats = categories.filter(c => !c.parent);

  const resetForm = () => { setForm({ name: '', description: '', parent: '', image: '' }); setFile(null); setPreview(''); setEditingId(null); };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', parent: cat.parent?._id || cat.parent || '', image: cat.image || '' });
    setFile(null); setPreview('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (form.parent) fd.append('parent', form.parent);
      if (form.image) fd.append('image', form.image);
      if (file) fd.append('imageFile', file);

      if (editingId) {
        await api.put(`/categories/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created');
      }
      resetForm();
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save category'); }
    finally { setUploading(false); }
  };

  const remove = async (cat) => {
    const hasChildren = categories.some(c => (c.parent?._id || c.parent) === cat._id);
    const msg = hasChildren
      ? `Delete "${cat.name}" and move its ${categories.filter(c => (c.parent?._id || c.parent) === cat._id).length} sub-categor(ies) to top level?`
      : `Delete category "${cat.name}"?`;
    if (!window.confirm(msg)) return;
    setBusyId(cat._id);
    try { await api.delete(`/categories/${cat._id}`); toast.success('Category deleted'); onChanged(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setBusyId(null); }
  };

  return (
    <div className="mt-6 grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
          <h3 className="font-bold text-lg">{editingId ? 'Edit Category' : 'Add Category / Sub-category'}</h3>
          <p className="text-xs text-gray-500 mb-4">Category image is <b>required</b> — it shows on the homepage cards automatically. Upload via Cloudinary or paste a URL.</p>
          <form onSubmit={save} className="space-y-3">
            <Field label="Name *">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sambrani Cup" className={inputCls} />
            </Field>
            <Field label="Type">
              <select value={form.parent} onChange={e => setForm({ ...form, parent: e.target.value })} className={inputCls}>
                <option value="">Top-level category</option>
                {topCats.map(c => <option key={c._id} value={c._id}>Sub-category of {c.name}</option>)}
              </select>
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Short description" className={inputCls} />
            </Field>
            <div className="border-2 border-dashed border-accent/20 rounded-xl p-4 bg-cream/50">
              <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><IconCloud className="w-4 h-4" /> Category Image * (required — homepage)</div>
              <input type="file" accept="image/*" onChange={handleFile} className="w-full text-xs" />
              <div className="flex items-center gap-3 mt-2">
                {preview && <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />}
                {!preview && <SmartImage src={form.image} className="w-16 h-16 rounded-lg object-cover border" />}
              </div>
              <div className="text-[11px] text-gray-500 mt-2">Or paste image URL</div>
              <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://res.cloudinary.com/…" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" />
            </div>
            <div className="flex gap-2 pt-1">
              <button disabled={uploading} className="flex-1 bg-primary text-white rounded-full py-3 font-bold text-sm disabled:opacity-50">
                {uploading ? 'Saving…' : editingId ? 'Update Category' : 'Create Category'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-1">All Categories ({categories.length})</h3>
          <p className="text-xs text-gray-500 mb-4">These drive the homepage and the navbar menu automatically.</p>
          <div className="space-y-2">
            {categories.map(c => {
              const sub = c.parent?.name || (c.parent ? categories.find(x => x._id === c.parent)?.name : '');
              return (
                <div key={c._id} className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-xl p-3 hover:border-primary/20 transition">
                  <SmartImage src={c.image} alt={c.name} className="w-12 h-12 rounded-xl object-cover border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-2 min-w-0"><span className="truncate">{c.name}</span>
                      {sub && <span className="shrink-0 text-[10px] bg-accent/10 text-accent-dark border border-accent/20 px-2 py-0.5 rounded-full font-bold uppercase">Sub · {sub}</span>}
                    </div>
                    <div className="text-[11px] text-gray-500 break-all">/{c.slug} · {c.productCount || 0} product{c.productCount === 1 ? '' : 's'}</div>
                  </div>
                  <div className="flex gap-1.5 w-full sm:w-auto">
                    <button onClick={() => startEdit(c)} className="flex-1 sm:flex-none text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary">Edit</button>
                    <button onClick={() => remove(c)} disabled={busyId === c._id} className="flex-1 sm:flex-none text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && <div className="text-sm text-gray-400 py-8 text-center">No categories yet. Add your first one — it will appear on the homepage & navbar right away.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DhenuVera tab — dedicated sub-category + product uploads         */
/* ------------------------------------------------------------------ */

function DhenuVeraTab({ categories, products, onChanged }) {
  const parent = categories.find((c) => !c.parent && /dhenu|puja|ritual/i.test(`${c.name || ''} ${c.slug || ''}`));
  const subs = parent
    ? categories.filter((c) => String(c.parent?._id || c.parent || '') === String(parent._id))
    : [];
  const scopeIds = parent ? [String(parent._id), ...subs.map((s) => String(s._id))] : [];
  const dhenuProducts = products.filter((p) => scopeIds.includes(String(p.category?._id || p.category || '')));

  // Parent-category form (only when no DhenuVera parent exists yet)
  const [pName, setPName] = useState('DhenuVera');
  const [pDesc, setPDesc] = useState('Sacred cow-dung incense — Sambrani Cups, Cone Dhoop & Dhoop Sticks.');
  const [pImage, setPImage] = useState('');
  const [pFile, setPFile] = useState(null);
  const [pBusy, setPBusy] = useState(false);

  const createParent = async (e) => {
    e.preventDefault();
    setPBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', pName);
      fd.append('description', pDesc);
      if (pImage) fd.append('image', pImage);
      if (pFile) fd.append('imageFile', pFile);
      await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('DhenuVera parent category created');
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create category'); }
    finally { setPBusy(false); }
  };

  // Sub-category form
  const [subForm, setSubForm] = useState({ name: '', description: '', image: '' });
  const [subFile, setSubFile] = useState(null);
  const [subPreview, setSubPreview] = useState('');
  const [subEditingId, setSubEditingId] = useState(null);
  const [subBusy, setSubBusy] = useState(false);

  const resetSub = () => { setSubForm({ name: '', description: '', image: '' }); setSubFile(null); setSubPreview(''); setSubEditingId(null); };
  const startSubEdit = (c) => {
    setSubEditingId(c._id);
    setSubForm({ name: c.name, description: c.description || '', image: c.image || '' });
    setSubFile(null); setSubPreview('');
  };
  const saveSub = async (e) => {
    e.preventDefault();
    setSubBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', subForm.name);
      fd.append('description', subForm.description);
      if (!subEditingId) fd.append('parent', parent._id);
      if (subForm.image) fd.append('image', subForm.image);
      if (subFile) fd.append('imageFile', subFile);
      if (subEditingId) {
        await api.put(`/categories/${subEditingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Sub-category updated');
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('DhenuVera sub-category created');
      }
      resetSub();
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save sub-category'); }
    finally { setSubBusy(false); }
  };
  const removeSub = async (c) => {
    const n = dhenuProducts.filter((p) => String(p.category?._id || p.category || '') === String(c._id)).length;
    if (!window.confirm(n ? `"${c.name}" has ${n} product(s). Delete it? (Products stay but lose their category link.)` : `Delete sub-category "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c._id}`); toast.success('Sub-category deleted'); onChanged(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  // Product form (scoped to DhenuVera categories)
  const emptyProduct = { name: '', category: '', price: '', comparePrice: '', stock: '100', unit: 'pack', weight: '', shortDescription: '', description: '', tags: '', images: '', isFeatured: true };
  const [prodForm, setProdForm] = useState(emptyProduct);
  const [prodFiles, setProdFiles] = useState([]);
  const [prodPreviews, setProdPreviews] = useState([]);
  const [prodEditingId, setProdEditingId] = useState(null);
  const [prodBusy, setProdBusy] = useState(false);

  const resetProd = () => { setProdForm({ ...emptyProduct, category: subs[0]?._id || parent?._id || '' }); setProdFiles([]); setProdPreviews([]); setProdEditingId(null); };
  const startProdEdit = (p) => {
    setProdEditingId(p._id);
    setProdForm({
      name: p.name, category: p.category?._id || p.category || '', price: p.price,
      comparePrice: p.comparePrice || '', stock: p.stock, unit: p.unit || 'pack', weight: p.weight || '',
      shortDescription: p.shortDescription || '', description: p.description || '',
      tags: (p.tags || []).join(', '), images: (p.images || []).join(', '), isFeatured: !!p.isFeatured,
    });
    setProdFiles([]); setProdPreviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const saveProd = async (e) => {
    e.preventDefault();
    if (!prodForm.category) { toast.error('Pick a DhenuVera sub-category'); return; }
    setProdBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', prodForm.name);
      fd.append('description', prodForm.description);
      fd.append('shortDescription', prodForm.shortDescription);
      fd.append('price', prodForm.price);
      if (prodForm.comparePrice) fd.append('comparePrice', prodForm.comparePrice);
      fd.append('category', prodForm.category);
      fd.append('stock', prodForm.stock);
      fd.append('unit', prodForm.unit);
      fd.append('weight', prodForm.weight);
      fd.append('isFeatured', prodForm.isFeatured);
      fd.append('tags', prodForm.tags);
      if (prodForm.images) fd.append('images', prodForm.images.split(',').map((s) => s.trim()).filter(Boolean).join(','));
      prodFiles.forEach((f) => fd.append('imageFiles', f));
      if (prodEditingId) {
        await api.put(`/products/${prodEditingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('DhenuVera product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('DhenuVera product created');
      }
      resetProd();
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
    finally { setProdBusy(false); }
  };
  const removeProd = async (p) => {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    try { await api.delete(`/products/${p._id}`); toast.success('Product deleted'); onChanged(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const catOptions = parent ? [{ _id: String(parent._id), name: `${parent.name} (general)` }, ...subs] : [];

  return (
    <div className="mt-6">
      {/* Header strip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sacred-deepmaroon via-sacred-maroon to-[#142808] text-white p-5 md:p-6">
        <div className="om-watermark absolute -right-4 -top-8 text-[120px] hidden sm:block" style={{ WebkitTextStroke: '1px rgba(245,165,36,0.25)', color: 'transparent' }}>ॐ</div>
        <div className="relative flex flex-wrap items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-white/10 border border-sacred-diya/40 flex items-center justify-center shrink-0">
            <IconFlame className="w-6 h-6 text-sacred-diya" />
          </span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[10px] font-bold tracking-[0.24em] text-sacred-diya">DHENUVERA STUDIO</div>
            <div className="font-sacred text-xl text-[#FFF6E5]">DhenuVera Uploads</div>
            <div className="text-[11px] text-white/60 mt-0.5">{subs.length} sub-categor{subs.length === 1 ? 'y' : 'ies'} · {dhenuProducts.length} product{dhenuProducts.length === 1 ? '' : 's'} — live in the homepage DhenuVera section</div>
          </div>
        </div>
      </div>

      {/* Step 1 — parent category (only when missing) */}
      {!parent && (
        <div className="mt-4 bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg">Step 1 — Create the DhenuVera parent category</h3>
          <p className="text-xs text-gray-500 mt-1">Sub-categories (Sambrani Cup, Cone Dhoop, Stick Dhoop) will live under it, and the homepage section picks them up automatically.</p>
          <form onSubmit={createParent} className="grid md:grid-cols-2 gap-3 mt-4">
            <Field label="Name *">
              <input required value={pName} onChange={(e) => setPName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Image * (upload or URL)">
              <div className="flex gap-2">
                <input value={pImage} onChange={(e) => setPImage(e.target.value)} placeholder="https://res.cloudinary.com/…" className={inputCls} />
                <label className="shrink-0 cursor-pointer text-xs font-bold border border-gray-200 rounded-xl px-4 flex items-center gap-1.5 hover:border-primary hover:text-primary">
                  <IconCloud className="w-4 h-4" /> Upload
                  <input type="file" accept="image/*" onChange={(e) => setPFile(e.target.files[0] || null)} className="hidden" />
                </label>
              </div>
              {pFile && <div className="text-[11px] text-green-700 mt-1">Selected: {pFile.name}</div>}
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <input value={pDesc} onChange={(e) => setPDesc(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <button disabled={pBusy} className="bg-primary text-white rounded-full px-8 py-3 font-bold text-sm disabled:opacity-50">
                {pBusy ? 'Creating…' : 'Create DhenuVera Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {parent && (
        <div className="mt-4 grid lg:grid-cols-2 gap-4 md:gap-6 items-start">
          {/* Sub-category upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-lg">{subEditingId ? 'Edit Sub-category' : 'Add DhenuVera Sub-category'}</h3>
            <p className="text-xs text-gray-500 mb-4">Under <b>{parent.name}</b> — e.g. Sambrani Cup, Cone Dhoop, Stick Dhoop. Image is required.</p>
            <form onSubmit={saveSub} className="space-y-3">
              <Field label="Name *">
                <input required value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Sambrani Cup" className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} rows={2} placeholder="Short description" className={inputCls} />
              </Field>
              <div className="border-2 border-dashed border-accent/20 rounded-xl p-4 bg-cream/50">
                <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><IconCloud className="w-4 h-4" /> Sub-category Image *</div>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; setSubFile(f || null); setSubPreview(f ? URL.createObjectURL(f) : ''); }} className="w-full text-xs" />
                {(subPreview || subForm.image) && <img src={subPreview || subForm.image} alt="preview" className="w-full h-28 rounded-lg object-cover border mt-2" />}
                <div className="text-[11px] text-gray-500 mt-2">Or paste image URL</div>
                <input value={subForm.image} onChange={(e) => setSubForm({ ...subForm, image: e.target.value })} placeholder="https://res.cloudinary.com/…" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" />
              </div>
              <div className="flex gap-2">
                <button disabled={subBusy} className="flex-1 bg-primary text-white rounded-full py-3 font-bold text-sm disabled:opacity-50">
                  {subBusy ? 'Saving…' : subEditingId ? 'Update Sub-category' : 'Create Sub-category'}
                </button>
                {subEditingId && <button type="button" onClick={resetSub} className="px-4 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>}
              </div>
            </form>

            <div className="mt-5 space-y-2">
              {subs.map((c) => {
                const n = dhenuProducts.filter((p) => String(p.category?._id || p.category || '') === String(c._id)).length;
                return (
                  <div key={c._id} className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-xl p-2.5 hover:border-primary/20 transition">
                    <SmartImage src={c.image} alt={c.name} className="w-11 h-11 rounded-xl object-cover border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{c.name}</div>
                      <div className="text-[11px] text-gray-500">/{c.slug} · {n} product{n === 1 ? '' : 's'}</div>
                    </div>
                    <button onClick={() => startSubEdit(c)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary">Edit</button>
                    <button onClick={() => removeSub(c)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                );
              })}
              {subs.length === 0 && <div className="text-xs text-gray-400 py-4 text-center">No sub-categories yet — add Sambrani Cup, Cone Dhoop, Stick Dhoop above.</div>}
            </div>
          </div>

          {/* Product upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-lg">{prodEditingId ? 'Edit DhenuVera Product' : 'Add DhenuVera Product'}</h3>
            <p className="text-xs text-gray-500 mb-4">Products here are scoped to DhenuVera categories and appear in the homepage section + shop.</p>
            <form onSubmit={saveProd} className="space-y-3">
              <Field label="Product Name *">
                <input required value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} placeholder="e.g. Sambrani Cup Guggal — Pack of 12" className={inputCls} />
              </Field>
              <Field label="Sub-category *">
                <select required value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} className={inputCls}>
                  <option value="">Select sub-category…</option>
                  {catOptions.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price ₹ *">
                  <input required type="number" min="0" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} placeholder="199" className={inputCls} />
                </Field>
                <Field label="Compare ₹">
                  <input type="number" min="0" value={prodForm.comparePrice} onChange={(e) => setProdForm({ ...prodForm, comparePrice: e.target.value })} placeholder="249" className={inputCls} />
                </Field>
                <Field label="Stock *">
                  <input type="number" min="0" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight">
                  <input value={prodForm.weight} onChange={(e) => setProdForm({ ...prodForm, weight: e.target.value })} placeholder="12 cups" className={inputCls} />
                </Field>
                <Field label="Unit">
                  <input value={prodForm.unit} onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })} placeholder="pack" className={inputCls} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={prodForm.isFeatured} onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="font-semibold text-gray-700">Feature in homepage bestsellers</span>
              </label>
              <Field label="Full description *">
                <textarea required rows={2} value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} placeholder="Fragrance, burn time, how to use…" className={inputCls} />
              </Field>
              <Field label="Tags (comma separated)">
                <input value={prodForm.tags} onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })} placeholder="dhenuvera, sambrani, guggal" className={inputCls} />
              </Field>
              <div className="border-2 border-dashed border-accent/20 rounded-xl p-4 bg-cream/50">
                <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><IconCloud className="w-4 h-4" /> Product Images (up to 5)</div>
                <input type="file" multiple accept="image/*" onChange={(e) => { const arr = Array.from(e.target.files).slice(0, 5); setProdFiles(arr); setProdPreviews(arr.map((f) => URL.createObjectURL(f))); }} className="w-full text-xs" />
                {prodPreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {prodPreviews.map((src, i) => <img key={i} src={src} alt={`preview ${i + 1}`} className="w-14 h-14 rounded-lg object-cover border" />)}
                  </div>
                )}
                <div className="text-[11px] text-gray-500 mt-2">Or paste image URLs (comma separated)</div>
                <input value={prodForm.images} onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })} placeholder="https://res.cloudinary.com/…" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" />
              </div>
              <div className="flex gap-2">
                <button disabled={prodBusy} className="flex-1 bg-primary text-white rounded-full py-3 font-bold text-sm disabled:opacity-50">
                  {prodBusy ? 'Saving…' : prodEditingId ? 'Update Product' : 'Create Product'}
                </button>
                {prodEditingId && <button type="button" onClick={resetProd} className="px-4 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>}
              </div>
            </form>

            <div className="mt-5 space-y-2 max-h-[420px] overflow-auto pr-1">
              {dhenuProducts.map((p) => (
                <div key={p._id} className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-xl p-2.5">
                  <SmartImage src={p.images?.[0]} alt={p.name} className="w-11 h-11 rounded-xl object-cover border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="text-[11px] text-gray-500">{fmtRs(p.price)} · {p.stock} in stock {p.isActive ? '' : '· Hidden'}</div>
                  </div>
                  <button onClick={() => startProdEdit(p)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary">Edit</button>
                  <button onClick={() => removeProd(p)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
                </div>
              ))}
              {dhenuProducts.length === 0 && <div className="text-xs text-gray-400 py-4 text-center">No DhenuVera products yet — add your first one above.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Banners tab — homepage hero slider                               */
/* ------------------------------------------------------------------ */

function BannersTab({ banners, onChanged }) {
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', sortOrder: '0', isActive: true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const resetForm = () => {
    setForm({ title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', sortOrder: '0', isActive: true });
    setFile(null); setPreview(''); setEditingId(null);
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title: b.title || '', subtitle: b.subtitle || '', image: b.image || '',
      link: b.link || '', buttonText: b.buttonText || 'Shop Now',
      sortOrder: String(b.sortOrder ?? 0), isActive: b.isActive !== false,
    });
    setFile(null); setPreview('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subtitle', form.subtitle);
      if (form.image) fd.append('image', form.image);
      fd.append('link', form.link);
      fd.append('buttonText', form.buttonText);
      fd.append('sortOrder', form.sortOrder);
      fd.append('isActive', form.isActive);
      if (file) fd.append('imageFile', file);

      if (editingId) {
        await api.put(`/banners/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Banner updated');
      } else {
        await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Banner created — live on homepage');
      }
      resetForm();
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save banner'); }
    finally { setUploading(false); }
  };

  const toggleActive = async (b) => {
    setBusyId(b._id);
    try {
      await api.put(`/banners/${b._id}`, { isActive: !b.isActive });
      toast.success(b.isActive ? 'Banner hidden from homepage' : 'Banner live on homepage');
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBusyId(null); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    setBusyId(b._id);
    try { await api.delete(`/banners/${b._id}`); toast.success('Banner deleted'); onChanged(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setBusyId(null); }
  };

  const shown = preview || form.image;

  return (
    <div className="mt-6 grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
          <h3 className="font-bold text-lg">{editingId ? 'Edit Banner' : 'Add Homepage Banner'}</h3>
          <p className="text-xs text-gray-500 mb-4">Banners appear in the homepage hero slider, in display order. Images are shown clean — upload wide shots (1600×600 recommended).</p>
          <form onSubmit={save} className="space-y-3">
            <Field label="Title *">
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. DhenuVera Festive Collection" className={inputCls} />
            </Field>
            <Field label="Subtitle">
              <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Sambrani Cups & Cone Dhoop in 6 fragrances" className={inputCls} />
            </Field>
            <div className="border-2 border-dashed border-accent/20 rounded-xl p-4 bg-cream/50">
              <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><IconCloud className="w-4 h-4" /> Banner Image * (wide, landscape)</div>
              <input type="file" accept="image/*" onChange={handleFile} className="w-full text-xs" />
              {shown && <img src={shown} alt="banner preview" className="w-full h-32 rounded-lg object-cover border mt-2" />}
              <div className="text-[11px] text-gray-500 mt-2">Or paste image URL</div>
              <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://res.cloudinary.com/…" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Link (optional)">
                <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="/category/sambrani-cup" className={inputCls} />
              </Field>
              <Field label="Button text">
                <input value={form.buttonText} onChange={e => setForm({ ...form, buttonText: e.target.value })} placeholder="Shop Now" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <Field label="Display order">
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className={inputCls} />
              </Field>
              <label className="flex items-center gap-2 text-sm pb-2.5">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="font-semibold text-gray-700">Show live</span>
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button disabled={uploading} className="flex-1 bg-primary text-white rounded-full py-3 font-bold text-sm disabled:opacity-50">
                {uploading ? 'Saving…' : editingId ? 'Update Banner' : 'Create Banner'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-1">All Banners ({banners.length})</h3>
          <p className="text-xs text-gray-500 mb-4">Lower display order shows first. Hidden banners stay saved but off the homepage.</p>
          <div className="space-y-3">
            {[...banners].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((b, i) => (
              <div key={b._id} className={`border rounded-2xl overflow-hidden ${b.isActive ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-80'}`}>
                <img src={b.image} alt={b.title} className="w-full h-36 object-cover" />
                <div className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-sacred-maroon/5 border border-sacred-maroon/15 flex items-center justify-center text-xs font-bold text-sacred-maroon shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{b.title}</div>
                    <div className="text-[11px] text-gray-500 truncate">{b.subtitle || 'No subtitle'} · Order {b.sortOrder ?? 0}</div>
                    <div className="mt-1">{b.isActive
                      ? <span className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Live</span>
                      : <span className="text-[11px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">Hidden</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 shrink-0 max-w-full">
                    <button onClick={() => startEdit(b)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary">Edit</button>
                    <button onClick={() => toggleActive(b)} disabled={busyId === b._id} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:border-accent hover:text-accent-dark disabled:opacity-50">{b.isActive ? 'Hide' : 'Show'}</button>
                    <button onClick={() => remove(b)} disabled={busyId === b._id} className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && <div className="text-sm text-gray-400 py-8 text-center">No banners yet. Add your first banner — it appears in the homepage hero slider instantly.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Products tab                                                       */
/* ------------------------------------------------------------------ */

function ProductsTab({ categories, products, onChanged }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '', comparePrice: '', category: '', stock: '100',
    unit: 'piece', weight: '', isFeatured: false, tags: '', images: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const flatCats = categories;

  const resetForm = () => {
    setForm({ name: '', description: '', shortDescription: '', price: '', comparePrice: '', category: '', stock: '100', unit: 'piece', weight: '', isFeatured: false, tags: '', images: '' });
    setFiles([]); setPreviews([]); setEditingId(null);
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, description: p.description || '', shortDescription: p.shortDescription || '', price: p.price,
      comparePrice: p.comparePrice || '', category: p.category?._id || p.category || '', stock: p.stock,
      unit: p.unit || 'piece', weight: p.weight || '', isFeatured: !!p.isFeatured,
      tags: (p.tags || []).join(', '), images: (p.images || []).join(', '),
    });
    setFiles([]); setPreviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiles = (e) => {
    const arr = Array.from(e.target.files).slice(0, 5);
    setFiles(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const save = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('shortDescription', form.shortDescription);
      fd.append('price', form.price);
      if (form.comparePrice) fd.append('comparePrice', form.comparePrice);
      if (form.category) fd.append('category', form.category);
      fd.append('stock', form.stock);
      fd.append('unit', form.unit);
      fd.append('weight', form.weight);
      fd.append('isFeatured', form.isFeatured);
      fd.append('tags', form.tags);
      if (form.images) fd.append('images', form.images.split(',').map(s => s.trim()).filter(Boolean).join(','));
      files.forEach(f => fd.append('imageFiles', f));

      let res;
      if (editingId) {
        res = await api.put(`/products/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        res = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      resetForm();
      onChanged();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
    finally { setUploading(false); }
  };

  const toggleActive = async (p) => {
    setBusyId(p._id);
    try { await api.put(`/products/${p._id}`, { isActive: !p.isActive }); toast.success(p.isActive ? 'Product hidden' : 'Product live'); onChanged(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBusyId(null); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    setBusyId(p._id);
    try { await api.delete(`/products/${p._id}`); toast.success('Product deleted'); onChanged(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setBusyId(null); }
  };

  const filtered = products.filter(p => {
    const s = search.trim().toLowerCase();
    const matchText = !s || (p.name || '').toLowerCase().includes(s) || (p.category?.name || '').toLowerCase().includes(s) || (p.tags || []).some(t => t.toLowerCase().includes(s));
    const matchCat = !catFilter || (p.category?._id || p.category) === catFilter || (p.category?.name || '') === catFilter;
    return matchText && matchCat;
  });

  return (
    <div className="mt-6 grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg">{editingId ? 'Edit Product' : 'Add Product'}</h3>
          <p className="text-xs text-gray-500 mb-4">Upload up to 5 images via Cloudinary or paste URLs.</p>
          <form onSubmit={save} className="space-y-3">
            <Field label="Product Name *">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sambrani Cup - Pack of 12" className={inputCls} />
            </Field>
            <Field label="Category *">
              <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                <option value="">Select category…</option>
                {flatCats.map(c => <option key={c._id} value={c._id}>{c.name}{c.parent?.name ? ` (${c.parent.name})` : ''}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price ₹ *">
                <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="199" className={inputCls} />
              </Field>
              <Field label="Compare ₹">
                <input type="number" min="0" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: e.target.value })} placeholder="249" className={inputCls} />
              </Field>
              <Field label="Stock *">
                <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight">
                <input value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="500g" className={inputCls} />
              </Field>
              <Field label="Unit">
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="pack / cup / piece" className={inputCls} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="font-semibold text-gray-700">Show in “Featured Products” on homepage</span>
            </label>
            <Field label="Short description">
              <input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="One-line teaser (optional)" className={inputCls} />
            </Field>
            <Field label="Full description *">
              <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description…" className={inputCls} />
            </Field>
            <Field label="Tags (comma separated)">
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="sambrani, pooja, incense" className={inputCls} />
            </Field>
            <div className="border-2 border-dashed border-accent/20 rounded-xl p-4 bg-cream/50">
              <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><IconCloud className="w-4 h-4" /> Product Images (up to 5)</div>
              <input type="file" multiple accept="image/*" onChange={handleFiles} className="w-full text-xs" />
              {previews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previews.map((src, i) => <img key={i} src={src} alt={`preview ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border" />)}
                </div>
              )}
              <div className="text-[11px] text-gray-500 mt-2">Or paste image URLs (comma separated) — merged with uploads</div>
              <input value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} placeholder="https://res.cloudinary.com/… , https://…" className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" />
            </div>
            <div className="flex gap-2 pt-1">
              <button disabled={uploading} className="flex-1 bg-primary text-white rounded-full py-3 font-bold text-sm disabled:opacity-50">
                {uploading ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-4">
          <h3 className="font-bold text-lg">Products ({filtered.length} of {products.length})</h3>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, category, tag…" className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-gray-200 rounded-full px-4 py-2 text-sm bg-white">
              <option value="">All categories</option>
              {flatCats.map(c => <option key={c._id} value={c._id}>{c.name}{c.parent?.name ? ` (${c.parent.name})` : ''}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2 max-h-[1200px] overflow-auto pr-1">
          {filtered.map(p => {
            const catName = p.category?.name || (flatCats.find(c => c._id === p.category)?.name) || '—';
            return (
              <div key={p._id} className={`flex flex-wrap items-center gap-3 border rounded-xl p-3 ${p.isActive ? 'border-gray-100 bg-white' : 'border-red-100 bg-red-50/40 opacity-80'}`}>
                <SmartImage src={p.images?.[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-[11px] text-gray-500">{catName} · {fmtRs(p.price)} · {p.stock} in stock</div>
                  <div className="text-[11px] mt-0.5 flex gap-1.5">
                    {p.isFeatured && <span className="bg-accent/10 text-accent-dark border border-accent/20 px-1.5 py-0.5 rounded-full font-bold">Featured</span>}
                    {p.isActive ? <span className="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">Live</span> : <span className="bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">Hidden</span>}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 shrink-0 max-w-full">
                  <button onClick={() => startEdit(p)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary">Edit</button>
                  <button onClick={() => toggleActive(p)} disabled={busyId === p._id} className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:border-accent hover:text-accent-dark disabled:opacity-50">{p.isActive ? 'Hide' : 'Show'}</button>
                  <button onClick={() => remove(p)} disabled={busyId === p._id} className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-sm text-gray-400 py-8 text-center bg-white rounded-2xl border border-dashed">No products found. Add your first product — it goes live instantly.</div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Users tab                                                          */
/* ------------------------------------------------------------------ */

function UsersTab({ users }) {
  const nonAdmins = users.filter(u => u.role !== 'admin');
  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-bold text-lg">Registered Users ({nonAdmins.length})</h3>
      <div className="overflow-auto mt-4 max-w-full">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {nonAdmins.map(u => (
              <tr key={u._id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 pr-4 font-semibold break-all">{u.name}</td>
                <td className="py-2.5 pr-4 text-gray-600 break-all">{u.email}</td>
                <td className="py-2.5 pr-4 text-gray-600">{u.phone}</td>
                <td className="py-2.5 text-gray-500 text-xs">{fmtDate(u.createdAt)}</td>
              </tr>
            ))}
            {nonAdmins.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No users yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}