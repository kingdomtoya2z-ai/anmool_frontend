'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';
import { ButtonLoader } from '@/components/Loader';

const RESEND_WAIT = 60;

function ForgotInner() {
  const [step, setStep] = useState('email'); // email | otp | password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async (silent) => {
    if (!email.trim()) { toast.error('Enter your account email'); return false; }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (!silent) toast.success(res.data.message || 'Code sent');
      setCooldown(RESEND_WAIT);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send code');
      return false;
    } finally { setLoading(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (await sendCode(false)) setStep('otp');
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', { email: email.trim().toLowerCase(), otp: otp.trim() });
      setResetToken(res.data.resetToken);
      setStep('password');
      toast.success('Code verified — set a new password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { resetToken, password });
      login(res.data.token, res.data.user);
      toast.success('Password reset — you are logged in');
      router.push(res.data.user.role === 'admin' ? '/admin' : '/account');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — request a new code');
      if (err.response?.status === 401) setStep('email');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-cream to-white">
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Anmool Dairy" className="h-12 w-auto mx-auto object-contain" width={180} height={58} />
          <h1 className="font-serif font-bold text-2xl mt-3">Forgot Password</h1>
          <p className="text-sm text-gray-500">Reset with a code sent to your email</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {['Email', 'Code', 'New password'].map((s, i) => {
              const idx = ['email', 'otp', 'password'].indexOf(step);
              return (
                <span key={s} className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${i <= idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1} · {s}</span>
                  {i < 2 && <span className="w-4 h-px bg-gray-300" />}
                </span>
              );
            })}
          </div>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Account email *</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="you@example.com" className={inputCls} />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <ButtonLoader /> : 'Send Reset Code'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtp} className="space-y-4">
            <div className="text-xs text-gray-500 bg-cream rounded-xl px-4 py-2.5">Code sent to <b>{email}</b> <button type="button" onClick={() => setStep('email')} className="text-primary font-bold ml-1">Change</button></div>
            <div>
              <label className="text-sm font-semibold">6-digit code</label>
              <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" placeholder="••••••" className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <div className="text-xs text-gray-400 mt-2 text-center">Code expires in 10 minutes · 5 attempts max</div>
            </div>
            <button disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <ButtonLoader /> : 'Verify Code'}</button>
            <div className="text-center text-sm">
              <button type="button" onClick={() => sendCode(false)} disabled={cooldown > 0 || loading} className="font-bold text-primary disabled:opacity-50 disabled:text-gray-400">
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">New password *</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required minLength={6} placeholder="Min 6 characters" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-semibold">Confirm password *</label>
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" required minLength={6} placeholder="Repeat new password" className={inputCls} />
            </div>
            <button disabled={loading} className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <ButtonLoader /> : 'Reset Password & Login'}</button>
          </form>
        )}

        <div className="text-center text-sm mt-6">
          <Link href="/login" className="font-bold text-primary">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword(){ return <Suspense fallback={<div className='p-10 text-center'><img src="/loader.png" alt="loading" className="w-16 h-16 mx-auto animate-pulse" /></div>}><ForgotInner/></Suspense> }
