'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Aperture, Bell, MessageCircle, Phone, Power, Settings, Star, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

const R = 214;
const R_IN = 70;
const R_OUT = R - 4;
const GAP = 1.4;

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [+(R + r * Math.cos(a)).toFixed(2), +(r * Math.sin(a)).toFixed(2)] as const;
};

function wedge(i: number, n: number) {
  const step = 180 / n;
  const a1 = 180 - i * step - GAP / 2; // first item sits on the left, then sweeps clockwise underneath
  const a0 = 180 - (i + 1) * step + GAP / 2;
  const [x0, y0] = pt(R_OUT, a0), [x1, y1] = pt(R_OUT, a1), [x2, y2] = pt(R_IN, a1), [x3, y3] = pt(R_IN, a0);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`;
}

/**
 * Quick-actions pie that drops out of a navbar button.
 * Live Chat · Call Customer · Reviews · Availability · Notifications · Settings.
 */
export default function QuickPie() {
  const router = useRouter();
  const { isAuthenticated, profile, toggleOnline } = useAuth();
  const { showToast } = useToast();
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // drives the CSS transition after mount
  const [anchor, setAnchor] = useState({ x: 0, y: 0, s: 1 });

  const items = [
    { id: 'chat', label: 'Live Chat', icon: MessageCircle, href: '/chat' },
    { id: 'call', label: 'Call Customer', icon: Phone },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, href: '/reviews' },
    { id: 'avail', label: !isAuthenticated ? 'Availability' : profile.online ? 'Go Offline' : 'Go Online', icon: Power, state: isAuthenticated ? (profile.online ? 'on' : 'off') : undefined },
    { id: 'notif', label: 'Notification Centre', icon: Bell, href: '/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const close = useCallback(() => { setShown(false); setTimeout(() => setOpen(false), 260); }, []);

  const toggle = () => {
    if (open) return close();
    const r = btn.current!.getBoundingClientRect();
    const s = Math.min(1, (window.innerWidth - 16) / (R * 2));
    setAnchor({ x: r.left + r.width / 2, y: r.bottom + 10, s });
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, close]);

  const run = (it: (typeof items)[number]) => {
    close();
    if (!isAuthenticated) { showToast('Sign in to use quick actions', 'info'); router.push('/login'); return; }
    if (it.id === 'avail') { toggleOnline(); showToast(profile.online ? 'You are now offline — new requests paused' : 'You are online and accepting requests', 'info'); return; }
    if (it.id === 'call') { showToast('Calling unlocks once you accept a job with a customer', 'info'); router.push('/jobs'); return; }
    if (it.href) router.push(it.href);
  };

  const step = 180 / items.length;

  return (
    <>
      <button ref={btn} onClick={toggle} aria-haspopup="menu" aria-expanded={open}
        className="group relative flex items-center gap-2.5 rounded-full border border-brand/40 bg-navy/70 py-1.5 pl-1.5 pr-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand shadow-[0_0_0_1px_rgba(255,214,10,.08),0_8px_30px_rgba(0,0,0,.4)] backdrop-blur transition hover:border-brand hover:shadow-[0_0_28px_rgba(255,214,10,.28)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand text-navy transition-transform duration-500 group-hover:rotate-90">
          {open ? <X size={16} strokeWidth={2.6} /> : <Aperture size={16} strokeWidth={2.4} />}
        </span>
        <span className="hidden sm:inline">Quick Actions</span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 118, background: 'rgba(2,10,24,.55)', backdropFilter: 'blur(4px)', opacity: shown ? 1 : 0, transition: 'opacity .3s' }} />
          <div role="menu" aria-label="Quick actions"
            style={{ position: 'fixed', zIndex: 119, left: anchor.x - R, top: anchor.y, width: R * 2, height: R + 6, transform: `scale(${anchor.s})`, transformOrigin: 'top center', pointerEvents: shown ? 'auto' : 'none' }}>
            <svg viewBox={`0 0 ${R * 2} ${R + 6}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="qp-glow" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#1d5590" stopOpacity=".55" /><stop offset="100%" stopColor="#1d5590" stopOpacity="0" /></radialGradient>
              </defs>
              <path d={`M0 0 A${R} ${R} 0 0 0 ${R * 2} 0Z`} transform={`translate(0 0)`} fill="url(#qp-glow)" style={{ opacity: shown ? 1 : 0, transition: 'opacity .5s' }} />
              {items.map((it, i) => {
                const mid = 180 - i * step - step / 2;
                const [ix, iy] = pt((R_IN + R_OUT) / 2, mid);
                const Icon = it.icon;
                const on = it.state === 'on';
                return (
                  <g key={it.id} role="menuitem" tabIndex={shown ? 0 : -1} aria-label={it.label} className="qp-wedge"
                    style={{ transformOrigin: `${R}px 0px`, transform: shown ? 'scale(1)' : 'scale(.15)', opacity: shown ? 1 : 0, transition: `transform .5s cubic-bezier(.2,.9,.25,1.12) ${i * 50}ms, opacity .3s ease ${i * 50}ms`, cursor: 'pointer', outline: 'none' }}
                    onClick={() => run(it)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(it); } }}>
                    <path d={wedge(i, items.length)} />
                    <foreignObject x={ix - 44} y={iy - 30} width={88} height={60} style={{ pointerEvents: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center', color: '#eaf2ff' }}>
                        <span style={{ position: 'relative', display: 'flex' }}>
                          <Icon size={22} strokeWidth={1.8} />
                          {it.state && <span style={{ position: 'absolute', top: -3, right: -6, width: 7, height: 7, borderRadius: '50%', background: on ? '#34d399' : '#7f9dc6', boxShadow: on ? '0 0 8px #34d399' : 'none' }} />}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', lineHeight: 1.2 }}>{it.label}</span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
            <style>{`
              .qp-wedge path { fill: rgba(7,28,59,.95); stroke: rgba(255,214,10,.24); stroke-width: 1; transition: fill .2s, stroke .2s; }
              .qp-wedge:hover path, .qp-wedge:focus-visible path { fill: rgba(29,85,144,.97); stroke: #ffd60a; }
              .qp-wedge:hover foreignObject div, .qp-wedge:focus-visible foreignObject div { color: #ffd60a !important; }
            `}</style>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
