import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

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
        setTimeout(onLoaded, 600);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [active, displayProgress, onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#04060c] transition-opacity duration-700 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Center Crest */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[1.5px] shadow-2xl shadow-amber-500/20 mb-6">
          <div className="w-full h-full bg-[#080b14] rounded-[14px] flex items-center justify-center">
            <span className="font-serif font-black text-amber-400 text-xl tracking-tighter">LC</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400 uppercase font-bold">
            TOYOTA HERITAGE
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-white uppercase">
          Land Cruiser 300 VX-R
        </h2>

        <p className="text-gray-400 text-xs font-mono mt-1 mb-8">
          Loading 3D High-Fidelity Asset Pipeline...
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-200"
            style={{ width: `${Math.max(8, displayProgress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-64 text-[10px] font-mono text-gray-500">
          <span>GLB ASSET ENGINE</span>
          <span className="text-amber-400 font-bold">{Math.round(displayProgress)}%</span>
        </div>
      </div>
    </div>
  );
}
