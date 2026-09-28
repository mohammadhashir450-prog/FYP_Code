import { useState, useRef, useCallback } from 'react';
import { useLenis } from './hooks/useLenis';
import { useScrollProgress } from './hooks/useScrollProgress';
import { CAR_COLORS } from './types';
import type { CarColorOption } from './types';
import CanvasContainer from './components/CanvasContainer';
import Navbar from './components/Navbar';
import HUDOverlay from './components/HUDOverlay';
import ScrollSections from './components/ScrollSections';
import ReservationModal from './components/ReservationModal';
import Preloader from './components/Preloader';
import type { CarModelControls } from './components/CarModel';

export default function App() {
  // Initialize Lenis smooth scroll
  useLenis();

  // Scroll progress ref (0.0 → 1.0)
  const scrollProgressRef = useScrollProgress();

  // Active section index (0 to 5)
  const [activePhase, setActivePhase] = useState(0);

  // Exterior paint color
  const [currentColor, setCurrentColor] = useState<CarColorOption>(CAR_COLORS[0]);

  // Reservation / Customizer modal state
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Preloader state
  const [isLoaded, setIsLoaded] = useState(false);

  // Manual 3D rig interaction controls
  const [controls, setControls] = useState<CarModelControls>({
    doorsOpen: false,
    hoodOpen: false,
    trunkOpen: false,
    lightsOn: true,
    currentColor: CAR_COLORS[0],
    manualInspectionMode: false,
  });

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
    <div className="relative min-h-screen bg-[#04060c] text-white selection:bg-amber-400 selection:text-black">
      {/* Real-time GLB Asset Preloader */}
      {!isLoaded && <Preloader onLoaded={() => setIsLoaded(true)} />}

      {/* Fixed 3D WebGL Canvas Layer */}
      <CanvasContainer
        scrollProgressRef={scrollProgressRef}
        controls={controls}
        onPhaseChange={handlePhaseChange}
        activePhase={activePhase}
      />

      {/* Floating Glassmorphism Navbar */}
      <Navbar
        currentColor={currentColor}
        onColorSelect={handleColorSelect}
        onOpenReservation={() => setIsReservationOpen(true)}
        activePhase={activePhase}
      />

      {/* High-Tech Automotive Telemetry HUD */}
      <HUDOverlay
        scrollProgressRef={scrollProgressRef}
        activePhase={activePhase}
        controls={controls}
        onUpdateControls={handleUpdateControls}
      />

      {/* Scrollable Storytelling Chapters & Sneaker-inspired Sections */}
      <main className="relative z-10">
        <ScrollSections
          currentColor={currentColor}
          onColorSelect={handleColorSelect}
          onOpenReservation={() => setIsReservationOpen(true)}
        />
      </main>

      {/* VIP Build Specification Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        currentColor={currentColor}
        onColorSelect={handleColorSelect}
      />
    </div>
  );
}
