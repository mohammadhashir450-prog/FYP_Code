'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, MapPinned, MessageCircle, Star, Bell, Settings, UserRound, Building2, BadgeCheck, ShieldCheck, ChevronsLeft, ChevronsRight, X,
} from 'lucide-react';
import { useAuth } from './AuthProvider';

const NAV = [
  { group: 'Workspace', items: [{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard }, { href: '/jobs', label: 'Job Requests', icon: Briefcase }, { href: '/tracking', label: 'Live Tracking', icon: MapPinned }] },
  {
    group: 'Engagement',
    items: [
      { href: '/chat', label: 'Live Chat', icon: MessageCircle },
      { href: '/reviews', label: 'Reviews & Ratings', icon: Star },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    group: 'Provider Entities',
    items: [
      { href: '/profile?tab=general', label: 'Profile & Identity', icon: UserRound },
      { href: '/profile?tab=business', label: 'Business Details', icon: Building2 },
      { href: '/profile?tab=verification', label: 'Verification & Badges', icon: BadgeCheck },
      { href: '/profile?tab=security', label: 'Security & Access', icon: ShieldCheck },
    ],
  },
];

export const OPEN_SIDEBAR_EVENT = 'repairease:open-sidebar';

function NavList({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const tab = useSearchParams().get('tab') || 'general';
  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    if (pathname !== path) return false;
    return query ? query === `tab=${tab}` : true;
  };
  return (
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '22px 12px' }}>
      {NAV.map((g) => (
        <div key={g.group} style={{ marginBottom: 26 }}>
          {!collapsed && <div className="eyebrow eyebrow-muted" style={{ padding: '0 14px 10px', fontSize: 9.5 }}>{g.group}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {g.items.map(({ href, label: text, icon: Icon }) => (
              <Link key={href} href={href} title={collapsed ? text : undefined} className={`sb-link${isActive(href) ? ' active' : ''}`}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <Icon size={19} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {!collapsed && text}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener(OPEN_SIDEBAR_EVENT, open);
    return () => window.removeEventListener(OPEN_SIDEBAR_EVENT, open);
  }, []);

  const w = collapsed ? 78 : 268;

  return (
    <>
      <style>{`
        .sb { position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; display: flex; flex-direction: column;
          background: linear-gradient(180deg, #04162f 0%, #030d1f 100%); border-right: 1px solid var(--border-light);
          transition: width .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1); overflow: hidden; }
        .sb-link { display: flex; align-items: center; gap: 13px; padding: 11px 14px; border-radius: 10px; text-decoration: none;
          font-size: 13.5px; font-weight: 500; color: var(--text-secondary); border: 1px solid transparent; transition: all .18s ease; white-space: nowrap; }
        .sb-link:hover { color: var(--text-primary); background: rgba(255,255,255,.04); }
        .sb-link.active { color: var(--yellow); background: rgba(255,214,10,.08); border-color: rgba(255,214,10,.22); }
        .sb-scrim { display: none; }
        @media (max-width: 900px) {
          .sb { transform: translateX(-100%); width: 268px !important; }
          .sb.open { transform: none; box-shadow: 12px 0 48px rgba(0,0,0,.6); }
          .sb-scrim.open { display: block; position: fixed; inset: 0; background: rgba(2,10,24,.7); backdrop-filter: blur(3px); z-index: 99; }
          .sb-collapse { display: none !important; }
        }
      `}</style>
      <div className={`sb-scrim${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside id="sidebar" className={`sb${mobileOpen ? ' open' : ''}`} style={{ width: w }}>
        {/* Brand */}
        <div style={{ padding: collapsed ? '20px 15px' : '22px 20px', display: 'flex', alignItems: 'center', gap: 12, minHeight: 82, borderBottom: '1px solid var(--border-light)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="RepairEase" width={44} height={44} className="logo-tile" style={{ flexShrink: 0, width: 44, height: 44, boxShadow: '0 0 20px rgba(255,214,10,.2)' }} />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 17, letterSpacing: '2px', color: 'var(--yellow)', lineHeight: 1.1 }}>REPAIREASE</div>
              <div className="eyebrow eyebrow-muted" style={{ fontSize: 8.5, marginTop: 4, letterSpacing: '2.4px' }}>Provider Portal</div>
            </div>
          )}
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="sb-close" style={{ display: mobileOpen ? 'flex' : 'none', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <Suspense fallback={<nav style={{ flex: 1 }} />}>
          <NavList collapsed={collapsed} />
        </Suspense>

        {/* Tier card */}
        <div style={{ padding: collapsed ? '14px 12px' : '16px', borderTop: '1px solid var(--border-light)' }}>
          {!collapsed && (
            <div className="panel-inner" style={{ padding: '14px 16px', marginBottom: 12 }}>
              <div className="eyebrow eyebrow-muted" style={{ fontSize: 9, marginBottom: 8 }}>Account Status</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>
                  {profile.verificationStatus === 'verified' ? 'Verified' : 'Under Review'}
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: profile.verificationStatus === 'verified' ? 'var(--success)' : 'var(--yellow)', boxShadow: `0 0 8px ${profile.verificationStatus === 'verified' ? 'var(--success)' : 'var(--yellow)'}` }} />
              </div>
            </div>
          )}
          <button onClick={onToggle} className="sb-collapse btn btn-ghost btn-sm btn-full" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Collapse</>}
          </button>
        </div>
      </aside>
    </>
  );
}
