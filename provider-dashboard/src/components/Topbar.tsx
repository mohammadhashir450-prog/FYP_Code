'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, LogOut, UserRound, Building2, BadgeCheck, ShieldCheck, LayoutDashboard, Briefcase, BadgeCheck as Verified } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';
import { OPEN_SIDEBAR_EVENT } from './Sidebar';

const PAGES = [
  { label: 'Overview', desc: 'Dashboard home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Job Requests', desc: 'Incoming and active service jobs', href: '/jobs', icon: Briefcase },
  { label: 'Profile & Identity', desc: 'Photo, name, contact details', href: '/profile?tab=general', icon: UserRound },
  { label: 'Business Details', desc: 'Workshop, registration, service area', href: '/profile?tab=business', icon: Building2 },
  { label: 'Verification & Badges', desc: 'Document and identity status', href: '/profile?tab=verification', icon: BadgeCheck },
  { label: 'Security & Access', desc: 'Password and availability', href: '/profile?tab=security', icon: ShieldCheck },
];

export function Avatar({ size = 38 }: { size?: number }) {
  const { user } = useAuth();
  if (!user) return null;
  return user.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.photo} alt={user.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,214,10,.5)', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color: 'var(--navy-850)', background: 'linear-gradient(135deg, var(--yellow-light), var(--yellow))' }}>
      {user.initials}
    </div>
  );
}

export default function Topbar() {
  const router = useRouter();
  const { user, logout, toggleOnline } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen((v) => !v); }
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    const click = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    window.addEventListener('keydown', key);
    window.addEventListener('mousedown', click);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('mousedown', click); };
  }, []);

  const results = PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
  const go = (href: string) => { setSearchOpen(false); setMenuOpen(false); setQuery(''); router.push(href); };

  if (!user) return null;

  return (
    <>
      <style>{`
        .tb { position: sticky; top: 0; z-index: 50; height: var(--topbar-height); display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 0 40px; background: rgba(3,13,31,.82); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border-light); }
        .tb-menu { display: none; }
        .tb-search { display: flex; align-items: center; gap: 10px; min-width: 300px; padding: 9px 14px; background: rgba(4,18,41,.7);
          border: 1px solid var(--border-light); border-radius: 10px; color: var(--text-muted); font-size: 13px; cursor: pointer; font-family: inherit; }
        .tb-search:hover { border-color: var(--border); color: var(--text-secondary); }
        .tb-item { display: flex; width: 100%; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 9px; border: none; background: none;
          color: var(--text-primary); font-size: 13.5px; cursor: pointer; text-align: left; font-family: inherit; }
        .tb-item:hover { background: rgba(255,255,255,.05); }
        @media (max-width: 900px) { .tb { padding: 0 16px; } .tb-menu { display: flex; } .tb-search { min-width: 0; } .tb-search span, .tb-search kbd, .tb-name, .tb-status-label { display: none; } }
      `}</style>
      <header className="tb">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="tb-menu btn btn-ghost btn-sm" aria-label="Open menu" onClick={() => window.dispatchEvent(new Event(OPEN_SIDEBAR_EVENT))}><Menu size={18} /></button>
          <button className="tb-search" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={16} /><span style={{ flex: 1, textAlign: 'left' }}>Search or jump to a page…</span>
            <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 5 }}>Ctrl K</kbd>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => { toggleOnline(); showToast(user.online ? 'You are now offline — new requests paused' : 'You are online and accepting requests', 'info'); }}
            className="badge" style={{ cursor: 'pointer', background: user.online ? 'rgba(52,211,153,.1)' : 'rgba(157,180,211,.08)', color: user.online ? 'var(--success)' : 'var(--text-secondary)', border: `1px solid ${user.online ? 'rgba(52,211,153,.3)' : 'var(--border)'}` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', boxShadow: user.online ? '0 0 8px currentColor' : 'none' }} />
            <span className="tb-status-label">{user.online ? 'Online' : 'Offline'}</span>
          </button>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}>
              <Avatar />
              <div className="tb-name" style={{ textAlign: 'left', maxWidth: 170 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.role}</div>
              </div>
            </button>
            {menuOpen && (
              <div className="panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: 280, padding: 10, boxShadow: 'var(--shadow)', zIndex: 60 }}>
                <div style={{ padding: '12px 12px 14px', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--border-light)', marginBottom: 6 }}>
                  <Avatar size={44} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                      {user.verified && <Verified size={15} color="var(--yellow)" />}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>
                </div>
                <button className="tb-item" onClick={() => go('/profile?tab=general')}><UserRound size={16} /> Profile & Identity</button>
                <button className="tb-item" onClick={() => go('/profile?tab=security')}><ShieldCheck size={16} /> Security & Access</button>
                <button className="tb-item" style={{ color: 'var(--danger)' }} onClick={() => { showToast('Signed out successfully', 'info'); logout(); }}><LogOut size={16} /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div onClick={() => setSearchOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(2,10,24,.75)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', paddingTop: '14vh' }}>
          <div onClick={(e) => e.stopPropagation()} className="panel" style={{ width: 'min(560px, 92vw)', alignSelf: 'flex-start', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pages…"
                onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].href); }}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 15, fontFamily: 'inherit' }} />
            </div>
            <div style={{ padding: 8, maxHeight: 320, overflowY: 'auto' }}>
              {results.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No matching pages</div>}
              {results.map(({ label, desc, href, icon: Icon }) => (
                <button key={href} className="tb-item" onClick={() => go(href)}>
                  <Icon size={18} color="var(--yellow)" />
                  <span><span style={{ display: 'block', fontWeight: 600 }}>{label}</span><span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{desc}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
