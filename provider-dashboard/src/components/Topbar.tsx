'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic scroll elevation
  useEffect(() => {
    const el = document.querySelector('.main-content > div') || window;
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ctrl+K / Cmd+K command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === 'Escape') { setSearchOpen(false); setProfileOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
    router.push('/login');
  };

  // Build breadcrumb from pathname
  const segments = (pathname || '/').split('/').filter(Boolean);
  const pageName = segments.length > 0
    ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Dashboard';

  return (
    <>
      {/* ── TOPBAR ─────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: scrolled ? '58px' : '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          background: scrolled
            ? 'rgba(8, 11, 18, 0.97)'
            : 'rgba(8, 11, 18, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid rgba(212, 175, 55, 0.22)'
            : '1px solid rgba(255,255,255,0.05)',
          boxShadow: scrolled
            ? '0 8px 28px rgba(0,0,0,0.7)'
            : 'none',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* ── LEFT: Breadcrumb ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: '12.5px',
              fontWeight: 800,
              letterSpacing: '1.8px',
              color: '#d4af37',
            }}
          >
            REPAIREASE
          </span>
          <span style={{ color: '#374151', fontSize: '13px', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94a3b8' }}>
            {pageName}
          </span>
        </div>

        {/* ── CENTER: Search ─────────────────────────────────────── */}
        <div style={{ flex: 1, maxWidth: '380px', margin: '0 24px' }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '7px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget).style.borderColor = 'rgba(212,175,55,0.35)';
              (e.currentTarget).style.background = 'rgba(212,175,55,0.04)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.07)';
              (e.currentTarget).style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
                Search providers, jobs, settings...
              </span>
            </div>
            <kbd style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '4px',
              padding: '2px 7px',
              fontSize: '10px',
              color: '#6b7280',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── RIGHT: Actions + Profile ───────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Platform Status Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px',
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '20px',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e', boxShadow: '0 0 6px #22c55e',
              display: 'inline-block', animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#4ade80', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
              LIVE
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.07)' }} />

          {/* Profile Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '5px 10px 5px 6px',
                background: profileOpen ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${profileOpen ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '9px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #7c5a1e 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#07090e', fontSize: '11px', fontWeight: 800,
                boxShadow: '0 0 10px rgba(212,175,55,0.3)',
                letterSpacing: '0.5px',
              }}>
                {(user?.name || 'AD').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.15 }}>
                  {user?.name || 'Admin'}
                </div>
                <div style={{ fontSize: '9.5px', color: '#c5a059', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>
                  ADMINISTRATOR
                </div>
              </div>
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke={profileOpen ? '#d4af37' : '#6b7280'} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'none' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute', top: '46px', right: 0,
                  width: '220px',
                  background: '#0d1117',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
                  padding: '8px',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {/* User info */}
                <div style={{
                  padding: '10px 12px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  marginBottom: '6px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    {user?.name || 'Admin User'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>
                    {user?.email || 'admin@repairease.com'}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    marginTop: '7px', padding: '2px 8px',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: '20px',
                    fontSize: '9.5px', fontWeight: 700, color: '#4ade80',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Verified Admin
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    width: '100%', padding: '9px 12px',
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    borderRadius: '8px',
                    color: '#f87171', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget).style.background = 'rgba(239,68,68,0.12)'}
                  onMouseLeave={(e) => (e.currentTarget).style.background = 'rgba(239,68,68,0.07)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop for dropdowns */}
      {(profileOpen) && (
        <div
          onClick={() => { setProfileOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
        />
      )}

      {/* ── COMMAND PALETTE MODAL ──────────────────────────────── */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 500,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '14vh',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '520px', maxWidth: '90vw',
              background: '#0d1117',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '14px',
              boxShadow: '0 24px 70px rgba(0,0,0,0.95)',
              overflow: 'hidden',
            }}
          >
            {/* Search Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or jump to a page..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#f8fafc', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                }}
              />
              <kbd onClick={() => setSearchOpen(false)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '5px', padding: '2px 7px',
                fontSize: '10px', color: '#6b7280', cursor: 'pointer',
              }}>
                ESC
              </kbd>
            </div>

            {/* Navigation Items */}
            <div style={{ padding: '10px 12px 14px', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: '#4b5563',
                letterSpacing: '1.2px', textTransform: 'uppercase',
                padding: '4px 6px', marginBottom: '6px',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Navigation
              </div>
              {[
                { icon: '🏛️', label: 'Dashboard Overview', href: '/dashboard', desc: 'Main admin dashboard' },
                { icon: '🔐', label: 'Login / Auth', href: '/login', desc: 'Authentication gateway' },
              ].filter(item =>
                !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(item => (
                <div
                  key={item.href}
                  onClick={() => { setSearchOpen(false); router.push(item.href); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px',
                    cursor: 'pointer', transition: 'background 0.15s',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget).style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => (e.currentTarget).style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#d4af37', fontFamily: "'JetBrains Mono', monospace" }}>↵</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
