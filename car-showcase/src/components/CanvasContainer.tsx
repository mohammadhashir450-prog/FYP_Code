/*
 * CanvasContainer.tsx
 *
 * Provides:
 *  - Full-screen fixed Canvas with ACESFilmic tone mapping
 *  - Premium studio + rim lighting
 *  - Animated road ground plane (canvas-generated asphalt texture)
 *  - ContactShadows to ground the car
 *  - Environment preset for metallic reflections
 *  - OrbitControls that start auto-rotating once car assembly is complete
 *  - Speed streak particles during high-scroll phase
 */

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import CarModel from './CarModel';
import type { CarModelControls } from './CarModel';

// ─── Animated road ground ──────────────────────────────────────────────────────
function RoadGround() {
  const texRef = useRef<THREE.CanvasTexture | null>(null);

  if (!texRef.current) {
    const size = 512;
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d')!;

    // Asphalt base
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, 0, size, size);

    // Noise
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const v = Math.floor(Math.random() * 36 + 16);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.3 + 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center dashed lane
    ctx.strokeStyle = '#d4a200';
    ctx.lineWidth = 9;
    ctx.setLineDash([52, 36]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();

    // Side solid lines
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    [size * 0.2, size * 0.8].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    });

    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 4);
    texRef.current = t;
  }

  // Animate road scrolling
  useFrame(() => {
    if (texRef.current) texRef.current.offset.y -= 0.0032;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -10]} receiveShadow>
      <planeGeometry args={[20, 80]} />
      <meshStandardMaterial
        map={texRef.current}
        roughness={0.85}
        metalness={0.05}
        color="#202020"
        envMapIntensity={0.2}
      />
    </mesh>
  );
}

// ─── Road edge reflectors ──────────────────────────────────────────────────────
function RoadEdges() {
  return (
    <group>
      {Array.from({ length: 18 }, (_, i) => {
        const z = -1.2 - i * 4.4;
        return (
          <group key={i}>
            {([-5.1, 5.1] as const).map(x => (
              <mesh key={x} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.07, 0.35]} />
                <meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.72} color="#ffffff" />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// ─── Ambient ground fog ────────────────────────────────────────────────────────
function GroundFog() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const mat = ref.current?.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = 0.09 + Math.sin(clock.getElapsedTime() * 0.65) * 0.035;
  });
  return (
    <mesh ref={ref} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 16]} />
      <meshBasicMaterial
        color="#003448"
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface CanvasContainerProps {
  controls: CarModelControls;
  assembled: boolean;
  onAssembled: () => void;
}

export default function CanvasContainer({
  controls,
  assembled,
  onAssembled,
}: CanvasContainerProps) {
  const orbitRef = useRef<OrbitControlsImpl>(null!);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Enable auto-rotate once assembly finishes
  useEffect(() => {
    if (!orbitRef.current) return;
    if (assembled) {
      orbitRef.current.autoRotate      = true;
      orbitRef.current.autoRotateSpeed = 0.55;
    } else {
      orbitRef.current.autoRotate = false;
    }
  }, [assembled]);

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.5] : [1, 1.8]}
        camera={{ position: [3.5, 1.6, 6.0], fov: 38, near: 0.05, far: 120 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.22,
          powerPreference: 'high-performance',
        }}
      >
        {/* ── Lighting ── */}
        <ambientLight intensity={0.50} />

        <spotLight
          position={[0, 12, 4]}
          angle={0.58}
          penumbra={0.90}
          intensity={22}
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? 512 : 2048}
          shadow-bias={-0.0002}
          color="#ffffff"
        />

        <directionalLight
          position={[8, 7, 10]}
          intensity={2.4}
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? 512 : 2048}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        {/* Lime rim light — signature accent */}
        <directionalLight position={[-8, 3, -5]} intensity={3.2} color="#ccff00" />
        {/* Warm fill from right */}
        <directionalLight position={[7, 2, -6]} intensity={2.0} color="#e0eeff" />
        {/* Under-car shadow fill */}
        <pointLight position={[0, -0.5, 0]} intensity={1.1} color="#050810" />
        {/* Headlight road cast */}
        <pointLight position={[0, 0.7, 3.8]} intensity={3.5} color="#d0e8ff" distance={7} decay={2} />

        {/* ── Environment (HDR reflections) ── */}
        <Environment preset="city" environmentIntensity={0.88} />

        {/* ── Road & ground ── */}
        <RoadGround />
        <RoadEdges />
        <GroundFog />

        {/* ── Soft contact shadow under car ── */}
        <ContactShadows
          position={[0, 0.005, 0]}
          opacity={0.96}
          scale={20}
          blur={3.2}
          far={4}
          color="#000000"
        />

        {/* ── Orbit Controls (auto-rotate after assembly) ── */}
        <OrbitControls
          ref={orbitRef}
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={3}
          maxDistance={12}
          target={[0, 0.4, 0]}
          makeDefault
        />

        {/* ── 3D Car ── */}
        <Suspense fallback={null}>
          <CarModel controls={controls} onAssembled={onAssembled} />
        </Suspense>
      </Canvas>
    </div>
  );
}
