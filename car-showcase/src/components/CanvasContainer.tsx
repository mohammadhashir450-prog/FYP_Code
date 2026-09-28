import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import CarModel from './CarModel';
import type { CarModelControls } from './CarModel';

// Speed particles for the high-velocity phase (simplified on mobile)
function VelocityStreaks({ active, isMobile }: { active: boolean; isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = isMobile ? 80 : 350;

  const [positions, speeds] = useRef(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 4 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      spd[i] = 18 + Math.random() * 25;
    }
    return [pos, spd];
  }).current();

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] -= speeds[i] * delta * 2.5;
      if (pos[i * 3 + 2] < -18) {
        pos[i * 3 + 2] = 18;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.05 : 0.06}
        color="#ccff00"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface CanvasContainerProps {
  scrollProgressRef: React.MutableRefObject<number>;
  controls: CarModelControls;
  onPhaseChange?: (phase: number) => void;
  activePhase: number;
}

export default function CanvasContainer({
  scrollProgressRef,
  controls,
  onPhaseChange,
  activePhase,
}: CanvasContainerProps) {
  const isHero = activePhase === 0;

  // Responsive device check: reduce dpr on mobile to [1, 1.5]
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      className={`fixed inset-0 w-full h-full z-0 transition-opacity duration-500 ${
        isHero ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 1.15, 5.2], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <ambientLight intensity={activePhase === 4 ? 0.35 : 0.6} />

        <spotLight
          position={[0, 9, 3]}
          angle={0.65}
          penumbra={0.8}
          intensity={14}
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? 512 : 2048}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        <directionalLight
          position={[6, 5, 8]}
          intensity={activePhase === 4 ? 1.5 : 2.8}
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? 512 : 2048}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        {/* Minimal lime edge rim accent */}
        <directionalLight position={[-7, 3, -4]} intensity={2.8} color="#ccff00" />
        <directionalLight position={[6, 2, -6]} intensity={2.2} color="#ffffff" />
        <pointLight position={[0, -0.4, 0]} intensity={1.2} color="#171717" />

        <Environment preset="city" environmentIntensity={activePhase === 4 ? 0.6 : 0.85} />

        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={0.85}
          scale={14}
          blur={2.4}
          far={4}
          color="#000000"
        />

        <VelocityStreaks active={activePhase === 4} isMobile={isMobile} />

        <Suspense fallback={null}>
          <CarModel
            scrollProgressRef={scrollProgressRef}
            controls={controls}
            onPhaseChange={onPhaseChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
