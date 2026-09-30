'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QuickPie from '../QuickPie';

type Mode = 'top' | 'down' | 'up';

const LINKS = [
  { id: 'top', label: 'Home' },
  { id: 'process', label: 'Process' },
  { id: 'services', label: 'Services' },
];

/**
 * Floating glass capsule navbar.
 *  top  → clear glass over the hero, large logo
 *  down → deep navy, compact
 *  up   → logo-blue gradient with a bright yellow edge
 * Includes scroll-spy, a scroll progress line and the Quick Actions pie in the centre.
 */
export default function Navbar() {
  const [mode, setMode] = useState<Mode>('top');
  const [active, setActive] = useState('top');
  const bar = useRef<HTMLDivElement>(null);
  const last = useRef(0);

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
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = l.id;
      }
      setActive(current);
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const skin: Record<Mode, string> = {
    top: 'border-white/10 bg-navy/25 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,.25)]',
    down: 'border-brand/25 bg-navy/85 backdrop-blur-2xl shadow-[0_14px_50px_rgba(0,0,0,.6)]',
    up: 'border-brand/60 bg-gradient-to-r from-steel/95 via-[#12427a]/95 to-navy/95 backdrop-blur-2xl shadow-[0_14px_50px_rgba(29,85,144,.5),0_0_0_1px_rgba(255,214,10,.15)]',
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-8 md:pt-4">
      <nav aria-label="Main" className={`pointer-events-auto relative mx-auto flex max-w-[1400px] items-center justify-between overflow-hidden rounded-2xl border px-3 transition-all duration-500 md:px-5 ${mode === 'top' ? 'h-[72px]' : 'h-[60px]'} ${skin[mode]}`}>
        {/* top light edge */}
        <span aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/80 to-transparent" />

        <Link href="/" className="relative z-10 flex items-center gap-3 no-underline">
          <span className="relative">
            <span aria-hidden className="absolute -inset-1 rounded-xl bg-brand/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" style={{ opacity: mode === 'top' ? 0.55 : 0.25 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="RepairEase" width={44} height={44} className={`relative rounded-xl bg-white p-0.5 transition-all duration-500 ${mode === 'top' ? 'h-11 w-11' : 'h-9 w-9'}`} />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-[17px] font-bold tracking-[0.22em] text-brand">REPAIREASE</span>
            <span className="mt-1 block font-mono text-[8px] font-semibold uppercase tracking-[0.35em] text-mist-dim">Provider Platform</span>
          </span>
        </Link>


        <div className="absolute left-1/2 z-20 -translate-x-1/2">
          <QuickPie />
        </div>

        <div className="relative z-10 flex items-center gap-2 md:gap-3">
        <ul className="mr-2 hidden list-none items-center gap-1 xl:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} className={`group relative block rounded-lg px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] no-underline transition ${active === l.id ? 'text-brand' : 'text-mist hover:text-white'}`}>
                {l.label}
                <span aria-hidden className={`absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left rounded bg-brand transition-transform duration-300 ${active === l.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </a>
            </li>
          ))}
        </ul>
          <Link href="/login" className="hidden rounded-lg px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-mist no-underline transition hover:text-white md:block">Sign in</Link>
          <Link href="/login" className="rounded-xl bg-gradient-to-br from-brand-light via-brand to-[#e6bf00] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-navy no-underline shadow-[0_6px_26px_rgba(255,214,10,.3)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_34px_rgba(255,214,10,.45)]">
            <span className="hidden sm:inline">Provider Portal</span><span className="sm:hidden">Portal</span>
          </Link>
        </div>

        {/* scroll progress */}
        <div ref={bar} aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-brand via-brand-light to-white" style={{ transform: 'scaleX(0)' }} />
      </nav>
    </header>
  );
}
