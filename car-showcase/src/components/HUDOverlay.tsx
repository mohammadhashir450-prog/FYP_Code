import { useState, useEffect } from 'react';
import { Zap, Lightbulb, DoorClosed, RotateCcw } from 'lucide-react';
import { SHOWCASE_SECTIONS } from '../types';
import type { CarModelControls } from './CarModel';
import { engineAudio } from '../utils/engineAudio';

interface HUDOverlayProps {
  scrollProgressRef: React.MutableRefObject<number>;
  activePhase: number;
  controls: CarModelControls;
  onUpdateControls: (patch: Partial<CarModelControls>) => void;
}

export default function HUDOverlay({
  scrollProgressRef,
  activePhase,
  controls,
  onUpdateControls,
}: HUDOverlayProps) {
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(850);
  const [gear, setGear] = useState('P');
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    let lastScroll = window.scrollY;
    let timerId: number;

    const updateTelemetry = () => {
      const sp = scrollProgressRef.current;
      setProgressPct(Math.round(sp * 100));

      const delta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;

      let currentSpeed = 0;
      let currentGear = 'P';
      let currentRPM = 850;

      if (sp < 0.17) {
        currentSpeed = Math.min(25, Math.round(delta * 0.4));
        currentGear = currentSpeed > 5 ? 'D1' : 'P';
        currentRPM = 850 + currentSpeed * 40;
      } else if (sp < 0.53) {
        currentSpeed = Math.min(65, Math.round(35 + delta * 0.5));
        currentGear = 'D3';
        currentRPM = 1400 + currentSpeed * 25;
      } else if (sp < 0.87) {
        currentSpeed = Math.min(95, Math.round(60 + delta * 0.6));
        currentGear = 'D6';
        currentRPM = 2200 + currentSpeed * 20;
      } else {
        currentSpeed = Math.min(210, Math.round(140 + delta * 0.9));
        currentGear = 'D10';
        currentRPM = 3800 + currentSpeed * 12;
      }

      setSpeed(currentSpeed);
      setGear(currentGear);
      setRpm(currentRPM);
      engineAudio.updateRPM(currentRPM);

      timerId = requestAnimationFrame(updateTelemetry);
    };

    timerId = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(timerId);
  }, [scrollProgressRef]);

  const currentSection = SHOWCASE_SECTIONS[activePhase] || SHOWCASE_SECTIONS[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Telemetry Header */}
      <div className="flex items-start justify-between mt-16 pointer-events-auto">
        <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-3.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-[#ccff00] uppercase font-bold">
                0{activePhase + 1} // {currentSection.tag}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-display font-bold text-white tracking-wide mt-0.5 uppercase">
              {currentSection.title}
            </span>
          </div>
        </div>

        {/* Circular Progress Badge */}
        <div className="glass-card px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-white">{progressPct}%</span>
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#ccff00] transition-all duration-150"
                strokeDasharray={`${progressPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Cluster */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-auto">
        {/* Speedometer Cluster */}
        <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-black tracking-tight text-white">
              {speed.toString().padStart(3, '0')}
            </span>
            <span className="text-[10px] font-mono text-[#ccff00] font-bold">KM/H</span>
          </div>

          <div className="h-7 w-px bg-white/10" />

          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-neutral-400">GEAR</span>
            <span className="text-sm font-mono font-bold text-[#ccff00]">{gear}</span>
          </div>

          <div className="h-7 w-px bg-white/10 hidden sm:block" />

          <div className="hidden sm:flex flex-col gap-1 w-20">
            <div className="flex justify-between text-[8px] font-mono text-neutral-400">
              <span>RPM</span>
              <span className="text-white font-bold">{rpm}</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ccff00] transition-all duration-100"
                style={{ width: `${Math.min(100, ((rpm - 800) / 4500) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3D Part Overrides */}
        <div className="glass-card p-1.5 rounded-2xl flex items-center gap-1">
          <button
            onClick={() =>
              onUpdateControls({
                manualInspectionMode: true,
                doorsOpen: !controls.doorsOpen,
              })
            }
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.doorsOpen
                ? 'bg-[#ccff00] text-black font-bold border-[#ccff00]'
                : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-[#ccff00]/50'
            }`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>DOORS</span>
          </button>

          <button
            onClick={() =>
              onUpdateControls({
                manualInspectionMode: true,
                hoodOpen: !controls.hoodOpen,
              })
            }
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.hoodOpen
                ? 'bg-[#ccff00] text-black font-bold border-[#ccff00]'
                : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:border-[#ccff00]/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>HOOD</span>
          </button>

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

          {controls.manualInspectionMode && (
            <button
              onClick={() =>
                onUpdateControls({
                  manualInspectionMode: false,
                  doorsOpen: false,
                  hoodOpen: false,
                })
              }
              title="Resume Scroll Sync"
              className="p-1.5 rounded-xl bg-white/[0.08] text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
