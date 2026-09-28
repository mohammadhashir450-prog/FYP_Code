import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, ChevronRight } from 'lucide-react';
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
      setScrolled(window.scrollY > 40);
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
        lenis.scrollTo(el, { offset: -60, duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#04060c]/85 backdrop-blur-xl border-b border-gold-500/15 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.6)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand & Crest */}
        <div
          onClick={() => scrollToSection('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[1px] shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-[#070913] rounded-[7px] flex items-center justify-center group-hover:bg-[#0c1020] transition-colors">
              <span className="font-serif font-black text-amber-400 text-sm tracking-tighter">LC</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-[0.25em] text-white text-sm font-bold uppercase">
                Land Cruiser
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold tracking-wider">
                300 VX-R
              </span>
            </div>
            <p className="text-[10px] tracking-[0.2em] text-gray-400 font-mono uppercase">
              TOYOTA HERITAGE
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-full px-4 py-1.5 shadow-inner">
          {SHOWCASE_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1 text-xs font-mono tracking-wider uppercase transition-all rounded-full ${
                activePhase === sec.index
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {sec.id}
            </button>
          ))}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Quick Color Swatches */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1.5 rounded-full">
            {CAR_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => onColorSelect(c)}
                title={c.name}
                className={`w-4 h-4 rounded-full transition-transform ${
                  currentColor.id === c.id
                    ? 'ring-2 ring-amber-400 scale-125'
                    : 'opacity-70 hover:opacity-100 hover:scale-110'
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
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Twin-Turbo V6 Engine Sound"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden lg:inline text-[11px]">V6 SOUND ON</span>
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 h-2 bg-amber-400 animate-[bounce_0.6s_infinite]" />
                  <span className="w-0.5 h-3 bg-amber-400 animate-[bounce_0.8s_infinite]" />
                  <span className="w-0.5 h-1.5 bg-amber-400 animate-[bounce_0.5s_infinite]" />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">SOUND OFF</span>
              </>
            )}
          </button>

          {/* Reserve / Configurator CTA */}
          <button
            onClick={onOpenReservation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-semibold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configure</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
