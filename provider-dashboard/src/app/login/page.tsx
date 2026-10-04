'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Camera, Check, Eye, EyeOff, FileText, Lock, Phone, ShieldCheck, User } from 'lucide-react';
import { useAuth, phoneKey } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BUSINESS_TYPES, EXPERIENCE, SERVICE_GROUPS, fileToDataUrl } from '@/lib/profile';
import { garage, pulseError, pulseTyping, GarageFocus } from '@/lib/garageState';

const GarageScene = dynamic(() => import('@/components/garage/GarageScene'), { ssr: false });

const STEP_TITLES = ['Create your account', 'Your workshop', 'Verify your identity'];
const STEP_HINTS = ['Tell us who you are and set a password.', 'Describe the service you offer.', 'Add your ID number and a supporting document.'];
const STEP_SAYS = ['New here? Let me get your bay ready.', 'Tell me about your workshop.', 'Last step — I just need your ID.'];

const empty = {
  fullName: '', phone: '', password: '', confirm: '',
  businessName: '', businessType: '', serviceType: '', experience: '', address: '',
  nationalId: '', documentName: '', photo: '',
};

const strength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return s;
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

  // Drive the 3D crew
  useEffect(() => { garage.mode = mode; garage.step = step; }, [mode, step]);
  useEffect(() => { garage.focus = focus; }, [focus]);
  useEffect(() => { garage.success = won ? 1 : 0; }, [won]);
  useEffect(() => () => { garage.mode = 'login'; garage.step = 0; garage.focus = 'none'; garage.success = 0; garage.typing = 0; garage.error = 0; }, []);

  const say = won ? "You're in! Let's get to work."
    : error ? 'Hmm… check that and try again.'
    : focus === 'password' ? "I'm not looking, promise."
    : focus === 'text' ? 'Take your time.'
    : mode === 'login' ? 'Welcome back, boss. Sign in and let’s get to work.'
    : STEP_SAYS[step];

  const fail = (msg: string) => { setError(msg); pulseError(); };
  const up = (k: keyof typeof empty, v: string) => { setForm((f) => ({ ...f, [k]: v })); pulseTyping(); if (error) setError(''); };
  const fp = (kind: GarageFocus) => ({ onFocus: () => setFocus(kind), onBlur: () => setFocus('none') });
  const switchMode = (m: 'login' | 'register') => { setMode(m); setStep(0); setError(''); };
  const celebrate = (then: () => void) => { setWon(true); setTimeout(then, 1600); };

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.phone.trim() || !form.password) return fail('Enter your phone number and password.');
    setLoading(true);
    setSubmitted(true);
    const res = await login(form.phone, form.password);
    setLoading(false);
    if (!res.ok) { setSubmitted(false); return fail(res.error || 'Sign in failed.'); }
    showToast('Welcome back to RepairEase', 'success');
    celebrate(() => router.push('/dashboard'));
  };

  const next = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return fail('Enter your full name.');
      if (phoneKey(form.phone).length < 10) return fail('Enter a valid phone number.');
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
    await register({ ...profile, designation: '', skills: [] }, password);
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

  const box = 'flex items-center rounded-xl border border-white/10 bg-white/[0.04] transition focus-within:border-brand/70 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_4px_rgba(255,214,10,.12)] hover:border-white/20';
  const bare = 'w-full min-w-0 border-0 bg-transparent px-4 py-3.5 text-[15px] text-ink outline-none placeholder:text-mist-dim/50';
  const labelCls = 'mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-dim';
  const sc = strength(form.password);

  return (
    <div className="fixed inset-0 overflow-hidden bg-navy">
      <style>{`
        @keyframes lg-border { to { background-position: 300% 0; } }
        @keyframes lg-shine { 0%, 55% { transform: translateX(-140%) skewX(-18deg); } 100% { transform: translateX(260%) skewX(-18deg); } }
        .lg-border { background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,214,10,.9), rgba(43,123,214,.9), rgba(255,255,255,.08)); background-size: 300% 100%; animation: lg-border 8s linear infinite; }
        .lg-shine { position: relative; overflow: hidden; }
        .lg-shine::after { content: ''; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); animation: lg-shine 3.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .lg-border, .lg-shine::after { animation: none; } }
      `}</style>

      <GarageScene say={say} />

      {/* depth + readability */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,13,31,.55)_0%,transparent_45%,rgba(2,10,24,.75)_100%)]" />

      {/* back to home */}
      <Link href="/" className="group absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-navy/60 py-2 pl-3 pr-4 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink no-underline backdrop-blur-xl transition hover:border-brand hover:text-brand md:left-8 md:top-7">
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" /> Back to home
      </Link>
      <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-mist-dim md:block">Move your mouse — the crew is watching</div>

      {/* card */}
      <main className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-y-auto px-3 pb-3 pt-14 md:items-center md:py-6">
        <div className="lg-border pointer-events-auto my-auto w-full max-w-[470px] animate-[fadeIn_.7s_ease_both] rounded-[30px] p-px shadow-[0_50px_140px_rgba(0,0,0,.7)]">
          <div className="relative rounded-[29px] bg-navy/80 px-5 py-6 backdrop-blur-2xl md:bg-navy/75 md:px-10 md:py-10">
            <span aria-hidden className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            {/* logo */}
            <div className="mb-6 hidden flex-col items-center text-center md:flex">
              <span className="relative">
                <span aria-hidden className="absolute -inset-2 rounded-3xl bg-brand/30 blur-xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="RepairEase" width={64} height={64} className="relative h-16 w-16 rounded-2xl bg-white p-0.5" />
              </span>
              <div className="mt-4 font-display text-[15px] font-bold tracking-[0.3em] text-brand">REPAIREASE</div>
              <div className="mt-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.36em] text-mist-dim">Provider Portal</div>
            </div>

            {/* tabs / steps */}
            {mode === 'login' && hasAccount ? (
              <div className="mb-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em]">
                <span className="rounded-lg bg-brand/15 py-2.5 text-center text-brand ring-1 ring-brand/40">Sign in</span>
                <button type="button" onClick={() => switchMode('register')} className="rounded-lg border-0 bg-transparent py-2.5 text-mist-dim transition hover:text-white">Apply</button>
              </div>
            ) : mode === 'register' ? (
              <div className="mb-7 flex items-center gap-2" aria-label={`Step ${step + 1} of 3`}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-1 items-center gap-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition ${i < step ? 'border-brand bg-brand text-navy' : i === step ? 'border-brand text-brand shadow-[0_0_14px_rgba(255,214,10,.45)]' : 'border-white/15 text-mist-dim'}`}>{i < step ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                    {i < 2 && <span className={`h-px flex-1 transition-colors duration-500 ${i < step ? 'bg-brand' : 'bg-white/15'}`} />}
                  </div>
                ))}
              </div>
            ) : null}

            <h1 className="font-display text-[30px] font-semibold leading-tight">{mode === 'login' ? 'Welcome back' : STEP_TITLES[step]}</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-mist-dim md:mt-2 md:text-[13.5px]">{mode === 'login' ? 'Sign in with your phone number.' : STEP_HINTS[step]}</p>

            {error && <div role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13px] text-red-200">{error}</div>}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="mt-6 grid gap-5" noValidate>
                <label><span className={labelCls}>Phone number</span>
                  <span className={box}>
                    <span className="flex items-center gap-2 border-r border-white/10 px-4 font-mono text-[12px] font-semibold text-mist"><Phone size={15} className="text-brand" />+92</span>
                    <input className={bare} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => up('phone', e.target.value)} {...fp('text')} placeholder="300 1234567" />
                  </span></label>
                <label><span className={labelCls}>Password</span>
                  <span className={box}>
                    <Lock size={16} className="ml-4 text-brand" />
                    <input className={bare} type={showPass ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => up('password', e.target.value)} {...fp('password')} placeholder="Your password" />
                    <button type="button" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password visibility" className="mr-3 border-0 bg-transparent p-1 text-mist-dim transition hover:text-brand">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </span></label>
                <button className="btn btn-primary btn-lg btn-full lg-shine mt-1" disabled={loading || won}>{won ? 'Welcome!' : loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}</button>
              </form>
            )}

            {mode === 'register' && (
              <div className="mt-6 grid gap-5">
                {step === 0 && (
                  <>
                    <label><span className={labelCls}>Full name</span><span className={box}><User size={16} className="ml-4 text-brand" /><input className={bare} value={form.fullName} onChange={(e) => up('fullName', e.target.value)} {...fp('text')} placeholder="Your full name" autoComplete="name" /></span></label>
                    <label><span className={labelCls}>Phone number</span><span className={box}><span className="flex items-center gap-2 border-r border-white/10 px-4 font-mono text-[12px] font-semibold text-mist"><Phone size={15} className="text-brand" />+92</span><input className={bare} type="tel" inputMode="tel" value={form.phone} onChange={(e) => up('phone', e.target.value)} {...fp('text')} placeholder="300 1234567" autoComplete="tel" /></span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label><span className={labelCls}>Password</span><span className={box}><input className={bare} type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => up('password', e.target.value)} {...fp('password')} placeholder="Min. 8 chars" autoComplete="new-password" /></span></label>
                      <label><span className={labelCls}>Confirm</span><span className={box}><input className={bare} type={showPass ? 'text' : 'password'} value={form.confirm} onChange={(e) => up('confirm', e.target.value)} {...fp('password')} autoComplete="new-password" /></span></label>
                    </div>
                    <div className="-mt-2 flex items-center gap-3">
                      <div className="flex flex-1 gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < sc ? (sc < 2 ? 'bg-red-400' : sc < 4 ? 'bg-brand' : 'bg-emerald-400') : 'bg-white/10'}`} />)}</div>
                      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-mist-dim"><input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} className="accent-[#ffd60a]" /> Show</label>
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <label><span className={labelCls}>Workshop / business name</span><span className={box}><input className={bare} value={form.businessName} onChange={(e) => up('businessName', e.target.value)} {...fp('text')} placeholder="Your business name" /></span></label>
                    <label><span className={labelCls}>Specialization</span>
                      <select className="select" value={form.serviceType} onChange={(e) => up('serviceType', e.target.value)}><option value="">Select</option>{SERVICE_GROUPS.map((g) => <optgroup key={g.label} label={g.label}>{g.items.map((t) => <option key={t}>{t}</option>)}</optgroup>)}</select></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label><span className={labelCls}>Business type</span><select className="select" value={form.businessType} onChange={(e) => up('businessType', e.target.value)}><option value="">Select</option>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
                      <label><span className={labelCls}>Experience</span><select className="select" value={form.experience} onChange={(e) => up('experience', e.target.value)}><option value="">Select</option>{EXPERIENCE.map((t) => <option key={t}>{t}</option>)}</select></label>
                    </div>
                    <label><span className={labelCls}>Workshop address</span><span className={box}><input className={bare} value={form.address} onChange={(e) => up('address', e.target.value)} {...fp('text')} placeholder="Street, area, city" /></span></label>
                  </>
                )}
                {step === 2 && (
                  <>
                    <label><span className={labelCls}>National ID (CNIC)</span><span className={box}><input className={`${bare} font-mono`} value={form.nationalId} onChange={(e) => up('nationalId', e.target.value)} {...fp('text')} placeholder="00000-0000000-0" /></span></label>
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
                  {step > 0 && <button className="btn btn-ghost btn-lg" onClick={() => { setError(''); setStep(step - 1); }} aria-label="Back"><ArrowLeft size={16} /></button>}
                  {step < 2
                    ? <button className="btn btn-primary btn-lg lg-shine flex-1" onClick={next}>Continue <ArrowRight size={16} /></button>
                    : <button className="btn btn-primary btn-lg lg-shine flex-1" disabled={loading || won} onClick={submit}>{won ? 'Submitted!' : loading ? 'Submitting…' : 'Submit application'}</button>}
                </div>
                {hasAccount && <p className="text-center text-[13px] text-mist-dim">Already registered? <button type="button" onClick={() => switchMode('login')} className="border-0 bg-transparent p-0 font-semibold text-brand hover:underline">Sign in</button></p>}
              </div>
            )}

            <div className="mt-5 hidden items-center justify-center gap-2 border-t md:mt-7 md:flex border-white/10 pt-5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-mist-dim">
              <ShieldCheck size={13} className="text-brand" /> Secure · Verified providers only
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
