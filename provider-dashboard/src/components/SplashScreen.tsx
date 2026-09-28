'use client';
import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// ── LAND CRUISER 3D MODEL ──────────────────────────────────────────
function LandCruiserModel({ progress }: { progress: number }) {
  const { scene } = useGLTF('/2022_toyota_land_cruiser_300_vx.r.glb');
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.envMapIntensity = 2.5;
        }
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Slow continuous rotation after loading
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    // Subtle floating animation
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.04 - 0.2;
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]} position={[0, -0.2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// ── GROUND GRID PLANE ─────────────────────────────────────────────
function GroundGrid() {
  return (
    <gridHelper
      args={[30, 30, '#1a2035', '#0f1620']}
      position={[0, -0.88, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// ── MAIN SPLASH SCREEN ─────────────────────────────────────────────
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'fadeout'>('loading');
  const [showModel, setShowModel] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    let val = 0;
    const interval = setInterval(() => {
      val += Math.random() * 6 + 2;
      if (val >= 95) {
        val = 95;
        clearInterval(interval);
      }
      setLoadingProgress(Math.min(val, 95));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // When model is loaded, complete to 100% and move to reveal
  useEffect(() => {
    if (modelLoaded) {
      setLoadingProgress(100);
      setTimeout(() => {
        setPhase('reveal');
        setShowModel(true);
      }, 400);

      // After reveal animation, fade out and call onComplete
      setTimeout(() => {
        setPhase('fadeout');
      }, 3200);

      setTimeout(() => {
        onComplete();
      }, 4000);
    }
  }, [modelLoaded, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#05070d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: phase === 'fadeout' ? 'opacity 0.85s cubic-bezier(0.4,0,0.2,1)' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Ambient background radials ───────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 50% at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 20% 20%, rgba(59,130,246,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 80% 10%, rgba(139,92,246,0.04) 0%, transparent 60%)
        `,
      }} />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />

      {/* ── TOP BRAND HEADER ──────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', top: '36px', left: 0, right: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '14px', zIndex: 10,
          opacity: phase === 'loading' ? 1 : showModel ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Gold emblem */}
        <div style={{
          width: 38, height: 38,
          background: 'linear-gradient(135deg, #d4af37 0%, #7c5a1e 100%)',
          borderRadius: '9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(212,175,55,0.5)',
          border: '1px solid rgba(255,235,170,0.4)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 9L12 16L22 9L12 2Z" fill="#080c14" />
            <path d="M2 15L12 22L22 15" stroke="#080c14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: '18px', fontWeight: 800, letterSpacing: '3px',
            color: '#f8fafc',
          }}>
            REPAIREASE
          </div>
          <div style={{
            fontSize: '9px', fontWeight: 700, color: '#c5a059',
            letterSpacing: '2.5px', textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            PROVIDER MANAGEMENT PORTAL
          </div>
        </div>
      </div>

      {/* ── 3D CANVAS ─────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '65vh',
          position: 'relative',
          opacity: showModel ? 1 : 0,
          transform: showModel ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(30px)',
          transition: 'all 1.2s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 5,
        }}
      >
        <Canvas
          camera={{ position: [4, 1.5, 5], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={() => {}}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[8, 10, 5]} intensity={1.8} castShadow color="#fff8e7" />
            <directionalLight position={[-6, 4, -4]} intensity={0.6} color="#b8d4ff" />
            <spotLight position={[0, 8, 0]} intensity={0.5} color="#d4af37" angle={0.4} penumbra={0.8} />

            <PresentationControls
              global
              rotation={[0, -0.2, 0]}
              polar={[-0.08, 0.15]}
              azimuth={[-Infinity, Infinity]}
            >
              <LandCruiserModel progress={loadingProgress} />
            </PresentationControls>

            <GroundGrid />
            <ContactShadows position={[0, -0.88, 0]} opacity={0.45} scale={12} blur={2.5} far={4} />
            <Environment preset="city" />

            {/* Trigger onLoad */}
            <OnLoadTrigger onLoad={() => setModelLoaded(true)} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── BOTTOM UI: Loading Bar + Text ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: '0 48px 44px',
          zIndex: 10,
        }}
      >
        {/* Status text */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '10px',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: '#64748b',
            letterSpacing: '1.5px', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {loadingProgress < 100
              ? `INITIALIZING SYSTEM... ${Math.round(loadingProgress)}%`
              : 'SYSTEM READY'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            fontSize: '10px', color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: loadingProgress < 100 ? '#d4af37' : '#22c55e',
              boxShadow: `0 0 8px ${loadingProgress < 100 ? '#d4af37' : '#22c55e'}`,
              animation: 'pulse 1.5s infinite',
            }} />
            <span>REPAIREASE v1.0</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '2px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${loadingProgress}%`,
            background: `linear-gradient(90deg, ${loadingProgress < 100 ? '#d4af37' : '#22c55e'} 0%, ${loadingProgress < 100 ? '#f3e5ab' : '#4ade80'} 100%)`,
            boxShadow: `0 0 12px ${loadingProgress < 100 ? 'rgba(212,175,55,0.6)' : 'rgba(34,197,94,0.6)'}`,
            borderRadius: '2px',
            transition: 'width 0.25s ease',
          }} />
        </div>

        {/* Sub-labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: '8px',
        }}>
          <span style={{ fontSize: '9px', color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
            AUTHENTICATION GATEWAY ACTIVE
          </span>
          <span style={{ fontSize: '9px', color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
            2026 REPAIREASE TECHNOLOGIES
          </span>
        </div>
      </div>

      {/* ── VEHICLE INFO CARD (shows after reveal) ────────────── */}
      {showModel && (
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            left: '52px',
            zIndex: 10,
            opacity: showModel ? 1 : 0,
            transform: showModel ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.6s',
          }}
        >
          <div style={{
            padding: '12px 18px',
            background: 'rgba(5,8,14,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '10px',
            borderLeft: '3px solid #d4af37',
          }}>
            <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1.5px', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
              FEATURED VEHICLE
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.3px' }}>
              Toyota Land Cruiser 300
            </div>
            <div style={{ fontSize: '11px', color: '#c5a059', marginTop: '2px' }}>
              VX · 2022 · Premium Service Ready
            </div>
          </div>
        </div>
      )}

      {/* ── ENTER BUTTON (shows when loaded) ──────────────────── */}
      {phase === 'reveal' && (
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            right: '52px',
            zIndex: 10,
            opacity: 1,
            animation: 'fadeInUp 0.7s ease 0.8s both',
          }}
        >
          <button
            onClick={() => {
              setPhase('fadeout');
              setTimeout(onComplete, 850);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b89327 100%)',
              border: '1px solid rgba(255,235,170,0.4)',
              borderRadius: '9px',
              color: '#07090e',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(212,175,55,0.4)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget).style.boxShadow = '0 8px 32px rgba(212,175,55,0.6)';
              (e.currentTarget).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.boxShadow = '0 6px 24px rgba(212,175,55,0.4)';
              (e.currentTarget).style.transform = 'none';
            }}
          >
            <span>Enter Portal</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07090e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── HELPER: Trigger callback on Three.js Suspense resolve ─────────
function OnLoadTrigger({ onLoad }: { onLoad: () => void }) {
  const triggered = useRef(false);
  useFrame(() => {
    if (!triggered.current) {
      triggered.current = true;
      onLoad();
    }
  });
  return null;
}

// Preload the model
useGLTF.preload('/2022_toyota_land_cruiser_300_vx.r.glb');
