'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { OPEN_PIE_EVENT } from '../PieMenu';

type Mode = 'top' | 'down' | 'up';

/**
 * Scroll-reactive navbar.
 *  top  → fully transparent over the hero
 *  down → deep navy glass with a yellow hairline
 *  up   → steel-blue gradient (logo blue) with a brighter yellow edge
 * A yellow progress line at the bottom tracks page scroll.
 */
export default function Navbar() {
  const [mode, setMode] = useState<Mode>('top');
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
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const skin: Record<Mode, string> = {
    top: 'bg-transparent border-transparent py-5',
    down: 'bg-navy/90 border-brand/25 py-3 shadow-[0_10px_40px_rgba(0,0,0,.55)] backdrop-blur-xl',
    up: 'bg-gradient-to-r from-steel/95 via-[#123f73]/95 to-navy/95 border-brand/60 py-3 shadow-[0_10px_40px_rgba(29,85,144,.45)] backdrop-blur-xl',
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${skin[mode]}`}>
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 md:px-10" aria-label="Main">
        <Link href="/" className="flex items-center gap-3 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="RepairEase" width={44} height={44} className={`rounded-xl bg-white p-0.5 transition-all duration-500 ${mode === 'top' ? 'h-11 w-11' : 'h-9 w-9'}`} />
          <span className="font-display text-lg font-bold tracking-[0.22em] text-brand">REPAIREASE</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hidden rounded-lg px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-mist no-underline transition hover:text-brand md:block">Home</a>
          <a href="#services" className="hidden rounded-lg px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-mist no-underline transition hover:text-brand md:block">How it works</a>
          <button onClick={() => window.dispatchEvent(new Event(OPEN_PIE_EVENT))} className="rounded-lg border border-steel bg-transparent px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition hover:border-brand hover:text-brand">
            Services
          </button>
          <Link href="/login" className="rounded-lg bg-gradient-to-br from-brand-light to-brand px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-navy no-underline shadow-[0_6px_24px_rgba(255,214,10,.28)] transition hover:-translate-y-0.5">
            Provider Portal
          </Link>
        </div>
      </nav>
      <div ref={bar} className="absolute -bottom-px left-0 h-[2px] w-full origin-left bg-gradient-to-r from-brand to-brand-light" style={{ transform: 'scaleX(0)' }} />
    </header>
  );
}
