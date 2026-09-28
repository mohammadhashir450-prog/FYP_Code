import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import CarModel from './CarModel';
import type { CarModelControls } from './CarModel';

// Speed particles for the high-velocity phase
function VelocityStreaks({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 400;

  const [positions, speeds] = useRef(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 4 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      spd[i] = 15 + Math.random() * 25;
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#d4af37"
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
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.1, 5.6], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        className="w-full h-full"
      >
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.5} />
        
        {/* Main Overhead Spotlight */}
        <spotLight
          position={[0, 8, 3]}
          angle={0.6}
          penumbra={0.8}
          intensity={12}
          castShadow
          shadow-mapSize={2048}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        {/* Front Warm Key Light */}
        <directionalLight
          position={[6, 5, 8]}
          intensity={2.8}
          castShadow
          shadow-mapSize={2048}
          shadow-bias={-0.0001}
          color="#fffdf8"
        />

        {/* Luxury Gold Side Rim Light */}
        <directionalLight
          position={[-7, 3, -4]}
          intensity={3.2}
          color="#d4af37"
        />

        {/* Cool Cyan Rear Rim Light for Edge Highlights */}
        <directionalLight
          position={[6, 2, -6]}
          intensity={2.6}
          color="#38bdf8"
        />

        {/* Fill light from undercarriage */}
        <pointLight position={[0, -0.4, 0]} intensity={1.5} color="#1e293b" />

        {/* Environment reflection map */}
        <Environment preset="city" environmentIntensity={0.85} />

        {/* Contact Shadow on asphalt */}
        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={0.85}
          scale={14}
          blur={2.4}
          far={4}
          color="#000000"
        />

        {/* Velocity Streaks in Dynamic Stage */}
        <VelocityStreaks active={activePhase === 5} />

        {/* 3D Car Model */}
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
