'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ── CHART TRAJECTORY DATA ── */
const TRAJECTORY_DATA = [
  { date: 'JAN 2026', value: 85, cap: 130 },
  { date: 'FEB 2026', value: 92, cap: 130 },
  { date: 'MAR 2026', value: 98, cap: 130 },
  { date: 'APR 2026', value: 104, cap: 130 },
  { date: 'MAY 2026', value: 109, cap: 130 },
  { date: 'JUN 2026', value: 114, cap: 130 },
  { date: 'JUL 2026', value: 118, cap: 130 },
  { date: 'AUG 2026', value: 122, cap: 130 },
  { date: 'SEP 2026', value: 126, cap: 130 },
  { date: 'OCT 2026', value: 130, cap: 130 },
  { date: 'TODAY (ATH)', value: 134.8, cap: 130 },
];

/* ── ANIMATED COUNTER COMPONENT ── */
function Counter({
  target,
  prefix = '',
  suffix = '',
  decimals = 0,
  hidden = false,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  hidden?: boolean;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 1200;
    const fps = 60;
    const totalFrames = Math.round(duration / (1000 / fps));
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      if (frame >= totalFrames) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(target * easeOut);
      }
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [target]);

  if (hidden) return <>••••••••••</>;

  const formattedNumber = val.toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <>
      {prefix}
      {formattedNumber}
      {suffix}
    </>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [allocTab, setAllocTab] = useState<'consolidated' | 'offshore' | 'bullion'>('consolidated');
  
  // Interactive Modals
  const [biometricModal, setBiometricModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [mandateModal, setMandateModal] = useState(false);
  const [dossierModal, setDossierModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanApproved, setScanApproved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBiometricAuth = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanApproved(true);
      showToast('Biometric Attestation Verified · Mandate #M-9021 Authorized', 'success');
      setTimeout(() => {
        setBiometricModal(false);
        setScanApproved(false);
      }, 1400);
    }, 1800);
  };

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <div
        style={{
          background: '#07090e',
          minHeight: '100vh',
          color: '#f8fafc',
          padding: '24px 28px 48px 28px',
          fontFamily: "'Inter', sans-serif",
        }}
        className="animate-fadeIn"
      >
        {/* ── 1. HERO SECTION ─────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 20, 31, 0.95) 0%, rgba(10, 14, 22, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.22)',
            borderRadius: '12px',
            padding: '26px 30px',
            marginBottom: '22px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Subtle gold accent light in background */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '120px',
              width: '380px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Left Header Titles */}
            <div>
              {/* Badges Top Line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    letterSpacing: '1.2px',
                    color: '#c5a059',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(212, 175, 55, 0.06)',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  LEVEL-5 SOVEREIGN SANCTION-FREE
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 8px #4ade80',
                      display: 'inline-block',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  HSM-ZK Cryptographic Attestation Active
                </span>
              </div>

              {/* Grand Title */}
              <h1
                style={{
                  fontSize: '34px',
                  fontWeight: 500,
                  margin: '0 0 8px 0',
                  lineHeight: 1.15,
                  letterSpacing: '0.2px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', Georgia, serif",
                    fontWeight: 700,
                    color: '#f8fafc',
                  }}
                >
                  Good Evening,{' '}
                </span>
                <span
                  style={{
                    fontFamily: "'Cinzel', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #f3e5ab 0%, #d4af37 60%, #b89327 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  Lord Montgomery
                </span>
              </h1>

              {/* Subtitle with Vault Metas */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontFamily: "'JetBrains Mono', monospace",
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Custody <strong style={{ color: '#d4af37' }}>MAR-0924-N</strong>
                </span>
                <span style={{ color: '#334155' }}>|</span>
                <span>Zurich Sub-Alpine cold Vault Alpha</span>
                <span style={{ color: '#334155' }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80' }}>
                  <span>🛡️</span> Zero knowledge consensus Ratified
                </span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {/* INITIATE TRANSFER (Gold) */}
                <button
                  onClick={() => setTransferModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                    color: '#07090e',
                    border: '1px solid rgba(255, 235, 170, 0.4)',
                    padding: '9px 18px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '12px',
                    letterSpacing: '0.8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(212, 175, 55, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(212, 175, 55, 0.35)';
                  }}
                >
                  <span style={{ fontSize: '14px' }}>⚡</span>
                  INITIATE TRANSFER
                </button>

                {/* Multi-Sig Mandate (Dark) */}
                <button
                  onClick={() => setMandateModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(21, 28, 42, 0.8)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#d4af37';
                    (e.currentTarget as HTMLButtonElement).style.color = '#f3e5ab';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212, 175, 55, 0.25)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
                  }}
                >
                  <span style={{ fontSize: '13px' }}>🛡️</span>
                  Multi-Sig Mandate
                </button>
              </div>

              {/* Secondary Tools: Tax Dossier & Privacy Eye */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setDossierModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 12px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#d4af37';
                    (e.currentTarget as HTMLButtonElement).style.color = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                  }}
                >
                  <span>📄</span>
                  Tax Dossier
                </button>

                <button
                  onClick={() => {
                    setPrivacyMode(!privacyMode);
                    showToast(privacyMode ? 'Values Visible' : 'Privacy Mode: Balances Masked', 'info');
                  }}
                  title={privacyMode ? 'Show Figures' : 'Mask Balances'}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: privacyMode ? '#d4af37' : '#94a3b8',
                    border: `1px solid ${privacyMode ? '#d4af37' : 'rgba(255, 255, 255, 0.08)'}`,
                    padding: '6px 10px',
                    borderRadius: '5px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {privacyMode ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. FOUR GRAND METRIC CARDS ───────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: '24px',
          }}
        >
          {/* CARD 1: GROSS CONSOLIDATED ASSETS */}
          <div
            style={{
              background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#d4af37';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212, 175, 55, 0.2)';
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                GROSS CONSOLIDATED ASSETS
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                +2.91%
              </span>
            </div>

            <div
              style={{
                fontSize: '25px',
                fontWeight: 800,
                color: '#f8fafc',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              <Counter target={148920100} prefix="PKR " hidden={privacyMode} />
              <span style={{ color: '#d4af37', fontSize: '20px' }}>.00</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
                paddingTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 6,
              }}
            >
              <span>CHF 132,840,110</span>
              <span style={{ color: '#d4af37' }}>61,400 oz XAU</span>
            </div>

            <div
              style={{
                fontSize: '9px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: '#22c55e' }}>Delta (24H): +PKR 4,210,000.00</span>
              <span>AUDITED 14:00 PKT</span>
            </div>
          </div>

          {/* CARD 2: UNENCUMBERED TIER-1 CASH */}
          <div
            style={{
              background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#d4af37';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212, 175, 55, 0.2)';
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                UNENCUMBERED TIER-1 CASH
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#d4af37',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                T+0
              </span>
            </div>

            <div
              style={{
                fontSize: '25px',
                fontWeight: 800,
                color: '#d4af37',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              <Counter target={42500000} prefix="PKR " hidden={privacyMode} />
              <span style={{ color: '#f3e5ab', fontSize: '20px' }}>.00</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
                paddingTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 6,
              }}
            >
              <span>SWIFT GPI Express Ready</span>
              <span>Zurich Vault Alpha</span>
            </div>

            <div
              style={{
                fontSize: '9px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Instant Liquidity Cap: <span style={{ color: '#d4af37' }}>PKR 25,000,000.00</span>
            </div>
          </div>

          {/* CARD 3: SOVEREIGN SYNDICATES & PE */}
          <div
            style={{
              background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#d4af37';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212, 175, 55, 0.2)';
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                SOVEREIGN SYNDICATES &amp; PE
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#d4af37',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                14.2% IRR
              </span>
            </div>

            <div
              style={{
                fontSize: '25px',
                fontWeight: 800,
                color: '#f8fafc',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              <Counter target={84180000} prefix="PKR " hidden={privacyMode} />
              <span style={{ color: '#d4af37', fontSize: '20px' }}>.00</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
                paddingTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 6,
              }}
            >
              <span>8 Prime Allocations</span>
              <span style={{ color: '#4ade80' }}>Q3 Distributions Settled</span>
            </div>

            <div
              style={{
                fontSize: '9px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Next Call: St. Moritz Fund</span>
              <span style={{ color: '#e2e8f0' }}>15. NOV 2026</span>
            </div>
          </div>

          {/* CARD 4: HARDWARE HSM THRESHOLD */}
          <div
            style={{
              background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '10px',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#d4af37';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212, 175, 55, 0.2)';
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                HARDWARE HSM THRESHOLD
              </div>
              <span style={{ fontSize: '13px', color: '#d4af37' }}>🛡️</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <div
                style={{
                  fontSize: '25px',
                  fontWeight: 800,
                  color: '#f8fafc',
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.1,
                }}
              >
                3 of 5 <span style={{ fontSize: '18px', color: '#94a3b8' }}>Keys</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase' }}>QUORUM</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37', fontFamily: "'JetBrains Mono', monospace" }}>
                  60%
                </div>
              </div>
            </div>

            {/* Segmented 5-Key Bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[1, 2, 3, 4, 5].map((k) => (
                <div
                  key={k}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 2,
                    background: k <= 3 ? '#d4af37' : '#1e293b',
                    boxShadow: k <= 3 ? '0 0 8px rgba(212, 175, 55, 0.6)' : 'none',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>

            <div
              style={{
                fontSize: '9px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Hardware Enclave Status:</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>IMPENETRABLE</span>
            </div>
          </div>
        </div>

        {/* ── 3. MIDDLE SECTION (LEFT CHART + RIGHT FIDUCIARY) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 20,
            marginBottom: '24px',
          }}
        >
          {/* LEFT WIDE CONTAINER: CAPITAL DEPLOYMENT & TRAJECTORY */}
          <div
            style={{
              background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header: Title + Filter Pills */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#c5a059',
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 4,
                  }}
                >
                  INSTITUTIONAL CUSTODY DISTRIBUTION
                </div>
                <h2
                  style={{
                    fontFamily: "'Cinzel', Georgia, serif",
                    fontSize: '21px',
                    fontWeight: 700,
                    margin: 0,
                    color: '#f8fafc',
                  }}
                >
                  Capital Deployment &amp; Sovereign Allocation
                </h2>
              </div>

              {/* Tabs: Consolidated, Offshore, Bullion */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(5, 8, 14, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '6px',
                  padding: '3px',
                }}
              >
                {(['consolidated', 'offshore', 'bullion'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setAllocTab(tab);
                      showToast(`View updated: ${tab.toUpperCase()} allocation`, 'info');
                    }}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: allocTab === tab ? '#d4af37' : 'transparent',
                      color: allocTab === tab ? '#07090e' : '#94a3b8',
                      transition: 'all 0.15s ease',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Segmented Distribution Bar */}
            <div
              style={{
                display: 'flex',
                height: '7px',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '20px',
                background: '#1e293b',
              }}
            >
              <div style={{ width: '38%', background: '#d4af37' }} title="Sovereign Bonds 38%" />
              <div style={{ width: '28%', background: '#f3e5ab' }} title="Swiss Bullion 28%" />
              <div style={{ width: '18%', background: '#4ade80' }} title="Tier-1 FX Cash 18%" />
              <div style={{ width: '16%', background: '#60a5fa' }} title="Private Syndicates 16%" />
            </div>

            {/* 4 Allocation Metric Boxes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
                marginBottom: '24px',
              }}
            >
              {/* Box 1: Sovereign Bonds */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4af37' }} />
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>Sovereign Bonds</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                  PKR 56.58M
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  38.0% • Weighted 4.41%
                </div>
              </div>

              {/* Box 2: Swiss Bullion */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f3e5ab' }} />
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>Swiss Bullion</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                  PKR 41.69M
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  28.0% • Allocated 999.9
                </div>
              </div>

              {/* Box 3: Tier-1 FX Cash */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>Tier-1 FX Cash</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                  PKR 26.80M
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  18.0% • Multi-Currency
                </div>
              </div>

              {/* Box 4: Private Syndicates */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>Private Syndicates</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                  PKR 23.85M
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  16.0% • 8 Strategic Funds
                </div>
              </div>
            </div>

            {/* Trajectory Header Line */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  SOVEREIGN COMPOUND YIELD TRAJECTORY (NAV 2026)
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ▲ +11.84% YTD NAV
                </span>
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#64748b',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Benchmark: CHF Risk-Free + 320bps
              </div>
            </div>

            {/* Trajectory Recharts Golden Area Chart */}
            <div style={{ position: 'relative', width: '100%', height: 180 }}>
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '10px',
                  fontSize: '8.5px',
                  color: '#475569',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '1px',
                  zIndex: 5,
                }}
              >
                $355M MAX CAP CEILING
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '10px',
                  fontSize: '8.5px',
                  color: '#475569',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '1px',
                  zIndex: 5,
                }}
              >
                INDEX: OBSIDIAN-ALPINE PRIVATE LEDGER
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAJECTORY_DATA} margin={{ top: 20, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sovereignGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="transparent"
                    tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{
                      background: '#090d14',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                    }}
                    formatter={(v: number) => [`PKR ${(v * 1.1).toFixed(2)}M`, 'NAV Yield']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#d4af37"
                    strokeWidth={2.5}
                    fill="url(#sovereignGold)"
                    dot={{ fill: '#d4af37', stroke: '#07090e', strokeWidth: 2, r: 3 }}
                    activeDot={{ fill: '#f3e5ab', stroke: '#d4af37', strokeWidth: 3, r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT STACKED COLUMN (3 CARDS) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 1. DESIGNATED FIDUCIARY */}
            <div
              style={{
                background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#64748b',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  DESIGNATED FIDUCIARY
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ● SECURE LINK ACTIVE
                </span>
              </div>

              {/* Fiduciary Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src="/fiduciary_banker.jpg"
                    alt="Hon. Alistair Vance"
                    width={44}
                    height={44}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    Hon. Alistair Vance
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#c5a059' }}>
                    Senior Partner - Zurich Private Desk
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                    Direct HSM Key: HAV-701
                  </div>
                </div>
              </div>

              {/* Quote Container */}
              <div
                style={{
                  background: 'rgba(5, 8, 14, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  marginBottom: 12,
                }}
              >
                &ldquo;Lord Montgomery, your Q4 sovereign bond re-allocation strategy is drafted. Ready for instant execution once biometric clearance is ratified.&rdquo;
                <div
                  style={{
                    fontSize: '9px',
                    color: '#64748b',
                    fontStyle: 'normal',
                    textAlign: 'right',
                    marginTop: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Encrypted Node • 13:58 PKT
                </div>
              </div>

              {/* Action Buttons: Direct Wire & Book Briefing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={() => {
                    showToast('Initiating encrypted audio uplink with Zurich Private Desk...', 'info');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '7px 10px',
                    borderRadius: '5px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    color: '#f3e5ab',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>📞</span> Direct Wire
                </button>
                <button
                  onClick={() => {
                    showToast('Briefing request queued for Zurich desk review', 'success');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '7px 10px',
                    borderRadius: '5px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>📅</span> Book Briefing
                </button>
              </div>
            </div>

            {/* 2. IMMEDIATE ACTION MANDATE */}
            <div
              style={{
                background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#ef4444',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  IMMEDIATE ACTION MANDATE
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  SIGN-OFF REQUIRED
                </span>
              </div>

              {/* Mandate Details */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                    Mandate #M-9021
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#d4af37', fontFamily: "'JetBrains Mono', monospace" }}>
                    PKR 12,500,000.00
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500, marginBottom: 3 }}>
                  Cross-Border Alpine Liquidity Rebalance
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', lineHeight: 1.35 }}>
                  Routing: GVA Tier-1 Vault to London Clearing House (GBP Conversion Hedged 1.3021)
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '10px',
                  color: '#4ade80',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 14,
                }}
              >
                <span>✔</span> 2 of 3 Trustees Approved
              </div>

              {/* Large Gold Button: AUTHORIZE WITH BIOMETRICS */}
              <button
                onClick={() => setBiometricModal(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                  color: '#07090e',
                  border: '1px solid rgba(255, 235, 170, 0.4)',
                  padding: '11px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '11.5px',
                  letterSpacing: '0.8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.3)';
                }}
              >
                <span style={{ fontSize: '15px' }}>🖐</span>
                AUTHORIZE WITH BIOMETRICS
              </button>
            </div>

            {/* 3. PHYSICAL STORAGE TELEMETRY */}
            <div
              style={{
                background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    PHYSICAL STORAGE TELEMETRY
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>
                    Zurich Alpine Bunker Alpha
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ARMED SECURED
                </span>
              </div>

              {/* CCTV Camera Stream Frame */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '140px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '10px',
                }}
              >
                <Image
                  src="/bunker_cctv.jpg"
                  alt="Zurich Alpine Bunker Live Feed"
                  fill
                  style={{ objectFit: 'cover' }}
                />

                {/* Night-vision scanline & vignette overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(rgba(10, 20, 10, 0.15) 50%, rgba(0, 0, 0, 0.4) 50%)',
                    backgroundSize: '100% 3px',
                    pointerEvents: 'none',
                  }}
                />

                {/* CCTV Top Overlay HUD */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '9px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#4ade80',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 1.2s infinite',
                    }}
                  />
                  <span>STREAM: LIVE [CAM-04-NORTH]</span>
                </div>
              </div>

              {/* Sensors Telemetry Readouts */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px',
                    padding: '6px 4px',
                  }}
                >
                  <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase' }}>TEMP</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                    16.4°C
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px',
                    padding: '6px 4px',
                  }}
                >
                  <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase' }}>SEISMIC</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>
                    0.00 gal
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '4px',
                    padding: '6px 4px',
                  }}
                >
                  <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase' }}>HUMIDITY</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                    32% RH
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. CUSTODY AUDIT LEDGER (HIGH VALUE EXECUTIONS) ─── */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0e131d 0%, #0a0e16 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#c5a059',
                  letterSpacing: '1.4px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 4,
                }}
              >
                CUSTODY AUDIT LEDGER
              </div>
              <h3
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: '19px',
                  fontWeight: 700,
                  margin: 0,
                  color: '#f8fafc',
                }}
              >
                High Value Executions &amp; Custody Feeds
              </h3>
            </div>

            <Link
              href="/jobs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '5px',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#f3e5ab',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textDecoration: 'none',
                textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s',
              }}
            >
              FULL ARCHIVE &gt;
            </Link>
          </div>

          {/* 3 Ledger Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* ROW 1: Geneva Vault Bullion */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#d4af37',
                  }}
                >
                  🏛️
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: 2 }}>
                    Geneva Vault Bullion Relocation (1,000 oz Fine Gold 999.9)
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                    REF: #GVA-AU-99021 • Carrier: Loomis International Air Secured • Today, 11:32 PKT
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  CLEARED
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                    PKR 2,748,500.00
                  </div>
                  <button
                    onClick={() => showToast('ZK-Proof Certificate #99021 Verified (SHA-256)', 'success')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d4af37',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: 0,
                    }}
                  >
                    ZK-Proof Cert ⤓
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2: Series C Sovereign Quantum */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    background: 'rgba(96, 165, 250, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#60a5fa',
                  }}
                >
                  ⚛️
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: 2 }}>
                    Series C Sovereign Quantum Syndicate Call
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                    REF: #SYND-Q-7708 • Escrow: Canton of Zug Trust Agent • Yesterday, 16:45 PKT
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    background: 'rgba(148, 163, 184, 0.1)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  MULTI-SIG SIGNED (3/3)
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                    PKR 5,000,000.00
                  </div>
                  <button
                    onClick={() => showToast('Trustee Signatures: 3/3 Validated with HSM Keys', 'info')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d4af37',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: 0,
                    }}
                  >
                    View Signatures 👁
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 3: Zurich Cantonal Treasury Distribution */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#22c55e',
                  }}
                >
                  🛡️
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: 2 }}>
                    Zurich Cantonal Treasury Distribution Deposit
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                    REF: #ZKB-DIV-0044 • Zero Withholding Protocol • 14 Oct 2026
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  AUTO-CREDIT
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', fontFamily: "'JetBrains Mono', monospace" }}>
                    +PKR 612,400.00
                  </div>
                  <button
                    onClick={() => setDossierModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d4af37',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: 0,
                    }}
                  >
                    Tax Slip 📄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. SOVEREIGN FIDUCIARY CORE MODULES BANNER ─────── */}
        <div
          style={{
            background: 'linear-gradient(90deg, #0e131d 0%, #151c2a 100%)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '10px',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '26px',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #d4af37 0%, #997a3a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#07090e',
              }}
            >
              ⚙️
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                Sovereign Fiduciary Core Modules
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Direct protocol routing to custody keys, KYC dossier attestations &amp; off-market syndicate desk
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/settings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#f3e5ab',
                fontSize: '11.5px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>🔑</span> HSM Security
            </Link>
            <Link
              href="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#f3e5ab',
                fontSize: '11.5px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>🪪</span> Biometric KYC
            </Link>
            <Link
              href="/reviews"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid #d4af37',
                color: '#d4af37',
                fontSize: '11.5px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>🌐</span> Private Allocations
            </Link>
          </div>
        </div>

        {/* ── 6. REGULATORY FOOTER ────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#d4af37' }}>🛡️</span>
            <span>FINMA Tier-1 Regulated · Basel III Compliant Custody</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔒 Quantum-Safe 256-bit HSM</span>
            <span style={{ color: '#334155' }}>|</span>
            <span>SESSION ID: RQM-7749-VAULT-OX</span>
          </div>

          <div>
            © 2026 Obsidian Reserve &amp; Trust Corporation SA. All sovereign rights reserved.
          </div>
        </div>

        {/* ── 7. INTERACTIVE BIOMETRIC AUTH MODAL ─────────────── */}
        {biometricModal && (
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
                background: 'linear-gradient(180deg, #0e131d 0%, #080c14 100%)',
                border: '1px solid #d4af37',
                borderRadius: '14px',
                padding: '28px',
                maxWidth: '460px',
                width: '100%',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.35)',
                textAlign: 'center',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                MULTI-SIG RATIFICATION REQUIRED
              </div>
              <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '20px', color: '#f8fafc', margin: '0 0 10px 0' }}>
                Biometric Mandate Authorization
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, marginBottom: 20 }}>
                Authorizing Mandate <strong style={{ color: '#d4af37' }}>#M-9021</strong> for{' '}
                <strong style={{ color: '#4ade80' }}>PKR 12,500,000.00</strong> to London Clearing House.
              </p>

              {/* Scanning visual */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 20px auto',
                  borderRadius: '50%',
                  border: `2px solid ${scanApproved ? '#22c55e' : isScanning ? '#d4af37' : 'rgba(212, 175, 55, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '44px',
                  position: 'relative',
                  background: isScanning ? 'rgba(212, 175, 55, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                  boxShadow: scanApproved ? '0 0 30px #22c55e' : isScanning ? '0 0 25px #d4af37' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {scanApproved ? '✓' : isScanning ? '⏳' : '🖐'}
              </div>

              <div style={{ fontSize: '12px', color: scanApproved ? '#22c55e' : isScanning ? '#d4af37' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace", marginBottom: 24 }}>
                {scanApproved ? 'MANDATE 3/3 RATIFIED & BROADCASTED' : isScanning ? 'SCANNING BIOMETRIC HARDWARE ENCLAVE...' : 'PLACE FINGERPRINT ON HARDWARE TOKEN'}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setBiometricModal(false)}
                  disabled={isScanning}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBiometricAuth}
                  disabled={isScanning || scanApproved}
                  style={{
                    flex: 1.5,
                    padding: '11px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                    border: 'none',
                    color: '#07090e',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}
                >
                  {isScanning ? 'Verifying...' : 'Ratify Fingerprint'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. INITIATE TRANSFER MODAL ───────────────────────── */}
        {transferModal && (
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
                background: 'linear-gradient(180deg, #0e131d 0%, #080c14 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '14px',
                padding: '28px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '19px', color: '#f8fafc', margin: 0 }}>
                  Initiate Sovereign Wire Transfer
                </h3>
                <button
                  onClick={() => setTransferModal(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#c5a059', marginBottom: 6 }}>
                  Source Vault Account
                </label>
                <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #1e293b', borderRadius: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                  MAR-0924-N · Zurich Sub-Alpine Cold Vault Alpha (Available: PKR 42,500,000.00)
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#c5a059', marginBottom: 6 }}>
                  Beneficiary Account / Sovereign Routing
                </label>
                <input
                  type="text"
                  defaultValue="PK92-HABB-0001-4458-9901-2244"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#c5a059', marginBottom: 6 }}>
                  Transfer Amount (PKR)
                </label>
                <input
                  type="text"
                  defaultValue="2,500,000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid #d4af37',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#d4af37',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setTransferModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTransferModal(false);
                    showToast('Wire Transfer of PKR 2,500,000.00 Broadcasted via SWIFT GPI', 'success');
                  }}
                  style={{
                    flex: 1.5,
                    padding: '10px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                    border: 'none',
                    color: '#07090e',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Broadcast Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 9. TAX DOSSIER MODAL ────────────────────────────── */}
        {dossierModal && (
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
                background: 'linear-gradient(180deg, #0e131d 0%, #080c14 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '14px',
                padding: '28px',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '19px', color: '#f8fafc', margin: 0 }}>
                  Sovereign Tax &amp; Audit Dossier
                </h3>
                <button
                  onClick={() => setDossierModal(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 14 }}>
                FINMA Basel-III Compliant Tax Declaration · Financial Year 2026
              </div>

              <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px', marginBottom: 20 }}>
                {[
                  { label: 'Gross Consolidated Tax Base', value: 'PKR 148,920,100.00' },
                  { label: 'Withholding Protocol Status', value: 'Zero Withholding (Article 15)' },
                  { label: 'Offshore Sovereign Exemption', value: '100% Ratified' },
                  { label: 'Net Annual Tax Liability', value: 'PKR 0.00 (Exempt)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: '11.5px' }}>
                    <span style={{ color: '#94a3b8' }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: '#f3e5ab', fontFamily: "'JetBrains Mono', monospace" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDossierModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setDossierModal(false);
                    showToast('Audited Tax Slip #TAX-2026-OX Downloaded', 'success');
                  }}
                  style={{
                    flex: 1.5,
                    padding: '10px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                    border: 'none',
                    color: '#07090e',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Export Signed PDF Slip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 10. MULTI-SIG MANDATE MODAL ─────────────────────── */}
        {mandateModal && (
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
                background: 'linear-gradient(180deg, #0e131d 0%, #080c14 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '14px',
                padding: '28px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '19px', color: '#f8fafc', margin: 0 }}>
                  Active Sovereign Mandates
                </h3>
                <button
                  onClick={() => setMandateModal(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>Mandate #M-9021</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37' }}>PKR 12,500,000.00</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 6 }}>Cross-Border Alpine Liquidity Rebalance</div>
                  <div style={{ fontSize: '10px', color: '#ef4444' }}>Status: Awaiting Final Biometric Sign-off (2/3 Approved)</div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>Mandate #M-8910</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#4ade80' }}>PKR 45,000,000.00</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 6 }}>Swiss Bullion 1,000 oz Physical Relocation</div>
                  <div style={{ fontSize: '10px', color: '#4ade80' }}>Status: Fully Executed · Loomis Air Secured</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setMandateModal(false);
                  setBiometricModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
                  border: 'none',
                  color: '#07090e',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                Proceed to Sign #M-9021
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
