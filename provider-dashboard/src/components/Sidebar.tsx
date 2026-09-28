'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/jobs', icon: '📋', label: 'Job Requests', badge: '2', badgeColor: 'var(--accent)' },
  { href: '/chat', icon: '💬', label: 'Live Chat' },
  { href: '/reviews', icon: '⭐', label: 'Reviews' },
  { href: '/availability', icon: '📍', label: 'Availability' },
  { href: '/notifications', icon: '🔔', label: 'Notifications', badge: '3', badgeColor: 'var(--danger)' },
  { href: '/profile', icon: '👤', label: 'Profile' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <aside
        id="sidebar"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: collapsed ? '72px' : '260px',
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Logo row */}
        <div style={{
          padding: collapsed ? '20px 16px' : '22px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexShrink: 0,
          minHeight: 72,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '19px', flexShrink: 0,
              boxShadow: '0 4px 12px var(--accent-glow)',
            }}>
              🔧
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>ProServe</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>PROVIDER PORTAL</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(c => !c)}
            id="sidebar-toggle-btn"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '12px',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▸' : '◂'}
          </button>
        </div>

        {/* Mini profile */}
        {!collapsed && user && (
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              <div style={{
                width: 38, height: 38,
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0,
                border: '2px solid rgba(108,99,255,0.4)',
              }}>
                {user.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: user.online ? 'var(--success)' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '11px', color: user.online ? 'var(--success)' : 'var(--text-muted)' }}>
                    {user.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="verified-badge" style={{ fontSize: '9px', padding: '2px 6px', flexShrink: 0 }}>✓</div>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {!collapsed && (
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 10 }}>
              Navigation
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const isHov = hovered === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 11,
                  padding: collapsed ? '12px' : '10px 12px',
                  borderRadius: '10px',
                  marginBottom: '3px',
                  transition: 'all 0.18s ease',
                  background: active
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(139,92,246,0.1))'
                    : isHov ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: active ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                  color: active ? 'var(--accent)' : isHov ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: active ? 600 : 400,
                  fontSize: '13.5px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span style={{
                    background: item.badgeColor,
                    color: 'white', fontSize: '10px', fontWeight: 700,
                    padding: '2px 6px', borderRadius: '10px', minWidth: '18px',
                    textAlign: 'center', lineHeight: '14px',
                  }}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 8, height: 8,
                    background: item.badgeColor,
                    borderRadius: '50%',
                  }} />
                )}
                {/* Active bar */}
                {active && !collapsed && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: 'var(--accent)', borderRadius: '0 3px 3px 0' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div style={{
          padding: collapsed ? '14px 0' : '14px 18px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
        }}>
          <div style={{
            width: 8, height: 8,
            background: 'var(--success)',
            borderRadius: '50%',
            boxShadow: '0 0 6px var(--success)',
            flexShrink: 0,
            animation: 'pulse 2s infinite',
          }} />
          {!collapsed && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Online &amp; Available</span>
          )}
        </div>
      </aside>
    </>
  );
}
