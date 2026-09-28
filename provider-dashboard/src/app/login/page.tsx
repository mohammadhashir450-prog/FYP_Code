'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

const SERVICE_TYPES = [
  'Automotive Engineering & Diagnostics',
  'Master Auto Mechanic',
  'Automotive Electrical & ECU Specialist',
  'Tyre & High-Speed Balancing',
  'HVAC & Climate Control Specialist',
  'Precision Bodywork & Paint',
  'Industrial Generator Specialist',
  'Heavy Machinery Repair',
  'Other Accredited Engineering',
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(0); // 0: Personal, 1: Workshop, 2: Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Camera & Document Upload State
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [docUploaded, setDocUploaded] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form State
  const [form, setForm] = useState({
    email: 'maximilian.s@repairease.com',
    password: '••••••••••••••••',
    fullName: '',
    phone: '',
    cnic: '',
    shopName: '',
    shopAddress: '',
    serviceType: SERVICE_TYPES[0],
    experience: '5+ Years',
  });

  const up = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError('');
  };

  /* ── LOGIN HANDLER ── */
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.email) {
      setError('Please provide your Email Address or Vault ID.');
      return;
    }
    setLoading(true);
    setError('');

    // Authenticate
    const ok = await login(
      form.email === 'maximilian.s@repairease.com' ? 'provider@demo.com' : form.email,
      form.password === '••••••••••••••••' ? 'demo123' : form.password
    );

    setLoading(false);
    if (ok) {
      showToast('Vault Clearance Granted · Welcome to RepairEase', 'success');
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use demo: provider@demo.com / demo123');
    }
  };

  /* ── GOOGLE AUTH SIMULATION ── */
  const handleGoogleAuth = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    await login('google.provider@repairease.com', 'demo123');
    setLoading(false);
    showToast('Authenticated via Google Sovereign SSO', 'success');
    router.push('/dashboard');
  };

  /* ── CAMERA HANDLERS ── */
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraActive(false);
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
    setPhotoTaken(true);
    showToast('Biometric live snapshot verified!', 'success');
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoDataUrl(null);
    startCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('Document must be under 15MB.');
        return;
      }
      setDocUploaded(file.name);
      showToast(`Accreditation Document "${file.name}" uploaded.`, 'success');
    }
  };

  /* ── MULTI-STEP SIGN UP VALIDATION & SUBMISSION ── */
  const handleNextStep = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return setError('Please enter your full legal name.');
      if (!form.email.trim()) return setError('Please enter a valid business email.');
      if (!form.phone.trim()) return setError('Please enter your direct mobile contact.');
      if (!form.cnic.trim()) return setError('National Identity or Passport ID is required.');
    }
    if (step === 1) {
      if (!form.shopName.trim()) return setError('Workshop or service entity name is required.');
      if (!form.shopAddress.trim()) return setError('Physical workshop address is required.');
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleSubmitCharter = async () => {
    if (!docUploaded) return setError('Please upload your trade certification or CNIC.');
    if (!photoTaken) return setError('Live photo capture is mandatory for tier-1 clearance.');
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    showToast('Charter Application Submitted. Awaiting Sovereign Review.', 'success');
    router.push('/pending');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090e',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Background radial gold glow */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── 1. TOP HEADER BAR ─────────────────────────────────── */}
      <header
        style={{
          padding: '24px 44px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #d4af37 0%, #997a3a 100%)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(212, 175, 55, 0.35)',
              border: '1px solid rgba(255, 235, 170, 0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 9L12 16L22 9L12 2Z" fill="#080c14" />
              <path d="M2 15L12 22L22 15" stroke="#080c14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '2px',
                color: '#f8fafc',
                lineHeight: 1.1,
              }}
            >
              REPAIREASE
            </div>
            <div
              style={{
                fontSize: '8.5px',
                fontWeight: 700,
                color: '#c5a059',
                letterSpacing: '2px',
              }}
            >
              PROVIDER PORTAL · EXECUTIVE
            </div>
          </div>
        </div>

        {/* Right Top Status & Help */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '20px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#f3e5ab',
              letterSpacing: '0.8px',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#d4af37',
                boxShadow: '0 0 8px #d4af37',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            <span>PROVIDER ENCLAVE</span>
          </div>

          <button
            onClick={() =>
              showToast('Security Node: FINMA Regulated 256-bit AES Enclave · Zero-Knowledge Authentication', 'info')
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
            title="Sovereign Security Protocol Help"
          >
            ?
          </button>
        </div>
      </header>

      {/* ── 2. CENTER PIECE: 2-COLUMN SPLIT GATEWAY CARD ─────── */}
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          style={{
            maxWidth: '1020px',
            width: '100%',
            minHeight: '580px',
            background: 'linear-gradient(135deg, rgba(12, 16, 25, 0.96) 0%, rgba(8, 12, 18, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.05)',
            display: 'grid',
            gridTemplateColumns: '44% 56%',
            overflow: 'hidden',
          }}
        >
          {/* ── LEFT PANEL (SWISS CUSTODY / REPAIREASE EXCELLENCE) ── */}
          <div
            style={{
              background: 'linear-gradient(175deg, #090e17 0%, #060810 100%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '48px 42px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top decorative gradient bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #d4af37, transparent)',
              }}
            />

            <div>
              {/* Top Enclave Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#c5a059',
                  letterSpacing: '1.4px',
                  textTransform: 'uppercase',
                  marginBottom: '60px',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#d4af37',
                    boxShadow: '0 0 6px #d4af37',
                  }}
                />
                <span>ZURICH VAULT ENCLAVE</span>
              </div>

              {/* Sub-label */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  color: '#d4af37',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                SWISS CUSTODY
              </div>

              {/* Grand Serif Headline */}
              <h1
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: '40px',
                  lineHeight: 1.15,
                  fontWeight: 500,
                  margin: '0 0 20px 0',
                }}
              >
                <span style={{ color: '#f8fafc', display: 'block' }}>Uncompromising</span>
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #f3e5ab 0%, #d4af37 60%, #b89327 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                  }}
                >
                  Sovereign
                </span>
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #f3e5ab 0%, #d4af37 60%, #b89327 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                  }}
                >
                  Custody
                </span>
              </h1>

              {/* Gold separator rule */}
              <div
                style={{
                  width: '42px',
                  height: '2px',
                  background: '#d4af37',
                  marginBottom: '22px',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                }}
              />

              {/* Description */}
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: '#94a3b8',
                  maxWidth: '320px',
                  margin: 0,
                }}
              >
                Reserved exclusively for private estates and accredited family offices requiring cryptographic finality.
              </p>
            </div>

            {/* Bottom Certification Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#64748b',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                paddingTop: '28px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#22c55e' }}>✔</span>
                <span>GOTTHARD DEPOSITORY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#d4af37' }}>🔒</span>
                <span>TIER-4 SECURITY</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL (VAULT GATEWAY / SIGN UP) ─────────── */}
          <div
            style={{
              padding: '48px 46px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#0c1018',
            }}
          >
            {/* Top Key Icon in Rounded Dark Container */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="14" r="4" stroke="#d4af37" strokeWidth="2" />
                <path d="M12 14L21 14M21 14L21 10M17 14L17 11" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Gateway Titles */}
            <div style={{ textAlign: 'center', marginBottom: '26px' }}>
              <h2
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  margin: '0 0 6px 0',
                }}
              >
                {mode === 'login' ? 'Vault Gateway' : 'Charter Application'}
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  margin: 0,
                }}
              >
                {mode === 'login'
                  ? 'Enter credentials to access private reserves'
                  : 'Register credentials for accredited platform clearance'}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '9px 14px',
                  fontSize: '12px',
                  color: '#ef4444',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── MODE: LOGIN ── */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Field 1: Email Address or Vault ID */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      letterSpacing: '1.2px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      marginBottom: '7px',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    EMAIL ADDRESS OR VAULT ID
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#07090e',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '7px',
                      padding: '0 14px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ color: '#64748b', fontSize: '14px', marginRight: 10 }}>👤</span>
                    <input
                      type="text"
                      value={form.email}
                      onChange={(e) => up('email', e.target.value)}
                      placeholder="maximilian.s@aurelia-reserve.ch"
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#f8fafc',
                        fontSize: '13px',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </div>

                {/* Field 2: Password with Forgot Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                    <label
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '1.2px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '11px',
                        color: '#c5a059',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#07090e',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '7px',
                      padding: '0 14px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ color: '#64748b', fontSize: '14px', marginRight: 10 }}>🔒</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => up('password', e.target.value)}
                      placeholder="••••••••••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#f8fafc',
                        fontSize: '13px',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: showPass ? '#d4af37' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '13px',
                        padding: '4px',
                      }}
                    >
                      {showPass ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Remember device & Encrypted TLS Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '12px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        accentColor: '#d4af37',
                        width: 15,
                        height: 15,
                        cursor: 'pointer',
                      }}
                    />
                    <span>Remember this device</span>
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '10px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#64748b',
                    }}
                  >
                    <span style={{ color: '#d4af37' }}>🛡️</span>
                    <span>ENCRYPTED TLS 1.3</span>
                  </div>
                </div>

                {/* Primary Button: SIGN IN */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '13px',
                    borderRadius: '7px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                    border: '1px solid rgba(255, 235, 170, 0.4)',
                    color: '#07090e',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    marginTop: 6,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(212, 175, 55, 0.55)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(212, 175, 55, 0.35)';
                  }}
                >
                  <span>➔]</span>
                  <span>{loading ? 'AUTHENTICATING ENCLAVE...' : 'SIGN IN'}</span>
                </button>

                {/* Divider Line: OR CONTINUE WITH */}
                <div
                  style={{
                    position: 'relative',
                    textAlign: 'center',
                    margin: '6px 0',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'rgba(255, 255, 255, 0.08)',
                    }}
                  />
                  <span
                    style={{
                      position: 'relative',
                      background: '#0c1018',
                      padding: '0 12px',
                      fontSize: '9.5px',
                      color: '#64748b',
                      letterSpacing: '1.2px',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    OR CONTINUE WITH
                  </span>
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '11px',
                    borderRadius: '7px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  {/* Google G SVG */}
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  <span>CONTINUE WITH GOOGLE</span>
                </button>

                {/* Bottom Switch to Sign Up */}
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: '11.5px', color: '#94a3b8' }}>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setStep(0);
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#d4af37',
                      fontWeight: 800,
                      cursor: 'pointer',
                      letterSpacing: '0.4px',
                      textDecoration: 'underline',
                    }}
                  >
                    APPLY FOR CHARTER / SIGN UP
                  </button>
                </div>
              </form>
            ) : (
              /* ── MODE: SIGN UP (CHARTER APPLICATION) ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Step indicator */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {['Credentials', 'Specialization', 'Biometrics & Docs'].map((label, idx) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        background: idx === step ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${idx === step ? '#d4af37' : 'rgba(255, 255, 255, 0.06)'}`,
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '9.5px',
                        color: idx === step ? '#f3e5ab' : '#64748b',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {idx + 1}. {label}
                    </div>
                  ))}
                </div>

                {/* Step 0: Personal Credentials */}
                {step === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                        FULL LEGAL NAME
                      </label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => up('fullName', e.target.value)}
                        placeholder="e.g. Master Engr. Bilal Raza"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#07090e',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '12.5px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => up('email', e.target.value)}
                          placeholder="engr@domain.com"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#07090e',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: '#f8fafc',
                            fontSize: '12.5px',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                          PHONE NUMBER
                        </label>
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => up('phone', e.target.value)}
                          placeholder="0300-1234567"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#07090e',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: '#f8fafc',
                            fontSize: '12.5px',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                        CNIC / NATIONAL IDENTITY ID
                      </label>
                      <input
                        type="text"
                        value={form.cnic}
                        onChange={(e) => up('cnic', e.target.value)}
                        placeholder="35201-1234567-1"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#07090e',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '12.5px',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#07090e',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: 4,
                      }}
                    >
                      PROCEED TO WORKSHOP CREDENTIALS ➔
                    </button>
                  </div>
                )}

                {/* Step 1: Workshop & Specialization */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                        WORKSHOP / ENTITY NAME
                      </label>
                      <input
                        type="text"
                        value={form.shopName}
                        onChange={(e) => up('shopName', e.target.value)}
                        placeholder="e.g. Apex Precision Motors & Diagnostics"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#07090e',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '12.5px',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                        SERVICE SPECIALIZATION
                      </label>
                      <select
                        value={form.serviceType}
                        onChange={(e) => up('serviceType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#07090e',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      >
                        {SERVICE_TYPES.map((t) => (
                          <option key={t} value={t} style={{ background: '#0c1018' }}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', marginBottom: 5 }}>
                        PHYSICAL SERVICE LOCATION
                      </label>
                      <input
                        type="text"
                        value={form.shopAddress}
                        onChange={(e) => up('shopAddress', e.target.value)}
                        placeholder="Plot 14, Commercial Sector Y, DHA Lahore"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#07090e',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '12.5px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        style={{
                          flex: 1,
                          padding: '11px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        style={{
                          flex: 2,
                          padding: '11px',
                          background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#07090e',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                        }}
                      >
                        PROCEED TO VERIFICATION ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Biometrics & Documents */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Document Upload */}
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        padding: '14px',
                        border: '1px dashed rgba(212, 175, 55, 0.4)',
                        background: 'rgba(212, 175, 55, 0.04)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <div style={{ fontSize: '18px', marginBottom: 4 }}>📄</div>
                      <div style={{ fontSize: '11.5px', color: '#f3e5ab', fontWeight: 600 }}>
                        {docUploaded ? `Attached: ${docUploaded}` : 'Upload Trade License / CNIC Document'}
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: 2 }}>
                        PDF, PNG or JPG (Max 15MB)
                      </div>
                    </div>

                    {/* Live Biometric Camera Capture */}
                    <div
                      style={{
                        background: '#07090e',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                      }}
                    >
                      {photoDataUrl ? (
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoDataUrl}
                            alt="Captured Live"
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              margin: '0 auto 8px auto',
                              border: '2px solid #22c55e',
                            }}
                          />
                          <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
                            ✓ Live Biometric Face Attestation Verified
                          </div>
                          <button
                            type="button"
                            onClick={retakePhoto}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#d4af37',
                              fontSize: '10px',
                              cursor: 'pointer',
                              marginTop: 4,
                            }}
                          >
                            Retake Photo
                          </button>
                        </div>
                      ) : cameraActive ? (
                        <div>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                              width: '180px',
                              height: '135px',
                              borderRadius: '6px',
                              margin: '0 auto 8px auto',
                              background: '#000',
                            }}
                          />
                          <canvas ref={canvasRef} style={{ display: 'none' }} />
                          <button
                            type="button"
                            onClick={capturePhoto}
                            style={{
                              padding: '6px 14px',
                              background: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Capture Snapshot
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginBottom: 6 }}>
                            Live Camera Attestation Required
                          </div>
                          <button
                            type="button"
                            onClick={startCamera}
                            style={{
                              padding: '7px 16px',
                              background: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid #d4af37',
                              borderRadius: '5px',
                              color: '#f3e5ab',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            📷 Enable Webcam Verification
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{
                          flex: 1,
                          padding: '11px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitCharter}
                        disabled={loading}
                        style={{
                          flex: 2,
                          padding: '11px',
                          background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#07090e',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                        }}
                      >
                        {loading ? 'TRANSMITTING APPLICATION...' : 'SUBMIT CHARTER APPLICATION ➔'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Switch back to sign in */}
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: '11.5px', color: '#94a3b8' }}>
                  Already have an accredited charter?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#d4af37',
                      fontWeight: 800,
                      cursor: 'pointer',
                      letterSpacing: '0.4px',
                      textDecoration: 'underline',
                    }}
                  >
                    SIGN IN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── 3. BOTTOM FOOTER ─────────────────────────────────── */}
      <footer
        style={{
          padding: '20px 44px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10.5px',
          color: '#64748b',
          fontFamily: "'JetBrains Mono', monospace",
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          position: 'relative',
          zIndex: 10,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: '#d4af37' }}>●</span>
          <span>© 2026 RepairEase Technologies S.A. • FINMA Regulated Depository</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button
            onClick={() => showToast('Protocol: Zero-Knowledge Multi-Sig v4.2 Enclave', 'info')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '10.5px' }}
          >
            PROTOCOL
          </button>
          <button
            onClick={() => showToast('Disclosures: All services cryptographic settlement compliant', 'info')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '10.5px' }}
          >
            DISCLOSURES
          </button>
          <button
            onClick={() => showToast('Security: Level-5 HSM & Biometric Cryptographic Isolation', 'info')}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '10.5px' }}
          >
            SECURITY
          </button>
        </div>
      </footer>

      {/* ── 4. FORGOT PASSWORD MODAL ─────────────────────────── */}
      {forgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#0c1018',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '14px',
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 0 50px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '19px', color: '#f8fafc', margin: 0 }}>
                Reset Vault Passkey
              </h3>
              <button
                onClick={() => setForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: 18 }}>
              Enter your registered Vault ID or business email address to dispatch an encrypted one-time hardware reset token.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. maximilian.s@repairease.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#07090e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '12.5px',
                marginBottom: 20,
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setForgotModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setForgotModal(false);
                  showToast('Encrypted Passkey Reset Token dispatched to your email.', 'success');
                }}
                style={{
                  flex: 1.5,
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                  border: 'none',
                  color: '#07090e',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Dispatch Reset Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
