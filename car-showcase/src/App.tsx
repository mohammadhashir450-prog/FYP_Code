/*
 * App.tsx — Root component
 *
 * Architecture:
 *  - Full-screen Canvas (CanvasContainer) sits at z-0
 *  - UIOverlay sits at z-10 (pointer-events selective)
 *  - Preloader at z-50 fades out once GLB is ready
 *  - No scroll sections — single-page cinematic view
 *  - Background: radial dark gradient (car pops against it)
 */

import { useState, useCallback, Suspense, lazy } from 'react';
import Preloader from './components/Preloader';
import UIOverlay from './components/UIOverlay';
import type { CarModelControls } from './components/CarModel';
import { CAR_COLORS } from './types';
import type { CarColorOption } from './types';

// Lazy-load the heavy 3D canvas to keep the initial JS bundle lean
const CanvasContainer = lazy(() => import('./components/CanvasContainer'));

export default function App() {
  const [isLoaded,   setIsLoaded]   = useState(false);
  const [assembled,  setAssembled]  = useState(false);
  const [currentColor, setCurrentColor] = useState<CarColorOption>(CAR_COLORS[0]);
  const [activeSection] = useState(0);
  const [reservationOpen, setReservationOpen] = useState(false);

  const [controls, setControls] = useState<CarModelControls>({
    lightsOn:  true,
    bodyColor: CAR_COLORS[0].hex,
  });

  const handleColorSelect = useCallback((c: CarColorOption) => {
    setCurrentColor(c);
    setControls(prev => ({ ...prev, bodyColor: c.hex }));
  }, []);

  const handleLightsToggle = useCallback(() => {
    setControls(prev => ({ ...prev, lightsOn: !prev.lightsOn }));
  }, []);

  const handleAssembled = useCallback(() => {
    setAssembled(true);
  }, []);

  return (
    /*
     * Root div: full-screen dark radial gradient background.
     * The 3D canvas renders on top of this via fixed positioning.
     */
    <div
      className="relative w-screen h-screen overflow-hidden text-white"
      style={{
        background: 'radial-gradient(ellipse at 60% 50%, #0a0f1a 0%, #000000 80%)',
      }}
    >
      {/* ── Loading Screen ── */}
      {!isLoaded && <Preloader onLoaded={() => setIsLoaded(true)} />}

      {/* ── 3D Canvas ── */}
      {isLoaded && (
        <Suspense fallback={null}>
          <CanvasContainer
            controls={controls}
            assembled={assembled}
            onAssembled={handleAssembled}
          />
        </Suspense>
      )}

      {/* ── UI Overlay ── */}
      {isLoaded && (
        <UIOverlay
          assembled={assembled}
          activeSection={activeSection}
          currentColor={currentColor}
          onColorSelect={handleColorSelect}
          onLightsToggle={handleLightsToggle}
          lightsOn={controls.lightsOn}
          onBookDrive={() => setReservationOpen(true)}
        />
      )}

      {/* ── Simple Book a Drive modal (inline) ── */}
      {reservationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setReservationOpen(false)}
        >
          <div
            className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="text-[10px] font-mono tracking-[0.3em] text-[#ccff00] uppercase mb-2">
                Private Reservation
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Book a Test Drive
              </h2>
              <p className="text-white/50 text-sm mt-1">
                Experience the Land Cruiser 300 VX.R in person.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {['Full Name', 'Email Address', 'Phone Number'].map(placeholder => (
                <input
                  key={placeholder}
                  type="text"
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                />
              ))}

              {/* Color badge */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0"
                  style={{ backgroundColor: currentColor.hex }}
                />
                <span className="text-sm text-white/60">
                  Selected color: <span className="text-white font-semibold">{currentColor.name}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReservationOpen(false)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 text-sm font-semibold hover:border-white/30 transition-colors"
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-[#ccff00] text-black text-sm font-black tracking-wider hover:bg-[#d4ff33] transition-colors shadow-[0_0_24px_rgba(204,255,0,0.3)]"
                onClick={() => setReservationOpen(false)}
              >
                Confirm Request
              </button>
            </div>

            {/* Close X */}
            <button
              onClick={() => setReservationOpen(false)}
              className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
