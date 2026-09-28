'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

export default function Topbar() {
  const pathname = usePathname() || '/dashboard';
  const { user, logout, toggleOnline } = useAuth();
  const { showToast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD' | 'CHF' | 'EUR' | 'XAU'>('PKR');
  const [time, setTime] = useState<{ zur: string; gva: string; lon: string; pkt: string }>({
    zur: '14:32:08',
    gva: '14:32:08',
    lon: '13:32:08',
    pkt: '14:15:20',
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const format = (offsetHours: number) => {
        const d = new Date(now.getTime() + offsetHours * 3600 * 1000);
        return d.toTimeString().split(' ')[0];
      };
      setTime({
        zur: format(-3), // CET ~ UTC+2 approx offset for display
        gva: format(-3),
        lon: format(-4),
        pkt: now.toTimeString().split(' ')[0],
      });
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out of Sovereign Session', 'info');
  };

  const handleToggle = () => {
    toggleOnline();
    showToast(
      user?.online ? 'HSM Node Switched to Standby' : 'HSM Node Live & Online!',
      user?.online ? 'warning' : 'success'
    );
  };

  return (
    <header
      id="topbar"
      style={{
        position: 'fixed',
        top: 0,
        left: '260px',
        right: 0,
        height: '64px',
        background: 'rgba(7, 9, 14, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 50,
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        gap: 16,
      }}
    >
      {/* Left: Clearance Badge + Live Clocks + Currencies */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'nowrap', overflow: 'hidden' }}>
        {/* Tier-1 Clearance Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 10px',
            background: 'rgba(12, 18, 28, 0.9)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '5px',
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.1)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#d4af37',
              boxShadow: '0 0 8px #d4af37',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              color: '#f3e5ab',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            TIER-1 SOVEREIGN CLEARANCE ACTIVE
          </span>
        </div>

        {/* Live Clocks */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#94a3b8',
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ color: '#64748b', fontSize: '9.5px', marginRight: 4 }}>PKT</span>
            <span style={{ color: '#d4af37', fontWeight: 600 }}>{time.pkt}</span>
          </div>
          <span style={{ color: '#334155' }}>|</span>
          <div>
            <span style={{ color: '#64748b', fontSize: '9.5px', marginRight: 4 }}>ZUR</span>
            <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{time.zur}</span>
          </div>
          <span style={{ color: '#334155' }}>|</span>
          <div>
            <span style={{ color: '#64748b', fontSize: '9.5px', marginRight: 4 }}>LON</span>
            <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{time.lon}</span>
          </div>
        </div>

        {/* Currency Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '5px',
            padding: '2px',
            flexShrink: 0,
          }}
        >
          {(['PKR', 'USD', 'CHF', 'EUR', 'XAU'] as const).map((cur) => (
            <button
              key={cur}
              onClick={() => {
                setSelectedCurrency(cur);
                showToast(`Primary Ledger Currency: ${cur}`, 'info');
              }}
              style={{
                padding: '3px 7px',
                borderRadius: '3px',
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: selectedCurrency === cur ? '#d4af37' : 'transparent',
                color: selectedCurrency === cur ? '#07090e' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Quick Action Buttons & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Wire Liquidity Pill */}
        <Link
          href="/availability"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '6px',
            color: '#f3e5ab',
            fontSize: '11px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          <span>⚡</span>
          <span>Wire Liquidity</span>
        </Link>

        {/* Encrypted Dossier Pill */}
        <Link
          href="/pending"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          <span>📄</span>
          <span>Encrypted Dossier</span>
        </Link>

        {/* Online Node Status Button */}
        <button
          onClick={handleToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            background: user?.online ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            border: `1px solid ${user?.online ? 'rgba(34, 197, 94, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: user?.online ? '#22c55e' : '#64748b',
              boxShadow: user?.online ? '0 0 6px #22c55e' : 'none',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: user?.online ? '#22c55e' : '#94a3b8',
            }}
          >
            {user?.online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </button>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '8px',
              padding: '4px 10px 4px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                flexShrink: 0,
              }}
            >
              <Image
                src="/fiduciary_banker.jpg"
                alt="Hon. Mohammad Hashir"
                width={32}
                height={32}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Hon. Mohammad Hashir
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#c5a059',
                  letterSpacing: '0.3px',
                }}
              >
                Private Desk Sovereign
              </div>
            </div>
            <span style={{ color: '#c5a059', fontSize: '9px', marginLeft: 2 }}>▾</span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#090d14',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                minWidth: 200,
                boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f3e5ab' }}>
                  Mohammad Hashir
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  mohammadhashir450@gmail.com
                </div>
              </div>
              {[
                { label: '🏛️ Executive Overview', href: '/dashboard' },
                { label: '🪪 Biometric Profile & KYC', href: '/profile' },
                { label: '🔐 Multi-Sig Governance', href: '/settings' },
                { label: '💼 Private Fiduciary Desk', href: '/chat' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212, 175, 55, 0.08)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#f3e5ab';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8';
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#ef4444',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                🚪 Terminate Sovereign Session
              </button>
            </div>
          )}
        </div>
      </div>

      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
        />
      )}
    </header>
  );
}
