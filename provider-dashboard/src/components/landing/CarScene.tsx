'use client';
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { story } from '@/lib/explodeState';

const MODEL = '/2022_toyota_land_cruiser_300_vx.r.glb';
const AC_MODEL = '/black_air_condition_splitter_low_poly.glb';
const CAR_LENGTH = 6.4; // world units after normalisation
const SPREAD = 0.78; // global multiplier for the explode distances

/** Explode direction per part, as fractions of car [width, height, length]. lat = ±1 by side, fw = ±1 by front/back. */
function recipe(key: string, lat: number, fw: number): [number, number, number] {
  if (/^Door/.test(key)) return [lat * 0.85, 0.12, fw * 0.28];
  if (key === 'Hood') return [0, 0.75, 0.38];
  if (key === 'Roof') return [0, 1.05, 0];
  if (key === 'Trunk') return [0, 0.6, -0.42];
  if (key === 'Bumper_F') return [0, 0.02, 0.5];
  if (key === 'Bumper_B') return [0, 0.02, -0.5];
  if (key === 'Diffuser_B') return [0, -0.2, -0.5];
  if (/^Fender/.test(key)) return [0, 0.55, fw * 0.16];
  if (key === 'Light_F') return [0, 0.38, 0.62];
  if (key === 'Light_B') return [0, 0.38, -0.62];
  if (/^SideMirror/.test(key)) return [lat * 0.8, 0.32, 0.1];
  if (key === 'SideSkirts') return [0, -0.28, 0];
  if (key === 'Engine') return [0, 0.42, 0.18];
  if (key === 'Exhaust') return [0, -0.34, -0.32];
  if (key === 'Suspension') return [0, -0.26, 0];
  if (/^W\d/.test(key)) return [lat * 0.85, -0.02, fw * 0.08];
  return [0, 0, 0]; // Body, Body_Bones — the chassis stays
}

/** Parts that get a floating callout label while exploded. */
const LABELS: Record<string, string> = {
  Hood: 'Hood',
  Roof: 'Roof',
  Door_FL: 'Doors',
  Bumper_F: 'Front bumper',
  W2: 'Wheels',
  Engine: 'Engine',
  Trunk: 'Tailgate',
  Suspension: 'Suspension',
};

/** GLTFLoader strips ':' from node names, so "T:SK_Door_FL_101_…" arrives as "TSK_Door_FL_101_…". */
function partKey(name: string) {
  const wheel = name.match(/^T:?(W\d)$/);
  if (wheel) return wheel[1];
  return name.match(/^T:?S[KM]_(.+?)_101/)?.[1] ?? name;
}

interface Part {
  nodes: THREE.Object3D[];
  base: THREE.Vector3[];
  dir: THREE.Vector3[]; // explode vector in each node's parent-local space
  up: THREE.Vector3[]; // world-up in each node's parent-local space (for idle floating)
  delay: number;
  phase: number;
  speed: number;
  amp: number;
}
interface Label { key: string; text: string; from: THREE.Vector3; offset: THREE.Vector3; delay: number }

function buildRig(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);

  // Glass → cheap transparency (transmission would add a full extra render pass).
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const mat = m as THREE.MeshPhysicalMaterial;
      if (mat.transmission > 0) {
        mat.transmission = 0;
        mat.transparent = true;
        mat.opacity = 0.32;
        mat.depthWrite = false;
      }
      mat.envMapIntensity = 1.25;
    }
  });

  const root = scene.getObjectByName('RootNode') ?? scene;
  const groups = new Map<string, THREE.Object3D[]>();
  const add = (k: string, n: THREE.Object3D) => groups.set(k, [...(groups.get(k) ?? []), n]);
  for (const child of root.children) {
    const key = partKey(child.name);
    if (key === 'Tyre') child.children.forEach((w) => add(partKey(w.name), w));
    else add(key, child);
  }

  // Reference box = shell + wheels only. Suspension / exhaust meshes are oversized and would skew the dimensions.
  const box = new THREE.Box3();
  ['Body', 'Bumper_F', 'Bumper_B', 'Roof', 'W1', 'W2', 'W3', 'W4'].forEach((k) =>
    groups.get(k)?.forEach((n) => box.union(new THREE.Box3().setFromObject(n))));
  if (box.isEmpty()) box.setFromObject(scene);
  const size = box.getSize(new THREE.Vector3()); // vehicle: +Z forward, X lateral, Y up
  const centre = box.getCenter(new THREE.Vector3());

  const parts: Part[] = [];
  const labels: Label[] = [];
  let i = 0;
  groups.forEach((nodes, key) => {
    const pb = new THREE.Box3();
    nodes.forEach((n) => pb.union(new THREE.Box3().setFromObject(n)));
    const centreW = pb.getCenter(new THREE.Vector3());
    const c = centreW.clone().sub(centre);
    const lat = Math.abs(c.x) < size.x * 0.04 ? 0 : Math.sign(c.x);
    const fw = Math.abs(c.z) < size.z * 0.04 ? 0 : Math.sign(c.z);
    const [fx, fy, fz] = recipe(key, lat, fw);
    const world = new THREE.Vector3(fx * size.x, fy * size.y, fz * size.z).multiplyScalar(SPREAD);

    const dir: THREE.Vector3[] = [];
    const up: THREE.Vector3[] = [];
    nodes.forEach((n) => {
      const inv = new THREE.Matrix4().copy((n.parent ?? scene).matrixWorld).invert();
      const origin = new THREE.Vector3().applyMatrix4(inv);
      dir.push(world.clone().applyMatrix4(inv).sub(origin));
      up.push(new THREE.Vector3(0, size.y * 0.035, 0).applyMatrix4(inv).sub(origin));
    });

    const delay = (i % 6) * 0.045;
    if (LABELS[key]) labels.push({ key, text: LABELS[key], from: centreW.clone(), offset: world.clone(), delay });

    parts.push({
      nodes,
      base: nodes.map((n) => n.position.clone()),
      dir,
      up,
      delay,
      phase: i * 1.9,
      speed: 0.7 + (i % 5) * 0.13,
      amp: 0.6 + (i % 4) * 0.25,
    });
    i++;
  });

  const scale = CAR_LENGTH / size.z;
  return { parts, labels, scale, radius: (size.z * 0.5) * scale, offset: new THREE.Vector3(-centre.x, -box.min.y, -centre.z).multiplyScalar(scale) };
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Radial-gradient canvas texture (soft glow sprite). */
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

/* ───────────────────────────── CAR ───────────────────────────── */

function ExplodedCar() {
  const { scene } = useGLTF(MODEL);
  const rig = useMemo(() => buildRig(scene), [scene]);
  const group = useRef<THREE.Group>(null);
  const stage = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const labelGroups = useRef<(THREE.Group | null)[]>([]);
  const labelEls = useRef<(HTMLDivElement | null)[]>([]);
  const e = useRef(0);
  const { camera, size, pointer } = useThree();
  const lean = useRef({ vel: 0, px: 0, py: 0 });
  const under = useMemo(() => glowTexture([[0, 'rgba(255,214,10,0.55)'], [0.5, 'rgba(255,214,10,0.14)'], [1, 'rgba(255,214,10,0)']]), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const narrow = size.width < 768;
    e.current = THREE.MathUtils.damp(e.current, story.explode, 5, dt);
    const ex = e.current;

    for (const p of rig.parts) {
      const local = smooth(THREE.MathUtils.clamp((ex - p.delay) / (1 - p.delay), 0, 1));
      const wobble = Math.sin(t * p.speed + p.phase) * p.amp * smooth(ex);
      const drift = Math.cos(t * p.speed * 0.7 + p.phase) * p.amp * 0.4 * smooth(ex);
      for (let n = 0; n < p.nodes.length; n++) {
        p.nodes[n].position
          .copy(p.base[n])
          .addScaledVector(p.dir[n], local)
          .addScaledVector(p.up[n], wobble)
          .addScaledVector(p.dir[n], drift * 0.03);
      }
    }

    // Callout labels follow their part and fade in once the car is mostly exploded.
    const labelOpacity = smooth(THREE.MathUtils.clamp((ex - 0.62) / 0.3, 0, 1)) * (1 - smooth(story.carOut)) * (narrow ? 0 : 1); // labels are desktop-only
    rig.labels.forEach((l, k) => {
      const g = labelGroups.current[k];
      if (!g) return;
      const local = smooth(THREE.MathUtils.clamp((ex - l.delay) / (1 - l.delay), 0, 1));
      g.position.copy(l.from).addScaledVector(l.offset, local);
      const el = labelEls.current[k];
      if (el) { el.style.opacity = String(labelOpacity); el.style.transform = `translateY(${(1 - labelOpacity) * 8}px)`; }
    });

    // Background travel: the car keeps moving across the page as you scroll, and leans into scroll velocity.
    story.vel = THREE.MathUtils.damp(story.vel, 0, 3, dt);
    lean.current.vel = THREE.MathUtils.damp(lean.current.vel, THREE.MathUtils.clamp(story.vel / 3500, -1, 1), 5, dt);
    lean.current.px = THREE.MathUtils.damp(lean.current.px, pointer.x, 2.5, dt);
    lean.current.py = THREE.MathUtils.damp(lean.current.py, pointer.y, 2.5, dt);
    const d = story.drift * Math.PI * 2;

    const g = group.current;
    if (g) {
      const driftX = narrow ? 0 : Math.sin(d * 1.5) * 0.55 * (1 - ex);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, story.rotY + Math.sin(d * 2) * 0.16 + lean.current.px * 0.18, 4, dt);
      g.rotation.z = -lean.current.vel * 0.07; // roll into the scroll
      g.rotation.x = lean.current.vel * 0.05;
      g.position.x = THREE.MathUtils.damp(g.position.x, (narrow ? 0 : story.x) + driftX, 4, dt);
      g.position.y = 0.7 * smooth(ex) + Math.sin(d * 3) * 0.14 + Math.sin(t * 0.8) * 0.035 - lean.current.vel * 0.18;
      g.position.z = Math.cos(d * 1.5) * 0.9 * (1 - ex);
      const out = smooth(story.carOut);
      g.position.x -= out * 11;
      g.rotation.y += out * 0.9;
      g.visible = out < 0.995;
      g.scale.setScalar((narrow ? 0.5 : 1) * (1 - out * 0.35));
    }

    // Turntable stage stays on the floor while the car lifts.
    if (stage.current && g) {
      stage.current.position.y = -g.position.y / g.scale.x + 0.012;
      stage.current.rotation.y = -g.rotation.y * 0.5; // counter-rotate a little so the rings feel anchored
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.12;
    if (ringB.current) {
      ringB.current.rotation.z = -t * 0.08;
      (ringB.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 1.6) * 0.15;
    }

    const camZ = story.camZ * (narrow ? 1.35 : 1);
    camera.position.set(lean.current.px * 0.5, 2.6 + ex * 1.2 + lean.current.py * 0.25, camZ - lean.current.vel * 0.6);
    camera.lookAt(0, (narrow ? -1.5 : 0.35) + ex * 0.6, 0); // on phones aim lower so the car sits above the copy
  });

  return (
    <group ref={group}>
      {/* glowing turntable stage */}
      <group ref={stage}>
        <mesh rotation-x={-Math.PI / 2} renderOrder={-2}>
          <circleGeometry args={[rig.radius * 1.9, 64]} />
          <meshBasicMaterial map={under} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh ref={ringA} rotation-x={-Math.PI / 2} renderOrder={-1}>
          <ringGeometry args={[rig.radius * 1.32, rig.radius * 1.345, 160, 1]} />
          <meshBasicMaterial color="#ffd60a" transparent opacity={0.75} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh ref={ringB} rotation-x={-Math.PI / 2} renderOrder={-1}>
          <ringGeometry args={[rig.radius * 1.62, rig.radius * 1.635, 160, 1]} />
          <meshBasicMaterial color="#2b7bd6" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      <group position={rig.offset} scale={rig.scale}>
        <primitive object={scene} />
        {rig.labels.map((l, k) => (
          <group key={l.key} ref={(el) => { labelGroups.current[k] = el; }}>
            <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <div ref={(el) => { labelEls.current[k] = el; }} style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', padding: '5px 11px 5px 8px', borderRadius: 999,
                background: 'rgba(4,22,47,.82)', border: '1px solid rgba(255,214,10,.45)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 30px rgba(0,0,0,.45)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#eaf2ff', transition: 'transform .3s' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffd60a', boxShadow: '0 0 10px #ffd60a' }} />
                {l.text}
              </div>
            </Html>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ───────────────────── AIR CONDITIONER ───────────────────── */

const AIR_COUNT = 420;
const AC_WIDTH = 4.3;

/** Hero split-unit: scroll-driven entrance, orbit rings, frost glow, soft cool-air stream and a live temperature HUD. */
function AirConditioner() {
  const { scene } = useGLTF(AC_MODEL);
  const root = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const hud = useRef<HTMLDivElement>(null);
  const mist = useRef<THREE.Mesh>(null);
  const { size, pointer } = useThree();

  const rig = useMemo(() => {
    // The FBX is Z-up and lying on its side: stand it up, then normalise the width.
    const orient = new THREE.Group();
    orient.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    orient.add(scene.clone(true)); // clone: memo may run twice in dev (StrictMode) and must not steal the cached scene
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
      if (m.isMesh) { const mat = m.material as THREE.MeshStandardMaterial; mat.envMapIntensity = 3.6; mat.roughness = Math.min(mat.roughness ?? 0.6, 0.3); mat.metalness = Math.max(mat.metalness ?? 0, 0.35); }
    });
    return { pivot, w: sz.y * s, h: sz.x * s, d: sz.z * s };
  }, [scene]);

  const backlight = useMemo(() => glowTexture([[0, 'rgba(120,180,255,0.9)'], [0.4, 'rgba(43,123,214,0.4)'], [1, 'rgba(29,85,144,0)']]), []);
  const softDot = useMemo(() => glowTexture([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(200,225,255,0.55)'], [1, 'rgba(160,200,255,0)']]), []);
  const frost = useMemo(() => glowTexture([[0, 'rgba(210,235,255,0.6)'], [0.5, 'rgba(120,180,255,0.18)'], [1, 'rgba(120,180,255,0)']]), []);

  // Particle buffers live in the geometry; life/velocity in refs (mutated per frame, never during render).
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
    if (!g.visible) {
      if (hud.current && hud.current.style.opacity !== '0') hud.current.style.opacity = '0';
      return;
    }

    const d = story.drift * Math.PI * 2;
    g.position.set((narrow ? 0 : 2.15) + (1 - a) * 11, (narrow ? 1.7 : 1.15) + Math.sin(t * 0.9) * 0.09 + Math.sin(d * 3) * 0.1, 0);
    g.rotation.y = -0.5 + a * 0.3 + Math.sin(d * 2.5) * 0.3 + pointer.x * 0.35 + (1 - a) * 1.2;
    g.rotation.x = pointer.y * -0.1;
    g.scale.setScalar((narrow ? 0.62 : 1) * (0.5 + 0.5 * a));

    if (ring1.current) { ring1.current.rotation.z = t * 0.35; ring1.current.rotation.x = 1.15 + Math.sin(t * 0.4) * 0.08; }
    if (ring2.current) { ring2.current.rotation.z = -t * 0.25; ring2.current.rotation.y = 0.5 + Math.cos(t * 0.5) * 0.1; }
    if (mist.current) mist.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.06);
    if (hud.current) { hud.current.style.opacity = String(smooth(THREE.MathUtils.clamp((story.ac - 0.6) / 0.4, 0, 1))); }

    // Cool-air stream from the lower vent
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const col = geo.getAttribute('color') as THREE.BufferAttribute;
    const P = pos.array as Float32Array, C = col.array as Float32Array;
    const L = life.current, V = vel.current;
    const w = rig.w, h = rig.h, dpt = rig.d;
    for (let i = 0; i < AIR_COUNT; i++) {
      L[i] += dt * (0.3 + (i % 7) * 0.03);
      if (L[i] >= 1) {
        L[i] = 0;
        P[i * 3] = (Math.random() - 0.5) * w * 0.82;
        P[i * 3 + 1] = -h * 0.45;
        P[i * 3 + 2] = dpt * 0.3;
        V[i * 3] = (Math.random() - 0.5) * 0.3;
        V[i * 3 + 1] = -0.7 - Math.random() * 0.8;
        V[i * 3 + 2] = 0.5 + Math.random() * 0.6;
      }
      // swirl: gentle sideways sine so the stream reads as airflow
      P[i * 3] += V[i * 3] * dt + Math.sin(t * 1.3 + i * 0.7 + L[i] * 6) * 0.006;
      P[i * 3 + 1] += V[i * 3 + 1] * dt;
      P[i * 3 + 2] += V[i * 3 + 2] * dt;
      V[i * 3 + 1] -= dt * 0.12;
      const f = Math.sin(Math.PI * L[i]) * a * 0.95; // fade in / out
      C[i * 3] = 0.7 * f; C[i * 3 + 1] = 0.95 * f; C[i * 3 + 2] = 1.0 * f;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  const R1 = rig.w * 0.72;
  return (
    <group ref={root} visible={false}>
      {/* backlight + frost mist */}
      <mesh position={[0, 0, -1.6]} renderOrder={-2}>
        <planeGeometry args={[13, 9]} />
        <meshBasicMaterial map={backlight} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={mist} position={[0, -rig.h * 1.3, 0.9]} renderOrder={-1}>
        <planeGeometry args={[rig.w * 1.4, rig.w * 0.9]} />
        <meshBasicMaterial map={frost} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.9} />
      </mesh>

      {/* orbit rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[R1, 0.012, 8, 200]} />
        <meshBasicMaterial color="#ffd60a" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[R1 * 1.22, 0.008, 8, 200]} />
        <meshBasicMaterial color="#5fa3ea" transparent opacity={0.7} toneMapped={false} />
      </mesh>

      <primitive object={rig.pivot} />

      <points geometry={geo} frustumCulled={false}>
        <pointsMaterial map={softDot} size={0.55} sizeAttenuation vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} alphaTest={0.01} />
      </points>

      {/* lights: cold blue underlight, warm rim, white top */}
      <pointLight position={[0, -rig.h * 0.5, 1.6]} intensity={14} distance={8} color="#5fa3ea" />
      <pointLight position={[rig.w * 0.6, rig.h * 0.9, 2]} intensity={9} distance={10} color="#ffd60a" />
      <pointLight position={[-rig.w * 0.6, rig.h * 1.2, 2.4]} intensity={10} distance={10} color="#ffffff" />

      {/* live temperature HUD */}
      <Html position={[-rig.w * 0.5, rig.h * 1.55, 0.3]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={hud} style={{ opacity: 0, minWidth: 148, padding: '12px 16px', borderRadius: 16, background: 'rgba(4,22,47,.78)', border: '1px solid rgba(95,163,234,.5)', backdropFilter: 'blur(10px)', boxShadow: '0 12px 40px rgba(0,0,0,.5), 0 0 30px rgba(43,123,214,.25)', color: '#eaf2ff' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#7f9dc6' }}>Cooling · Auto</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 600, lineHeight: 1, color: '#fff' }}>22</span>
            <span style={{ fontSize: 16, color: '#ffd60a' }}>°C</span>
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
            {[0, 1, 2, 3, 4].map((k) => <span key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k < 4 ? '#5fa3ea' : 'rgba(255,255,255,.15)' }} />)}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ───────────────────────────── SCENE ───────────────────────────── */

export default function CarScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0, 2.6, 11], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 9, 5]} intensity={1.6} color="#fff4d6" />
        <directionalLight position={[-7, 4, -4]} intensity={0.9} color="#5fa3ea" />
        <Suspense fallback={null}>
          <ExplodedCar />
          <AirConditioner />
          <Sparkles count={90} scale={[20, 8, 9]} position={[0, 3.2, 0]} size={2.6} speed={0.25} opacity={0.55} color="#9ccaff" />
          <Environment files="/hdr/city.hdr" />
        </Suspense>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.65} scale={26} blur={2.6} far={7} resolution={512} color="#000814" />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL);
useGLTF.preload(AC_MODEL);
