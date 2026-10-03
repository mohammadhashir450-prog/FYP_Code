'use client';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges, Html, Line, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { story } from '@/lib/explodeState';

export const AC_MODEL = '/black_air_condition_splitter_low_poly.glb';
const AIR_COUNT = 520;
const AC_WIDTH = 4.3;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Soft radial-gradient sprite texture. */
function glowTexture(stops: [number, string][]) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Vertical fade texture for the cold-air cone (opaque at the vent, transparent at the tip). */
function coneTexture() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,255,255,0.95)'); // canvas top = v1 = the cone apex, which sits at the vent
  g.addColorStop(0.55, 'rgba(255,255,255,0.28)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const MODE_COLOR: Record<string, [number, number, number]> = {
  cool: [0.6, 0.92, 1],
  dry: [1, 0.88, 0.55],
  fan: [0.82, 0.9, 1],
};

/** Draws the unit's front display (temperature, mode, fan bars). */
function drawLed(ctx: CanvasRenderingContext2D, temp: number, mode: string, fan: number, power: boolean) {
  const W = 360, H = 130;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(2,10,24,0.92)';
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 22); ctx.fill();
  ctx.strokeStyle = power ? 'rgba(95,163,234,0.55)' : 'rgba(95,163,234,0.18)';
  ctx.lineWidth = 3; ctx.stroke();
  if (!power) {
    ctx.fillStyle = 'rgba(127,157,198,0.5)'; ctx.font = '600 38px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.fillText('STANDBY', W / 2, H / 2 + 13);
    return;
  }
  const col = mode === 'dry' ? '#ffd48a' : mode === 'fan' ? '#d6e6ff' : '#7fe3ff';
  ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.fillStyle = col; ctx.textAlign = 'left';
  ctx.font = '700 86px "JetBrains Mono", monospace';
  ctx.fillText(String(temp), 26, 96);
  ctx.font = '600 34px "JetBrains Mono", monospace';
  ctx.fillText('°C', 26 + ctx.measureText(String(temp)).width + 70, 62);
  ctx.shadowBlur = 8;
  ctx.font = '700 26px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
  ctx.fillText(mode.toUpperCase(), W - 24, 44);
  for (let i = 0; i < 3; i++) { // fan bars
    ctx.globalAlpha = i < fan ? 1 : 0.22;
    ctx.fillRect(W - 24 - (3 - i) * 22, 96 - (i + 1) * 12, 14, (i + 1) * 12);
  }
  ctx.globalAlpha = 1;
}

const CALLOUTS = [
  { text: 'Inverter compressor', anchor: [-0.34, 0.1], off: [-1.35, 1.0] },
  { text: 'Cooling coil', anchor: [0.05, -0.05], off: [0.2, 1.4] },
  { text: 'Anti-bacterial filter', anchor: [0.4, -0.18], off: [1.5, 0.75] },
] as const;

/**
 * Hero split-AC. Scroll-driven entrance (falls from above), glass wall plate, live front display,
 * scanning light bar, orbit rings, annotated callouts, a cold-air cone, frost sparkles and a
 * soft airflow stream. Temperature / mode / fan / power come from the interactive remote (story.ac*).
 */
export default function AirConditioner() {
  const { scene } = useGLTF(AC_MODEL);
  const root = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const scan = useRef<THREE.Mesh>(null);
  const mist = useRef<THREE.Mesh>(null);
  const cone = useRef<THREE.Mesh>(null);
  const led = useRef<THREE.Mesh>(null);
  const ledKey = useRef('');
  const lines = useRef<(unknown)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const dots = useRef<(THREE.Mesh | null)[]>([]);
  const { size, pointer } = useThree();

  const rig = useMemo(() => {
    // The FBX is Z-up and lying on its side: stand it up, then normalise the width.
    const orient = new THREE.Group();
    orient.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    orient.add(scene.clone(true)); // clone: memo may run twice in dev (StrictMode)
    orient.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(orient);
    const sz = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const s = AC_WIDTH / Math.max(sz.x, sz.z, sz.y);
    const pivot = new THREE.Group();
    orient.position.copy(c).multiplyScalar(-1);
    pivot.add(orient);
    pivot.scale.setScalar(s);
    pivot.rotation.z = Math.PI / 2; // long side horizontal
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.MeshPhysicalMaterial;
        mat.envMapIntensity = 3.8; mat.roughness = Math.min(mat.roughness ?? 0.6, 0.28); mat.metalness = Math.max(mat.metalness ?? 0, 0.3);
      }
    });
    return { pivot, w: sz.y * s, h: sz.x * s, d: sz.z * s };
  }, [scene]);

  const tex = useMemo(() => ({
    backlight: glowTexture([[0, 'rgba(120,180,255,0.9)'], [0.4, 'rgba(43,123,214,0.4)'], [1, 'rgba(29,85,144,0)']]),
    dot: glowTexture([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(210,235,255,0.6)'], [1, 'rgba(160,200,255,0)']]),
    frost: glowTexture([[0, 'rgba(210,235,255,0.6)'], [0.5, 'rgba(120,180,255,0.18)'], [1, 'rgba(120,180,255,0)']]),
    cone: coneTexture(),
  }), []);

  // front display canvas
  const ledCanvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 360; c.height = 130;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { c, t };
  }, []);

  const ledRef = useRef(ledCanvas); // mutated per frame via the ref (not the memo value)

  // Particle buffers live in the geometry; life/velocity in refs (mutated per frame only)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(AIR_COUNT * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(AIR_COUNT * 3), 3));
    return g;
  }, []);
  const life = useRef(Float32Array.from({ length: AIR_COUNT }, (_, i) => (i * 0.6180339) % 1));
  const vel = useRef(new Float32Array(AIR_COUNT * 3));

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const narrow = size.width < 768;
    const a = smooth(story.ac);
    g.visible = a > 0.005;
    if (!g.visible) { labels.current.forEach((el) => { if (el && el.style.opacity !== '0') el.style.opacity = '0'; }); return; }

    const power = story.acPower > 0.5;
    const fan = story.acFan;
    const mode = story.acMode;
    const base = MODE_COLOR[mode] ?? MODE_COLOR.cool;
    const flow = power ? (mode === 'fan' ? 0.55 : 1) * (0.5 + fan * 0.38) : 0;

    // entrance: falls in from above with a little overshoot, tumbling as it settles
    const d = story.drift * Math.PI * 2;
    const drop = (1 - a);
    g.position.set(narrow ? 0 : 2.5, (narrow ? 1.9 : 1.5) + drop * 10 + Math.sin(t * 0.9) * 0.08 + Math.sin(d * 3) * 0.1, 0);
    g.rotation.y = -0.5 + a * 0.3 + Math.sin(d * 2.5) * 0.28 + pointer.x * 0.32 + drop * 1.4;
    g.rotation.x = pointer.y * -0.09 + drop * 0.6;
    g.scale.setScalar((narrow ? 0.62 : 1) * (0.55 + 0.45 * a));

    // display refresh when the remote changes
    const key = `${story.acTemp}|${mode}|${fan}|${power}`;
    if (key !== ledKey.current) {
      ledKey.current = key;
      drawLed(ledRef.current.c.getContext('2d')!, story.acTemp, mode, fan, power);
      ledRef.current.t.needsUpdate = true;
    }

    if (ring1.current) { ring1.current.rotation.z = t * 0.35; ring1.current.rotation.x = 1.15 + Math.sin(t * 0.4) * 0.08; }
    if (ring2.current) { ring2.current.rotation.z = -t * 0.25; ring2.current.rotation.y = 0.5 + Math.cos(t * 0.5) * 0.1; }
    if (mist.current) { mist.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.06); (mist.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + flow * 0.55; }
    if (cone.current) {
      cone.current.scale.set(1 + Math.sin(t * 2.1) * 0.03, 1, 1 + Math.sin(t * 2.1) * 0.03);
      const m = cone.current.material as THREE.MeshBasicMaterial;
      m.opacity = flow * 0.22 * a; m.color.setRGB(base[0], base[1], base[2]);
    }
    if (scan.current) { // light bar sweeping over the unit
      const phase = (t % 3.4) / 3.4;
      scan.current.position.y = (phase - 0.5) * rig.h * 1.15;
      (scan.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * phase) * 0.55 * a;
    }

    // callouts
    const showCallouts = smooth(THREE.MathUtils.clamp((story.ac - 0.72) / 0.28, 0, 1));
    CALLOUTS.forEach((_, i) => {
      const el = labels.current[i]; if (el) { el.style.opacity = String(showCallouts); el.style.transform = `translateY(${(1 - showCallouts) * 8}px)`; }
      const dot = dots.current[i]; if (dot) dot.scale.setScalar(showCallouts * (1 + Math.sin(t * 3 + i) * 0.25));
      const ln = lines.current[i] as { material?: THREE.Material; visible: boolean } | null;
      if (ln) { ln.visible = showCallouts > 0.02; if (ln.material) ln.material.opacity = showCallouts * 0.8; }
    });

    // Cool-air stream from the lower vent
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const col = geo.getAttribute('color') as THREE.BufferAttribute;
    const P = pos.array as Float32Array, C = col.array as Float32Array;
    const L = life.current, V = vel.current;
    const w = rig.w, h = rig.h, dpt = rig.d;
    for (let i = 0; i < AIR_COUNT; i++) {
      L[i] += dt * (0.3 + (i % 7) * 0.03) * (0.4 + flow);
      if (L[i] >= 1) {
        L[i] = 0;
        P[i * 3] = (Math.random() - 0.5) * w * 0.82;
        P[i * 3 + 1] = -h * 0.45;
        P[i * 3 + 2] = dpt * 0.3;
        V[i * 3] = (Math.random() - 0.5) * 0.3;
        V[i * 3 + 1] = -0.7 - Math.random() * 0.8;
        V[i * 3 + 2] = 0.5 + Math.random() * 0.6;
      }
      const sp = 0.4 + flow;
      P[i * 3] += V[i * 3] * dt * sp + Math.sin(t * 1.3 + i * 0.7 + L[i] * 6) * 0.006;
      P[i * 3 + 1] += V[i * 3 + 1] * dt * sp;
      P[i * 3 + 2] += V[i * 3 + 2] * dt * sp;
      V[i * 3 + 1] -= dt * 0.12;
      const f = Math.sin(Math.PI * L[i]) * a * 0.95 * Math.min(1, flow * 1.25); // fade in / out
      C[i * 3] = base[0] * f; C[i * 3 + 1] = base[1] * f; C[i * 3 + 2] = base[2] * f;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  const { w, h, d } = rig;
  return (
    <group ref={root} visible={false}>
      {/* backlight + frost mist */}
      <mesh position={[0, 0, -1.7]} renderOrder={-3}>
        <planeGeometry args={[13, 9]} />
        <meshBasicMaterial map={tex.backlight} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={mist} position={[0, -h * 1.45, 0.9]} renderOrder={-2}>
        <planeGeometry args={[w * 1.5, w * 0.95]} />
        <meshBasicMaterial map={tex.frost} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.6} />
      </mesh>

      {/* glass wall-mount plate */}
      <mesh position={[0, 0, -d * 0.5 - 0.12]} renderOrder={-1}>
        <boxGeometry args={[w * 1.22, h * 2.2, 0.06]} />
        <meshPhysicalMaterial color="#0a2447" transparent opacity={0.42} roughness={0.12} metalness={0.25} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.6} />
        <Edges threshold={15} color="#5fa3ea" />
      </mesh>

      {/* orbit rings */}
      <mesh ref={ring1}><torusGeometry args={[w * 0.74, 0.011, 8, 220]} /><meshBasicMaterial color="#ffd60a" transparent opacity={0.8} toneMapped={false} /></mesh>
      <mesh ref={ring2}><torusGeometry args={[w * 0.9, 0.008, 8, 220]} /><meshBasicMaterial color="#5fa3ea" transparent opacity={0.7} toneMapped={false} /></mesh>

      <primitive object={rig.pivot} />

      {/* front display */}
      <mesh ref={led} position={[w * 0.25, h * 0.1, d * 0.5 + 0.02]}>
        <planeGeometry args={[w * 0.24, w * 0.24 * (130 / 360)]} />
        <meshBasicMaterial map={ledCanvas.t} transparent toneMapped={false} />
      </mesh>
      {/* scanning light bar */}
      <mesh ref={scan} position={[0, 0, d * 0.5 + 0.03]} renderOrder={5}>
        <planeGeometry args={[w * 1.02, 0.035]} />
        <meshBasicMaterial color="#9fe7ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* cold-air cone from the vent */}
      <mesh ref={cone} position={[0, -h * 0.5 - h * 1.1, d * 0.55]} rotation={[-0.42, 0, 0]} renderOrder={-1}>
        <coneGeometry args={[w * 0.46, h * 2.4, 40, 1, true]} />
        <meshBasicMaterial map={tex.cone} color="#9fe7ff" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* airflow stream */}
      <points geometry={geo} frustumCulled={false}>
        <pointsMaterial map={tex.dot} size={0.36} sizeAttenuation vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.01} />
      </points>
      <Sparkles count={46} scale={[w * 0.95, h * 2.2, 1.6]} position={[0, -h * 1.15, d * 0.7]} size={3.2} speed={0.7} opacity={0.75} color="#cfeeff" />

      {/* annotated callouts */}
      {CALLOUTS.map((c, i) => {
        const ax = c.anchor[0] * w, ay = c.anchor[1] * h, lx = c.off[0] * w * 0.5, ly = c.off[1] * h;
        return (
          <group key={c.text}>
            <mesh ref={(el) => { dots.current[i] = el; }} position={[ax, ay, d * 0.5 + 0.04]} scale={0}>
              <sphereGeometry args={[0.045, 12, 12]} /><meshBasicMaterial color="#ffd60a" toneMapped={false} />
            </mesh>
            <Line ref={(el) => { lines.current[i] = el; }} points={[[ax, ay, d * 0.5 + 0.04], [lx, ly, d * 0.5 + 0.3]]} color="#ffd60a" lineWidth={1.2} transparent opacity={0} />
            <Html position={[lx, ly, d * 0.5 + 0.3]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <div ref={(el) => { labels.current[i] = el; }} style={{ opacity: 0, whiteSpace: 'nowrap', padding: '5px 12px', borderRadius: 999, background: 'rgba(4,22,47,.86)', border: '1px solid rgba(255,214,10,.5)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 28px rgba(0,0,0,.45)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#eaf2ff' }}>
                {c.text}
              </div>
            </Html>
          </group>
        );
      })}

      {/* lights: cold underlight, warm rim, white key */}
      <pointLight position={[0, -h * 0.5, 1.6]} intensity={14} distance={8} color="#5fa3ea" />
      <pointLight position={[w * 0.6, h * 0.9, 2]} intensity={9} distance={10} color="#ffd60a" />
      <pointLight position={[-w * 0.6, h * 1.2, 2.4]} intensity={10} distance={10} color="#ffffff" />
    </group>
  );
}

useGLTF.preload(AC_MODEL);
