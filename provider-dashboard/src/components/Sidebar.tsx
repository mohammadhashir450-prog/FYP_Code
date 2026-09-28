'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href);

  return (
    <aside
      id="sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: collapsed ? '74px' : '260px',
        height: '100vh',
        background: '#090d14',
        borderRight: '1px solid rgba(212, 175, 55, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: collapsed ? '18px 14px' : '20px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexShrink: 0,
          minHeight: 74,
          background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, overflow: 'hidden' }}>
          {/* Gold Geometric Emblem */}
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #d4af37 0%, #997a3a 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
              border: '1px solid rgba(255, 235, 170, 0.4)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 9L12 16L22 9L12 2Z" fill="#080c14" />
              <path d="M2 15L12 22L22 15" stroke="#080c14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontWeight: 800,
                  fontSize: '15px',
                  letterSpacing: '1.2px',
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                }}
              >
                REPAIREASE
              </div>
              <div
                style={{
                  fontSize: '8.5px',
                  fontWeight: 700,
                  color: '#c5a059',
                  letterSpacing: '1.8px',
                  whiteSpace: 'nowrap',
                }}
              >
                PROVIDER PORTAL
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            color: '#c5a059',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '11px',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Main Nav Items List - Only Base Dashboard Structure */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px 10px',
        }}
      >
        <div style={{ marginBottom: 6 }}>
          {!collapsed && (
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '1.2px',
                padding: '0 10px 8px',
                textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              MAIN
            </div>
          )}
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '10px 0' : '10px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '7px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              color: isActive('/dashboard') ? '#f3e5ab' : '#94a3b8',
              background: isActive('/dashboard')
                ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.04) 100%)'
                : 'transparent',
              borderLeft: isActive('/dashboard') ? '3px solid #d4af37' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>🏛️</span>
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </div>
      </nav>

      {/* Clean Bottom Status */}
      <div
        style={{
          padding: collapsed ? '14px 6px' : '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0,
          background: 'rgba(5, 8, 13, 0.95)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#f3e5ab' }}>
                RepairEase Active
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>
                Structure Ready
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
