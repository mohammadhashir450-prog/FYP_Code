'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Cog, Disc3, Gauge, Menu, Paintbrush, Snowflake, X, Zap } from 'lucide-react';
import { useAuth } from '../AuthProvider';

type Mode = 'top' | 'down' | 'up';

const LINKS = [
  { id: 'top', label: 'Home' },
  { id: 'process', label: 'Process' },
  { id: 'climate', label: 'Climate' },
  { id: 'services', label: 'Services', mega: true },
];

const SERVICES = [
  { icon: Cog, title: 'Engine & Diagnostics', desc: 'Computer scans, full engine service' },
  { icon: Paintbrush, title: 'Body & Paint', desc: 'Panels, dents, showroom finish' },
  { icon: Disc3, title: 'Tyres & Wheels', desc: 'Balancing, alignment, replacement' },
  { icon: Zap, title: 'Electrical & ECU', desc: 'Wiring, sensors, control units' },
  { icon: Snowflake, title: 'Climate Control', desc: 'AC gas, compressor, vents' },
  { icon: Gauge, title: 'Suspension & Brakes', desc: 'Safety-critical inspection' },
];

const SPY = ['process', 'climate', 'services', 'join'];
const ISLAND: Record<string, [string, string]> = {
  top: ['00', 'Welcome'], process: ['01', 'Disassembly'], climate: ['04', 'Climate Control'], services: ['05', 'Services'], join: ['06', 'Get started'],
};
const RING = 2 * Math.PI * 27; // logo progress ring circumference

/**
 * Next-level navbar
 *  · floating glass capsule with an animated gradient border
 *  · 3 scroll states (clear / navy / logo-blue) + scroll progress ring around the logo
 *  · scroll-spy pill, services mega-panel, mobile drawer, account-aware CTA
 */
export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState<Mode>('top');
  const [active, setActive] = useState('top');
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const last = useRef(0);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const listRef = useRef<HTMLUListElement>(null);
  const megaWrap = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - p));
      if (y < 24) setMode('top');
      else if (Math.abs(y - last.current) > 4) setMode(y > last.current ? 'down' : 'up');
      last.current = y;

      let current = 'top';
      for (const id of SPY) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) current = id;
      }
      setActive(current);
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sliding highlight pill under the active link
  useEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active]);

  // Close overlays with Esc / outside click; lock body scroll under the drawer
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMega(false); setDrawer(false); } };
    const click = (e: MouseEvent) => { if (megaWrap.current && !megaWrap.current.contains(e.target as Node)) setMega(false); };
    window.addEventListener('keydown', key);
    window.addEventListener('mousedown', click);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('mousedown', click); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const go = useCallback((id: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    setMega(false);
    setDrawer(false);
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const openMega = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMega(true); };
  const closeMegaSoon = () => { closeTimer.current = setTimeout(() => setMega(false), 180); };

  const compact = mode === 'down'; // scrolling down → the bar condenses into a floating island
  const label = ISLAND[active] ?? ISLAND.top;

  const spot = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`);
  };
  const magnet = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
  };
  const unmagnet = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = ''; };

  const skin: Record<Mode, string> = {
    top: 'bg-navy/55 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,.3)]',
    down: 'bg-navy/90 backdrop-blur-2xl shadow-[0_16px_60px_rgba(0,0,0,.65)]',
    up: 'bg-gradient-to-r from-steel/95 via-[#12427a]/95 to-navy/95 backdrop-blur-2xl shadow-[0_16px_60px_rgba(29,85,144,.55)]',
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-8 md:pt-4">
      <style>{`
        @keyframes nb-border { to { background-position: 300% 0; } }
        @keyframes nb-shine { 0%, 60% { transform: translateX(-140%) skewX(-18deg); } 100% { transform: translateX(260%) skewX(-18deg); } }
        @keyframes nb-in { from { opacity: 0; transform: translateY(-10px) scale(.98); } to { opacity: 1; transform: none; } }
        .nb-border { --a: 1; background: linear-gradient(90deg, rgba(255,255,255,calc(.08*var(--a))), rgba(255,214,10,calc(.85*var(--a))), rgba(43,123,214,calc(.9*var(--a))), rgba(255,255,255,calc(.08*var(--a)))); background-size: 300% 100%; animation: nb-border 7s linear infinite; }
        .nb-border.nb-top { --a: .5; }
        .nb-shine::after { content: ''; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); animation: nb-shine 3.6s ease-in-out infinite; }
        .nb-mega { animation: nb-in .25s ease both; }
        @keyframes nb-swap { from { opacity: 0; transform: translateY(10px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
        .nb-swap { animation: nb-swap .45s cubic-bezier(.2,.9,.25,1) both; }
        @media (prefers-reduced-motion: reduce) { .nb-border, .nb-shine::after { animation: none; } }
      `}</style>

      <div className={`nb-border pointer-events-auto mx-auto ${compact ? 'max-w-[760px]' : 'max-w-[1400px]'} rounded-[18px] p-px transition-all duration-700 ease-[cubic-bezier(.2,.9,.25,1)] ${mode === 'top' ? 'nb-top' : ''}`}>
        <nav aria-label="Main" onMouseMove={spot} className={`relative flex items-center justify-between rounded-[17px] px-3 transition-all duration-500 md:px-5 ${mode === 'top' ? 'h-[76px]' : compact ? 'h-[56px]' : 'h-[62px]'} ${skin[mode]}`}>
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[17px] opacity-70" style={{ background: 'radial-gradient(220px circle at var(--sx, 50%) 0%, rgba(255,214,10,.16), transparent 70%)' }} />
          <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          {/* Brand + scroll ring */}
          <Link href="/" onClick={go('top')} className="group relative z-10 flex items-center gap-3 no-underline" aria-label="RepairEase home">
            <span className="relative flex h-[52px] w-[52px] items-center justify-center">
              <svg aria-hidden viewBox="0 0 60 60" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="30" cy="30" r="27" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
                <circle ref={ring} cx="30" cy="30" r="27" fill="none" stroke="#ffd60a" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} style={{ filter: 'drop-shadow(0 0 5px rgba(255,214,10,.8))' }} />
              </svg>
              <span aria-hidden className="absolute inset-2 rounded-xl bg-brand/40 blur-md transition-opacity duration-500" style={{ opacity: mode === 'top' ? 0.6 : 0.3 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={40} height={40} className={`relative rounded-xl bg-white p-0.5 transition-all duration-500 group-hover:rotate-[-5deg] group-hover:scale-110 ${mode === 'top' ? 'h-10 w-10' : 'h-9 w-9'}`} />
            </span>
            <span className={`${compact ? 'hidden' : 'hidden sm:block'} leading-none`}>
              <span className="block font-display text-[18px] font-bold tracking-[0.24em] text-brand">REPAIREASE</span>
              <span className="mt-1.5 block font-mono text-[8px] font-semibold uppercase tracking-[0.38em] text-mist-dim">Provider Platform</span>
            </span>
          </Link>

          {/* Centre links */}
          <ul ref={listRef} className={`absolute left-1/2 z-10 hidden -translate-x-1/2 list-none items-center gap-0.5 rounded-full border border-white/10 bg-navy/50 p-1 backdrop-blur ${compact ? 'lg:hidden' : 'lg:flex'}`}>
            <span aria-hidden className="absolute bottom-1 top-1 rounded-full bg-brand/15 ring-1 ring-brand/40 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]" style={{ left: pill.x, width: pill.w }} />
            {LINKS.map((l) => (
              <li key={l.id} data-id={l.id} className="relative" ref={l.mega ? megaWrap : undefined} onMouseEnter={l.mega ? openMega : undefined} onMouseLeave={l.mega ? closeMegaSoon : undefined}>
                {l.mega ? (
                  <button aria-haspopup="true" aria-expanded={mega} onClick={() => setMega((v) => !v)}
                    className={`flex items-center border-0 bg-transparent gap-1.5 rounded-full px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-colors ${active === l.id || mega ? 'text-brand' : 'text-mist hover:text-white'}`}>
                    {l.label}<ChevronDown size={12} strokeWidth={2.6} className={`transition-transform duration-300 ${mega ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <a href={`#${l.id}`} onClick={go(l.id)} className={`block rounded-full px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] no-underline transition-colors ${active === l.id ? 'text-brand' : 'text-mist hover:text-white'}`}>{l.label}</a>
                )}

                {l.mega && mega && (
                  <div className="nb-mega absolute left-1/2 top-[calc(100%+18px)] w-[620px] -translate-x-1/2 rounded-2xl border border-brand/30 bg-navy/95 p-3 shadow-[0_30px_90px_rgba(0,0,0,.7)] backdrop-blur-2xl" role="menu">
                    <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-brand/30 bg-navy" />
                    <div className="grid grid-cols-2 gap-1.5">
                      {SERVICES.map(({ icon: Icon, title, desc }) => (
                        <a key={title} role="menuitem" href="#services" onClick={go('services')} className="group flex items-start gap-3 rounded-xl p-3 no-underline transition hover:bg-white/5">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-navy"><Icon size={18} strokeWidth={1.9} /></span>
                          <span>
                            <span className="block text-[13px] font-semibold text-ink">{title}</span>
                            <span className="mt-0.5 block text-[11.5px] leading-snug text-mist-dim">{desc}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-steel/40 to-transparent px-4 py-3">
                      <span className="text-[12px] text-mist">Are you a mechanic or technician?</span>
                      <Link href="/login" className="flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand no-underline">Join as provider <ArrowUpRight size={13} /></Link>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Island label (visible while condensed) */}
          <div aria-live="polite" className={`pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 transition-all duration-500 lg:flex ${compact ? 'opacity-100' : 'translate-y-2 opacity-0'}`}>
            <span key={active} className="nb-swap flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-brand">{label[0]}</span>
              <span className="h-3 w-px bg-white/20" />
              <span className="font-display text-[15px] font-semibold tracking-wide text-ink">{label[1]}</span>
            </span>
          </div>

          {/* Right */}
          <div className="relative z-10 flex items-center gap-2 md:gap-3">
            <div className={compact ? 'hidden' : 'contents'}>
            {isAuthenticated && user ? (
              <Link href="/dashboard" className="hidden items-center gap-2.5 rounded-full border border-white/10 bg-navy/50 py-1 pl-1 pr-4 no-underline transition hover:border-brand/50 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand font-mono text-[11px] font-bold text-navy">{user.initials}</span>
                <span className="hidden max-w-[110px] truncate text-[12px] font-semibold text-ink md:block">{user.name}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden rounded-lg px-3 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-mist no-underline transition hover:text-white md:block">Sign in</Link>
            )}
            </div>
            <Link href={isAuthenticated ? '/dashboard' : '/login'} onMouseMove={magnet} onMouseLeave={unmagnet} className="nb-shine group relative flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-brand-light via-brand to-[#e6bf00] px-4 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy no-underline shadow-[0_6px_26px_rgba(255,214,10,.32)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(255,214,10,.5)]">
              <span className="relative z-10 hidden sm:inline">{isAuthenticated ? 'Dashboard' : 'Provider Portal'}</span>
              <span className="relative z-10 sm:hidden">Portal</span>
              <ArrowUpRight size={14} strokeWidth={2.6} className="relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <button onClick={() => setDrawer(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-navy/60 text-ink transition hover:border-brand hover:text-brand lg:hidden"><Menu size={19} /></button>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-b-[17px]">
            <div ref={bar} aria-hidden className="h-full w-full origin-left bg-gradient-to-r from-brand via-brand-light to-white" style={{ transform: 'scaleX(0)' }} />
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div className={`pointer-events-auto fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${drawer ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!drawer}>
        <div className="absolute inset-0 bg-[#020a18]/80 backdrop-blur-md" onClick={() => setDrawer(false)} />
        <aside className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-brand/25 bg-gradient-to-b from-[#06204a] to-[#030d1f] p-6 shadow-[-30px_0_80px_rgba(0,0,0,.6)] transition-transform duration-500 ease-[cubic-bezier(.2,.9,.25,1)] ${drawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold tracking-[0.22em] text-brand">REPAIREASE</span>
            <button onClick={() => setDrawer(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-transparent text-ink"><X size={18} /></button>
          </div>
          <ul className="mt-10 grid list-none gap-1">
            {LINKS.map((l, i) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)} className={`flex items-center justify-between rounded-xl px-4 py-4 font-display text-2xl no-underline transition ${active === l.id ? 'bg-brand/10 text-brand' : 'text-ink hover:bg-white/5'}`} style={{ transitionDelay: `${drawer ? i * 50 : 0}ms` }}>
                  {l.label}<span className="font-mono text-[10px] tracking-widest text-mist-dim">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3">
            <Link href={isAuthenticated ? '/dashboard' : '/login'} className="rounded-xl bg-gradient-to-br from-brand-light to-brand py-4 text-center font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-navy no-underline">{isAuthenticated ? 'Open dashboard' : 'Provider Portal'}</Link>
            {!isAuthenticated && <Link href="/login" className="rounded-xl border border-white/15 py-4 text-center font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-ink no-underline">Sign in</Link>}
          </div>
        </aside>
      </div>
    </header>
  );
}
