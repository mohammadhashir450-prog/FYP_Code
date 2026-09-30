'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Camera, Eye, EyeOff, FileText } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BUSINESS_TYPES, EXPERIENCE, SERVICE_TYPES, fileToDataUrl } from '@/lib/profile';
import { garage, pulseError, pulseTyping, GarageFocus } from '@/lib/garageState';

const GarageScene = dynamic(() => import('@/components/garage/GarageScene'), { ssr: false });

const STEP_TITLES = ['Create your account', 'Your workshop', 'Verify your identity'];
const STEP_SAYS = ['New here? Let me get your bay ready.', 'Tell me about your workshop.', 'Last step — I just need your ID.'];

const empty = {
  fullName: '', email: '', phone: '', password: '', confirm: '',
  businessName: '', businessType: '', serviceType: '', experience: '', address: '',
  nationalId: '', documentName: '', photo: '',
};

export default function LoginPage() {
  const router = useRouter();
  const { ready, isAuthenticated, hasAccount, login, register } = useAuth();
  const { showToast } = useToast();

  const [chosenMode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focus, setFocus] = useState<GarageFocus>('none');
  const [won, setWon] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(empty);
  const docRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const mode = ready && !hasAccount ? 'register' : chosenMode;

  useEffect(() => {
    if (ready && isAuthenticated && !submitted) router.replace('/dashboard');
  }, [ready, isAuthenticated, submitted, router]);

  // Drive the 3D workman
  useEffect(() => { garage.mode = mode; garage.step = step; }, [mode, step]);
  useEffect(() => { garage.focus = focus; }, [focus]);
  useEffect(() => { garage.success = won ? 1 : 0; }, [won]);
  useEffect(() => () => { garage.mode = 'login'; garage.step = 0; garage.focus = 'none'; garage.success = 0; garage.typing = 0; garage.error = 0; }, []);

  const say = won ? "You're in! Let's get to work."
    : error ? 'Hmm… check that and try again.'
    : focus === 'password' ? "I'm not looking, promise."
    : focus === 'text' ? 'Take your time.'
    : mode === 'login' ? 'Welcome back, boss. Sign in and let’s fix some cars.'
    : STEP_SAYS[step];

  const fail = (msg: string) => { setError(msg); pulseError(); };
  const up = (k: keyof typeof empty, v: string) => { setForm((f) => ({ ...f, [k]: v })); pulseTyping(); if (error) setError(''); };
  const fp = (kind: GarageFocus) => ({ onFocus: () => setFocus(kind), onBlur: () => setFocus('none') });
  const switchMode = (m: 'login' | 'register') => { setMode(m); setStep(0); setError(''); };

  const celebrate = (then: () => void) => { setWon(true); setTimeout(then, 1600); };

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) return fail('Enter your email and password.');
    setLoading(true);
    setSubmitted(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (!res.ok) { setSubmitted(false); return fail(res.error || 'Sign in failed.'); }
    showToast('Welcome back to RepairEase', 'success');
    celebrate(() => router.push('/dashboard'));
  };

  const next = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return fail('Enter your full name.');
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return fail('Enter a valid email address.');
      if (!form.phone.trim()) return fail('Enter your phone number.');
      if (form.password.length < 8) return fail('Password must be at least 8 characters.');
      if (form.password !== form.confirm) return fail('Passwords do not match.');
    }
    if (step === 1) {
      if (!form.businessName.trim()) return fail('Enter your business or workshop name.');
      if (!form.serviceType) return fail('Choose your service specialization.');
      if (!form.address.trim()) return fail('Enter your workshop address.');
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!form.nationalId.trim()) return fail('Enter your national identity number.');
    if (!form.documentName) return fail('Upload your trade licence or ID document.');
    setLoading(true);
    setSubmitted(true);
    const { password, confirm: _confirm, ...profile } = form;
    void _confirm;
    await register({ ...profile, designation: '' }, password);
    setLoading(false);
    showToast('Application submitted — awaiting review', 'success');
    celebrate(() => router.push('/pending'));
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 8 * 1024 * 1024) return fail('Choose an image under 8MB.');
    try { up('photo', await fileToDataUrl(f)); } catch { fail('Could not read that image.'); }
  };

  if (!ready || (isAuthenticated && !submitted)) return null;

  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-ink outline-none transition placeholder:text-mist-dim/50 hover:border-white/20 focus:border-brand/70 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(255,214,10,.12)]';
  const labelCls = 'mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-dim';

  return (
    <div className="fixed inset-0 overflow-hidden bg-navy">
      <GarageScene say={say} />

      {/* readability gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_left,rgba(3,13,31,.92)_0%,rgba(3,13,31,.55)_38%,transparent_62%)] max-md:bg-[linear-gradient(to_top,rgba(3,13,31,.95)_0%,rgba(3,13,31,.6)_45%,transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,10,24,.7)_100%)]" />

      {/* brand */}
      <Link href="/" className="absolute left-5 top-5 z-10 flex items-center gap-3 no-underline md:left-10 md:top-8" aria-label="RepairEase home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl bg-white p-0.5 shadow-[0_0_30px_rgba(255,214,10,.25)]" />
        <span className="leading-none">
          <span className="block font-display text-[17px] font-bold tracking-[0.22em] text-brand">REPAIREASE</span>
          <span className="mt-1.5 block font-mono text-[8px] font-semibold uppercase tracking-[0.36em] text-mist-dim">Provider Platform</span>
        </span>
      </Link>
      <div className="pointer-events-none absolute bottom-6 left-10 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-mist-dim md:block">Move your mouse — he is watching</div>

      {/* card */}
      <main className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-y-auto px-4 pb-4 md:items-center md:justify-end md:px-0 md:pb-0 md:pr-[7vw]">
        <div className="pointer-events-auto relative my-auto w-full max-w-[430px] animate-[fadeIn_.7s_ease_both] rounded-[28px] border border-white/10 bg-navy/70 p-7 shadow-[0_40px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl md:p-10">
          <span aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />

          {mode === 'register' && (
            <div className="mb-6 flex gap-1.5" aria-label={`Step ${step + 1} of 3`}>
              {[0, 1, 2].map((i) => <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-brand' : 'bg-white/10'}`} />)}
            </div>
          )}

          <h1 className="font-display text-[32px] font-semibold leading-tight">{mode === 'login' ? 'Welcome back' : STEP_TITLES[step]}</h1>
          <p className="mt-2 text-sm text-mist-dim">{mode === 'login' ? 'Sign in to your provider workspace.' : `Step ${step + 1} of 3`}</p>

          {error && <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13px] text-red-200">{error}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="mt-7 grid gap-5" noValidate>
              <label><span className={labelCls}>Email</span>
                <input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={(e) => up('email', e.target.value)} {...fp('text')} placeholder="you@example.com" /></label>
              <label><span className={labelCls}>Password</span>
                <span className="relative block">
                  <input className={`${inputCls} pr-12`} type={showPass ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => up('password', e.target.value)} {...fp('password')} placeholder="Your password" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-mist-dim transition hover:text-brand">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </span></label>
              <button className="btn btn-primary btn-lg btn-full mt-1" disabled={loading || won}>{won ? 'Welcome!' : loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}</button>
              <p className="text-center text-[13px] text-mist-dim">New provider? <button type="button" onClick={() => switchMode('register')} className="border-0 bg-transparent p-0 font-semibold text-brand hover:underline">Apply for an account</button></p>
            </form>
          )}

          {mode === 'register' && (
            <div className="mt-7 grid gap-5">
              {step === 0 && (
                <>
                  <label><span className={labelCls}>Full name</span><input className={inputCls} value={form.fullName} onChange={(e) => up('fullName', e.target.value)} {...fp('text')} placeholder="Your full name" autoComplete="name" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label><span className={labelCls}>Email</span><input className={inputCls} type="email" value={form.email} onChange={(e) => up('email', e.target.value)} {...fp('text')} placeholder="you@example.com" autoComplete="email" /></label>
                    <label><span className={labelCls}>Phone</span><input className={inputCls} type="tel" value={form.phone} onChange={(e) => up('phone', e.target.value)} {...fp('text')} placeholder="Contact number" autoComplete="tel" /></label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label><span className={labelCls}>Password</span><input className={inputCls} type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => up('password', e.target.value)} {...fp('password')} placeholder="Min. 8 characters" autoComplete="new-password" /></label>
                    <label><span className={labelCls}>Confirm</span><input className={inputCls} type={showPass ? 'text' : 'password'} value={form.confirm} onChange={(e) => up('confirm', e.target.value)} {...fp('password')} autoComplete="new-password" /></label>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-mist-dim"><input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} className="accent-[#ffd60a]" /> Show passwords</label>
                </>
              )}
              {step === 1 && (
                <>
                  <label><span className={labelCls}>Workshop name</span><input className={inputCls} value={form.businessName} onChange={(e) => up('businessName', e.target.value)} {...fp('text')} placeholder="Your business name" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label><span className={labelCls}>Specialization</span><select className="select" value={form.serviceType} onChange={(e) => up('serviceType', e.target.value)}><option value="">Select</option>{SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
                    <label><span className={labelCls}>Business type</span><select className="select" value={form.businessType} onChange={(e) => up('businessType', e.target.value)}><option value="">Select</option>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
                  </div>
                  <label><span className={labelCls}>Experience</span><select className="select" value={form.experience} onChange={(e) => up('experience', e.target.value)}><option value="">Select</option>{EXPERIENCE.map((t) => <option key={t}>{t}</option>)}</select></label>
                  <label><span className={labelCls}>Workshop address</span><input className={inputCls} value={form.address} onChange={(e) => up('address', e.target.value)} {...fp('text')} placeholder="Street, area, city" /></label>
                </>
              )}
              {step === 2 && (
                <>
                  <label><span className={labelCls}>National ID (CNIC)</span><input className={`${inputCls} font-mono`} value={form.nationalId} onChange={(e) => up('nationalId', e.target.value)} {...fp('text')} placeholder="00000-0000000-0" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => docRef.current?.click()} className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-center text-ink transition hover:border-brand/60">
                      <FileText size={22} className={form.documentName ? 'text-brand' : 'text-mist-dim'} />
                      <span className="break-all text-[12.5px] font-semibold">{form.documentName || 'Upload licence / ID'}</span>
                    </button>
                    <button type="button" onClick={() => photoRef.current?.click()} className="flex min-h-[112px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-0 text-center text-ink transition hover:border-brand/60">
                      {form.photo
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={form.photo} alt="Profile" className="h-[112px] w-full object-cover" />
                        : <><Camera size={22} className="text-mist-dim" /><span className="text-[12.5px] font-semibold">Photo <span className="font-normal text-mist-dim">(optional)</span></span></>}
                    </button>
                  </div>
                  <input ref={docRef} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 15 * 1024 * 1024) fail('Document must be under 15MB.'); else up('documentName', f.name); } e.target.value = ''; }} />
                  <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
                </>
              )}

              <div className="mt-1 flex gap-3">
                {step > 0 && <button className="btn btn-ghost btn-lg" onClick={() => { setError(''); setStep(step - 1); }}><ArrowLeft size={16} /></button>}
                {step < 2
                  ? <button className="btn btn-primary btn-lg flex-1" onClick={next}>Continue <ArrowRight size={16} /></button>
                  : <button className="btn btn-primary btn-lg flex-1" disabled={loading || won} onClick={submit}>{won ? 'Submitted!' : loading ? 'Submitting…' : 'Submit application'}</button>}
              </div>
              {hasAccount && <p className="text-center text-[13px] text-mist-dim">Already registered? <button type="button" onClick={() => switchMode('login')} className="border-0 bg-transparent p-0 font-semibold text-brand hover:underline">Sign in</button></p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
