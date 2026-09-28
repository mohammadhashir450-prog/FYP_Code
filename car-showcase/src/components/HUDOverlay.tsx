import { useState, useEffect } from 'react';
import { Gauge, Zap, Lightbulb, DoorClosed, RotateCcw, Box } from 'lucide-react';
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

      // Speed calculation based on scroll velocity & phase
      let currentSpeed = 0;
      let currentGear = 'P';
      let currentRPM = 850;

      if (sp < 0.16) {
        currentSpeed = Math.min(25, Math.round(delta * 0.4));
        currentGear = currentSpeed > 5 ? 'D1' : 'P';
        currentRPM = 850 + currentSpeed * 40;
      } else if (sp < 0.54) {
        currentSpeed = Math.min(65, Math.round(35 + delta * 0.5));
        currentGear = 'D3';
        currentRPM = 1400 + currentSpeed * 25;
      } else if (sp < 0.88) {
        currentSpeed = Math.min(95, Math.round(60 + delta * 0.6));
        currentGear = 'D6';
        currentRPM = 2200 + currentSpeed * 20;
      } else {
        // Dynamic Launch phase (Stage 5)
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
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-8">
      {/* Top Telemetry Header Bar */}
      <div className="flex items-start justify-between mt-16 pointer-events-auto">
        {/* Left: Mission / Phase Telemetry Card */}
        <div className="bg-[#070913]/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                PHASE 0{activePhase + 1} // {currentSection.tag}
              </span>
            </div>
            <span className="text-sm font-serif font-bold text-white tracking-wider mt-0.5">
              {currentSection.title}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          {/* Quick HUD specs pill */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[9px] font-mono text-gray-400 uppercase">DRIVE MODE</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {activePhase === 5 ? 'SPORT+ S2' : 'COMFORT LC'}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-mono text-gray-400 uppercase">E-KDSS</span>
              <span className="text-xs font-mono font-bold text-emerald-400">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right: Scroll progress indicator pill */}
        <div className="bg-[#070913]/70 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl">
          <div className="text-right">
            <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider">
              SHOWCASE JOURNEY
            </span>
            <span className="text-sm font-mono font-bold text-white">
              {progressPct}% <span className="text-xs text-amber-400">INDEX</span>
            </span>
          </div>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-400 transition-all duration-150"
                strokeDasharray={`${progressPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold text-white">
              {activePhase + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Digital Speedometer & Manual Part Interactors */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-auto">
        {/* Left: Speedometer & RPM Gauge Cluster */}
        <div className="bg-[#070913]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-5">
          {/* Speed Indicator */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black tracking-tight text-white">
              {speed.toString().padStart(3, '0')}
            </span>
            <div className="text-[9px] font-mono text-gray-400">
              <span className="block font-bold text-amber-400">KM/H</span>
              <span>GPS</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* Gear Indicator */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-gray-400">GEAR</span>
            <span className="text-lg font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              {gear}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* RPM & Boost Bars */}
          <div className="flex flex-col gap-1 w-24">
            <div className="flex justify-between text-[8px] font-mono text-gray-400">
              <span>RPM</span>
              <span className="text-amber-400 font-bold">{rpm}</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-100"
                style={{ width: `${Math.min(100, ((rpm - 800) / 4500) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray-400">
              <span>BOOST</span>
              <span className="text-cyan-400 font-bold">1.4 BAR</span>
            </div>
          </div>
        </div>

        {/* Right: Manual Part Inspection Overrides */}
        <div className="bg-[#070913]/80 backdrop-blur-xl border border-white/10 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-amber-400 px-2 font-bold uppercase hidden md:inline">
            INTERACTIVE RIG:
          </span>

          {/* Toggle Doors */}
          <button
            onClick={() => {
              onUpdateControls({
                manualInspectionMode: true,
                doorsOpen: !controls.doorsOpen,
              });
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.doorsOpen
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-amber-400/50'
            }`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>DOORS</span>
          </button>

          {/* Toggle Hood */}
          <button
            onClick={() => {
              onUpdateControls({
                manualInspectionMode: true,
                hoodOpen: !controls.hoodOpen,
              });
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.hoodOpen
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-amber-400/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>HOOD</span>
          </button>

          {/* Toggle Trunk */}
          <button
            onClick={() => {
              onUpdateControls({
                manualInspectionMode: true,
                trunkOpen: !controls.trunkOpen,
              });
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.trunkOpen
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-amber-400/50'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>TRUNK</span>
          </button>

          {/* Toggle Headlights */}
          <button
            onClick={() => onUpdateControls({ lightsOn: !controls.lightsOn })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              controls.lightsOn
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-amber-400/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>LIGHTS</span>
          </button>

          {/* Reset to Scroll Mode */}
          {controls.manualInspectionMode && (
            <button
              onClick={() => {
                onUpdateControls({
                  manualInspectionMode: false,
                  doorsOpen: false,
                  hoodOpen: false,
                  trunkOpen: false,
                });
              }}
              title="Resume Scroll Sync"
              className="p-1.5 rounded-xl bg-white/[0.08] text-amber-400 hover:bg-amber-400 hover:text-black transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
