'use client';
import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  useProgress,
  Environment,
  ContactShadows,
  Html,
  Center,
} from '@react-three/drei';
import * as THREE from 'three';

// ── PRELOAD immediately so browser starts fetching on import ────────
useGLTF.preload('/2022_toyota_land_cruiser_300_vx.r.glb');

// ── AUTO-FIT CAMERA to the model's bounding box ───────────────────
function AutoCamera({ target }: { target: THREE.Box3 | null }) {
  const { camera } = useThree();
  const fitted = useRef(false);

  useEffect(() => {
    if (!target || fitted.current) return;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    target.getSize(size);
    target.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let dist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.55;
    dist = Math.max(dist, 3);

    camera.position.set(center.x + dist * 0.6, center.y + dist * 0.35, center.z + dist);
    camera.lookAt(center.x, center.y + size.y * 0.05, center.z);
    camera.updateProjectionMatrix();
    fitted.current = true;
  }, [target, camera]);

  return null;
}

// ── LAND CRUISER MODEL ─────────────────────────────────────────────
function LandCruiserModel({
  onBounds,
}: {
  onBounds: (box: THREE.Box3) => void;
}) {
  const { scene } = useGLTF('/2022_toyota_land_cruiser_300_vx.r.glb');
  const groupRef = useRef<THREE.Group>(null!);
  const reported = useRef(false);

  // Enhance materials and compute bounds once
  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = Array.isArray(mesh.material)
          ? (mesh.material as THREE.MeshStandardMaterial[])
          : [mesh.material as THREE.MeshStandardMaterial];
        mat.forEach((m) => {
          if (m.isMeshStandardMaterial) {
            m.envMapIntensity = 2.2;
            m.needsUpdate = true;
          }
        });
      }
    });

    if (!reported.current) {
      const box = new THREE.Box3().setFromObject(scene);
      onBounds(box);
      reported.current = true;
    }
  }, [scene, onBounds]);

  // Slow rotation + float
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.06;
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

// ── LOADING PROGRESS INSIDE CANVAS (drei useProgress) ─────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          color: '#ffd60a',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '1.5px',
          textAlign: 'center',
          minWidth: '160px',
        }}
      >
        <div style={{ marginBottom: '8px', opacity: 0.7 }}>LOADING MODEL</div>
        <div
          style={{
            width: '140px',
            height: '2px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ffd60a, #ffe873)',
              boxShadow: '0 0 8px rgba(255,214,10,0.7)',
              transition: 'width 0.15s ease',
            }}
          />
        </div>
        <div style={{ marginTop: '6px', color: '#64748b' }}>{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

// ── GROUND GRID ────────────────────────────────────────────────────
function GroundGrid({ y }: { y: number }) {
  return (
    <gridHelper
      args={[40, 40, '#0f2a52', '#0b1020']}
      position={[0, y, 0]}
    />
  );
}

// ── PROGRESS WATCHER: calls onReady when drei finishes loading ─────
function ProgressWatcher({ onReady }: { onReady: () => void }) {
  const { progress, active } = useProgress();
  const fired = useRef(false);

  useFrame(() => {
    if (!fired.current && progress >= 100 && !active) {
      fired.current = true;
      onReady();
    }
  });
  return null;
}

// ─────────────────────────────────────────────────────────────────
// MAIN SPLASH SCREEN
// ─────────────────────────────────────────────────────────────────
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // After model is ready, auto-exit after 3.5 s
  useEffect(() => {
    if (!modelReady) return;
    const t = setTimeout(() => triggerExit(), 3500);
    return () => clearTimeout(t);
  }, [modelReady]);

  const triggerExit = () => {
    setFadeOut(true);
    setTimeout(onComplete, 800);
  };

  // Compute ground Y from bounding box
  const groundY = bounds
    ? (() => {
        const min = new THREE.Vector3();
        bounds.getSize(min);
        const center = new THREE.Vector3();
        bounds.getCenter(center);
        return center.y - min.y / 2;
      })()
    : -1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#020a18',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Background glow layers ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 45% at 50% 100%, rgba(255,214,10,0.09) 0%, transparent 65%),
            radial-gradient(ellipse 50% 35% at 15% 15%, rgba(43,123,214,0.04) 0%, transparent 55%),
            radial-gradient(ellipse 45% 30% at 85% 10%, rgba(43,123,214,0.04) 0%, transparent 55%)
          `,
        }}
      />
      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)',
        }}
      />

      {/* ── TOP BRAND ─── */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 14,
          zIndex: 20,
        }}
      >
        <img src="/logo.png" alt="RepairEase" width={46} height={46} style={{ borderRadius: 12, background: '#fff', padding: 2, boxShadow: '0 0 28px rgba(255,214,10,0.45)', flexShrink: 0 }} />
        <div>
          <div
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '3.5px',
              color: '#f8fafc',
              lineHeight: 1.1,
            }}
          >
            REPAIREASE
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#e6bf00',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 2,
            }}
          >
            PROVIDER MANAGEMENT PORTAL
          </div>
        </div>
      </div>

      {/* ── 3D CANVAS (full height) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
        }}
      >
        <Canvas
          camera={{ position: [6, 3, 10], fov: 42, near: 0.1, far: 500 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[10, 12, 8]}
            intensity={2.2}
            castShadow
            color="#fffae8"
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-8, 6, -6]} intensity={0.8} color="#c8deff" />
          <spotLight
            position={[0, 10, 2]}
            intensity={0.9}
            color="#ffd60a"
            angle={0.5}
            penumbra={1}
          />
          <pointLight position={[0, -1, 4]} intensity={0.4} color="#ffd60a" />

          <Suspense fallback={<Loader />}>
            <LandCruiserModel onBounds={setBounds} />
            <AutoCamera target={bounds} />
            <GroundGrid y={groundY} />
            <ContactShadows
              position={[0, groundY, 0]}
              opacity={0.55}
              scale={20}
              blur={3}
              far={6}
            />
            <Environment preset="city" />
            <ProgressWatcher onReady={() => setModelReady(true)} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── BOTTOM HUD ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 48px 36px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Status row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#64748b',
              letterSpacing: '1.2px',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: modelReady ? '#22c55e' : '#ffd60a',
                boxShadow: `0 0 8px ${modelReady ? '#22c55e' : '#ffd60a'}`,
                display: 'inline-block',
              }}
            />
            {modelReady ? 'SYSTEM READY' : 'LOADING ASSETS...'}
          </div>

          <div
            style={{
              fontSize: 10,
              color: '#374151',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '1px',
            }}
          >
            REPAIREASE v1.0 · 2026
          </div>
        </div>

        {/* Gold progress line */}
        <div
          style={{
            width: '100%',
            height: 1,
            background: modelReady
              ? 'linear-gradient(90deg,rgba(34,197,94,0.6) 0%,rgba(34,197,94,0.1) 100%)'
              : 'linear-gradient(90deg,rgba(255,214,10,0.5) 0%,rgba(255,214,10,0.08) 100%)',
          }}
        />
      </div>

      {/* ── VEHICLE CARD (bottom-left, appears when model ready) ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: 90,
          left: 48,
          zIndex: 20,
          opacity: modelReady ? 1 : 0,
          transform: modelReady ? 'translateX(0)' : 'translateX(-20px)',
          transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          style={{
            padding: '12px 18px',
            background: 'rgba(2,10,24,0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,214,10,0.25)',
            borderLeft: '3px solid #ffd60a',
            borderRadius: '10px',
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              color: '#64748b',
              letterSpacing: '1.5px',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 4,
            }}
          >
            FEATURED VEHICLE
          </div>
          <div
            style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.2 }}
          >
            Toyota Land Cruiser 300
          </div>
          <div style={{ fontSize: 11, color: '#e6bf00', marginTop: 2 }}>
            VX · 2022 · Premium Service Ready
          </div>
        </div>
      </div>

      {/* ── ENTER PORTAL BUTTON (bottom-right) ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: 90,
          right: 48,
          zIndex: 20,
          opacity: modelReady ? 1 : 0,
          transform: modelReady ? 'translateX(0)' : 'translateX(20px)',
          transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1) 0.15s',
        }}
      >
        <button
          onClick={() => triggerExit()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '13px 26px',
            background: 'linear-gradient(135deg,#ffd60a 0%,#c9a300 100%)',
            border: '1px solid rgba(255,232,115,0.4)',
            borderRadius: 10,
            color: '#030d1f',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '1.5px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            boxShadow: '0 6px 28px rgba(255,214,10,0.45)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 10px 36px rgba(255,214,10,0.65)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 6px 28px rgba(255,214,10,0.45)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'none';
          }}
        >
          <span>Enter Portal</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#030d1f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
