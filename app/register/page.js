'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';
import { ButtonLoader } from '@/components/Loader';

const RESEND_WAIT = 60;

function RegisterInner() {
  const [step, setStep] = useState('details'); // details | otp
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const { login } = useAuth();

  // Deep link from login when account exists but is unverified: ?verify=email
  useEffect(() => {
    const v = params.get('verify');
    if (v) {
      setOtpEmail(v);
      setStep('otp');
      setCooldown(RESEND_WAIT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleDetails = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
    };
    if (!payload.name) { toast.error('Full name is required'); return; }
    if (!payload.email) { toast.error('Email is required'); return; }
    if (!payload.phone) { toast.error('Phone is required'); return; }
    if (!/^[6-9]\d{9}$/.test(payload.phone)) { toast.error('Enter valid 10 digit Indian phone'); return; }
    if (!payload.password) { toast.error('Password is required'); return; }
    if (payload.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', payload);
      if (res.data.requiresOtp) {
        setOtpEmail(res.data.email || payload.email);
        setStep('otp');
        setCooldown(RESEND_WAIT);
        toast.success('Verification code sent to your email');
      } else if (res.data.token) {
        login(res.data.token, res.data.user);
        toast.success('Account created successfully!');
        router.push(redirect);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: otpEmail, otp: otp.trim() });
      login(res.data.token, res.data.user);
      toast.success('Email verified — welcome!');
      router.push(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !otpEmail) return;
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email: otpEmail });
      setCooldown(RESEND_WAIT);
      toast.success('New code sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend code');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-cream to-white">
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Anmool Dairy" className="h-12 w-auto mx-auto object-contain" width={180} height={58} />
          <h1 className="font-serif font-bold text-2xl mt-3">{step === 'otp' ? 'Verify Email' : 'Create Account'}</h1>
          <p className="text-sm text-gray-500">
            {step === 'otp'
              ? `Enter the 6-digit code sent to ${otpEmail}`
              : 'Join Anmool Dairy family - genuine products await'}
          </p>
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${step === 'details' ? 'bg-primary text-white' : 'bg-green-100 text-green-700'}`}>1 · Details</span>
            <span className="w-6 h-px bg-gray-300" />
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${step === 'otp' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2 · Email OTP</span>
          </div>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleDetails} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Full Name *</label>
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Your name" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-semibold">Email *</label>
              <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} type="email" required placeholder="you@example.com" className={inputCls} />
              <div className="text-xs text-gray-400 mt-1">A verification code will be sent here</div>
            </div>
            <div>
              <label className="text-sm font-semibold">Phone *</label>
              <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required placeholder="10 digit mobile" maxLength={10} className={inputCls} />
              <div className="text-xs text-gray-400 mt-1">No duplicate phone allowed</div>
            </div>
            <div>
              <label className="text-sm font-semibold">Password *</label>
              <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} type="password" required minLength={6} placeholder="Min 6 characters" className={inputCls} />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <ButtonLoader /> : 'Send Verification Code'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">6-digit code</label>
              <input
                value={otp}
                onChange={e=>setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                inputMode="numeric"
                placeholder="••••••"
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="text-xs text-gray-400 mt-2 text-center">Code expires in 10 minutes · 5 attempts max</div>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <ButtonLoader /> : 'Verify & Create Account'}</button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setStep('details')} className="font-semibold text-gray-500 hover:text-primary">← Edit details</button>
              <button type="button" onClick={handleResend} disabled={cooldown > 0 || loading} className="font-bold text-primary disabled:opacity-50 disabled:text-gray-400">
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm mt-6">
          <span className="text-gray-500">Already have account?</span> <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-primary">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function Register(){ return <Suspense fallback={<div className='p-10 text-center'><img src="/loader.png" alt="loading" className="w-16 h-16 mx-auto animate-pulse" /></div>}><RegisterInner/></Suspense> }
