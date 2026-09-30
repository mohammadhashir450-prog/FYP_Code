'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../AuthProvider';

type Mode = 'top' | 'down' | 'up';

const LINKS = [
  { id: 'top', label: 'Home' },
  { id: 'process', label: 'Process' },
  { id: 'climate', label: 'Climate' },
  { id: 'services', label: 'Services' },
];

/**
 * Floating glass capsule navbar with an animated gradient border.
 *  top  → clear glass over the hero, large logo
 *  down → deep navy, compact
 *  up   → logo-blue gradient, bright yellow border
 * Centred scroll-spy links with a sliding highlight pill, scroll progress line,
 * shine-sweep CTA, and account-aware right side.
 */
export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState<Mode>('top');
  const [active, setActive] = useState('top');
  const bar = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (y < 24) setMode('top');
      else if (Math.abs(y - last.current) > 4) setMode(y > last.current ? 'down' : 'up');
      last.current = y;

      let current = 'top';
      for (const l of LINKS) {
        const el = l.id === 'top' ? null : document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) current = l.id;
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

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const skin: Record<Mode, string> = {
    top: 'bg-navy/30 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,.3)]',
    down: 'bg-navy/90 backdrop-blur-2xl shadow-[0_16px_60px_rgba(0,0,0,.65)]',
    up: 'bg-gradient-to-r from-steel/95 via-[#12427a]/95 to-navy/95 backdrop-blur-2xl shadow-[0_16px_60px_rgba(29,85,144,.55)]',
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-8 md:pt-4">
      <style>{`
        @keyframes nb-border { to { background-position: 300% 0; } }
        @keyframes nb-shine { 0%, 60% { transform: translateX(-140%) skewX(-18deg); } 100% { transform: translateX(260%) skewX(-18deg); } }
        .nb-border { background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,214,10,.85), rgba(43,123,214,.9), rgba(255,255,255,.08)); background-size: 300% 100%; animation: nb-border 7s linear infinite; }
        .nb-shine::after { content: ''; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); animation: nb-shine 3.6s ease-in-out infinite; }
      `}</style>

      {/* animated gradient hairline border */}
      <div className={`nb-border pointer-events-auto mx-auto max-w-[1400px] rounded-[18px] p-px transition-all duration-500 ${mode === 'top' ? 'opacity-60' : 'opacity-100'}`}>
        <nav aria-label="Main" className={`relative flex items-center justify-between overflow-hidden rounded-[17px] px-3 transition-all duration-500 md:px-5 ${mode === 'top' ? 'h-[74px]' : 'h-[60px]'} ${skin[mode]}`}>
          <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <span aria-hidden className="pointer-events-none absolute -left-10 top-0 h-full w-40 bg-brand/10 blur-2xl" />

          {/* Brand */}
          <Link href="/" className="group relative z-10 flex items-center gap-3 no-underline">
            <span className="relative">
              <span aria-hidden className="absolute -inset-1.5 rounded-2xl bg-brand/40 blur-md transition-opacity duration-500" style={{ opacity: mode === 'top' ? 0.6 : 0.3 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="RepairEase" width={46} height={46} className={`relative rounded-xl bg-white p-0.5 transition-all duration-500 group-hover:rotate-[-4deg] group-hover:scale-105 ${mode === 'top' ? 'h-[46px] w-[46px]' : 'h-9 w-9'}`} />
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block font-display text-[18px] font-bold tracking-[0.24em] text-brand">REPAIREASE</span>
              <span className="mt-1.5 block font-mono text-[8px] font-semibold uppercase tracking-[0.38em] text-mist-dim">Provider Platform</span>
            </span>
          </Link>

          {/* Centre links */}
          <ul ref={listRef} className="absolute left-1/2 z-10 hidden -translate-x-1/2 list-none items-center gap-0.5 rounded-full border border-white/10 bg-navy/50 p-1 backdrop-blur lg:flex">
            <span aria-hidden className="absolute bottom-1 top-1 rounded-full bg-brand/15 ring-1 ring-brand/40 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]" style={{ left: pill.x, width: pill.w }} />
            {LINKS.map((l) => (
              <li key={l.id} data-id={l.id} className="relative">
                <a href={`#${l.id}`} onClick={go(l.id)} className={`block rounded-full px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] no-underline transition-colors ${active === l.id ? 'text-brand' : 'text-mist hover:text-white'}`}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right */}
          <div className="relative z-10 flex items-center gap-2 md:gap-3">
            {isAuthenticated && user ? (
              <Link href="/dashboard" className="flex items-center gap-2.5 rounded-full border border-white/10 bg-navy/50 py-1 pl-1 pr-4 no-underline transition hover:border-brand/50">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand font-mono text-[11px] font-bold text-navy">{user.initials}</span>
                <span className="hidden max-w-[110px] truncate text-[12px] font-semibold text-ink md:block">{user.name}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden rounded-lg px-3 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-mist no-underline transition hover:text-white md:block">Sign in</Link>
            )}
            <Link href={isAuthenticated ? '/dashboard' : '/login'} className="nb-shine group relative flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br from-brand-light via-brand to-[#e6bf00] px-4 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy no-underline shadow-[0_6px_26px_rgba(255,214,10,.32)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(255,214,10,.5)]">
              <span className="relative z-10 hidden sm:inline">{isAuthenticated ? 'Dashboard' : 'Provider Portal'}</span>
              <span className="relative z-10 sm:hidden">Portal</span>
              <ArrowUpRight size={14} strokeWidth={2.6} className="relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div ref={bar} aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-brand via-brand-light to-white" style={{ transform: 'scaleX(0)' }} />
        </nav>
      </div>
    </header>
  );
}
