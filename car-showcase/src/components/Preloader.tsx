import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

interface PreloaderProps {
  onLoaded: () => void;
}

export default function Preloader({ onLoaded }: PreloaderProps) {
  const { progress, active } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setDisplayProgress((prev) => Math.max(prev, Math.round(progress)));
  }, [progress]);

  useEffect(() => {
    if (!active && displayProgress >= 100) {
      const timeout = setTimeout(() => {
        setIsFading(true);
        setTimeout(onLoaded, 500);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [active, displayProgress, onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Minimal LC Monogram */}
        <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-display font-black text-xl mb-6 shadow-soft">
          LC
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#ccff00] uppercase font-bold">
            TOYOTA HERITAGE
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white uppercase">
          Land Cruiser 300 VX-R
        </h2>

        <p className="text-neutral-400 text-xs font-mono mt-1 mb-8">
          Loading 3D High-Fidelity Asset Pipeline...
        </p>

        {/* Minimal Progress Bar with Lime Accent */}
        <div className="w-64 h-1 bg-neutral-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#ccff00] transition-all duration-200"
            style={{ width: `${Math.max(6, displayProgress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-64 text-[10px] font-mono text-neutral-500">
          <span>GLTF ASSET</span>
          <span className="text-white font-bold">{Math.round(displayProgress)}%</span>
        </div>
      </div>
    </div>
  );
}
