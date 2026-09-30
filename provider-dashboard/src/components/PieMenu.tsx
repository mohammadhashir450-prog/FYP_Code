'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, Hourglass, LayoutDashboard, UserRound, Briefcase, Wrench, X } from 'lucide-react';

export const OPEN_PIE_EVENT = 'repairease:toggle-pie';

const ITEMS = [
  { label: 'Login / Register', href: '/login', icon: LogIn },
  { label: 'Verification', href: '/pending', icon: Hourglass },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/profile', icon: UserRound },
  { label: 'Job Requests', href: '/jobs', icon: Briefcase },
];

// Geometry (SVG units). Hub sits on the right screen edge, wedges fan out to the left over a half circle.
const R = 200;
const R_IN = 66;
const R_OUT = R - 4;
const GAP = 1.6; // degrees between wedges
const STEP = 180 / ITEMS.length;

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [+(R + r * Math.cos(a)).toFixed(2), +(R + r * Math.sin(a)).toFixed(2)] as const;
};

function wedge(i: number) {
  const a0 = 90 + i * STEP + GAP / 2;
  const a1 = 90 + (i + 1) * STEP - GAP / 2;
  const [x0, y0] = pt(R_OUT, a0), [x1, y1] = pt(R_OUT, a1), [x2, y2] = pt(R_IN, a1), [x3, y3] = pt(R_IN, a0);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`;
}

/** Radial "pie" navigation: half-hub on the right edge that fans out into one wedge per page. */
export default function PieMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const go = useCallback((href: string) => { setOpen(false); router.push(href); }, [router]);

  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener(OPEN_PIE_EVENT, toggle);
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener(OPEN_PIE_EVENT, toggle); window.removeEventListener('keydown', key); };
  }, []);

  return (
    <>
      <style>{`
        .pie-root { position: fixed; right: 0; top: 50%; width: ${R}px; height: ${R * 2}px; transform: translateY(-50%); z-index: 90; pointer-events: none; }
        .pie-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .pie-wedge { transform-origin: ${R}px ${R}px; transform: scale(.2); opacity: 0; pointer-events: none;
          transition: transform .45s cubic-bezier(.2,.9,.25,1.15), opacity .3s ease; cursor: pointer; outline: none; }
        .pie-open .pie-wedge { transform: scale(1); opacity: 1; pointer-events: auto; }
        .pie-wedge path { fill: rgba(7,28,59,.94); stroke: rgba(255,214,10,.22); stroke-width: 1; transition: fill .2s, stroke .2s; }
        .pie-wedge:hover path, .pie-wedge:focus-visible path { fill: rgba(29,85,144,.96); stroke: #ffd60a; }
        .pie-wedge.active path { fill: rgba(255,214,10,.14); stroke: #ffd60a; }
        .pie-hub { position: absolute; right: -64px; top: ${R - 64}px; width: 128px; height: 128px; border-radius: 50%; pointer-events: auto; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; padding-right: 64px;
          background: linear-gradient(135deg, #ffe873, #ffd60a 55%, #e6bf00); color: #04162f; border: 0;
          box-shadow: 0 0 0 6px rgba(255,214,10,.14), 0 12px 40px rgba(0,0,0,.55); transition: transform .3s ease, box-shadow .3s ease; }
        .pie-hub:hover { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(255,214,10,.2), 0 12px 40px rgba(0,0,0,.55); }
        .pie-hub span { font-family: var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .pie-scrim { position: fixed; inset: 0; z-index: 89; background: rgba(2,10,24,.55); backdrop-filter: blur(3px); opacity: 0; pointer-events: none; transition: opacity .3s; }
        .pie-scrim.on { opacity: 1; pointer-events: auto; }
        @media (max-width: 640px) { .pie-root { transform: translateY(-50%) scale(.82); transform-origin: right center; } }
      `}</style>

      <div className={`pie-scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} />

      <nav className={`pie-root${open ? ' pie-open' : ''}`} aria-label="Portal pages">
        <svg className="pie-svg" viewBox={`0 0 ${R} ${R * 2}`} role="menu">
          {ITEMS.map((it, i) => {
            const mid = 90 + i * STEP + STEP / 2;
            const [ix, iy] = pt((R_IN + R_OUT) / 2, mid);
            const active = pathname === it.href;
            const Icon = it.icon;
            return (
              <g key={it.href} role="menuitem" tabIndex={open ? 0 : -1} aria-label={it.label}
                className={`pie-wedge${active ? ' active' : ''}`}
                style={{ transitionDelay: open ? `${i * 45}ms` : '0ms' }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onClick={() => go(it.href)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(it.href); } }}>
                <path d={wedge(i)} />
                <foreignObject x={ix - 40} y={iy - 27} width={80} height={54} style={{ pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active || hover === i ? '#ffd60a' : '#dbe8ff', textAlign: 'center' }}>
                    <Icon size={17} strokeWidth={1.8} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', lineHeight: 1.15 }}>{it.label}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        <button className="pie-hub" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close services menu' : 'Open services menu'}>
          {open ? <X size={22} strokeWidth={2.4} /> : <Wrench size={22} strokeWidth={2.2} />}
          <span>{open ? 'Close' : 'Services'}</span>
        </button>
      </nav>
    </>
  );
}
