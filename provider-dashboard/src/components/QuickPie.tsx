'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Aperture, Bell, MessageCircle, Phone, Power, Settings, Star, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

// Geometry (SVG units). The hub sits on the LEFT screen edge and the wedges fan out to the right.
const R = 226;
const R_IN = 70;
const R_OUT = R - 4;
const GAP = 1.4;

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [+(r * Math.cos(a)).toFixed(2), +(R + r * Math.sin(a)).toFixed(2)] as const;
};

function wedge(i: number, n: number) {
  const step = 180 / n;
  const a0 = -90 + i * step + GAP / 2;
  const a1 = -90 + (i + 1) * step - GAP / 2;
  const [x0, y0] = pt(R_OUT, a0), [x1, y1] = pt(R_OUT, a1), [x2, y2] = pt(R_IN, a1), [x3, y3] = pt(R_IN, a0);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`;
}

/**
 * Quick-actions pie on the left edge (mirror of the Services pie on the right).
 * Live Chat · Call Customer · Reviews · Availability · Notifications · Settings.
 */
export default function QuickPie() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, profile, toggleOnline } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const items = [
    { id: 'chat', label: 'Live Chat', icon: MessageCircle, href: '/chat' },
    { id: 'call', label: 'Call Customer', icon: Phone, href: '/jobs' },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, href: '/reviews' },
    { id: 'avail', label: !isAuthenticated ? 'Availability' : profile.online ? 'Go Offline' : 'Go Online', icon: Power, state: isAuthenticated ? (profile.online ? 'on' : 'off') : undefined },
    { id: 'notif', label: 'Notification Centre', icon: Bell, href: '/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const run = (it: (typeof items)[number]) => {
    close();
    if (!isAuthenticated) { showToast('Sign in to use quick actions', 'info'); router.push('/login'); return; }
    if (it.id === 'avail') {
      toggleOnline();
      showToast(profile.online ? 'You are now offline — new requests paused' : 'You are online and accepting requests', 'info');
      return;
    }
    if (it.id === 'call') showToast('Calling unlocks once you accept a job with a customer', 'info');
    if (it.href) router.push(it.href);
  };

  const step = 180 / items.length;

  return (
    <>
      <style>{`
        .qp-root { position: fixed; left: var(--qp-left, 0px); top: 50%; width: ${R}px; height: ${R * 2}px; transform: translateY(-50%); z-index: 91; pointer-events: none; transition: left .3s cubic-bezier(.4,0,.2,1); }
        .qp-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .qp-wedge { transform-origin: 0px ${R}px; transform: scale(.15); opacity: 0; pointer-events: none;
          transition: transform .5s cubic-bezier(.2,.9,.25,1.12), opacity .3s ease; cursor: pointer; outline: none; }
        .qp-open .qp-wedge { transform: scale(1); opacity: 1; pointer-events: auto; }
        .qp-wedge path { fill: rgba(7,28,59,.95); stroke: rgba(255,214,10,.24); stroke-width: 1; transition: fill .2s, stroke .2s; }
        .qp-wedge:hover path, .qp-wedge:focus-visible path { fill: rgba(29,85,144,.97); stroke: #ffd60a; }
        .qp-hub { position: absolute; left: -64px; top: ${R - 64}px; width: 128px; height: 128px; border-radius: 50%; pointer-events: auto; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; padding-left: 64px;
          background: linear-gradient(225deg, #ffe873, #ffd60a 55%, #e6bf00); color: #04162f; border: 0;
          box-shadow: 0 0 0 6px rgba(255,214,10,.14), 0 12px 40px rgba(0,0,0,.55); transition: transform .3s ease, box-shadow .3s ease; }
        .qp-hub:hover { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(255,214,10,.2), 0 12px 40px rgba(0,0,0,.55); }
        .qp-hub span { font-family: var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .qp-scrim { position: fixed; inset: 0; z-index: 90; background: rgba(2,10,24,.55); backdrop-filter: blur(3px); opacity: 0; pointer-events: none; transition: opacity .3s; }
        .qp-scrim.on { opacity: 1; pointer-events: auto; }
        @media (max-width: 900px) { .qp-root { left: 0; } }
        @media (max-width: 640px) { .qp-root { transform: translateY(-50%) scale(.8); transform-origin: left center; } .qp-hub { transform: scale(.55); } .qp-open .qp-hub { transform: none; } }
      `}</style>

      <div className={`qp-scrim${open ? ' on' : ''}`} onClick={close} />

      <nav className={`qp-root${open ? ' qp-open' : ''}`} aria-label="Quick actions" data-path={pathname}>
        <svg className="qp-svg" viewBox={`0 0 ${R} ${R * 2}`} role="menu">
          {items.map((it, i) => {
            const mid = -90 + i * step + step / 2;
            const [ix, iy] = pt((R_IN + R_OUT) / 2, mid);
            const Icon = it.icon;
            const on = it.state === 'on';
            return (
              <g key={it.id} role="menuitem" tabIndex={open ? 0 : -1} aria-label={it.label} className="qp-wedge"
                style={{ transitionDelay: open ? `${i * 45}ms` : '0ms' }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onClick={() => run(it)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(it); } }}>
                <path d={wedge(i, items.length)} />
                <foreignObject x={ix - 44} y={iy - 30} width={88} height={60} style={{ pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center', color: hover === i ? '#ffd60a' : '#eaf2ff' }}>
                    <span style={{ position: 'relative', display: 'flex' }}>
                      <Icon size={21} strokeWidth={1.8} />
                      {it.state && <span style={{ position: 'absolute', top: -3, right: -6, width: 7, height: 7, borderRadius: '50%', background: on ? '#34d399' : '#7f9dc6', boxShadow: on ? '0 0 8px #34d399' : 'none' }} />}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', lineHeight: 1.2 }}>{it.label}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        <button className="qp-hub" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" aria-label={open ? 'Close quick actions' : 'Open quick actions'}>
          {open ? <X size={22} strokeWidth={2.4} /> : <Aperture size={22} strokeWidth={2.2} />}
          <span>{open ? 'Close' : 'Quick'}</span>
        </button>
      </nav>
    </>
  );
}
