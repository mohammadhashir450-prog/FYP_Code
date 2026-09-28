import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useLenis } from './hooks/useLenis';
import { useScrollProgress } from './hooks/useScrollProgress';
import { CAR_COLORS } from './types';
import type { CarColorOption } from './types';
import Navbar from './components/Navbar';
import HUDOverlay from './components/HUDOverlay';
import ScrollSections from './components/ScrollSections';
import ReservationModal from './components/ReservationModal';
import Preloader from './components/Preloader';
import type { CarModelControls } from './components/CarModel';

// Performance: Lazy load 3D Canvas container to keep initial bundle ultra-lean
const CanvasContainer = lazy(() => import('./components/CanvasContainer'));

function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  factor: number
): string {
  const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
  return `rgb(${r}, ${g}, ${b})`;
}

const BG_STOPS: { sp: number; rgb: [number, number, number] }[] = [
  { sp: 0.0, rgb: [10, 10, 10] },   // Hero (minimal dark)
  { sp: 0.25, rgb: [14, 14, 14] },  // Design
  { sp: 0.45, rgb: [12, 12, 12] },  // Interior
  { sp: 0.65, rgb: [8, 8, 8] },     // Engine
  { sp: 0.80, rgb: [0, 0, 0] },     // Wheels (pure black abyss)
  { sp: 1.0, rgb: [6, 6, 6] },      // Final CTA
];

function getThemeBg(sp: number): string {
  if (sp <= BG_STOPS[0].sp) return `rgb(${BG_STOPS[0].rgb.join(',')})`;
  if (sp >= BG_STOPS[BG_STOPS.length - 1].sp)
    return `rgb(${BG_STOPS[BG_STOPS.length - 1].rgb.join(',')})`;

  for (let i = 0; i < BG_STOPS.length - 1; i++) {
    const cur = BG_STOPS[i];
    const next = BG_STOPS[i + 1];
    if (sp >= cur.sp && sp <= next.sp) {
      const factor = (sp - cur.sp) / (next.sp - cur.sp);
      return interpolateColor(cur.rgb, next.rgb, factor);
    }
  }
  return `rgb(${BG_STOPS[0].rgb.join(',')})`;
}

export default function App() {
  useLenis();
  const scrollProgressRef = useScrollProgress();
  const containerRef = useRef<HTMLDivElement>(null!);

  const [activePhase, setActivePhase] = useState(0);
  const [currentColor, setCurrentColor] = useState<CarColorOption>(CAR_COLORS[0]);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [controls, setControls] = useState<CarModelControls>({
    doorsOpen: false,
    hoodOpen: false,
    trunkOpen: false,
    lightsOn: true,
    currentColor: CAR_COLORS[0],
    manualInspectionMode: false,
  });

  // Background color interpolation loop without React re-render
  useEffect(() => {
    let animId: number;
    const updateBg = () => {
      const sp = scrollProgressRef.current;
      const bg = getThemeBg(sp);
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = bg;
      }
      document.body.style.backgroundColor = bg;
      animId = requestAnimationFrame(updateBg);
    };
    animId = requestAnimationFrame(updateBg);
    return () => cancelAnimationFrame(animId);
  }, [scrollProgressRef]);

  const handleUpdateControls = useCallback((patch: Partial<CarModelControls>) => {
    setControls((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleColorSelect = useCallback((color: CarColorOption) => {
    setCurrentColor(color);
    setControls((prev) => ({ ...prev, currentColor: color }));
  }, []);

  const handlePhaseChange = useCallback((phase: number) => {
    setActivePhase(phase);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen text-white selection:bg-[#ccff00] selection:text-black transition-colors duration-150"
      style={{ backgroundColor: 'rgb(10, 10, 10)' }}
    >
      {/* Asset Preloader */}
      {!isLoaded && <Preloader onLoaded={() => setIsLoaded(true)} />}

      {/* Lazy Loaded 3D Canvas */}
      <Suspense fallback={null}>
        <CanvasContainer
          scrollProgressRef={scrollProgressRef}
          controls={controls}
          onPhaseChange={handlePhaseChange}
          activePhase={activePhase}
        />
      </Suspense>

      {/* Sticky Transparent Navbar */}
      <Navbar
        currentColor={currentColor}
        onColorSelect={handleColorSelect}
        onOpenReservation={() => setIsReservationOpen(true)}
        activePhase={activePhase}
      />

      {/* Performance HUD with Direct DOM Mutations */}
      <HUDOverlay
        scrollProgressRef={scrollProgressRef}
        activePhase={activePhase}
        controls={controls}
        onUpdateControls={handleUpdateControls}
      />

      {/* 6 HTML Story Sections */}
      <main className="relative z-10">
        <ScrollSections
          currentColor={currentColor}
          onColorSelect={handleColorSelect}
          onOpenReservation={() => setIsReservationOpen(true)}
        />
      </main>

      {/* VIP Custom Build Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        currentColor={currentColor}
        onColorSelect={handleColorSelect}
      />
    </div>
  );
}
