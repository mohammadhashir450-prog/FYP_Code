'use client';
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Sparkles, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { garage } from '@/lib/garageState';
import Worker from './Worker';

const CAR = '/2022_toyota_land_cruiser_300_vx.r.glb';
const CAR_SCALE = 70; // normalises the FBX units to a ~4.4 m long vehicle

/** The Land Cruiser on a two-post lift (static, side-on). */
function LiftedCar() {
  const { scene } = useGLTF(CAR);
  const car = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        const p = mat as THREE.MeshPhysicalMaterial;
        if (p.transmission > 0) { p.transmission = 0; p.transparent = true; p.opacity = 0.3; p.depthWrite = false; }
        p.envMapIntensity = 1.3;
      }
    });
    return c;
  }, [scene]);
  const g = useRef<THREE.Group>(null);
  useFrame((state) => { if (g.current) g.current.position.y = 0.72 + Math.sin(state.clock.elapsedTime * 0.6) * 0.004; });
  return (
    <group ref={g} position={[0, 0.72, -1.5]} rotation-y={Math.PI / 2 + 0.12}>
      <group scale={CAR_SCALE} position={[0, 0.02, 0]}><primitive object={car} /></group>
    </group>
  );
}

function Lift() {
  const steel = <meshStandardMaterial color="#1b2b45" metalness={0.8} roughness={0.35} />;
  return (
    <group position={[0, 0, -1.5]}>
      {[-1.5, 1.5].map((x) => (
        <group key={x} position={[x, 0, -1.25]}>
          <mesh position={[0, 1.3, 0]} castShadow><boxGeometry args={[0.22, 2.6, 0.3]} />{steel}</mesh>
          <mesh position={[0, 0.03, 0.4]}><boxGeometry args={[0.6, 0.06, 1.0]} />{steel}</mesh>
          <mesh position={[0, 0.6, 0.55]}><boxGeometry args={[0.16, 0.12, 1.3]} /><meshStandardMaterial color="#ffd60a" metalness={0.3} roughness={0.5} /></mesh>
        </group>
      ))}
      <mesh position={[0, 2.55, -1.25]}><boxGeometry args={[3.4, 0.16, 0.3]} />{steel}</mesh>
    </group>
  );
}

function Wrenches() {
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ x: -1.9 + i * 0.48, len: 0.5 + ((i * 37) % 5) * 0.06 })), []);
  return (
    <group position={[-6.4, 1.6, -3.86]}>
      <mesh position={[2.15, -0.2, -0.02]}><boxGeometry args={[5.1, 1.2, 0.05]} /><meshStandardMaterial color="#0a2447" roughness={0.8} /></mesh>
      {items.map((w, i) => (
        <group key={i} position={[w.x + 1.9, 0.1, 0]}>
          <mesh position={[0, -w.len / 2, 0]}><boxGeometry args={[0.05, w.len, 0.02]} /><meshStandardMaterial color="#b9c6d8" metalness={0.9} roughness={0.25} /></mesh>
          <mesh position={[0, 0.02, 0]}><torusGeometry args={[0.07, 0.022, 8, 16, Math.PI * 1.6]} /><meshStandardMaterial color="#b9c6d8" metalness={0.9} roughness={0.25} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Props() {
  const raw = useTexture('/logo.png');
  const logo = useMemo(() => { const t = raw.clone(); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; }, [raw]);
  const stripe = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32;
    const x = c.getContext('2d')!;
    for (let i = -2; i < 12; i++) { x.fillStyle = i % 2 ? '#ffd60a' : '#0b1220'; x.beginPath(); x.moveTo(i * 32, 32); x.lineTo(i * 32 + 32, 32); x.lineTo(i * 32 + 64, 0); x.lineTo(i * 32 + 32, 0); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color="#0a1c3a" roughness={0.28} metalness={0.7} envMapIntensity={0.9} />
      </mesh>
      <gridHelper args={[24, 24, '#1d5590', '#0f2f5a']} position={[0, 0.003, 0]} />
      {/* caution border around the lift bay */}
      {[[0, -3.1, 6, 0.18], [0, 0.2, 6, 0.18]].map(([x, z, w, d], i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[(x as number), 0.006, z as number]}><planeGeometry args={[w as number, d as number]} /><meshBasicMaterial map={stripe} toneMapped={false} /></mesh>
      ))}

      {/* back wall + branded panel */}
      <mesh position={[0, 3, -4.2]}><boxGeometry args={[24, 6, 0.2]} /><meshStandardMaterial color="#061a38" roughness={0.9} /></mesh>
      <mesh position={[-4.6, 3.3, -4.08]}><planeGeometry args={[1.7, 1.7]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
      <mesh position={[-4.6, 3.3, -4.1]}><planeGeometry args={[1.9, 1.9]} /><meshBasicMaterial color="#ffd60a" toneMapped={false} /></mesh>
      <Wrenches />

      <CeilingLights />

      <BreakerBox />
      <WallAC />

      {/* toolbox */}
      <group position={[-5.4, 0, -2.6]}>
        <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[1.3, 1.0, 0.65]} /><meshStandardMaterial color="#0f3a73" metalness={0.5} roughness={0.4} /></mesh>
        {[0.2, 0.42, 0.64, 0.86].map((y) => (<mesh key={y} position={[0, y, 0.335]}><boxGeometry args={[1.2, 0.015, 0.01]} /><meshBasicMaterial color="#ffd60a" toneMapped={false} /></mesh>))}
        <mesh position={[0, 1.04, 0]}><boxGeometry args={[1.36, 0.08, 0.7]} /><meshStandardMaterial color="#ffd60a" metalness={0.4} roughness={0.4} /></mesh>
      </group>

      {/* tyre stack + drum */}
      {[0.16, 0.5, 0.84].map((y, i) => (
        <mesh key={y} position={[4.6, y, -2.4 + i * 0.02]} rotation-x={Math.PI / 2} castShadow><torusGeometry args={[0.38, 0.17, 14, 28]} /><meshStandardMaterial color="#10141c" roughness={0.9} /></mesh>
      ))}
      <mesh position={[5.5, 0.5, -1.6]} castShadow><cylinderGeometry args={[0.32, 0.32, 1, 20]} /><meshStandardMaterial color="#ffd60a" roughness={0.5} metalness={0.3} /></mesh>
      <mesh position={[5.5, 0.5, -1.6]}><cylinderGeometry args={[0.325, 0.325, 0.12, 20]} /><meshStandardMaterial color="#0b1220" /></mesh>
    </group>
  );
}

/** Ceiling light bars; they pulse when the sign-in succeeds (power on!). */
function CeilingLights() {
  const refs = useRef<(THREE.PointLight | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((l, i) => { if (l) l.intensity = 26 + garage.success * (18 + Math.sin(t * 14 + i) * 16); });
  });
  return (
    <>
      {[-3, 1.2, 5].map((x, i) => (
        <group key={x} position={[x, 4.6, -1]}>
          <mesh><boxGeometry args={[2.6, 0.06, 0.28]} /><meshBasicMaterial color="#e9f3ff" toneMapped={false} /></mesh>
          <pointLight ref={(el) => { refs.current[i] = el; }} position={[0, -0.3, 0]} intensity={26} distance={10} color="#cfe4ff" />
        </group>
      ))}
    </>
  );
}

/** Wall-mounted breaker box with blinking LEDs — the electrician's workstation. */
function BreakerBox() {
  const leds = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    leds.current.forEach((m, i) => {
      if (!m) return;
      const on = garage.typing > 0.2 ? Math.sin(t * 18 + i * 1.3) > 0 : Math.sin(t * 1.4 + i * 2.1) > 0.3;
      (m.material as THREE.MeshBasicMaterial).color.set(on ? (i % 3 === 0 ? '#34d399' : '#ffd60a') : '#1b2b45');
    });
  });
  return (
    <group position={[4.7, 2.0, -4.06]}>
      <mesh><boxGeometry args={[1.1, 1.5, 0.14]} /><meshStandardMaterial color="#1b2b45" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[0, 0, 0.08]}><boxGeometry args={[0.95, 1.35, 0.03]} /><meshStandardMaterial color="#0f2f5a" metalness={0.5} roughness={0.5} /></mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} ref={(el) => { leds.current[i] = el; }} position={[-0.3 + (i % 3) * 0.3, 0.4 - Math.floor(i / 3) * 0.3, 0.11]}>
          <sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color="#1b2b45" toneMapped={false} />
        </mesh>
      ))}
      {[-0.3, 0, 0.3].map((x) => <mesh key={x} position={[x, -0.5, 0.1]}><boxGeometry args={[0.16, 0.26, 0.05]} /><meshStandardMaterial color="#ffd60a" roughness={0.5} /></mesh>)}
      {/* cables */}
      {[-0.2, 0.2].map((x) => <mesh key={x} position={[x, -1.3, 0.02]}><cylinderGeometry args={[0.025, 0.025, 1.1, 8]} /><meshStandardMaterial color={x < 0 ? '#ff9f1c' : '#2b7bd6'} /></mesh>)}
    </group>
  );
}

/** A simple split-AC on the wall above the electrician. */
function WallAC() {
  return (
    <group position={[2.4, 3.5, -4.0]}>
      <mesh><boxGeometry args={[1.5, 0.45, 0.3]} /><meshStandardMaterial color="#e9f0fb" roughness={0.35} metalness={0.1} /></mesh>
      <mesh position={[0, -0.14, 0.16]}><boxGeometry args={[1.3, 0.05, 0.04]} /><meshStandardMaterial color="#9db4d3" /></mesh>
      <mesh position={[0.55, 0.06, 0.16]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#34d399" toneMapped={false} /></mesh>
    </group>
  );
}

/** Camera drifts with the pointer and dollies gently per registration step. */
function CameraRig() {
  const { camera, size, pointer } = useThree();
  const cur = useRef({ x: 0, z: 10.2, y: 1.75 });
  useFrame((_, dt) => {
    const narrow = size.width < 900;
    const shiftX = 0; // the form card sits in the middle; the crew flank it
    const dz = garage.mode === 'register' ? 9.8 - garage.step * 0.2 : 10.2;
    cur.current.z = THREE.MathUtils.damp(cur.current.z, narrow ? dz + 4.5 : dz, 2.5, dt);
    cur.current.x = THREE.MathUtils.damp(cur.current.x, shiftX + pointer.x * 0.5, 3, dt);
    cur.current.y = THREE.MathUtils.damp(cur.current.y, 1.75 + pointer.y * 0.2 + (narrow ? 0.5 : 0), 3, dt);
    camera.position.set(cur.current.x, cur.current.y, cur.current.z);
    camera.lookAt(shiftX, narrow ? 0.5 : 1.15, 0);
  });
  return null;
}

export default function GarageScene({ say }: { say: string }) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 34, position: [0, 1.75, 10.2], near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.fog = new THREE.Fog('#030d1f', 9, 22); scene.background = new THREE.Color('#030d1f'); }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#fff1cf" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <directionalLight position={[-6, 3, -2]} intensity={0.8} color="#5fa3ea" />
      <Suspense fallback={null}>
        <Props />
        <Lift />
        <LiftedCar />
        <Worker variant="mechanic" say={say} />
        <Worker variant="electrician" />
        <Sparkles count={70} scale={[14, 4, 8]} position={[0, 2.4, -1]} size={2.4} speed={0.2} opacity={0.4} color="#9ccaff" />
        <Environment files="/hdr/city.hdr" environmentIntensity={0.55} />
      </Suspense>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={20} blur={2.4} far={5} resolution={512} color="#000814" />
      <CameraRig />
    </Canvas>
  );
}

useGLTF.preload(CAR);
