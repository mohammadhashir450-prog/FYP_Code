import { useState, useEffect } from 'react';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';
import {
  Compass,
  Zap,
  Shield,
  Gauge,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowDown,
  Layers,
  Wind,
  Maximize2
} from 'lucide-react';
import { getLenis } from '../hooks/useLenis';

interface ScrollSectionsProps {
  currentColor: CarColorOption;
  onColorSelect: (color: CarColorOption) => void;
  onOpenReservation: () => void;
}

// Counter with scroll-driven interpolation
function AnimatedStatCounter({
  target,
  unit,
  label,
  subtext,
  decimals = 0,
}: {
  target: number;
  unit: string;
  label: string;
  subtext: string;
  decimals?: number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let frameId: number;
    let start: number | null = null;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Number((ease * target).toFixed(decimals)));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, decimals]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-amber-400/40 transition-all shadow-xl">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight">
          {val}
        </span>
        <span className="text-lg font-mono font-bold text-amber-400">{unit}</span>
      </div>
      <span className="block text-xs font-mono font-bold text-amber-300 uppercase tracking-widest mt-2">
        {label}
      </span>
      <p className="text-[11px] font-mono text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

export default function ScrollSections({
  currentColor,
  onColorSelect,
  onOpenReservation,
}: ScrollSectionsProps) {
  // Test Drive booking form state
  const [testDriveName, setTestDriveName] = useState('');
  const [testDriveEmail, setTestDriveEmail] = useState('');
  const [testDriveCity, setTestDriveCity] = useState('Dubai Downtown Showroom');
  const [testDriveDate, setTestDriveDate] = useState('2026-10-05');
  const [selectedTrim, setSelectedTrim] = useState('LC 300 VX-R (Flagship Luxury)');
  const [testDriveBooked, setTestDriveBooked] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(el, { duration: 1.4 });
      else el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTestDriveBooked(true);
  };

  return (
    <div className="relative z-10 w-full">
      {/* ──────────────────────────────────────────────────────────
          1. HERO SECTION: "BUILT FOR ANY ROAD"
          Car in 3/4 front view popping out, subtle floating idle, CTA
         ────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-between pt-32 pb-16 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-2xl mt-6 sm:mt-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 mb-5 shadow-lg shadow-amber-400/5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-amber-300 tracking-[0.25em] uppercase">
              2022 TOYOTA LAND CRUISER 300 VX-R
            </span>
          </div>

          {/* Big Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-black tracking-tight text-white uppercase leading-[0.92]">
            Built For <br />
            <span className="text-gradient-gold">Any Road</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 font-light leading-relaxed max-w-xl">
            The sovereign of all terrains re-engineered from the ground up on the ultra-rigid
            TNGA-F chassis. Twin-Turbocharged V6 force, 700mm water-fording command, and
            unrivaled executive poise.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollToSection('test-drive')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              Book a Test Drive
            </button>
            <button
              onClick={onOpenReservation}
              className="px-6 py-4 rounded-full bg-white/[0.05] border border-white/15 text-white font-mono text-xs uppercase tracking-wider backdrop-blur-md hover:bg-white/10 hover:border-amber-400/50 transition-all"
            >
              Configure Bespoke Build
            </button>
          </div>

          {/* Color Switcher Bar in Hero */}
          <div className="mt-10 p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl inline-flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider pl-2 font-semibold">
              COLOR:
            </span>
            <div className="flex items-center gap-2">
              {CAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onColorSelect(c)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full transition-all ${
                    currentColor.id === c.id
                      ? 'ring-2 ring-amber-400 scale-125 shadow-lg shadow-amber-400/30'
                      : 'opacity-65 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-amber-300 font-bold border-l border-white/10 pl-3 pr-2">
              {currentColor.name}
            </span>
          </div>
        </div>

        {/* Hero Bottom Bar */}
        <div className="flex items-center justify-between pt-12 border-t border-white/[0.08]">
          <div
            onClick={() => scrollToSection('design')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-12 rounded-full border-2 border-amber-400/40 flex items-start justify-center p-1.5 group-hover:border-amber-400 transition-colors">
              <div className="w-1.5 h-2.5 bg-amber-400 rounded-full animate-[bounce_1.5s_infinite]" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase">
                SCROLL TO EXPLORE
              </span>
              <span className="text-xs text-gray-400 font-mono">
                3D INTERACTIVE CHOREOGRAPHY
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 font-mono text-xs text-gray-400">
            <span>PLATFORM: TNGA-F LADDER FRAME</span>
            <span>PRODUCED: YOSHIWARA, AICHI, JAPAN</span>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. DESIGN SECTION:
          Car rotates to side profile, text LEFT, feature cards RIGHT
         ────────────────────────────────────────────────────────── */}
      <section
        id="design"
        className="min-h-screen flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text on the LEFT */}
          <div className="lg:col-span-5 backdrop-blur-2xl bg-[#080c16]/75 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3 font-bold">
              <Wind className="w-4 h-4" />
              <span>02 // SCULPTED SIDE PROFILE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
              Design Born <br />
              <span className="text-gradient-gold">From Iron & Air</span>
            </h2>

            <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
              As you look across its pure side profile, every sculpted crease serves aerodynamic
              stability. The hood features a distinctive central concave indentation to improve
              forward corner visibility during steep desert ascents and rocky trails.
            </p>

            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-mono text-gray-400 uppercase">OVERALL LENGTH</span>
                <span className="text-2xl font-mono font-bold text-white">4,985 MM</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-gray-400 uppercase">GROUND CLEARANCE</span>
                <span className="text-2xl font-mono font-bold text-amber-400">235 MM</span>
              </div>
            </div>
          </div>

          {/* Center gap for the side-view 3D car */}
          <div className="hidden lg:block lg:col-span-2 pointer-events-none" />

          {/* Feature Cards on the RIGHT */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#080c16]/75 border border-white/10 backdrop-blur-2xl shadow-xl hover:border-amber-400/40 transition-all">
              <div className="flex items-center gap-3 text-amber-400 mb-2">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-serif font-bold text-white">
                  All-Aluminum Outer Shell
                </h3>
              </div>
              <p className="text-xs font-mono text-gray-300 leading-relaxed">
                Roof, hood, all four passenger doors, and the split rear tailgate are
                stamped from aircraft-grade aluminum, achieving a massive 200 kg mass reduction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080c16]/75 border border-white/10 backdrop-blur-2xl shadow-xl hover:border-amber-400/40 transition-all">
              <div className="flex items-center gap-3 text-amber-400 mb-2">
                <Compass className="w-5 h-5" />
                <h3 className="text-base font-serif font-bold text-white">
                  32° Approach & 26.5° Departure
                </h3>
              </div>
              <p className="text-xs font-mono text-gray-300 leading-relaxed">
                High-mounted bumpers and tucked rocker panels safeguard vital mechanical
                components while allowing extreme geometric articulation over rocky ridges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080c16]/75 border border-white/10 backdrop-blur-2xl shadow-xl hover:border-amber-400/40 transition-all">
              <div className="flex items-center gap-3 text-amber-400 mb-2">
                <Shield className="w-5 h-5" />
                <h3 className="text-base font-serif font-bold text-white">
                  700 MM Water Fording
                </h3>
              </div>
              <p className="text-xs font-mono text-gray-300 leading-relaxed">
                High-snorkel intake routing and sealed electrical chassis conduits empower
                flawless river and deep flood traversal with zero cabin seepage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. INTERIOR/DOORS SECTION:
          Front doors open, camera moves closer
         ────────────────────────────────────────────────────────── */}
      <section
        id="interior"
        className="min-h-screen flex items-center justify-start px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl backdrop-blur-2xl bg-[#080c16]/80 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3 font-bold">
            <Maximize2 className="w-4 h-4" />
            <span>03 // CABIN REVELATION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            Step Inside The <br />
            <span className="text-gradient-gold">Inner Sanctuary</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            The doors swing open as the camera moves close into the cockpit.
            Finished in semi-aniline leather with diamond quilting and brushed aluminum switchgear,
            the LC300 isolates passengers in tranquil library-quiet acoustics.
          </p>

          <div className="mt-6 space-y-3 font-mono text-xs text-gray-300">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
              <span className="text-amber-400 font-bold">01</span>
              <span>12.3-inch Panoramic Display with 3D Underfloor Multi-Terrain Monitor</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
              <span className="text-amber-400 font-bold">02</span>
              <span>Front & Rear Refrigerated Coolbox for sub-zero desert hydration</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
              <span className="text-amber-400 font-bold">03</span>
              <span>14-Speaker JBL Premium Spatial Sound System with active noise cancellation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          4. ENGINE/PERFORMANCE SECTION:
          Hood opens, camera TOP-DOWN, animated spec counters
         ────────────────────────────────────────────────────────── */}
      <section
        id="engine"
        className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-2xl backdrop-blur-2xl bg-[#060912]/85 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl mb-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3 font-bold">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>04 // TWIN-TURBOCHARGED PROPULSION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            V6 Twin-Turbo: <br />
            <span className="text-gradient-gold">Pure Unrivaled Power</span>
          </h2>

          <p className="mt-3 text-gray-300 text-sm sm:text-base leading-relaxed">
            With the hood lifted, witness the 3.5-liter V35A-FTS dual-intercooled powerhouse.
            Replacing the previous V8, it yields 30 more horsepower and an astonishing
            110 Nm more low-end torque while slashing fuel consumption by 10%.
          </p>
        </div>

        {/* Animated Spec Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
          <AnimatedStatCounter
            target={409}
            unit="HP"
            label="Peak Power"
            subtext="Twin-Turbo Charged"
          />
          <AnimatedStatCounter
            target={650}
            unit="NM"
            label="Max Torque"
            subtext="@ 2,000 - 3,600 RPM"
          />
          <AnimatedStatCounter
            target={3.5}
            unit="L"
            label="Displacement"
            subtext="V6 Dual Intercooled"
            decimals={1}
          />
          <AnimatedStatCounter
            target={10}
            unit="SPD"
            label="Transmission"
            subtext="Direct Shift Automatic"
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          5. WHEELS/OFF-ROAD SECTION:
          Camera low on wheels, tyres spin rapidly, dark background
         ────────────────────────────────────────────────────────── */}
      <section
        id="wheels"
        className="min-h-screen flex items-center justify-end px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl backdrop-blur-2xl bg-black/90 border border-amber-500/25 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3 font-bold">
            <Gauge className="w-4 h-4 text-amber-400 animate-spin" />
            <span>05 // HIGH-VELOCITY WHEEL ARTICULATION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            E-KDSS & <br />
            <span className="text-gradient-gold">All-Terrain Contact</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            Close to the tarmac, all four wheels spin with rotational force.
            World-first Electronic Kinetic Dynamic Suspension System (E-KDSS) electronically
            disengages stabilizer bars to unlock massive wheel stroke on dunes and locks them
            instantaneously for flat cornering poise at track speeds.
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5">
              <span className="text-gray-400 block text-[10px]">WHEEL SPEC</span>
              <span className="text-white font-bold text-sm">20" Forged Alloy</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5">
              <span className="text-gray-400 block text-[10px]">DIFFERENTIAL</span>
              <span className="text-amber-400 font-bold text-sm">Torsen LSD Center</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          6. FINAL CTA SECTION:
          Car returns to hero pose, "Book a Test Drive" + product cards
         ────────────────────────────────────────────────────────── */}
      <section
        id="test-drive"
        className="min-h-screen py-24 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col justify-center"
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-amber-400 tracking-[0.25em] uppercase">
            VIP DEMONSTRATION ALLOCATION
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-black text-white mt-2 uppercase tracking-tight">
            Book a Test Drive
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3 font-light">
            Take command of the 2022 Toyota Land Cruiser 300. Choose your trim and reserve
            a private closed-course demonstration.
          </p>
        </div>

        {/* Product Cards for Trims */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Trim 1: VX-R */}
          <div
            onClick={() => setSelectedTrim('LC 300 VX-R (Flagship Luxury)')}
            className={`cursor-pointer p-6 rounded-3xl border transition-all ${
              selectedTrim.includes('VX-R')
                ? 'bg-[#0e1322] border-amber-400 shadow-2xl shadow-amber-400/20 scale-[1.02]'
                : 'bg-[#070a14]/80 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                FLAGSHIP
              </span>
              <span className="text-xs font-mono text-gray-400">FROM $91,500</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">LC 300 VX-R</h3>
            <p className="text-xs font-mono text-gray-400 mt-1">Luxury Flagship Specification</p>
            <ul className="mt-4 space-y-2 text-xs font-mono text-gray-300">
              <li>• 3.5L V6 Twin-Turbo (409 HP)</li>
              <li>• 20" Forged Machine-Faced Alloys</li>
              <li>• Semi-Aniline Leather & Coolbox</li>
              <li>• 14-Speaker JBL Premium Sound</li>
            </ul>
          </div>

          {/* Trim 2: GR-Sport */}
          <div
            onClick={() => setSelectedTrim('LC 300 GR-Sport (Dakar Edition)')}
            className={`cursor-pointer p-6 rounded-3xl border transition-all ${
              selectedTrim.includes('GR-Sport')
                ? 'bg-[#0e1322] border-amber-400 shadow-2xl shadow-amber-400/20 scale-[1.02]'
                : 'bg-[#070a14]/80 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                RALLY TUNED
              </span>
              <span className="text-xs font-mono text-gray-400">FROM $94,200</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">LC 300 GR-Sport</h3>
            <p className="text-xs font-mono text-gray-400 mt-1">Dakar Rally Heritage Rig</p>
            <ul className="mt-4 space-y-2 text-xs font-mono text-gray-300">
              <li>• Front & Rear Electronic Diff Locks</li>
              <li>• Specially Tuned E-KDSS Suspension</li>
              <li>• 18" Matte Grey Beadlock Alloys</li>
              <li>• GR Red & Black Interior Accents</li>
            </ul>
          </div>

          {/* Trim 3: Sahara ZX */}
          <div
            onClick={() => setSelectedTrim('LC 300 Sahara ZX (Executive Touring)')}
            className={`cursor-pointer p-6 rounded-3xl border transition-all ${
              selectedTrim.includes('Sahara ZX')
                ? 'bg-[#0e1322] border-amber-400 shadow-2xl shadow-amber-400/20 scale-[1.02]'
                : 'bg-[#070a14]/80 border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                EXECUTIVE
              </span>
              <span className="text-xs font-mono text-gray-400">FROM $98,800</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Sahara ZX</h3>
            <p className="text-xs font-mono text-gray-400 mt-1">First-Class Executive Tourer</p>
            <ul className="mt-4 space-y-2 text-xs font-mono text-gray-300">
              <li>• Dual 11.6" Rear Seat Entertainment</li>
              <li>• Hands-Free Power Kick Tailgate</li>
              <li>• 21" Premium Diamond Rims</li>
              <li>• Heated & Ventilated Executive Row</li>
            </ul>
          </div>
        </div>

        {/* Booking Form Card */}
        <div className="max-w-2xl mx-auto w-full p-8 sm:p-10 rounded-3xl bg-[#080c16]/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
          {testDriveBooked ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono text-amber-400 tracking-widest uppercase font-bold">
                TEST DRIVE CONFIRMED
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Your Appointment Is Scheduled
              </h3>
              <p className="text-gray-300 text-sm mt-3 font-light leading-relaxed">
                Thank you, <span className="text-white font-bold">{testDriveName}</span>. Your private
                demonstration for the <span className="text-amber-400 font-bold">{selectedTrim}</span> has
                been logged at <span className="text-white font-bold">{testDriveCity}</span> for{' '}
                <span className="text-white font-bold">{testDriveDate}</span>.
              </p>
              <button
                onClick={() => setTestDriveBooked(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-amber-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
              >
                Schedule Another Test Drive
              </button>
            </div>
          ) : (
            <form onSubmit={handleTestDriveSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                  SELECTED: {selectedTrim}
                </span>
                <span className="text-xs font-mono text-gray-400">FINISH: {currentColor.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={testDriveName}
                    onChange={(e) => setTestDriveName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={testDriveEmail}
                    onChange={(e) => setTestDriveEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Premier Showroom
                  </label>
                  <select
                    value={testDriveCity}
                    onChange={(e) => setTestDriveCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  >
                    <option>Dubai Downtown Showroom</option>
                    <option>Riyadh King Fahd Highway Center</option>
                    <option>Tokyo Aoyama Experience Center</option>
                    <option>London Mayfair VIP Boutique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0b0f19] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Confirm Test Drive Reservation
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs font-mono">
          <div>© 2026 Toyota Motor Corporation. 2022 Toyota Land Cruiser 300 VX-R.</div>
          <div className="flex gap-6">
            <span className="hover:text-amber-400 cursor-pointer">PRIVACY</span>
            <span className="hover:text-amber-400 cursor-pointer">LEGAL</span>
            <span className="hover:text-amber-400 cursor-pointer">CONTACT CONCIERGE</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
