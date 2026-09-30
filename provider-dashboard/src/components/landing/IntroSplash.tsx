'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const NAME = 'REPAIREASE'.split('');
const STATUS = ['Calibrating tools', 'Loading 3D showroom', 'Assembling parts', 'Almost ready'];
const MIN_MS = 2600;

/**
 * Cinematic intro: orbiting rings around the logo, staggered wordmark, live load progress,
 * then a two-panel curtain that opens onto the page.
 */
export default function IntroSplash({ progress, onDone }: { progress: number; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0); // smoothed % shown to the user
  const [minElapsed, setMinElapsed] = useState(false);
  const exiting = useRef(false);

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.is-ring', { scale: 0.4, opacity: 0, duration: 1.2, stagger: 0.12 }, 0)
        .from('.is-logo', { scale: 0.6, opacity: 0, filter: 'blur(14px)', duration: 1.1 }, 0.15)
        .from('.is-sweep', { xPercent: -120, duration: 1.1, ease: 'power2.inOut' }, 0.9)
        .from('.is-letter', { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.05 }, 0.5)
        .from('.is-sub', { opacity: 0, letterSpacing: '0.1em', duration: 1, ease: 'power2.out' }, 1.0)
        .from('.is-meter', { opacity: 0, y: 12, duration: 0.6 }, 1.1);
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  // Smooth the displayed percentage toward the real one.
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1); // time-based, so slow frames can't stall the bar
      prev = now;
      setShown((s) => {
        const target = Math.min(progress, minElapsed ? 100 : 96);
        const next = s + (target - s) * (1 - Math.exp(-dt * 4));
        return target - next < 0.1 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, minElapsed]);

  useEffect(() => { if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`; }, [shown]);

  // Exit: curtain opens (runs once; the timeline is killed only on unmount)
  const exitTl = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    if (shown < 99.5 || exiting.current) return;
    exiting.current = true;
    exitTl.current = gsap.timeline({ onComplete: onDone })
      .to('.is-center', { scale: 1.15, opacity: 0, filter: 'blur(10px)', duration: 0.7, ease: 'power2.in' })
      .to('.is-top', { yPercent: -101, duration: 1.0, ease: 'power4.inOut' }, 0.35)
      .to('.is-bottom', { yPercent: 101, duration: 1.0, ease: 'power4.inOut' }, 0.35)
      .to('.is-line', { scaleX: 0, opacity: 0, duration: 0.5 }, 0.2);
  }, [shown, onDone]);
  useEffect(() => () => { exitTl.current?.kill(); }, []);

  const status = STATUS[Math.min(STATUS.length - 1, Math.floor((shown / 100) * STATUS.length))];

  return (
    <div ref={root} className="fixed inset-0 z-[100] overflow-hidden" role="status" aria-label="Loading">
      {/* curtain panels */}
      <div className="is-top absolute inset-x-0 top-0 h-1/2 bg-[#020a18]" />
      <div className="is-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#020a18]" />
      <div aria-hidden className="is-line absolute inset-x-0 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,85,144,.35),transparent_60%)]" />

      <div className="is-center absolute inset-0 flex flex-col items-center justify-center gap-9">
        {/* logo with orbit rings */}
        <div className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
          <svg className="is-ring absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="97" stroke="url(#is-g1)" strokeWidth="1.5" strokeDasharray="4 9" />
            <defs><linearGradient id="is-g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffd60a" /><stop offset="1" stopColor="#2b7bd6" /></linearGradient></defs>
          </svg>
          <svg className="is-ring absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] animate-[spin_9s_linear_infinite_reverse]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="96" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round" strokeDasharray="90 512" />
            <circle cx="100" cy="100" r="96" stroke="#2b7bd6" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 542" strokeDashoffset="-260" />
          </svg>
          <span aria-hidden className="is-ring absolute inset-8 rounded-full bg-brand/20 blur-2xl animate-pulse" />
          <div className="is-logo relative h-28 w-28 overflow-hidden rounded-3xl bg-white p-1 shadow-[0_0_60px_rgba(255,214,10,.35)] md:h-32 md:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="RepairEase" className="h-full w-full rounded-[20px] object-contain" />
            <span aria-hidden className="is-sweep absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
        </div>

        {/* wordmark */}
        <div className="text-center">
          <div className="flex justify-center overflow-hidden font-display text-4xl font-bold tracking-[0.28em] text-brand md:text-5xl" aria-label="RepairEase">
            {NAME.map((c, i) => <span key={i} className="is-letter inline-block">{c}</span>)}
          </div>
          <div className="is-sub mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.5em] text-mist-dim">Provider Platform</div>
        </div>

        {/* meter */}
        <div className="is-meter w-64">
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
            <div ref={bar} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-brand via-brand-light to-white shadow-[0_0_14px_rgba(255,214,10,.7)]" style={{ transform: 'scaleX(0)' }} />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.25em] text-mist-dim">
            <span>{status}</span>
            <span className="text-brand">{String(Math.round(shown)).padStart(2, '0')}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
