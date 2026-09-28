'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

export default function Topbar() {
  const router = useRouter();
  const { user, logout, toggleOnline } = useAuth();
  const { showToast } = useToast();

  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Track window scroll to create dynamic sticky luxury elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Signed out of RepairEase Executive Session', 'info');
    router.push('/login');
  };

  const handleToggleOnline = () => {
    toggleOnline();
    showToast(
      user?.online ? 'Provider Enclave set to Standby' : 'Provider Enclave Live & Online',
      user?.online ? 'warning' : 'success'
    );
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: scrolled ? '62px' : '70px',
          background: scrolled
            ? 'linear-gradient(180deg, rgba(7, 10, 15, 0.96) 0%, rgba(5, 8, 13, 0.94) 100%)'
            : 'linear-gradient(180deg, rgba(9, 13, 20, 0.85) 0%, rgba(7, 10, 15, 0.7) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? '1px solid rgba(212, 175, 55, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: scrolled
            ? '0 12px 36px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(212, 175, 55, 0.15)'
            : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── LEFT: BREADCRUMB & NODE STATUS ─────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: '#f8fafc',
              }}
            >
              REPAIREASE
            </span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>/</span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#c5a059',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Executive Desk
            </span>
          </div>

          {/* Live Node Badge */}
          <div
            onClick={handleToggleOnline}
            title="Click to toggle Enclave availability"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '4px 10px',
              borderRadius: '20px',
              background: user?.online ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${user?.online ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: user?.online ? '#22c55e' : '#ef4444',
                boxShadow: `0 0 8px ${user?.online ? '#22c55e' : '#ef4444'}`,
                display: 'inline-block',
                animation: user?.online ? 'pulse 2s infinite' : 'none',
              }}
            />
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: user?.online ? '#4ade80' : '#f87171',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.6px',
              }}
            >
              {user?.online ? 'LIVE ENCLAVE' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* ── CENTER: FAST SEARCH BAR (CMD+K) ────────────────── */}
        <div style={{ flex: 1, maxWidth: '420px', margin: '0 20px' }}>
          <div
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(5, 8, 14, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '7px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212, 175, 55, 0.4)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 16px rgba(212, 175, 55, 0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>🔍</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
                Search commands, telemetry, dossiers...
              </span>
            </div>
            <kbd
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* ── RIGHT: CURRENCY, NOTIFICATIONS & PROFILE ───────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Sovereign Currency Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.07)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#f3e5ab',
              letterSpacing: '0.5px',
            }}
          >
            <span style={{ color: '#d4af37' }}>🛡️</span>
            <span>PKR SOVEREIGN</span>
          </div>

          {/* Notification Bell with Badge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: notifOpen ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${notifOpen ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: notifOpen ? '#f3e5ab' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              🔔
              {/* Unread dot */}
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#d4af37',
                  boxShadow: '0 0 6px #d4af37',
                }}
              />
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '320px',
                  background: '#0c1018',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
                  padding: '14px',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>Enclave Alerts</span>
                  <span style={{ fontSize: '10px', color: '#c5a059', fontFamily: "'JetBrains Mono', monospace" }}>
                    2 UNREAD
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      padding: '10px',
                      background: 'rgba(212, 175, 55, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#f3e5ab' }}>
                      Zurich Vault Relocation Settled
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 2 }}>
                      PKR 2,748,500.00 cryptographic attestation cleared.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                      Multi-Sig Mandate #M-9021
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 2 }}>
                      Awaiting biometric key quorum confirmation.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Button with Clean Non-Cluttered Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 10px 4px 6px',
                borderRadius: '8px',
                background: profileOpen ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${profileOpen ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Luxury Avatar Emblem */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #8c6d23 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#07090e',
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
                }}
              >
                AR
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
                  {user?.name || 'Lord Montgomery'}
                </div>
                <div style={{ fontSize: '9px', color: '#c5a059', letterSpacing: '0.6px' }}>
                  LEVEL-5 SOVEREIGN
                </div>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>▾</span>
            </button>

            {/* Clean, Non-Cluttered Dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '240px',
                  background: '#0c1018',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '10px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
                  padding: '12px',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                {/* Header Info */}
                <div
                  style={{
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                    {user?.name || 'Lord Montgomery'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                    {user?.email || 'provider@repairease.com'}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    Tier-1 Verified Provider
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={handleToggleOnline}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    }}
                  >
                    <span>Availability Node</span>
                    <span style={{ fontSize: '10px', color: user?.online ? '#4ade80' : '#f87171' }}>
                      {user?.online ? '● Online' : '○ Standby'}
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: 4,
                    }}
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── FAST COMMAND PALETTE MODAL (CMD+K) ──────────────── */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '540px',
              maxWidth: '92%',
              background: '#0c1018',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '12px',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '16px', marginRight: 12 }}>🔍</span>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type command or search dossiers..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '14px',
                }}
              />
              <kbd
                onClick={() => setSearchOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ESC
              </kbd>
            </div>

            <div style={{ padding: '12px 14px', maxHeight: '280px', overflowY: 'auto' }}>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                Quick Navigation
              </div>
              <div
                onClick={() => {
                  setSearchOpen(false);
                  router.push('/dashboard');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>🏛️</span>
                  <span style={{ fontSize: '12.5px', color: '#f8fafc' }}>Executive Dashboard Overview</span>
                </div>
                <span style={{ fontSize: '10px', color: '#d4af37' }}>Jump ➔</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
