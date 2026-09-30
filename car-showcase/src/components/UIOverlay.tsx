/*
 * UIOverlay.tsx — Premium minimalist hero UI
 *
 * Layout:
 *  ┌─ Top bar: badge + nav links ─────────────────────────────────────────────┐
 *  │                                                                           │
 *  │  Left column: headline + tagline + CTA buttons                           │
 *  │  Right column: floating spec cards                                       │
 *  │                                                                           │
 *  └─ Bottom: section dot indicator ──────────────────────────────────────────┘
 *
 * All positioned as fixed overlay (pointer-events selective so 3D canvas
 * still receives orbit drag events).
 */

import { motion } from 'framer-motion';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';

const SPECS = [
  { label: 'Engine',       value: '3.5L Twin-Turbo V6' },
  { label: 'Power',        value: '409 hp / 650 Nm' },
  { label: '0–100 km/h',   value: '6.7 seconds' },
  { label: 'Drive',        value: 'Part-Time 4WD' },
  { label: 'Wading Depth', value: '700 mm' },
  { label: 'Ground Clear', value: '225 mm' },
];

const SECTIONS = ['HERO', 'DESIGN', 'INTERIOR', 'ENGINE', 'WHEELS', 'CTA'];

interface UIOverlayProps {
  assembled:       boolean;
  activeSection:   number;
  currentColor:    CarColorOption;
  onColorSelect:   (c: CarColorOption) => void;
  onLightsToggle:  () => void;
  lightsOn:        boolean;
  onBookDrive:     () => void;
}

export default function UIOverlay({
  assembled,
  activeSection,
  currentColor,
  onColorSelect,
  onLightsToggle,
  lightsOn,
  onBookDrive,
}: UIOverlayProps) {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none select-none">

      {/* ══════════════════════ TOP NAV BAR ══════════════════════ */}
      <motion.header
        className="pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: assembled ? 1 : 0, y: assembled ? 0 : -24 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        {/* Brand badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <span className="font-black text-black text-xs tracking-wider">LC</span>
          </div>
          <div>
            <div className="text-[9px] font-mono tracking-[0.3em] text-[#ccff00] uppercase font-bold">
              Toyota Heritage
            </div>
            <div className="text-[11px] font-semibold text-white/80 tracking-wide">
              Land Cruiser Series
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {['Design', 'Interior', 'Performance', 'Configure'].map(l => (
            <a
              key={l}
              href="#"
              className="text-xs font-semibold tracking-widest text-white/60 uppercase hover:text-[#ccff00] transition-colors duration-300"
            >
              {l}
            </a>
          ))}
        </nav>

        {/* Lights toggle */}
        <button
          onClick={onLightsToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-mono text-white/70 hover:border-[#ccff00] hover:text-[#ccff00] transition-all duration-300"
        >
          <span className={`w-2 h-2 rounded-full ${lightsOn ? 'bg-[#ccff00]' : 'bg-white/30'} transition-colors`} />
          {lightsOn ? 'LIGHTS ON' : 'LIGHTS OFF'}
        </button>
      </motion.header>

      {/* ══════════════════════ HERO TEXT — LEFT ══════════════════════ */}
      <motion.div
        className="absolute bottom-28 left-8 md:left-14 max-w-lg pointer-events-auto"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: assembled ? 1 : 0, x: assembled ? 0 : -40 }}
        transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Overline */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-px bg-[#ccff00]" />
          <span className="text-[10px] font-mono tracking-[0.35em] text-[#ccff00] uppercase font-bold">
            2022 · Series 300 · VX.R
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="font-black uppercase leading-none tracking-tight mb-4"
          style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.72) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Land Cruiser<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #ccff00 0%, #88dd00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            300 VX.R
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-white/55 text-sm md:text-base font-light leading-relaxed mb-8 max-w-sm">
          Built for any road. Engineered for every terrain.
          Legendary capability meets uncompromising luxury.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="group relative px-7 py-3.5 rounded-full bg-[#ccff00] text-black text-xs font-black tracking-widest uppercase overflow-hidden hover:scale-105 active:scale-95 transition-transform duration-200 shadow-[0_0_30px_rgba(204,255,0,0.35)]"
          >
            <span className="relative z-10">Explore Features</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity" />
          </button>
          <button
            onClick={onBookDrive}
            className="px-7 py-3.5 rounded-full border border-white/25 bg-white/5 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            Book a Test Drive
          </button>
        </div>

        {/* Color selector */}
        <div className="flex items-center gap-3 mt-7">
          <span className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase">Color</span>
          {CAR_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => onColorSelect(c)}
              title={c.name}
              className="w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125"
              style={{
                backgroundColor: c.hex,
                borderColor: currentColor.id === c.id ? '#ccff00' : 'rgba(255,255,255,0.2)',
                boxShadow: currentColor.id === c.id ? `0 0 10px ${c.hex}88` : 'none',
              }}
            />
          ))}
          <span className="text-[10px] font-mono text-white/50">{currentColor.name}</span>
        </div>
      </motion.div>

      {/* ══════════════════════ SPEC CARDS — RIGHT ══════════════════════ */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 right-8 md:right-12 flex flex-col gap-2 pointer-events-none"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: assembled ? 1 : 0, x: assembled ? 0 : 40 }}
        transition={{ duration: 0.85, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {SPECS.map((s, i) => (
          <motion.div
            key={s.label}
            className="px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 min-w-[160px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: assembled ? 1 : 0, x: assembled ? 0 : 20 }}
            transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
          >
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/40 uppercase mb-0.5">
              {s.label}
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              {s.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════ SECTION DOTS — BOTTOM CENTER ══════════════════════ */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: assembled ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {SECTIONS.map((name, i) => (
          <div key={name} className="flex flex-col items-center gap-1.5 group">
            <div
              className="text-[8px] font-mono tracking-widest transition-colors duration-300"
              style={{ color: activeSection === i ? '#ccff00' : 'rgba(255,255,255,0.25)' }}
            >
              {name}
            </div>
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width:  activeSection === i ? 24 : 6,
                height: 6,
                backgroundColor: activeSection === i ? '#ccff00' : 'rgba(255,255,255,0.2)',
                boxShadow: activeSection === i ? '0 0 8px #ccff0088' : 'none',
              }}
            />
          </div>
        ))}
      </motion.div>

      {/* ══════════════════════ ASSEMBLY PROGRESS HINT ══════════════════════ */}
      {!assembled && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase">
            Assembling
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#ccff00]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
