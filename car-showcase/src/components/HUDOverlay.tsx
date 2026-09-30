import { useEffect, useRef } from 'react';
import { Zap, Lightbulb } from 'lucide-react';
import { SHOWCASE_SECTIONS } from '../types';
import type { CarModelControls } from './CarModel';
import { engineAudio } from '../utils/engineAudio';

interface HUDOverlayProps {
  activePhase: number;
  controls: CarModelControls;
  onUpdateControls: (patch: Partial<CarModelControls>) => void;
}

export default function HUDOverlay({ activePhase, controls, onUpdateControls }: HUDOverlayProps) {
  const speedRef        = useRef<HTMLSpanElement>(null);
  const gearRef         = useRef<HTMLSpanElement>(null);
  const rpmRef          = useRef<HTMLSpanElement>(null);
  const rpmBarRef       = useRef<HTMLDivElement>(null);
  const progressPctRef  = useRef<HTMLSpanElement>(null);
  const circleRef       = useRef<SVGPathElement>(null);

  // 60fps telemetry — direct DOM mutation, no React re-renders
  useEffect(() => {
    let lastY = window.scrollY;
    let id: number;

    const tick = () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const sp = totalH > 0 ? window.scrollY / totalH : 0;
      const delta = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      const pct = Math.round(sp * 100);

      let speed = 0, gear = 'P', rpm = 850;
      if (sp < 0.17) {
        speed = Math.min(25, Math.round(delta * 0.4));
        gear = speed > 5 ? 'D1' : 'P';
        rpm = 850 + speed * 40;
      } else if (sp < 0.53) {
        speed = Math.min(65, Math.round(35 + delta * 0.5));
        gear = 'D3';
        rpm = 1400 + speed * 25;
      } else if (sp < 0.87) {
        speed = Math.min(95, Math.round(60 + delta * 0.6));
        gear = 'D6';
        rpm = 2200 + speed * 20;
      } else {
        speed = Math.min(210, Math.round(140 + delta * 0.9));
        gear = 'D10';
        rpm = 3800 + speed * 12;
      }

      if (speedRef.current)       speedRef.current.textContent = speed.toString().padStart(3, '0');
      if (gearRef.current)        gearRef.current.textContent = gear;
      if (rpmRef.current)         rpmRef.current.textContent = rpm.toString();
      if (rpmBarRef.current)      rpmBarRef.current.style.width = `${Math.min(100, ((rpm - 800) / 4500) * 100)}%`;
      if (progressPctRef.current) progressPctRef.current.textContent = `${pct}%`;
      if (circleRef.current)      circleRef.current.setAttribute('stroke-dasharray', `${pct}, 100`);

      engineAudio.updateRPM(rpm);
      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const sec = SHOWCASE_SECTIONS[activePhase] || SHOWCASE_SECTIONS[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-8">
      {/* Top — Section tag */}
      <div className="flex items-start justify-between mt-16 pointer-events-auto">
        <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-3.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-[#ccff00] uppercase font-bold">
                0{activePhase + 1} // {sec.tag}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide mt-0.5 uppercase">
              {sec.title}
            </span>
          </div>
        </div>

        {/* Circular scroll progress */}
        <div className="glass-card px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
          <span ref={progressPctRef} className="text-xs font-mono font-bold text-white">0%</span>
          <div className="relative w-6 h-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                strokeWidth="3.5" stroke="rgba(255,255,255,0.1)" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                ref={circleRef}
                strokeDasharray="0, 100" strokeWidth="3.5" strokeLinecap="round"
                stroke="#ccff00" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom — Speed cluster + controls */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-auto">
        {/* Speedometer */}
        <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span ref={speedRef} className="text-3xl font-black tracking-tight text-white">000</span>
            <span className="text-[10px] font-mono text-[#ccff00] font-bold">KM/H</span>
          </div>

          <div className="h-7 w-px bg-white/10" />

          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-neutral-400">GEAR</span>
            <span ref={gearRef} className="text-sm font-mono font-bold text-[#ccff00]">P</span>
          </div>

          <div className="h-7 w-px bg-white/10 hidden sm:block" />

          <div className="hidden sm:flex flex-col gap-1 w-20">
            <div className="flex justify-between text-[8px] font-mono text-neutral-400">
              <span>RPM</span>
              <span ref={rpmRef} className="text-white font-bold">850</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div ref={rpmBarRef} className="h-full bg-[#ccff00] transition-all duration-100" style={{ width: '0%' }} />
            </div>
          </div>
        </div>

        {/* Part control buttons */}
        <div className="glass-card p-1.5 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => onUpdateControls({ lightsOn: !controls.lightsOn })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.lightsOn
                ? 'bg-[#ccff00] text-black font-bold border-[#ccff00]'
                : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-[#ccff00]/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>LIGHTS</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-400">
            <Zap className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>V6 409HP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
