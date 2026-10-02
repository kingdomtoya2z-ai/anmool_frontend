'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';
import Loader, { ButtonLoader } from '@/components/Loader';

function LoginInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const { login } = useAuth();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome ${res.data.user.name}!`);
      router.push(res.data.user.role==='admin' ? '/admin' : redirect);
    } catch (err) {
      const data = err.response?.data || {};
      if (err.response?.status === 403 && data.requiresOtp) {
        toast.error(data.message || 'Email not verified');
        router.push(`/register?verify=${encodeURIComponent(data.email || email)}&redirect=${encodeURIComponent(redirect)}`);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-cream to-white">
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Anmool Dairy" className="h-12 w-auto mx-auto object-contain" width={180} height={58} />
          <h1 className="font-serif font-bold text-2xl mt-3">Welcome Back</h1>
          <p className="text-sm text-gray-500">Login to Anmool Dairy</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
            </div>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required placeholder="••••••" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <button disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <ButtonLoader /> : 'Login'}</button>
        </form>
        <div className="text-center text-sm mt-6">
          <span className="text-gray-500">No account?</span> <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-primary">Register now</Link>
        </div>
      </div>
    </div>
  );
}

export default function Login(){ return <Suspense fallback={<div className='p-10 text-center'><img src="/loader.png" alt="loading" className="w-16 h-16 mx-auto animate-pulse" /></div>}><LoginInner/></Suspense> }