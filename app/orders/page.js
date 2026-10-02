'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { ORDER_FLOW, STATUS_META, OrderCard, fmtRs } from '@/components/UserDashboard';
import { IconBox, IconPin } from '@/components/icons';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.role === 'admin') {
      setLoading(false);
      return;
    }
    api
      .get('/orders/my')
      .then((r) => {
        setOrders(r.data || []);
        if (r.data?.length) setOpenId(r.data[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') list = list.filter((o) => o.orderStatus === statusFilter);
    const s = query.trim().toLowerCase();
    if (s)
      list = list.filter(
        (o) =>
          (o.orderNumber || '').toLowerCase().includes(s) ||
          (o.items || []).some((it) => (it.name || '').toLowerCase().includes(s))
      );
    return list;
  }, [orders, statusFilter, query]);

  if (!user)
    return (
      <div className="max-w-[700px] mx-auto px-4 py-10 text-center">
        <div className="bg-white rounded-3xl border p-10">
          Please <Link href="/login?redirect=/orders" className="text-primary font-bold">login</Link> to view orders.
        </div>
      </div>
    );

  if (user.role === 'admin')
    return (
      <div className="max-w-[700px] mx-auto px-4 py-10 text-center">
        <div className="bg-white rounded-3xl border p-10">
          <div className="font-bold text-lg">You are logged in as Admin</div>
          <p className="text-sm text-gray-500 mt-2">Track & update all orders from the admin panel.</p>
          <Link href="/admin" className="inline-block mt-5 bg-primary text-white px-8 py-3 rounded-full font-bold text-sm">
            Open Admin → Orders
          </Link>
        </div>
      </div>
    );

  if (loading) return <Loader text="Loading your orders..." />;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} order{orders.length === 1 ? '' : 's'} · Every order has a trackable{' '}
            <b>Order ID</b> (e.g. ANM-000123)
          </p>
        </div>
        <Link href="/account?tab=track" className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-dark transition">
          <IconPin className="w-3.5 h-3.5" /> Track by Order ID
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mt-5">
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
            placeholder="Search Order ID or item…"
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
          <div className="bg-white rounded-2xl border border-dashed p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-cream border border-accent/20 flex items-center justify-center text-primary mb-3"><IconBox className="w-6 h-6" /></div>
            <div className="font-bold">No orders found</div>
            <p className="text-sm text-gray-500 mt-1">
              {query || statusFilter !== 'all' ? 'Try a different search or filter.' : 'Shop and your orders will appear here.'}
            </p>
            <Link href="/" className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold">
              Shop now
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/account" className="text-xs font-bold text-primary hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
