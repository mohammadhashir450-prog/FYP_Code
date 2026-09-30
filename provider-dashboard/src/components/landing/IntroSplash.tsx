'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const NAME = 'REPAIREASE'.split('');
const STATUS = ['Calibrating tools', 'Loading 3D showroom', 'Assembling parts', 'Tuning the engine', 'Ready'];
const MIN_MS = 3000;

/** Drifting light motes behind the logo. */
function Motes() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    const N = 70;
    const P = Array.from({ length: N }, (_, i) => ({ x: (i * 0.6180339 * 997) % 1, y: (i * 0.7548776 * 613) % 1, z: 0.3 + ((i * 0.5698402) % 1) * 0.9, k: i % 4 === 0 }));
    const resize = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    window.addEventListener('resize', resize);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of P) {
        p.y -= 0.0007 * p.z; if (p.y < -0.02) p.y = 1.02;
        p.x += Math.sin((p.y + p.z) * 9) * 0.0002;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.z * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = p.k ? `rgba(255,214,10,${0.35 * p.z})` : `rgba(140,190,255,${0.3 * p.z})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}

/**
 * Cinematic intro: big logo with orbiting rings and conic halo, staggered wordmark, motes,
 * live load progress, then a two-panel curtain that opens onto the page.
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
      tl.from('.is-grid', { opacity: 0, duration: 1.4 }, 0)
        .from('.is-halo', { scale: 0.3, opacity: 0, duration: 1.6 }, 0)
        .from('.is-ring', { scale: 0.35, opacity: 0, duration: 1.3, stagger: 0.14 }, 0.1)
        .from('.is-logo', { scale: 0.5, opacity: 0, filter: 'blur(18px)', duration: 1.2 }, 0.2)
        .from('.is-sweep', { xPercent: -160, duration: 1.2, ease: 'power2.inOut' }, 1.0)
        .from('.is-letter', { yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.055 }, 0.7)
        .from('.is-sub', { opacity: 0, letterSpacing: '0.1em', duration: 1.1, ease: 'power2.out' }, 1.2)
        .from('.is-meter', { opacity: 0, y: 14, duration: 0.7 }, 1.3)
        .from('.is-corner', { opacity: 0, scale: 0.6, duration: 0.8, stagger: 0.08 }, 0.4);
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  // Smooth the displayed percentage toward the real one (time-based, so slow frames can't stall it).
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1);
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
      .to('.is-logo', { scale: 1.12, duration: 0.5, ease: 'power2.out' })
      .to('.is-center', { scale: 1.25, opacity: 0, filter: 'blur(12px)', duration: 0.8, ease: 'power2.in' }, 0.35)
      .to('.is-corner', { opacity: 0, duration: 0.4 }, 0.2)
      .to('.is-top', { yPercent: -101, duration: 1.05, ease: 'power4.inOut' }, 0.55)
      .to('.is-bottom', { yPercent: 101, duration: 1.05, ease: 'power4.inOut' }, 0.55)
      .to('.is-line', { scaleX: 0, opacity: 0, duration: 0.5 }, 0.4);
  }, [shown, onDone]);
  useEffect(() => () => { exitTl.current?.kill(); }, []);

  const status = STATUS[Math.min(STATUS.length - 1, Math.floor((shown / 100) * STATUS.length))];

  return (
    <div ref={root} className="fixed inset-0 z-[100] overflow-hidden" role="status" aria-label="Loading RepairEase">
      <style>{`
        @keyframes is-conic { to { transform: rotate(360deg); } }
        @keyframes is-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>

      {/* curtain panels */}
      <div className="is-top absolute inset-x-0 top-0 h-1/2 bg-[#020a18]" />
      <div className="is-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#020a18]" />
      <div aria-hidden className="is-line absolute inset-x-0 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-brand/70 to-transparent" />

      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,85,144,.42),transparent_62%)]" />
      <div aria-hidden className="is-grid pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-40 [background-image:linear-gradient(rgba(43,123,214,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(43,123,214,.35)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(500px)_rotateX(58deg)] [transform-origin:bottom]" />
      <Motes />

      {/* HUD corners */}
      {['left-6 top-6 border-l border-t', 'right-6 top-6 border-r border-t', 'left-6 bottom-6 border-b border-l', 'right-6 bottom-6 border-b border-r'].map((c) => (
        <span key={c} aria-hidden className={`is-corner absolute h-8 w-8 border-brand/60 md:h-12 md:w-12 ${c}`} />
      ))}

      <div className="is-center absolute inset-0 flex flex-col items-center justify-center gap-8 md:gap-10">
        {/* logo with halo + orbit rings */}
        <div className="relative flex h-[17rem] w-[17rem] items-center justify-center md:h-[22rem] md:w-[22rem]">
          <span aria-hidden className="is-halo absolute inset-6 animate-[is-conic_6s_linear_infinite] rounded-full opacity-80 blur-[2px] [background:conic-gradient(from_0deg,transparent,rgba(255,214,10,.85),transparent_30%,rgba(43,123,214,.85),transparent_65%)] [mask-image:radial-gradient(circle,transparent_58%,black_60%,black_64%,transparent_66%)]" />
          <svg className="is-ring absolute inset-0 h-full w-full animate-[spin_26s_linear_infinite]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="98" stroke="url(#is-g1)" strokeWidth="1.2" strokeDasharray="2 7" />
            <defs><linearGradient id="is-g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffd60a" /><stop offset="1" stopColor="#2b7bd6" /></linearGradient></defs>
          </svg>
          <svg className="is-ring absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="96" stroke="#ffd60a" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="110 493" />
            <circle cx="100" cy="100" r="96" stroke="#2b7bd6" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="70 533" strokeDashoffset="-300" />
          </svg>
          <span aria-hidden className="is-ring absolute inset-14 animate-pulse rounded-full bg-brand/25 blur-3xl" />
          <div className="is-logo relative h-40 w-40 animate-[is-float_4s_ease-in-out_infinite] overflow-hidden rounded-[2rem] bg-white p-1.5 shadow-[0_0_90px_rgba(255,214,10,.45),0_30px_80px_rgba(0,0,0,.6)] md:h-56 md:w-56 md:rounded-[2.6rem] md:p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="RepairEase" className="h-full w-full rounded-[1.6rem] object-contain md:rounded-[2.1rem]" />
            <span aria-hidden className="is-sweep absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          </div>
        </div>

        {/* wordmark */}
        <div className="text-center">
          <div className="flex justify-center overflow-hidden font-display text-4xl font-bold tracking-[0.3em] text-brand md:text-6xl" aria-label="RepairEase">
            {NAME.map((c, i) => <span key={i} className="is-letter inline-block">{c}</span>)}
          </div>
          <div className="is-sub mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.55em] text-mist md:text-[11px]">Provider Platform</div>
        </div>

        {/* meter */}
        <div className="is-meter w-72 md:w-80">
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
            <div ref={bar} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-brand via-brand-light to-white shadow-[0_0_16px_rgba(255,214,10,.8)]" style={{ transform: 'scaleX(0)' }} />
          </div>
          <div className="mt-3.5 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.28em] text-mist-dim">
            <span>{status}</span>
            <span className="text-brand">{String(Math.round(shown)).padStart(2, '0')}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
