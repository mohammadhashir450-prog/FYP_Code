'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface NavGroup {
  group: string;
  items: {
    href: string;
    icon: string;
    label: string;
    badge?: string;
    badgeColor?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'EXECUTIVE & CAPITAL',
    items: [
      { href: '/dashboard', icon: '🏛️', label: 'Executive Overview' },
      { href: '/availability', icon: '🏦', label: 'Vault & Liquidity Pools' },
      { href: '/jobs', icon: '🌐', label: 'Sovereign Portfolios', badge: '2', badgeColor: '#d4af37' },
    ],
  },
  {
    group: 'CUSTODY & RATIFICATION',
    items: [
      { href: '/settings', icon: '🔐', label: 'Multi-Sig Governance' },
      { href: '/profile', icon: '🪪', label: 'Biometric Attestations & KYC' },
      { href: '/pending', icon: '📜', label: 'Dossier Ratification' },
    ],
  },
  {
    group: 'PRIVATE FIDUCIARY',
    items: [
      { href: '/chat', icon: '💼', label: 'Private Fiduciary Desk', badge: '1', badgeColor: '#4ade80' },
      { href: '/reviews', icon: '📊', label: 'Off-Market Allocations' },
      { href: '/notifications', icon: '🛡️', label: 'Security & HSM Keys', badge: '3', badgeColor: '#ef4444' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <>
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
                  OBSIDIAN
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
                  RESERVE · SOVEREIGN
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            id="sidebar-toggle-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '6px',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#c5a059',
              fontSize: '11px',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▸' : '◂'}
          </button>
        </div>

        {/* Node Active Pill */}
        {!collapsed && (
          <div style={{ padding: '12px 16px 6px 16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(12, 18, 28, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '6px',
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                    display: 'inline-block',
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span style={{ color: '#94a3b8', letterSpacing: '0.5px' }}>HSM NODE: LHR-01</span>
              </div>
              <span
                style={{
                  color: '#22c55e',
                  fontWeight: 700,
                  fontSize: '9px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* Navigation Categories */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? '12px 6px' : '10px 12px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group} style={{ marginBottom: 14 }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#64748b',
                    letterSpacing: '1.2px',
                    padding: '6px 8px 4px 8px',
                    textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {grp.group}
                </div>
              )}
              {grp.items.map((item) => {
                const active = isActive(item.href);
                const isHov = hovered === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    onMouseLeave={() => setHovered(null)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      padding: collapsed ? '10px' : '9px 12px',
                      borderRadius: '6px',
                      marginBottom: '2px',
                      transition: 'all 0.18s ease',
                      background: active
                        ? 'linear-gradient(90deg, #d4af37 0%, #b89327 100%)'
                        : isHov
                        ? 'rgba(212, 175, 55, 0.08)'
                        : 'transparent',
                      border: active
                        ? '1px solid rgba(255, 235, 170, 0.3)'
                        : isHov
                        ? '1px solid rgba(212, 175, 55, 0.2)'
                        : '1px solid transparent',
                      color: active ? '#080c14' : isHov ? '#f3e5ab' : '#94a3b8',
                      textDecoration: 'none',
                      fontWeight: active ? 700 : 500,
                      fontSize: '12.5px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '15px', flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                    {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span
                        style={{
                          background: active ? '#080c14' : item.badgeColor || '#d4af37',
                          color: active ? '#d4af37' : '#080c14',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          minWidth: '16px',
                          textAlign: 'center',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Consortium Custody Pill */}
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
                background: '#d4af37',
                boxShadow: '0 0 6px #d4af37',
                flexShrink: 0,
                animation: 'pulse 2.5s infinite',
              }}
            />
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#f3e5ab' }}>
                  Consortium Custody Active
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                  Tier-1 Sovereign Reserve · PKR
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
