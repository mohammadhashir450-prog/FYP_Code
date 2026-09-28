'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

const STEPS = ['Personal Info', 'Shop Details', 'Documents & Photo'];

const SERVICE_TYPES = [
  'Auto Mechanic', 'Electrician', 'Plumber', 'Tyre Shop',
  'AC Technician', 'Painter', 'Carpenter', 'Generator Repair',
  'Mobile Repair', 'Computer Technician', 'Other',
];

const FEATURES = [
  { icon: '📋', title: 'Instant Job Alerts', desc: 'Get notified the moment a customer requests your service' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Communicate directly with customers via in-app messaging' },
  { icon: '⭐', title: 'Build Your Reputation', desc: 'Verified reviews help you grow your customer base' },
  { icon: '📍', title: 'Smart Location Matching', desc: 'Customers near you find you first — like InDrive' },
  { icon: '💰', title: 'Instant Payments', desc: 'Receive payments securely directly to your wallet' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [docUploaded, setDocUploaded] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [featureIndex, setFeatureIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    fullName: '', phone: '', cnic: '',
    shopName: '', shopAddress: '', serviceType: '', experience: '', bio: '',
  });

  // Cycle through features on left panel
  useEffect(() => {
    const t = setInterval(() => setFeatureIndex(i => (i + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const up = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); if (error) setError(''); };

  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = pwStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor = ['', 'var(--danger)', '#f97316', 'var(--accent3)', 'var(--accent)', 'var(--success)'][strength];

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    setLoading(true); setError('');
    const ok = await login(form.email, form.password);
    setLoading(false);
    if (ok) {
      showToast('Welcome back, Ahmed! 👋', 'success');
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Try provider@demo.com / demo123');
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return 'Full name is required.';
      if (!form.email.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
      if (!form.phone.trim()) return 'Phone number is required.';
      if (!form.cnic.trim()) return 'CNIC number is required.';
      if (!form.password) return 'Password is required.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 1) {
      if (!form.shopName.trim()) return 'Shop name is required.';
      if (!form.shopAddress.trim()) return 'Shop address is required.';
      if (!form.serviceType) return 'Please select a service type.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) return setError(err);
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!docUploaded) return setError('Please upload your CNIC or business document.');
    if (!photoTaken) return setError('Please take a live photo for verification.');
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    showToast('Registration submitted! Awaiting admin approval.', 'success');
    router.push('/pending');
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch {
      setCameraActive(false);
      setError('Camera access denied. Please allow camera permissions in your browser.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setPhotoDataUrl(dataUrl);
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setPhotoTaken(true);
    showToast('Photo captured successfully!', 'success');
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
    setCameraActive(false);
    setPhotoDataUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return setError('File size must be less than 10MB.');
      setDocUploaded(file.name);
      showToast(`Document "${file.name}" uploaded!`, 'success');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* ───────── LEFT PANEL ───────── */}
      <div style={{
        background: 'linear-gradient(160deg, #0d0d2b 0%, #1a0533 45%, #07101f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 65%)', top: '-5%', left: '-10%', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 65%)', bottom: '5%', right: '-5%', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)', top: '40%', right: '10%', borderRadius: '50%' }} />

        <div style={{ position: 'relative', maxWidth: 380, width: '100%' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px',
              boxShadow: '0 8px 32px var(--accent-glow)',
              animation: 'float 3s ease-in-out infinite',
            }}>🔧</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, #f0f4ff, var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ProServe
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Provider Portal</div>
            </div>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.3, marginBottom: 12, color: 'var(--text-primary)' }}>
            Grow Your Business<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              On Your Terms
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px', marginBottom: 40 }}>
            Join thousands of verified service professionals managing jobs, customers, and earnings — all from one smart dashboard.
          </p>

          {/* Rotating feature card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: 28,
            minHeight: 90,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: i === featureIndex ? 'flex' : 'none',
                gap: 14, alignItems: 'flex-start',
                animation: 'fadeIn 0.4s ease',
              }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FEATURES.map((_, i) => (
              <div key={i} onClick={() => setFeatureIndex(i)} style={{
                width: i === featureIndex ? 20 : 6, height: 6,
                borderRadius: '3px',
                background: i === featureIndex ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex' }}>
              {['UA', 'SM', 'BR', 'FK', 'AK'].map((av, i) => (
                <div key={av} style={{
                  width: 30, height: 30,
                  background: `hsl(${i * 60 + 200}, 70%, 50%)`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: 'white',
                  marginLeft: i === 0 ? 0 : -8,
                  border: '2px solid var(--bg-primary)',
                }}>
                  {av}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 1 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: 'var(--accent3)', fontSize: '12px' }}>★</span>)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trusted by 2,400+ providers</div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── RIGHT PANEL ───────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Mode toggle */}
          <div className="tabs" style={{ marginBottom: 32 }}>
            <button id="tab-login" className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setStep(0); setError(''); }}>
              Sign In
            </button>
            <button id="tab-register" className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}>
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger animate-fadeIn" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          {/* ─── LOGIN ─── */}
          {mode === 'login' && (
            <div className="animate-fadeIn">
              <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: 6 }}>Welcome back 👋</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 28 }}>
                Sign in to your provider account to continue
              </p>

              <div className="form-group">
                <label className="label" htmlFor="login-email">Email Address</label>
                <input id="login-email" type="email" className="input" placeholder="ahmed@example.com"
                  value={form.email} onChange={e => up('email', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="login-password">
                  Password
                  <Link href="#" style={{ float: 'right', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </label>
                <div style={{ position: 'relative' }}>
                  <input id="login-password" type={showPass ? 'text' : 'password'} className="input"
                    placeholder="Enter your password" value={form.password}
                    onChange={e => up('password', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ paddingRight: 48 }} />
                  <button onClick={() => setShowPass(s => !s)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px',
                  }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <button id="btn-login" onClick={handleLogin} disabled={loading}
                className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }}>
                {loading
                  ? <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span> Signing in...</>
                  : 'Sign In →'}
              </button>

              {/* Demo credentials */}
              <div style={{
                marginTop: 24,
                background: 'var(--bg-card)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                fontSize: '13px',
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Demo Credentials
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => { up('email', 'provider@demo.com'); up('password', 'demo123'); }}
                    style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', color: 'var(--accent)', fontFamily: 'Inter, sans-serif' }}>
                    provider@demo.com / demo123
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── REGISTER ─── */}
          {mode === 'register' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: 4 }}>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: 24 }}>
                Join ProServe as a verified service provider
              </p>

              {/* Step progress */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                {STEPS.map((label, i) => (
                  <div key={label} style={{ flex: 1 }}>
                    <div style={{
                      height: 4, borderRadius: 2,
                      background: i < step ? 'var(--success)' : i === step ? 'linear-gradient(90deg, var(--accent), var(--accent2))' : 'var(--border)',
                      transition: 'background 0.4s',
                    }} />
                    <div style={{ fontSize: '10px', marginTop: 5, fontWeight: i === step ? 700 : 400, color: i <= step ? (i === step ? 'var(--accent)' : 'var(--success)') : 'var(--text-muted)' }}>
                      {i < step ? '✓ ' : `${i + 1}. `}{label}
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── Step 0 ─── */}
              {step === 0 && (
                <div className="animate-fadeIn">
                  <div className="grid-2" style={{ gap: 14 }}>
                    <div className="form-group">
                      <label className="label" htmlFor="r-name">Full Name *</label>
                      <input id="r-name" type="text" className="input" placeholder="Ahmed Khan" value={form.fullName} onChange={e => up('fullName', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="r-phone">Phone *</label>
                      <input id="r-phone" type="tel" className="input" placeholder="+92 300 0000000" value={form.phone} onChange={e => up('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-email">Email Address *</label>
                    <input id="r-email" type="email" className="input" placeholder="ahmed@example.com" value={form.email} onChange={e => up('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-cnic">CNIC Number *</label>
                    <input id="r-cnic" type="text" className="input" placeholder="42201-1234567-1" value={form.cnic} onChange={e => up('cnic', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-pw">Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input id="r-pw" type={showPass ? 'text' : 'password'} className="input"
                        placeholder="Create strong password" value={form.password}
                        onChange={e => up('password', e.target.value)} style={{ paddingRight: 48 }} />
                      <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {form.password && (
                      <div style={{ marginTop: 8 }}>
                        <div className="progress-bar">
                          <div style={{ height: '100%', width: `${(strength / 5) * 100}%`, background: strengthColor, borderRadius: 3, transition: 'all 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: strengthColor, marginTop: 3, display: 'block' }}>
                          Strength: {strengthLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-cpw">Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input id="r-cpw" type={showConfirmPass ? 'text' : 'password'} className="input"
                        placeholder="Repeat your password" value={form.confirmPassword}
                        onChange={e => up('confirmPassword', e.target.value)}
                        style={{ paddingRight: 48, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? 'var(--danger)' : '' }} />
                      <button onClick={() => setShowConfirmPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {showConfirmPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: 3, display: 'block' }}>Passwords don't match</span>
                    )}
                  </div>
                  <button id="reg-next-1" onClick={handleNext} className="btn btn-primary btn-full">
                    Next: Shop Details →
                  </button>
                </div>
              )}

              {/* ─── Step 1 ─── */}
              {step === 1 && (
                <div className="animate-fadeIn">
                  <div className="form-group">
                    <label className="label" htmlFor="r-shop">Shop / Business Name *</label>
                    <input id="r-shop" type="text" className="input" placeholder="Ahmed Auto Repair" value={form.shopName} onChange={e => up('shopName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-addr">Shop Address *</label>
                    <input id="r-addr" type="text" className="input" placeholder="Street 5, Model Town, Lahore" value={form.shopAddress} onChange={e => up('shopAddress', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-stype">Service Type *</label>
                    <select id="r-stype" className="input" value={form.serviceType} onChange={e => up('serviceType', e.target.value)} style={{ cursor: 'pointer' }}>
                      <option value="">Select your service type</option>
                      {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid-2" style={{ gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="label" htmlFor="r-exp">Experience (years)</label>
                      <input id="r-exp" type="number" className="input" placeholder="5" value={form.experience} onChange={e => up('experience', e.target.value)} min="0" max="60" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="label" style={{ opacity: 0 }}>.</label>
                      <div style={{ display: 'flex', gap: 8, height: 46 }}>
                        <button onClick={() => setStep(0)} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="r-bio">Short Bio (optional)</label>
                    <textarea id="r-bio" className="input" rows={3} placeholder="Describe your experience and services..." value={form.bio} onChange={e => up('bio', e.target.value)} style={{ resize: 'vertical' }} />
                  </div>
                  <button id="reg-next-2" onClick={handleNext} className="btn btn-primary btn-full">
                    Next: Documents & Photo →
                  </button>
                </div>
              )}

              {/* ─── Step 2 ─── */}
              {step === 2 && (
                <div className="animate-fadeIn">
                  {/* Document upload */}
                  <div className="form-group">
                    <label className="label">📄 Upload CNIC / Business License *</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: `2px dashed ${docUploaded ? 'var(--success)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: docUploaded ? 'rgba(34,197,94,0.05)' : 'var(--bg-input)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: 6 }}>{docUploaded ? '✅' : '📂'}</div>
                      <div style={{ fontSize: '13px', color: docUploaded ? 'var(--success)' : 'var(--text-secondary)', fontWeight: docUploaded ? 600 : 400 }}>
                        {docUploaded ? docUploaded : 'Click to upload document'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 3 }}>PDF, JPG, PNG — Max 10MB</div>
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                    {docUploaded && (
                      <button onClick={() => setDocUploaded(null)} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>🗑️ Remove</button>
                    )}
                  </div>

                  {/* Live photo */}
                  <div className="form-group">
                    <label className="label">🤳 Live Selfie for Identity Verification *</label>
                    <div style={{
                      border: `2px solid ${photoTaken ? 'var(--success)' : cameraActive ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      background: 'var(--bg-input)',
                      transition: 'border-color 0.3s',
                    }}>
                      {cameraActive ? (
                        <div style={{ position: 'relative' }}>
                          <video ref={videoRef} autoPlay playsInline muted
                            style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
                          <div style={{
                            position: 'absolute', inset: 0,
                            border: '3px solid rgba(108,99,255,0.5)',
                            borderRadius: 0,
                            pointerEvents: 'none',
                          }} />
                          <button id="btn-capture-photo" onClick={capturePhoto} style={{
                            position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                            width: 52, height: 52,
                            background: 'white', border: '4px solid var(--accent)', borderRadius: '50%',
                            cursor: 'pointer', fontSize: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                          }}>📷</button>
                        </div>
                      ) : photoTaken && photoDataUrl ? (
                        <div style={{ position: 'relative' }}>
                          <img src={photoDataUrl} alt="Captured" style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
                          <div style={{
                            position: 'absolute', top: 10, right: 10,
                            background: 'var(--success)', borderRadius: '50%',
                            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px',
                          }}>✓</div>
                        </div>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: 8 }}>🤳</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 14 }}>
                            Take a live selfie for identity verification.<br />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Make sure your face is clearly visible and well-lit.</span>
                          </div>
                          <button id="btn-open-camera" onClick={startCamera} className="btn btn-secondary btn-sm">
                            📷 Open Camera
                          </button>
                        </div>
                      )}
                    </div>
                    {photoTaken && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: '12px', color: 'var(--success)', flex: 1 }}>✅ Photo captured successfully</span>
                        <button onClick={retakePhoto} className="btn btn-ghost btn-sm">🔄 Retake</button>
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>

                  {/* Agreement */}
                  <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                    By submitting, you agree to our <a href="#" style={{ color: 'var(--accent)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy Policy</a>. Your information is encrypted and secure.
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
                    <button id="btn-submit-register" onClick={handleSubmit} disabled={loading || !docUploaded || !photoTaken}
                      className="btn btn-primary" style={{ flex: 2, opacity: (!docUploaded || !photoTaken) ? 0.5 : 1 }}>
                      {loading
                        ? <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span> Submitting...</>
                        : '🚀 Submit for Verification'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
