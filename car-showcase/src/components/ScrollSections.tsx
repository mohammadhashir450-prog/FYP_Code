import { useState, useEffect } from 'react';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';
import {
  Compass,
  Zap,
  Shield,
  Gauge,
  CheckCircle2,
  Wind,
  Layers,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { getLenis } from '../hooks/useLenis';

interface ScrollSectionsProps {
  activePhase?: number;
  currentColor?: CarColorOption;
  onColorSelect?: (color: CarColorOption) => void;
  onOpenReservation?: () => void;
}

// Minimal Animated Stat Counter
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
    const duration = 1600;

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
    <div className="glass-card p-6 rounded-2xl hover:border-[#ccff00]/40 transition-all">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
          {val}
        </span>
        <span className="text-lg font-mono font-bold text-[#ccff00]">{unit}</span>
      </div>
      <span className="block text-xs font-mono font-bold text-white uppercase tracking-widest mt-2">
        {label}
      </span>
      <p className="text-[11px] font-mono text-neutral-400 mt-1">{subtext}</p>
    </div>
  );
}

export default function ScrollSections({
  currentColor = CAR_COLORS[0],
  onColorSelect = () => {},
  onOpenReservation = () => {},
}: ScrollSectionsProps) {
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
      if (lenis) lenis.scrollTo(el, { duration: 1.2 });
      else el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTestDriveBooked(true);
  };

  return (
    <div className="relative z-10 w-full">
      {/* ────────────────── 1. HERO SECTION ────────────────── */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-between pt-28 pb-16 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-2xl mt-6 sm:mt-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
            <span className="text-[11px] font-mono font-semibold text-neutral-300 tracking-[0.2em] uppercase">
              2022 TOYOTA LAND CRUISER 300
            </span>
          </div>

          {/* Large Bold Typography (Space Grotesk) */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-white uppercase leading-[0.92]">
            Built For <br />
            <span className="text-white hover:text-[#ccff00] transition-colors">Any Road.</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-neutral-400 font-normal leading-relaxed max-w-lg">
            Sovereign engineering rebuilt on the high-rigidity TNGA-F ladder architecture.
            Twin-Turbo V6 propulsion, 700mm water-fording command, and executive acoustic isolation.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollToSection('test-drive')}
              className="px-8 py-3.5 rounded-full bg-[#ccff00] text-black font-display font-bold text-xs uppercase tracking-widest hover:bg-[#b8e600] active:scale-95 transition-all shadow-accent-glow"
            >
              Book a Test Drive
            </button>
            <button
              onClick={onOpenReservation}
              className="px-6 py-3.5 rounded-full bg-white/[0.05] border border-white/15 text-white font-mono text-xs uppercase tracking-wider backdrop-blur-md hover:bg-white/10 hover:border-[#ccff00]/50 transition-all"
            >
              Bespoke Spec
            </button>
          </div>

          {/* Minimalist Color Swatches */}
          <div className="mt-8 p-2.5 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-xl inline-flex items-center gap-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider pl-2">
              FINISH:
            </span>
            <div className="flex items-center gap-2">
              {CAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onColorSelect(c)}
                  title={c.name}
                  className={`w-5 h-5 rounded-full transition-all ${
                    currentColor.id === c.id
                      ? 'ring-2 ring-[#ccff00] scale-125'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-white font-semibold border-l border-white/10 pl-3 pr-2">
              {currentColor.name}
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-10 border-t border-white/[0.08]">
          <div
            onClick={() => scrollToSection('design')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-7 h-11 rounded-full border border-neutral-600 flex items-start justify-center p-1 group-hover:border-[#ccff00] transition-colors">
              <div className="w-1.5 h-2 bg-[#ccff00] rounded-full animate-[bounce_1.4s_infinite]" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-[#ccff00] font-bold tracking-widest uppercase">
                SCROLL TO EXPLORE
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                3D SCROLL CHOREOGRAPHY
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 font-mono text-xs text-neutral-500">
            <span>PLATFORM: TNGA-F</span>
            <span>ORIGIN: JAPAN</span>
          </div>
        </div>
      </section>

      {/* ────────────────── 2. DESIGN SECTION ────────────────── */}
      <section
        id="design"
        className="min-h-screen flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text LEFT */}
          <div className="lg:col-span-5 glass-card p-8 sm:p-10 rounded-2xl shadow-soft">
            <div className="flex items-center gap-2 text-[#ccff00] text-xs font-mono tracking-widest uppercase mb-3 font-bold">
              <Wind className="w-4 h-4" />
              <span>02 // SIDE PROFILE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
              Aero Form, <br />
              <span className="text-neutral-400">Iron Stance.</span>
            </h2>

            <p className="mt-4 text-neutral-300 text-sm leading-relaxed">
              In full side profile, the monolithic proportions reflect pure functional precision.
              High approach angles protect vital components, while the lowered center of gravity
              stabilizes high-speed motorway cruising.
            </p>

            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 font-mono">
              <div>
                <span className="block text-[10px] text-neutral-400 uppercase">LENGTH</span>
                <span className="text-2xl font-display font-bold text-white">4,985 MM</span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-400 uppercase">CLEARANCE</span>
                <span className="text-2xl font-display font-bold text-[#ccff00]">235 MM</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2 pointer-events-none" />

          {/* Cards RIGHT */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card p-6 rounded-2xl shadow-soft hover:border-[#ccff00]/40 transition-all">
              <div className="flex items-center gap-3 text-[#ccff00] mb-2">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-display font-bold text-white uppercase">
                  Aluminum Outer Panels
                </h3>
              </div>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Roof, hood, doors, and rear hatch pressed from high-tensile aluminum,
                stripping 200 kg from the kerb weight.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl shadow-soft hover:border-[#ccff00]/40 transition-all">
              <div className="flex items-center gap-3 text-[#ccff00] mb-2">
                <Compass className="w-5 h-5" />
                <h3 className="text-base font-display font-bold text-white uppercase">
                  32° / 26.5° Articulation
                </h3>
              </div>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Steep approach geometry safeguards mechanicals over boulder fields and sand crests.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl shadow-soft hover:border-[#ccff00]/40 transition-all">
              <div className="flex items-center gap-3 text-[#ccff00] mb-2">
                <Shield className="w-5 h-5" />
                <h3 className="text-base font-display font-bold text-white uppercase">
                  700 MM Fording
                </h3>
              </div>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                High-mounted intake routing and water-tight electronic junctions prevent water ingress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 3. INTERIOR / DOORS ────────────────── */}
      <section
        id="interior"
        className="min-h-screen flex items-center justify-start px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl glass-card p-8 sm:p-10 rounded-2xl shadow-soft">
          <div className="flex items-center gap-2 text-[#ccff00] text-xs font-mono tracking-widest uppercase mb-3 font-bold">
            <Maximize2 className="w-4 h-4" />
            <span>03 // OPEN CABIN</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
            Executive <br />
            <span className="text-neutral-400">Sanctuary.</span>
          </h2>

          <p className="mt-4 text-neutral-300 text-sm leading-relaxed">
            With front doors open, camera moves into the cockpit.
            Finished in semi-aniline leather with diamond quilting and brushed aluminum switchgear,
            the LC300 isolates passengers in tranquil acoustic quiet.
          </p>

          <div className="mt-6 space-y-3 font-mono text-xs text-neutral-300">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
              <span className="text-[#ccff00] font-bold">01</span>
              <span>12.3-inch Panoramic Display with Underfloor Terrain View</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
              <span className="text-[#ccff00] font-bold">02</span>
              <span>Center Armrest Coolbox with sub-zero refrigeration</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
              <span className="text-[#ccff00] font-bold">03</span>
              <span>14-Speaker JBL Premium Spatial Audio with active noise isolation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 4. ENGINE / PERFORMANCE ────────────────── */}
      <section
        id="engine"
        className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-2xl glass-card p-8 sm:p-10 rounded-2xl shadow-soft mb-8">
          <div className="flex items-center gap-2 text-[#ccff00] text-xs font-mono tracking-widest uppercase mb-3 font-bold">
            <Zap className="w-4 h-4" />
            <span>04 // PROPULSION HEART</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
            V6 Twin-Turbo: <br />
            <span className="text-neutral-400">Unfiltered Thrust.</span>
          </h2>

          <p className="mt-3 text-neutral-300 text-sm leading-relaxed">
            From the top-down perspective, inspect the 3.5L V35A-FTS dual-intercooled engine.
            Replacing the old V8, it delivers 30 more horsepower, 110 Nm more low-end torque,
            and 10-speed seamless ratio shifts.
          </p>
        </div>

        {/* Spec Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
          <AnimatedStatCounter target={409} unit="HP" label="Peak Output" subtext="Twin-Turbo V6" />
          <AnimatedStatCounter target={650} unit="NM" label="Max Torque" subtext="@ 2,000 - 3,600 RPM" />
          <AnimatedStatCounter target={3.5} unit="L" label="Displacement" subtext="Dual Intercooled" decimals={1} />
          <AnimatedStatCounter target={10} unit="SPD" label="Gearbox" subtext="Direct Shift Automatic" />
        </div>
      </section>

      {/* ────────────────── 5. WHEELS / OFF-ROAD ────────────────── */}
      <section
        id="wheels"
        className="min-h-screen flex items-center justify-end px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl glass-card p-8 sm:p-10 rounded-2xl shadow-soft border-[#ccff00]/20">
          <div className="flex items-center gap-2 text-[#ccff00] text-xs font-mono tracking-widest uppercase mb-3 font-bold">
            <Gauge className="w-4 h-4 animate-spin" />
            <span>05 // WHEEL CONTACT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white uppercase leading-tight">
            E-KDSS & <br />
            <span className="text-neutral-400">Wheel Torque.</span>
          </h2>

          <p className="mt-4 text-neutral-300 text-sm leading-relaxed">
            Low on the asphalt, all four tyres spin under rotational load.
            The Electronic Kinetic Dynamic Suspension System (E-KDSS) unlocks massive wheel travel
            over rocks and binds flat for track composure.
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-neutral-400 block text-[10px]">WHEEL SPEC</span>
              <span className="text-white font-bold text-sm">20" Forged Alloy</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-neutral-400 block text-[10px]">DIFF SYSTEM</span>
              <span className="text-[#ccff00] font-bold text-sm">Torsen LSD Center</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 6. FINAL CTA & TEST DRIVE ────────────────── */}
      <section
        id="test-drive"
        className="min-h-screen py-24 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col justify-center"
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-[#ccff00] tracking-[0.25em] uppercase">
            PRIVATE DEMONSTRATION
          </span>
          <h2 className="text-4xl sm:text-6xl font-display font-black text-white mt-2 uppercase tracking-tight">
            Book a Test Drive
          </h2>
          <p className="text-neutral-400 text-sm mt-3 font-normal max-w-md mx-auto">
            Select your preferred trim and reserve a closed-course trial at your nearest premier boutique.
          </p>
        </div>

        {/* 3 Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: VX-R */}
          <div
            onClick={() => setSelectedTrim('LC 300 VX-R (Flagship Luxury)')}
            className={`cursor-pointer p-6 rounded-2xl border transition-all ${
              selectedTrim.includes('VX-R')
                ? 'bg-neutral-900 border-[#ccff00] shadow-soft scale-[1.02]'
                : 'glass-card border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ccff00]/15 text-[#ccff00] font-bold">
                FLAGSHIP
              </span>
              <span className="text-xs font-mono text-neutral-400">FROM $91,500</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white uppercase">LC 300 VX-R</h3>
            <p className="text-xs font-mono text-neutral-400 mt-1">Luxury Flagship Specification</p>
            <ul className="mt-4 space-y-2 text-xs font-mono text-neutral-300">
              <li>• 3.5L V6 Twin-Turbo (409 HP)</li>
              <li>• 20" Forged Machine-Faced Alloys</li>
              <li>• Semi-Aniline Leather & Coolbox</li>
              <li>• 14-Speaker JBL Premium Sound</li>
            </ul>
          </div>

          {/* Card 2: GR-Sport */}
          <div
            onClick={() => setSelectedTrim('LC 300 GR-Sport (Dakar Edition)')}
            className={`cursor-pointer p-6 rounded-2xl border transition-all ${
              selectedTrim.includes('GR-Sport')
                ? 'bg-neutral-900 border-[#ccff00] shadow-soft scale-[1.02]'
                : 'glass-card border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
                RALLY TUNED
              </span>
              <span className="text-xs font-mono text-neutral-400">FROM $94,200</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white uppercase">LC 300 GR-Sport</h3>
            <p className="text-xs font-mono text-neutral-400 mt-1">Dakar Rally Heritage Rig</p>
            <ul className="mt-4 space-y-2 text-xs font-mono text-neutral-300">
              <li>• Front & Rear Electronic Diff Locks</li>
              <li>• Specially Tuned E-KDSS Suspension</li>
              <li>• 18" Matte Grey Beadlock Alloys</li>
              <li>• GR Red & Black Interior Accents</li>
            </ul>
          </div>

          {/* Card 3: Sahara ZX */}
          <div
            onClick={() => setSelectedTrim('LC 300 Sahara ZX (Executive Touring)')}
            className={`cursor-pointer p-6 rounded-2xl border transition-all ${
              selectedTrim.includes('Sahara ZX')
                ? 'bg-neutral-900 border-[#ccff00] shadow-soft scale-[1.02]'
                : 'glass-card border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
                EXECUTIVE
              </span>
              <span className="text-xs font-mono text-neutral-400">FROM $98,800</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white uppercase">Sahara ZX</h3>
            <p className="text-xs font-mono text-neutral-400 mt-1">First-Class Executive Tourer</p>
            <ul className="mt-4 space-y-2 text-xs font-mono text-neutral-300">
              <li>• Dual 11.6" Rear Seat Entertainment</li>
              <li>• Hands-Free Power Kick Tailgate</li>
              <li>• 21" Premium Diamond Rims</li>
              <li>• Heated & Ventilated Executive Row</li>
            </ul>
          </div>
        </div>

        {/* Minimalist Booking Form */}
        <div className="max-w-2xl mx-auto w-full p-8 sm:p-10 rounded-2xl glass-card shadow-soft">
          {testDriveBooked ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-[#ccff00]/15 text-[#ccff00] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ccff00]/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-xs font-mono text-[#ccff00] tracking-widest uppercase font-bold">
                RESERVATION LOGGED
              </span>
              <h3 className="text-2xl font-display font-bold text-white mt-1 uppercase">
                Appointment Confirmed
              </h3>
              <p className="text-neutral-300 text-sm mt-3 font-normal leading-relaxed">
                Thank you, <span className="text-white font-bold">{testDriveName}</span>. Your private
                session for the <span className="text-[#ccff00] font-bold">{selectedTrim}</span> is confirmed
                at <span className="text-white font-bold">{testDriveCity}</span> on{' '}
                <span className="text-white font-bold">{testDriveDate}</span>.
              </p>
              <button
                onClick={() => setTestDriveBooked(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#ccff00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-colors"
              >
                Schedule Another Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleTestDriveSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono text-[#ccff00] font-bold uppercase">
                  TRIM: {selectedTrim}
                </span>
                <span className="text-xs font-mono text-neutral-400">FINISH: {currentColor.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tariq Al-Mansoor"
                    value={testDriveName}
                    onChange={(e) => setTestDriveName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vip@domain.com"
                    value={testDriveEmail}
                    onChange={(e) => setTestDriveEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Experience Center
                  </label>
                  <select
                    value={testDriveCity}
                    onChange={(e) => setTestDriveCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ccff00]"
                  >
                    <option>Dubai Downtown Showroom</option>
                    <option>Riyadh King Fahd Center</option>
                    <option>Tokyo Aoyama Boutique</option>
                    <option>London Mayfair Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={testDriveDate}
                    onChange={(e) => setTestDriveDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-full bg-[#ccff00] text-black font-display font-bold text-xs uppercase tracking-widest shadow-accent-glow hover:bg-[#b8e600] active:scale-[0.99] transition-all"
              >
                Confirm Test Drive
              </button>
            </form>
          )}
        </div>

        {/* Minimal Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-xs font-mono">
          <div>© 2026 Toyota Motor Corporation. 2022 Toyota Land Cruiser 300 VX-R.</div>
          <div className="flex gap-6">
            <span className="hover:text-[#ccff00] cursor-pointer">PRIVACY</span>
            <span className="hover:text-[#ccff00] cursor-pointer">LEGAL</span>
            <span className="hover:text-[#ccff00] cursor-pointer">CONCIERGE</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
