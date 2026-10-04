'use client';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { story } from '@/lib/explodeState';

export const AC_MODEL = '/black_air_condition_splitter_low_poly.glb';
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

/**
 * Split-AC showpiece: eases in from above on scroll, with a live front display, a soft cold-air
 * stream and a gentle backlight. Temperature / mode / fan / power come from the remote (story.ac*).
 */
export default function AirConditioner() {
  const { scene } = useGLTF(AC_MODEL);
  const root = useRef<THREE.Group>(null);
  const mist = useRef<THREE.Mesh>(null);
  const cone = useRef<THREE.Mesh>(null);
  const led = useRef<THREE.Mesh>(null);
  const ledKey = useRef('');
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
        mat.envMapIntensity = 2.4; mat.roughness = Math.min(mat.roughness ?? 0.6, 0.35); mat.metalness = Math.min(mat.metalness ?? 0, 0.4);
      }
    });
    return { pivot, w: sz.y * s, h: sz.x * s, d: sz.z * s };
  }, [scene]);

  const tex = useMemo(() => ({
    backlight: glowTexture([[0, 'rgba(120,180,255,0.9)'], [0.4, 'rgba(43,123,214,0.4)'], [1, 'rgba(29,85,144,0)']]),
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

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const narrow = size.width < 768;
    const a = smooth(story.ac);
    g.visible = a > 0.005;
    if (!g.visible) return;

    const power = story.acPower > 0.5;
    const fan = story.acFan;
    const mode = story.acMode;
    const base = MODE_COLOR[mode] ?? MODE_COLOR.cool;
    const flow = power ? (mode === 'fan' ? 0.55 : 1) * (0.5 + fan * 0.38) : 0;

    // entrance: falls in from above with a little overshoot, tumbling as it settles
    const d = story.drift * Math.PI * 2;
    const drop = (1 - a);
    g.position.set(narrow ? 0 : 2.6, (narrow ? 2.7 : 1.35) + drop * 9 + Math.sin(t * 0.9) * 0.05, 0);
    g.rotation.y = -0.38 + a * 0.2 + Math.sin(d * 2) * 0.1 + pointer.x * 0.18 + drop * 1.2;
    g.rotation.x = pointer.y * -0.05 + drop * 0.5;
    g.scale.setScalar((narrow ? 0.72 : 1) * (0.6 + 0.4 * a));

    // display refresh when the remote changes
    const key = `${story.acTemp}|${mode}|${fan}|${power}`;
    if (key !== ledKey.current) {
      ledKey.current = key;
      drawLed(ledRef.current.c.getContext('2d')!, story.acTemp, mode, fan, power);
      ledRef.current.t.needsUpdate = true;
    }

    if (mist.current) { mist.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.06); (mist.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + flow * 0.28; }
    if (cone.current) {
      cone.current.scale.set(1 + Math.sin(t * 2.1) * 0.03, 1, 1 + Math.sin(t * 2.1) * 0.03);
      const m = cone.current.material as THREE.MeshBasicMaterial;
      m.opacity = flow * 0.1 * a; m.color.setRGB(base[0], base[1], base[2]);
    }
  });

  const { w, h, d } = rig;
  return (
    <group ref={root} visible={false}>
      {/* backlight + frost mist */}
      <mesh position={[0, 0, -1.7]} renderOrder={-3}>
        <planeGeometry args={[11, 7.5]} />
        <meshBasicMaterial map={tex.backlight} opacity={0.45} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={mist} position={[0, -h * 1.45, 0.9]} renderOrder={-2}>
        <planeGeometry args={[w * 1.5, w * 0.95]} />
        <meshBasicMaterial map={tex.frost} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={0.6} />
      </mesh>

      <primitive object={rig.pivot} />

      {/* front display */}
      <mesh ref={led} position={[w * 0.25, h * 0.1, d * 0.5 + 0.02]}>
        <planeGeometry args={[w * 0.24, w * 0.24 * (130 / 360)]} />
        <meshBasicMaterial map={ledCanvas.t} transparent toneMapped={false} />
      </mesh>

      {/* cold-air cone from the vent */}
      <mesh ref={cone} position={[0, -h * 0.5 - h * 0.85, d * 0.55]} rotation={[-0.42, 0, 0]} renderOrder={-1}>
        <coneGeometry args={[w * 0.34, h * 1.9, 48, 1, true]} />
        <meshBasicMaterial map={tex.cone} color="#9fe7ff" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>


      {/* lights: cold underlight, warm rim, white key */}
      <pointLight position={[0, -h * 0.6, 2]} intensity={10} distance={8} color="#5fa3ea" />
      <pointLight position={[-w * 0.7, h * 1.1, 2.4]} intensity={16} distance={10} color="#ffffff" />
      <pointLight position={[w * 0.7, h * 0.9, 2.2]} intensity={12} distance={10} color="#cfe3ff" />
    </group>
  );
}

useGLTF.preload(AC_MODEL);
