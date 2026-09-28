'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Job Requests',
  '/chat': 'Live Chat',
  '/reviews': 'Reviews & Ratings',
  '/availability': 'Availability',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export default function Topbar() {
  const pathname = usePathname() || '/dashboard';
  const { user, logout, toggleOnline } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const currentPage = BREADCRUMBS[pathname]
    || BREADCRUMBS[Object.keys(BREADCRUMBS).find(k => pathname.startsWith(k)) || '']
    || 'Dashboard';

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
  };

  const handleToggle = () => {
    toggleOnline();
    showToast(user?.online ? 'You are now Offline' : 'You are now Online!', user?.online ? 'warning' : 'success');
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
        background: 'rgba(10, 15, 30, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 50,
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        gap: 16,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px', color: 'var(--text-muted)', marginBottom: 1 }}>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-secondary)' }}>{currentPage}</span>
          </nav>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{currentPage}</h2>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

        {/* Online toggle pill */}
        <button
          id="topbar-online-toggle"
          onClick={handleToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: user?.online ? 'rgba(34,197,94,0.12)' : 'rgba(136,152,187,0.1)',
            border: `1px solid ${user?.online ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
            borderRadius: '20px',
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'all 0.25s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: user?.online ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: user?.online ? '0 0 6px var(--success)' : 'none',
          }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: user?.online ? 'var(--success)' : 'var(--text-muted)' }}>
            {user?.online ? 'Online' : 'Offline'}
          </span>
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          id="topbar-notifications"
          style={{
            width: 38, height: 38,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px',
            textDecoration: 'none',
            position: 'relative',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          title="Notifications"
        >
          🔔
          <span style={{
            position: 'absolute', top: -5, right: -5,
            width: 18, height: 18,
            background: 'var(--danger)',
            borderRadius: '50%',
            fontSize: '10px', fontWeight: 700, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-primary)',
          }}>
            3
          </span>
        </Link>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="topbar-profile-btn"
            onClick={() => setProfileOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '5px 12px 5px 5px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div style={{
              width: 30, height: 30,
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: 'white',
            }}>
              {user?.avatar || 'AK'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'Provider'}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginLeft: 4 }}>▾</span>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              minWidth: 180,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              zIndex: 200,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease',
            }}>
              {[
                { label: '👤 Profile', href: '/profile' },
                { label: '⚙️ Settings', href: '/settings' },
                { label: '📍 Availability', href: '/availability' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: 'block', padding: '11px 16px',
                    fontSize: '13px', color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                id="topbar-logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '11px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '13px', color: 'var(--danger)',
                  textAlign: 'left', fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s',
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
        />
      )}
    </header>
  );
}
