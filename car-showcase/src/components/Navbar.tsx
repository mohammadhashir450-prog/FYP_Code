import { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { CAR_COLORS, SHOWCASE_SECTIONS } from '../types';
import type { CarColorOption } from '../types';
import { engineAudio } from '../utils/engineAudio';
import { getLenis } from '../hooks/useLenis';

interface NavbarProps {
  currentColor: CarColorOption;
  onColorSelect: (color: CarColorOption) => void;
  onOpenReservation: () => void;
  activePhase: number;
}

export default function Navbar({
  currentColor,
  onColorSelect,
  onOpenReservation,
  activePhase,
}: NavbarProps) {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const active = engineAudio.toggle();
    setIsAudioActive(active);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el, { offset: -50, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] py-3.5 shadow-soft'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand / Crest */}
        <div
          onClick={() => scrollToSection('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-display font-black text-xs tracking-tighter group-hover:bg-[#ccff00] transition-colors">
            LC
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-sm tracking-wide uppercase">
              Land Cruiser
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#ccff00]/15 text-[#ccff00] font-bold tracking-wider">
              300 VX-R
            </span>
          </div>
        </div>

        {/* Minimal Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-full px-3 py-1">
          {SHOWCASE_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1 text-xs font-mono tracking-wider uppercase transition-all rounded-full ${
                activePhase === sec.index
                  ? 'bg-[#ccff00] text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {sec.id}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Minimalist Paint Swatches */}
          <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900/80 border border-white/10 px-2 py-1.5 rounded-full">
            {CAR_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => onColorSelect(c)}
                title={c.name}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  currentColor.id === c.id
                    ? 'ring-2 ring-[#ccff00] scale-125'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* Engine Audio Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
              isAudioActive
                ? 'bg-[#ccff00]/15 border-[#ccff00]/40 text-[#ccff00]'
                : 'bg-white/[0.04] border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="hidden lg:inline text-[11px] font-bold">V6 ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">AUDIO</span>
              </>
            )}
          </button>

          {/* Minimal Accent CTA */}
          <button
            onClick={onOpenReservation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ccff00] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#b8e600] active:scale-95 transition-all shadow-accent-glow"
          >
            <span>Test Drive</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
