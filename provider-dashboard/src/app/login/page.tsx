'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Camera, Eye, EyeOff, FileText, Lock, Phone, ShieldCheck, TriangleAlert, Wrench, Clock, BadgeCheck } from 'lucide-react';
import { useAuth, phoneKey } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BUSINESS_TYPES, EXPERIENCE, SERVICE_TYPES, fileToDataUrl } from '@/lib/profile';

const STEPS = ['Account', 'Business', 'Verification'];

const empty = {
  fullName: '', phone: '', password: '', confirm: '',
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
  const submitted = useRef(false);
  const [form, setForm] = useState(empty);
  const docRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && isAuthenticated && !submitted.current) router.replace('/dashboard');
  }, [ready, isAuthenticated, router]);

  const mode = ready && !hasAccount ? 'register' : chosenMode;
  const up = (k: keyof typeof empty, v: string) => { setForm((f) => ({ ...f, [k]: v })); if (error) setError(''); };
  const switchMode = (m: 'login' | 'register') => { setMode(m); setStep(0); setError(''); };

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.phone.trim() || !form.password) return setError('Enter your phone number and password.');
    setLoading(true);
    const res = await login(form.phone, form.password);
    setLoading(false);
    if (!res.ok) return setError(res.error || 'Sign in failed.');
    showToast('Welcome back to RepairEase', 'success');
    router.push('/dashboard');
  };

  const next = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return setError('Enter your full name.');
      if (phoneKey(form.phone).length < 10) return setError('Enter a valid phone number.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
    }
    if (step === 1) {
      if (!form.businessName.trim()) return setError('Enter your business or workshop name.');
      if (!form.serviceType) return setError('Choose your service specialization.');
      if (!form.address.trim()) return setError('Enter your workshop address.');
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!form.nationalId.trim()) return setError('Enter your national identity number.');
    if (!form.documentName) return setError('Upload your trade licence or ID document.');
    setLoading(true);
    const { password, confirm, ...profile } = form;
    submitted.current = true;
    await register({ ...profile, designation: '' }, password);
    setLoading(false);
    showToast('Application submitted — awaiting review', 'success');
    router.push('/pending');
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 8 * 1024 * 1024) return setError('Choose an image under 8MB.');
    try { up('photo', await fileToDataUrl(f)); } catch { setError('Could not read that image.'); }
  };

  if (!ready || isAuthenticated) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .auth-card { display: grid; grid-template-columns: 42% 58%; width: min(1060px, 100%); overflow: hidden; }
        .auth-left { padding: 52px 44px; display: flex; flex-direction: column; justify-content: space-between; position: relative;
          background: radial-gradient(500px 340px at 0% 0%, rgba(43,123,214,.28), transparent 70%), linear-gradient(175deg, #06204a 0%, #04122b 100%);
          border-right: 1px solid var(--border-light); }
        .auth-right { padding: 52px 52px; }
        @media (max-width: 900px) { .auth-card { grid-template-columns: 1fr; } .auth-left { padding: 32px 26px; gap: 28px; } .auth-right { padding: 32px 22px; } .auth-hide-sm { display: none !important; } }
      `}</style>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div className="panel auth-card animate-fadeIn" style={{ boxShadow: '0 30px 90px rgba(0,0,0,.65), 0 0 60px rgba(29,85,144,.15)' }}>
          {/* Brand panel */}
          <div className="auth-left">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--yellow), transparent)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="RepairEase" width={58} height={58} className="logo-tile" style={{ width: 58, height: 58, boxShadow: '0 0 28px rgba(255,214,10,.25)' }} />
                <div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 21, letterSpacing: 3, color: 'var(--yellow)' }}>REPAIREASE</div>
                  <div className="eyebrow eyebrow-muted" style={{ fontSize: 9, marginTop: 4 }}>Provider Portal</div>
                </div>
              </div>
              <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.15, fontWeight: 500, marginBottom: 20 }}>
                Repairs, <br /><em className="gradient-text" style={{ fontWeight: 600 }}>delivered</em><br />to the doorstep.
              </h1>
              <div style={{ width: 44, height: 2, background: 'var(--yellow)', marginBottom: 20, boxShadow: '0 0 12px rgba(255,214,10,.5)' }} />
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 340 }}>
                Manage your workshop profile, credentials and service requests from one secure, professional workspace.
              </p>
            </div>
            <div className="auth-hide-sm" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
              {[{ i: BadgeCheck, t: 'Verified provider badge' }, { i: ShieldCheck, t: 'Secure account and data' }, { i: Wrench, t: 'Built for mechanics & technicians' }].map(({ i: Icon, t }) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Icon size={17} color="var(--yellow)" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Form panel */}
          <div className="auth-right">
            <div className="eyebrow" style={{ marginBottom: 12 }}>{mode === 'login' ? 'Secure Sign In' : `Provider Application · Step ${step + 1} of 3`}</div>
            <h2 className="serif" style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>{mode === 'login' ? 'Welcome back' : ['Create your account', 'Business details', 'Verify your identity'][step]}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
              {mode === 'login' ? 'Sign in to manage your provider profile.' : ['Tell us who you are and set a password.', 'Describe the service you offer.', 'Add your ID number and a supporting document.'][step]}
            </p>

            {mode === 'register' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
                {STEPS.map((s, i) => (
                  <div key={s} style={{ flex: 1 }}>
                    <div style={{ height: 3, borderRadius: 2, background: i <= step ? 'var(--yellow)' : 'var(--border)', transition: 'background .3s' }} />
                    <div className="label" style={{ marginTop: 8, color: i === step ? 'var(--yellow)' : undefined }}>{i + 1}. {s}</div>
                  </div>
                ))}
              </div>
            )}

            {error && <div className="alert alert-danger" style={{ marginBottom: 22 }}><TriangleAlert size={17} style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span></div>}

            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div className="field">
                  <label className="label">Phone number</label>
                  <div className="input-wrap"><input className="input has-icon" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => up('phone', e.target.value)} placeholder="0300 1234567" /><Phone className="lead" /></div>
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <div className="input-wrap">
                    <input className="input has-icon" type={showPass ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => up('password', e.target.value)} placeholder="Your password" />
                    <button type="button" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                  </div>
                </div>
                <button className="btn btn-primary btn-lg btn-full" disabled={loading}>{loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}</button>
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                  New provider? <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--yellow)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Apply for an account</button>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {step === 0 && (
                  <>
                    <div className="field"><label className="label">Full legal name</label><input className="input" value={form.fullName} onChange={(e) => up('fullName', e.target.value)} placeholder="Your full name" autoComplete="name" /></div>
                    <div className="field"><label className="label">Phone number</label><input className="input" type="tel" inputMode="tel" value={form.phone} onChange={(e) => up('phone', e.target.value)} placeholder="0300 1234567" autoComplete="tel" /></div>
                    <div className="form-grid-2">
                      <div className="field"><label className="label">Password</label><input className="input" type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => up('password', e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" /></div>
                      <div className="field"><label className="label">Confirm password</label><input className="input" type={showPass ? 'text' : 'password'} value={form.confirm} onChange={(e) => up('confirm', e.target.value)} autoComplete="new-password" /></div>
                    </div>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} style={{ accentColor: 'var(--yellow)' }} /> Show passwords
                    </label>
                  </>
                )}
                {step === 1 && (
                  <>
                    <div className="field"><label className="label">Business / workshop name</label><input className="input" value={form.businessName} onChange={(e) => up('businessName', e.target.value)} placeholder="Your business name" /></div>
                    <div className="form-grid-2">
                      <div className="field"><label className="label">Service specialization</label>
                        <select className="select" value={form.serviceType} onChange={(e) => up('serviceType', e.target.value)}><option value="">Select</option>{SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                      <div className="field"><label className="label">Business type</label>
                        <select className="select" value={form.businessType} onChange={(e) => up('businessType', e.target.value)}><option value="">Select</option>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                    </div>
                    <div className="field"><label className="label">Experience</label>
                      <select className="select" value={form.experience} onChange={(e) => up('experience', e.target.value)}><option value="">Select</option>{EXPERIENCE.map((t) => <option key={t}>{t}</option>)}</select></div>
                    <div className="field"><label className="label">Workshop address</label><input className="input" value={form.address} onChange={(e) => up('address', e.target.value)} placeholder="Street, area, city" /></div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="field"><label className="label">National identity number (CNIC)</label><input className="input" style={{ fontFamily: 'var(--font-mono)' }} value={form.nationalId} onChange={(e) => up('nationalId', e.target.value)} placeholder="00000-0000000-0" /></div>
                    <div className="form-grid-2">
                      <button type="button" onClick={() => docRef.current?.click()} className="panel-inner" style={{ padding: '22px 14px', border: '1px dashed var(--border)', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
                        <FileText size={24} color={form.documentName ? 'var(--yellow)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: 13, fontWeight: 600, overflowWrap: 'anywhere' }}>{form.documentName || 'Upload trade licence / ID'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF, PNG or JPG · 15MB</span>
                      </button>
                      <button type="button" onClick={() => photoRef.current?.click()} className="panel-inner" style={{ padding: form.photo ? 0 : '22px 14px', minHeight: 116, overflow: 'hidden', border: '1px dashed var(--border)', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
                        {form.photo
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={form.photo} alt="Profile" style={{ width: '100%', height: 116, objectFit: 'cover' }} />
                          : <><Camera size={24} color="var(--text-muted)" /><span style={{ fontSize: 13, fontWeight: 600 }}>Profile photo</span><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Optional</span></>}
                      </button>
                    </div>
                    <input ref={docRef} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 15 * 1024 * 1024) setError('Document must be under 15MB.'); else up('documentName', f.name); } e.target.value = ''; }} />
                    <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}><Lock size={14} /> Your documents are used only for verification.</div>
                  </>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  {step > 0 && <button className="btn btn-ghost btn-lg" onClick={() => { setError(''); setStep(step - 1); }}><ArrowLeft size={16} /> Back</button>}
                  {step < 2
                    ? <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={next}>Continue <ArrowRight size={16} /></button>
                    : <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading} onClick={submit}>{loading ? 'Submitting…' : 'Submit Application'}</button>}
                </div>
                {hasAccount && (
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    Already registered? <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--yellow)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Sign in</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ padding: '18px 24px 26px', textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <Clock size={12} /> © {new Date().getFullYear()} RepairEase · Service Provider Portal
      </footer>
    </div>
  );
}
