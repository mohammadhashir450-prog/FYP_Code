'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

export interface RadialItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  active?: boolean;
  /** small status dot on the icon */
  status?: 'on' | 'off';
}

interface Props {
  side: 'left' | 'right';
  items: RadialItem[];
  hubIcon: LucideIcon;
  hubLabel: string;
  ariaLabel: string;
  /** CSS var (without --) that offsets the hub from the screen edge, e.g. the sidebar width */
  offsetVar?: string;
  zIndex?: number;
}

// Geometry (SVG units). The hub is a half-circle on the screen edge; wedges fan out over a half circle.
const R = 236;
const R_IN = 74;
const R_OUT = R - 6;
const GAP = 1.6;
const R_MID = (R_IN + R_OUT) / 2 + 2;

/**
 * Premium radial (pie) menu. One wedge per item, glow + outward lift on hover,
 * live caption inside the hub, roving keyboard focus, Esc / scrim to close.
 */
export default function RadialMenu({ side, items, hubIcon: HubIcon, hubLabel, ariaLabel, offsetVar, zIndex = 90 }: Props) {
  const uid = useId().replace(/:/g, '');
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const hub = useRef<HTMLButtonElement>(null);
  const wedges = useRef<(SVGGElement | null)[]>([]);
  const viaKeyboard = useRef(false);
  const n = items.length;
  const cx = side === 'left' ? 0 : R;

  const pt = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(R + r * Math.sin(a)).toFixed(2)] as const;
  };
  /** angle range (degrees, lo<hi) for item i, ordered top → bottom */
  const range = (i: number): [number, number] => {
    const step = 180 / n;
    if (side === 'left') return [-90 + i * step, -90 + (i + 1) * step];
    return [270 - (i + 1) * step, 270 - i * step];
  };

  const arc = (r0: number, r1: number, lo: number, hi: number) => {
    const [x0, y0] = pt(r1, lo), [x1, y1] = pt(r1, hi), [x2, y2] = pt(r0, hi), [x3, y3] = pt(r0, lo);
    return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
  };
  const line = (r: number, lo: number, hi: number) => {
    const [x0, y0] = pt(r, lo), [x1, y1] = pt(r, hi);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };

  const close = useCallback((refocus = false) => {
    setOpen(false);
    setHover(null);
    if (refocus) hub.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true); };
    window.addEventListener('keydown', key);
    const t = viaKeyboard.current ? setTimeout(() => wedges.current[0]?.focus(), 350) : undefined;
    return () => { window.removeEventListener('keydown', key); if (t) clearTimeout(t); };
  }, [open, close]);

  const move = (from: number, dir: 1 | -1) => wedges.current[(from + dir + n) % n]?.focus();
  const activeItem = hover !== null ? items[hover] : null;
  const ShownIcon = activeItem ? activeItem.icon : HubIcon;

  const select = (it: RadialItem) => { close(); it.onSelect(); };

  const edge = side === 'left' ? 'left' : 'right';

  return (
    <>
      <style>{`
        .rm-${uid} { position: fixed; ${edge}: ${offsetVar ? `var(--${offsetVar}, 0px)` : '0px'}; top: 50%; width: ${R}px; height: ${R * 2}px; transform: translateY(-50%); z-index: ${zIndex}; pointer-events: none; transition: ${edge} .3s cubic-bezier(.4,0,.2,1); }
        .rm-${uid} .rm-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .rm-${uid} .rm-pop { transform-origin: ${cx}px ${R}px; transform: scale(.12) rotate(${side === 'left' ? -25 : 25}deg); opacity: 0; pointer-events: none;
          transition: transform .55s cubic-bezier(.2,.9,.25,1.1), opacity .3s ease; }
        .rm-${uid}.rm-open .rm-pop { transform: none; opacity: 1; pointer-events: auto; }
        .rm-${uid} .rm-w { cursor: pointer; outline: none; }
        .rm-${uid} .rm-lift { transition: transform .3s cubic-bezier(.2,.9,.3,1); }
        .rm-${uid} .rm-body { fill: url(#rm-fill-${uid}); stroke: rgba(255,214,10,.2); stroke-width: 1; transition: fill .25s, stroke .25s, filter .25s; }
        .rm-${uid} .rm-rim { fill: none; stroke: #ffd60a; stroke-width: 2.5; stroke-linecap: round; opacity: 0; transition: opacity .25s; }
        .rm-${uid} .rm-w:hover .rm-body, .rm-${uid} .rm-w:focus-visible .rm-body, .rm-${uid} .rm-w[data-hot="1"] .rm-body { fill: url(#rm-hot-${uid}); stroke: #ffd60a; filter: drop-shadow(0 0 14px rgba(255,214,10,.35)); }
        .rm-${uid} .rm-w:hover .rm-rim, .rm-${uid} .rm-w:focus-visible .rm-rim, .rm-${uid} .rm-w[data-active="1"] .rm-rim { opacity: 1; }
        .rm-${uid} .rm-badge { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;
          background: rgba(255,214,10,.08); border: 1px solid rgba(255,214,10,.32); transition: background .25s, border-color .25s, box-shadow .25s; }
        .rm-${uid} .rm-ico { color: #ffd60a; }
        .rm-${uid} .rm-lbl { color: #eaf2ff; }
        .rm-${uid} .rm-w[data-active="1"] .rm-lbl { color: #ffd60a; }
        .rm-${uid} .rm-w:hover .rm-badge, .rm-${uid} .rm-w:focus-visible .rm-badge, .rm-${uid} .rm-w[data-hot="1"] .rm-badge { background: #ffd60a; border-color: #ffd60a; box-shadow: 0 0 18px rgba(255,214,10,.55); }
        .rm-${uid} .rm-w:hover .rm-ico, .rm-${uid} .rm-w:focus-visible .rm-ico, .rm-${uid} .rm-w[data-hot="1"] .rm-ico { color: #04162f; }
        .rm-${uid} .rm-w:hover .rm-lbl, .rm-${uid} .rm-w:focus-visible .rm-lbl, .rm-${uid} .rm-w[data-hot="1"] .rm-lbl { color: #ffd60a; }
        .rm-${uid} .rm-ring { animation: rm-spin-${uid} 40s linear infinite; transform-origin: ${cx}px ${R}px; }
        @keyframes rm-spin-${uid} { to { transform: rotate(360deg); } }
        .rm-${uid} .rm-hub { position: absolute; ${edge}: -68px; top: ${R - 68}px; width: 136px; height: 136px; border-radius: 50%; pointer-events: auto; cursor: pointer; border: 0;
          display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; padding-${side === 'left' ? 'left' : 'right'}: 68px;
          background: linear-gradient(${side === 'left' ? '225deg' : '135deg'}, #ffe873, #ffd60a 55%, #e6bf00); color: #04162f;
          box-shadow: 0 0 0 6px rgba(255,214,10,.14), 0 0 0 1px rgba(255,214,10,.4), 0 14px 44px rgba(0,0,0,.6);
          transition: transform .3s ease, box-shadow .3s ease; animation: rm-pulse-${uid} 3.2s ease-in-out infinite; }
        .rm-${uid}.rm-open .rm-hub { animation: none; box-shadow: 0 0 0 8px rgba(255,214,10,.2), 0 0 0 1px rgba(255,214,10,.6), 0 14px 44px rgba(0,0,0,.6); }
        .rm-${uid} .rm-hub:hover { transform: scale(1.05); }
        .rm-${uid} .rm-hub:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
        @keyframes rm-pulse-${uid} { 0%, 100% { box-shadow: 0 0 0 5px rgba(255,214,10,.12), 0 0 0 1px rgba(255,214,10,.4), 0 14px 44px rgba(0,0,0,.6); } 50% { box-shadow: 0 0 0 14px rgba(255,214,10,0), 0 0 0 1px rgba(255,214,10,.4), 0 14px 44px rgba(0,0,0,.6); } }
        .rm-${uid} .rm-hub span { font-family: var(--font-mono); font-size: 8.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; text-align: center; line-height: 1.25; max-width: 62px; }
        .rm-scrim-${uid} { position: fixed; inset: 0; z-index: ${zIndex - 1}; background: radial-gradient(circle at ${side === 'left' ? '0%' : '100%'} 50%, rgba(29,85,144,.35), rgba(2,10,24,.7) 60%); backdrop-filter: blur(4px); opacity: 0; pointer-events: none; transition: opacity .35s; }
        .rm-scrim-${uid}.on { opacity: 1; pointer-events: auto; }
        @media (max-width: 900px) { .rm-${uid} { ${edge}: 0; } }
        @media (max-width: 640px) { .rm-${uid} { transform: translateY(-50%) scale(.6); transform-origin: ${edge} center; } }
        @media (prefers-reduced-motion: reduce) { .rm-${uid} .rm-pop, .rm-${uid} .rm-lift, .rm-${uid} .rm-hub, .rm-${uid} .rm-ring { transition: none; animation: none; } }
      `}</style>

      <div className={`rm-scrim-${uid}${open ? ' on' : ''}`} onClick={() => close()} />

      <nav className={`rm-${uid}${open ? ' rm-open' : ''}`} aria-label={ariaLabel}>
        <svg className="rm-svg" viewBox={`0 0 ${R} ${R * 2}`} role="menu" aria-hidden={!open}>
          <defs>
            <linearGradient id={`rm-fill-${uid}`} x1={side === 'left' ? '0' : '1'} y1="0" x2={side === 'left' ? '1' : '0'} y2="1">
              <stop offset="0" stopColor="#0a2447" stopOpacity=".96" /><stop offset="1" stopColor="#04162f" stopOpacity=".98" />
            </linearGradient>
            <linearGradient id={`rm-hot-${uid}`} x1={side === 'left' ? '0' : '1'} y1="0" x2={side === 'left' ? '1' : '0'} y2="1">
              <stop offset="0" stopColor="#1d5590" /><stop offset="1" stopColor="#0f2f5a" />
            </linearGradient>
          </defs>

          <g className="rm-pop" style={{ transitionDelay: open ? '0ms' : '80ms' }}>
            {/* decorative dial ticks */}
            <g className="rm-ring" opacity=".55">
              {Array.from({ length: 61 }).map((_, k) => {
                const deg = (side === 'left' ? -90 : 90) + k * 3;
                const [x0, y0] = pt(R_OUT + 5, deg), [x1, y1] = pt(R_OUT + (k % 5 === 0 ? 11 : 8), deg);
                return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke={k % 5 === 0 ? '#ffd60a' : '#2b7bd6'} strokeWidth={k % 5 === 0 ? 1.4 : 0.8} opacity={k % 5 === 0 ? 0.9 : 0.5} />;
              })}
            </g>
            <path d={line(R_IN - 6, side === 'left' ? -90 : 90, side === 'left' ? 90 : 270)} fill="none" stroke="rgba(255,214,10,.35)" strokeWidth="1" strokeDasharray="2 5" />
          </g>

          {items.map((it, i) => {
            const [lo, hi] = range(i);
            const mid = (lo + hi) / 2;
            const [bx, by] = pt(R_MID, mid);
            const rad = (mid * Math.PI) / 180;
            const lift = hover === i ? 9 : 0;
            const Icon = it.icon;
            return (
              <g key={it.id} className="rm-pop" style={{ transitionDelay: open ? `${60 + i * 55}ms` : '0ms' }}>
                <g className="rm-lift" style={{ transform: `translate(${(Math.cos(rad) * lift).toFixed(2)}px, ${(Math.sin(rad) * lift).toFixed(2)}px)` }}>
                  <g ref={(el) => { wedges.current[i] = el; }} className="rm-w" role="menuitem" tabIndex={open ? 0 : -1} aria-label={it.label}
                    data-active={it.active ? '1' : '0'} data-hot={hover === i ? '1' : '0'}
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                    onFocus={() => setHover(i)} onBlur={() => setHover((h) => (h === i ? null : h))}
                    onClick={() => select(it)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it); }
                      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); move(i, 1); }
                      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); move(i, -1); }
                    }}>
                    <path className="rm-body" d={arc(R_IN, R_OUT, lo + GAP / 2, hi - GAP / 2)} />
                    <path className="rm-rim" d={line(R_OUT + 1, lo + 3, hi - 3)} />
                    <foreignObject x={bx - 48} y={by - 34} width={96} height={68} style={{ pointerEvents: 'none' }}>
                      <div style={{ width: 96, height: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <div className="rm-badge">
                          <span className="rm-ico" style={{ display: 'flex', transition: 'color .25s' }}><Icon size={19} strokeWidth={1.9} /></span>
                          {it.status && <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: it.status === 'on' ? '#34d399' : '#7f9dc6', boxShadow: it.status === 'on' ? '0 0 8px #34d399' : 'none', border: '1px solid #04162f' }} />}
                        </div>
                        <div className="rm-lbl" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', lineHeight: 1.2, transition: 'color .25s' }}>{it.label}</div>
                      </div>
                    </foreignObject>
                  </g>
                </g>
              </g>
            );
          })}
        </svg>

        <button ref={hub} className="rm-hub" onClick={(e) => { viaKeyboard.current = e.detail === 0; if (open) close(); else setOpen(true); }} aria-expanded={open} aria-haspopup="menu" aria-label={open ? `Close ${ariaLabel}` : `Open ${ariaLabel}`}>
          {open && !activeItem ? <X size={24} strokeWidth={2.4} /> : <ShownIcon size={24} strokeWidth={2.1} />}
          <span>{activeItem ? activeItem.label : open ? 'Close' : hubLabel}</span>
        </button>
      </nav>
    </>
  );
}
