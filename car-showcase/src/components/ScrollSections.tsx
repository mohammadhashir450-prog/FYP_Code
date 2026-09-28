import { KEY_SPECS, CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';
import { Wind, Layers, Flame, Compass, Cpu } from 'lucide-react';

interface ScrollSectionsProps {
  currentColor: CarColorOption;
  onColorSelect: (color: CarColorOption) => void;
  onOpenReservation: () => void;
}

export default function ScrollSections({
  currentColor,
  onColorSelect,
  onOpenReservation,
}: ScrollSectionsProps) {
  return (
    <div className="relative z-10 w-full overflow-hidden">
      {/* ────────────────── SECTION 0: HERO ────────────────── */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-between pt-32 pb-16 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-2xl mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-amber-300 tracking-widest uppercase">
              70TH ANNIVERSARY ICON
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-black tracking-tight text-white uppercase leading-[0.9]">
            The King <br />
            <span className="text-gradient-gold">Of All Terrains</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 font-light leading-relaxed max-w-xl">
            Meet the 2022 Toyota Land Cruiser 300 VX-R. Re-engineered on the ultra-rigid
            TNGA-F platform with a 3.5-liter twin-turbo V6, combining peerless off-road
            supremacy with bespoke Japanese luxury.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenReservation}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-sm tracking-wider uppercase shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              Order Specification
            </button>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="text-xs font-mono text-gray-400">STARTING AT</span>
              <span className="text-sm font-mono font-bold text-white">$91,500 USD</span>
            </div>
          </div>
        </div>

        {/* Scroll Prompt */}
        <div className="flex items-center justify-between pt-12 border-t border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-12 rounded-full border-2 border-amber-400/40 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-2.5 bg-amber-400 rounded-full animate-[bounce_1.5s_infinite]" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase">
                SCROLL TO EXPLORE
              </span>
              <span className="text-xs text-gray-400 font-mono">
                3D KINETIC PRODUCT STORY
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 font-mono text-xs text-gray-400">
            <span>MODEL CODE: FJA300R</span>
            <span>ASSEMBLY: YOSHIWARA, JAPAN</span>
          </div>
        </div>
      </section>

      {/* ────────────────── SECTION 1: AERODYNAMICS & SCULPTURE ────────────────── */}
      <section
        id="aerodynamics"
        className="min-h-screen flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl backdrop-blur-2xl bg-[#070913]/65 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3">
            <Wind className="w-4 h-4" />
            <span>01 // ARCHITECTURAL FORM</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            Sculpted For <br />
            <span className="text-gradient-gold">Unshakable Poise</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            The Land Cruiser 300 sheds 200 kg from the previous generation thanks to an
            all-aluminum roof, hood, doors, and tailgate panels. The lowered center of gravity
            improves on-road composure while preserving legendary 700mm water-fording prowess.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">WEIGHT SAVING</span>
              <span className="text-2xl font-mono font-bold text-white">-200 KG</span>
              <span className="block text-[11px] text-amber-400/80 mt-0.5">High-tensile aluminium</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">RIGIDITY GAIN</span>
              <span className="text-2xl font-mono font-bold text-white">+20%</span>
              <span className="block text-[11px] text-amber-400/80 mt-0.5">TNGA-F ladder frame</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── SECTION 2: CABIN & CRAFTSMANSHIP ────────────────── */}
      <section
        id="cockpit"
        className="min-h-screen flex items-center justify-end px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl backdrop-blur-2xl bg-[#070913]/65 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3">
            <Layers className="w-4 h-4" />
            <span>02 // BESPOKE INTERIOR</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            Executive Sanctuary, <br />
            <span className="text-gradient-gold">Zero Distraction</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            Four doors open onto hand-stitched semi-aniline leather upholstery, open-pore wood
            finishes, and an acoustically sealed cabin. Dual active noise cancellation filters
            out the outside world, paired with a 14-speaker JBL Premium audio soundstage.
          </p>

          <ul className="mt-6 space-y-3 font-mono text-xs text-gray-300">
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span>12.3-inch high-resolution infotainment screen with 3D terrain monitor</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span>Refrigerated center console coolbox for long desert expeditions</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span>Four-zone automatic climate control with nanoe™ X air purification</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ────────────────── SECTION 3: POWERTRAIN & V6 TWIN TURBO ────────────────── */}
      <section
        id="powertrain"
        className="min-h-screen flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl backdrop-blur-2xl bg-[#070913]/65 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>03 // PROPULSION HEART</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            Twin-Turbocharged <br />
            <span className="text-gradient-gold">V6 Dominance</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            Replacing the venerable V8, the state-of-the-art 3.5L V35A-FTS Twin-Turbo V6 produces
            an astonishing 409 horsepower and 650 Nm of torque from just 2,000 RPM.
            Channelled via a 10-speed Direct Shift automatic transmission for instantaneous response.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-2xl font-mono font-bold text-amber-400">409</span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">HORSEPOWER</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-2xl font-mono font-bold text-white">650</span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">NM TORQUE</span>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-2xl font-mono font-bold text-emerald-400">10</span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">GEAR RATIOS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── SECTION 4: TAILGATE & UTILITY ────────────────── */}
      <section
        id="tailgate"
        className="min-h-screen flex items-center justify-end px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-xl backdrop-blur-2xl bg-[#070913]/65 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3">
            <Compass className="w-4 h-4" />
            <span>04 // EXPEDITION CAPACITY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            Intelligent Cargo, <br />
            <span className="text-gradient-gold">Unlimited Horizon</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            The power tailgate lifts to reveal a completely flat-floor cargo bed with power-stowable
            third-row seating. Capable of carrying up to 1,967 liters of expedition gear with a
            3,500 kg braked towing capacity.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">CARGO VOLUME</span>
              <span className="text-2xl font-mono font-bold text-white">1,967 L</span>
              <span className="block text-[11px] text-gray-400 mt-0.5">Seats folded flat</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-[10px] font-mono text-gray-400 uppercase">TOWING CAPACITY</span>
              <span className="text-2xl font-mono font-bold text-amber-400">3,500 KG</span>
              <span className="block text-[11px] text-gray-400 mt-0.5">Integrated hitch</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── SECTION 5: VELOCITY & OFF-ROAD RIG ────────────────── */}
      <section
        id="velocity"
        className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-24"
      >
        <div className="max-w-2xl backdrop-blur-2xl bg-[#070913]/70 border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-3">
            <Cpu className="w-4 h-4" />
            <span>05 // DYNAMIC STANCE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-tight">
            E-KDSS Kinetic <br />
            <span className="text-gradient-gold">Suspension System</span>
          </h2>

          <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed">
            World-first Electronic Kinetic Dynamic Suspension System (E-KDSS) electronically
            disengages the stabilizer bars for unmatched wheel articulation across boulders and
            sand dunes, and locks them instantaneously for track-like cornering stability at high speeds.
          </p>

          {/* Interactive Paint Palette Selector inside showcase */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="block text-xs font-mono text-amber-400 uppercase tracking-widest font-bold mb-3">
              SELECT EXTERIOR FINISH:
            </span>
            <div className="flex flex-wrap gap-3">
              {CAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onColorSelect(c)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-mono transition-all ${
                    currentColor.id === c.id
                      ? 'border-amber-400 bg-amber-400/10 text-white shadow-lg shadow-amber-400/20'
                      : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-1 ring-white/30"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── SECTION 6: SPECIFICATIONS MATRIX ────────────────── */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
            TECHNICAL ARCHITECTURE
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mt-2">
            Engineered Without Compromise
          </h2>
          <p className="text-gray-400 text-sm mt-3 font-mono">
            Every millimeter refined over 70 years of legendary global testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KEY_SPECS.map((spec, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#070913]/80 border border-white/10 backdrop-blur-xl hover:border-amber-400/40 transition-colors shadow-xl"
            >
              <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                {spec.label}
              </span>
              <div className="text-3xl font-mono font-black text-white mt-1">
                {spec.value}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                {spec.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* VIP Callout Banner */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#070913] to-black border border-amber-500/25 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div>
            <span className="text-xs font-mono text-amber-400 tracking-widest uppercase font-bold">
              VIP ALLOCATION 2026/2027
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
              Commission Your VX-R Build
            </h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xl font-light">
              Limited production allocations are now open for worldwide delivery.
              Reserve your chassis with prioritized factory scheduling.
            </p>
          </div>

          <button
            onClick={onOpenReservation}
            className="whitespace-nowrap px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-sm tracking-wider uppercase shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Commence Reservation
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-gray-500 text-xs font-mono">
          <div>
            © 2026 Toyota Motor Corporation. 2022 Land Cruiser 300 VX-R Showcase Experience.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-amber-400 cursor-pointer">PRIVACY</span>
            <span className="hover:text-amber-400 cursor-pointer">LEGAL</span>
            <span className="hover:text-amber-400 cursor-pointer">DEALERSHIP LOCATOR</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
