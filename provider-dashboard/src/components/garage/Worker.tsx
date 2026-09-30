'use client';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { garage } from '@/lib/garageState';

export type WorkerVariant = 'mechanic' | 'electrician';

/** Per-variant look + where each one stands: [x, z, facing (radians, 0 = toward camera)]. */
const VARIANTS = {
  mechanic: {
    skin: '#e0aa82', overall: '#12417d', shirt: '#dfe9ff', hat: '#ffd60a', glove: '#ffd60a', boot: '#151a24',
    ring: '#ffd60a', spark: [1, 0.75, 0.25] as [number, number, number],
    spots: { login: [-3.3, -0.4, 0.55], s0: [-3.2, 0.3, 0.45], s1: [-3.8, -1.7, 0.3], s2: [-2.7, 0.7, 0.3] } as Record<string, [number, number, number]>,
  },
  electrician: {
    skin: '#c79673', overall: '#1f5fa6', shirt: '#ffffff', hat: '#f4f7ff', glove: '#ff9f1c', boot: '#20242e',
    ring: '#5fa3ea', spark: [0.45, 0.8, 1] as [number, number, number],
    spots: { login: [3.3, -0.4, -0.55], s0: [3.2, 0.3, -0.45], s1: [3.8, -1.7, -0.3], s2: [2.7, 0.7, -0.3] } as Record<string, [number, number, number]>,
  },
};

const damp = THREE.MathUtils.damp;

function Cap({ r, len, y = 0, color, rough = 0.7 }: { r: number; len: number; y?: number; color: string; rough?: number }) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <capsuleGeometry args={[r, len, 6, 14]} />
      <meshStandardMaterial color={color} roughness={rough} metalness={0.05} />
    </mesh>
  );
}

/**
 * Procedural low-poly workman in brand colours (navy overalls, yellow hard hat).
 * Poses are driven by `garage` state: works on the car while you type, covers his eyes
 * for the password, walks between stations as registration advances, shakes his head on
 * errors and jumps when you succeed. A speech bubble narrates.
 */
export default function Worker({ variant, say }: { variant: WorkerVariant; say?: string }) {
  const V = VARIANTS[variant];
  const SPOTS = V.spots;
  const SKIN = V.skin, OVERALL = V.overall, SHIRT = V.shirt, HAT = V.hat, GLOVE = V.glove, BOOT = V.boot;
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const spine = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shL = useRef<THREE.Group>(null);
  const shR = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const elR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const knL = useRef<THREE.Group>(null);
  const knR = useRef<THREE.Group>(null);
  const brow = useRef<THREE.Group>(null);
  const wrench = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const stage = useRef<THREE.Group>(null);
  const sparks = useRef<THREE.Points>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const { pointer } = useThree();
  const s = useRef({ yaw: SPOTS.login[2], jump: 0, jumpV: 0, wasSuccess: 0, walkPhase: 0, moving: 0 });

  // spark particles (emitted at the wrench tip while typing)
  const N = 48;
  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const life = useRef(Float32Array.from({ length: N }, (_, i) => (i * 0.61803) % 1));
  const vel = useRef(new Float32Array(N * 3));

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const r = root.current, hp = hips.current, sp = spine.current, hd = head.current;
    if (!r || !hp || !sp || !hd || !shL.current || !shR.current || !elL.current || !elR.current || !hipL.current || !hipR.current || !knL.current || !knR.current) return;
    const st = s.current;

    // decay the pulses
    garage.typing = Math.max(0, garage.typing - dt * 2.2);
    garage.error = Math.max(0, garage.error - dt * 1.2);
    const typing = garage.typing;
    const err = garage.error;
    const hidden = garage.focus === 'password' ? 1 : 0;
    const pw = variant === 'mechanic' ? hidden : 0; // mechanic covers his eyes
    const turnAway = variant === 'electrician' ? hidden : 0; // electrician turns his back
    const win = garage.success;

    // ── target spot (walks between stations)
    const key = garage.mode === 'login' ? 'login' : `s${Math.min(2, garage.step)}`;
    const [tx, tz, face0] = SPOTS[key];
    const face = face0 + turnAway * Math.PI * 0.85;
    const dx = tx - r.position.x, dz = tz - r.position.z;
    const dist = Math.hypot(dx, dz);
    const moving = dist > 0.06 ? 1 : 0;
    st.moving = damp(st.moving, moving, 8, dt);
    if (moving) {
      const sp2 = Math.min(dist, 1.5 * dt);
      r.position.x += (dx / dist) * sp2;
      r.position.z += (dz / dist) * sp2;
      const heading = Math.atan2(dx, dz);
      let dy = heading - st.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      st.yaw += dy * Math.min(1, dt * 8);
      st.walkPhase += dt * 9;
    } else {
      let dy = face - st.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      st.yaw += dy * Math.min(1, dt * 5);
    }
    r.rotation.y = st.yaw + pointer.x * 0.3; // follows the pointer, like the car and AC models

    // ── celebration jump
    if (win && !st.wasSuccess) { st.jumpV = 4.2; }
    st.wasSuccess = win;
    if (win) {
      st.jumpV -= 9.8 * dt;
      st.jump = Math.max(0, st.jump + st.jumpV * dt);
      if (st.jump === 0 && st.jumpV < 0) st.jumpV = 3.2 * (0.5 + Math.abs(Math.sin(t * 2)) * 0.5);
    } else { st.jump = damp(st.jump, 0, 10, dt); }
    r.position.y = st.jump;

    // ── body
    const breathe = Math.sin(t * 1.6) * 0.012;
    hp.position.y = 0.98 + breathe + Math.sin(t * 0.9 + (variant === 'mechanic' ? 0 : 1.7)) * 0.012 - Math.abs(Math.sin(st.walkPhase)) * 0.03 * st.moving;
    sp.rotation.x = damp(sp.rotation.x, (typing > 0.05 ? 0.28 : 0.04) + pw * 0.1 + err * 0.08, 6, dt);
    sp.rotation.z = Math.sin(st.walkPhase) * 0.05 * st.moving;

    // ── head: looks at the pointer / the form, shakes on error, nods down when hiding eyes
    const look = garage.focus === 'text' ? 0.7 : 0.25;
    const yawT = pointer.x * 0.55 + look * garage.formSide * 0.4 + Math.sin(t * 24) * 0.35 * err;
    hd.rotation.y = damp(hd.rotation.y, pw ? -0.5 : yawT, 6, dt);
    hd.rotation.x = damp(hd.rotation.x, pw ? 0.35 : -pointer.y * 0.25 - err * 0.1, 6, dt);
    if (brow.current) brow.current.rotation.z = damp(brow.current.rotation.z, err * 0.35, 8, dt);

    // ── legs (walk cycle)
    const sw = Math.sin(st.walkPhase) * 0.7 * st.moving;
    hipL.current.rotation.x = sw; hipR.current.rotation.x = -sw;
    knL.current.rotation.x = Math.max(0, -sw) * 0.9; knR.current.rotation.x = Math.max(0, sw) * 0.9;

    // ── arms
    const L = { sx: 0.05, sz: -0.08, ex: -0.1 };
    const R = { sx: 0.05, sz: 0.08, ex: -0.1 };
    // idle sway / walking swing
    L.sx += -sw * 0.8 + Math.sin(t * 1.3) * 0.04; R.sx += sw * 0.8 + Math.sin(t * 1.3 + 1) * 0.04;
    // typing → the right hand works the wrench on the engine
    if (typing > 0.02 && !pw) {
      R.sx = -1.05 + Math.sin(t * 15) * 0.32 * typing; R.ex = -1.0 + Math.sin(t * 15 + 1) * 0.25 * typing; R.sz = 0.25;
      L.sx = -0.6; L.ex = -0.9;
    }
    // password → both hands cover the eyes
    if (pw) { L.sx = -1.25; L.ex = -1.85; L.sz = 0.28; R.sx = -1.25; R.ex = -1.85; R.sz = -0.28; }
    // registration greeting wave
    if (garage.mode === 'register' && !moving && !typing && !pw && !win) {
      if (variant === 'mechanic') { R.sz = 2.35 + Math.sin(t * 7) * 0.25; R.sx = 0; R.ex = -0.35; }
      else { L.sz = -2.35 - Math.sin(t * 7) * 0.25; L.sx = 0; L.ex = -0.35; }
    }
    // error → shoulders drop
    if (err > 0.05) { L.sz -= err * 0.2; R.sz += err * 0.2; }
    // success → both arms up
    if (win) { L.sx = 0; L.sz = -2.7 + Math.sin(t * 10) * 0.2; L.ex = -0.2; R.sx = 0; R.sz = 2.7 - Math.sin(t * 10) * 0.2; R.ex = -0.2; }

    const k = 9;
    shL.current.rotation.x = damp(shL.current.rotation.x, L.sx, k, dt); shL.current.rotation.z = damp(shL.current.rotation.z, L.sz, k, dt); elL.current.rotation.x = damp(elL.current.rotation.x, L.ex, k, dt);
    shR.current.rotation.x = damp(shR.current.rotation.x, R.sx, k, dt); shR.current.rotation.z = damp(shR.current.rotation.z, R.sz, k, dt); elR.current.rotation.x = damp(elR.current.rotation.x, R.ex, k, dt);

    if (ringA.current) ringA.current.rotation.z = t * 0.3 * (variant === 'mechanic' ? 1 : -1);
    if (stage.current) { const pulse = 1 + win * 0.25 + Math.sin(t * 1.6) * 0.03; stage.current.scale.setScalar(pulse); }

    // ── sparks at the tool tip while working
    if (sparks.current && wrench.current) {
      const P = (sparkGeo.getAttribute('position') as THREE.BufferAttribute), C = (sparkGeo.getAttribute('color') as THREE.BufferAttribute);
      const pa = P.array as Float32Array, ca = C.array as Float32Array;
      const tip = new THREE.Vector3(0, -0.28, 0.02);
      wrench.current.localToWorld(tip);
      sparks.current.worldToLocal(tip);
      const active = typing > 0.25 && !pw;
      for (let i = 0; i < N; i++) {
        life.current[i] += dt * 1.8;
        if (life.current[i] >= 1) {
          life.current[i] = active ? 0 : 1;
          if (active) {
            pa[i * 3] = tip.x; pa[i * 3 + 1] = tip.y; pa[i * 3 + 2] = tip.z;
            vel.current[i * 3] = (Math.random() - 0.3) * 1.6; vel.current[i * 3 + 1] = Math.random() * 1.6 + 0.4; vel.current[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
          }
        }
        const l = life.current[i];
        pa[i * 3] += vel.current[i * 3] * dt; pa[i * 3 + 1] += vel.current[i * 3 + 1] * dt; pa[i * 3 + 2] += vel.current[i * 3 + 2] * dt;
        vel.current[i * 3 + 1] -= 4.5 * dt;
        const f = l >= 1 ? 0 : (1 - l);
        ca[i * 3] = V.spark[0] * f; ca[i * 3 + 1] = V.spark[1] * f; ca[i * 3 + 2] = V.spark[2] * f;
      }
      P.needsUpdate = true; C.needsUpdate = true;
    }

    // speech bubble follows scale-in
    if (bubble.current) bubble.current.style.transform = `translateY(${Math.sin(t * 2) * 2}px)`;
  });

  return (
    <group ref={root} position={[SPOTS.login[0], 0, SPOTS.login[1]]} rotation-y={SPOTS.login[2]} scale={0.84}>
      {/* glowing turntable stage (same idea as the landing car) */}
      <group ref={stage}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.012}><circleGeometry args={[1.05, 48]} /><meshBasicMaterial color={V.ring} transparent opacity={0.1} depthWrite={false} toneMapped={false} /></mesh>
        <mesh ref={ringA} rotation-x={-Math.PI / 2} position-y={0.015}><ringGeometry args={[0.86, 0.9, 64, 1]} /><meshBasicMaterial color={V.ring} transparent opacity={0.85} depthWrite={false} toneMapped={false} /></mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={0.015}><ringGeometry args={[1.02, 1.03, 64, 1]} /><meshBasicMaterial color={V.ring} transparent opacity={0.4} depthWrite={false} toneMapped={false} /></mesh>
      </group>
      <group ref={hips} position={[0, 0.98, 0]}>
        {/* pelvis */}
        <mesh position={[0, 0.02, 0]} castShadow><boxGeometry args={[0.36, 0.2, 0.22]} /><meshStandardMaterial color={OVERALL} roughness={0.75} /></mesh>
        {/* tool belt */}
        <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[0.215, 0.215, 0.06, 20]} /><meshStandardMaterial color="#2a1d12" roughness={0.6} /></mesh>
        <mesh position={[0.18, 0.1, 0.06]}><boxGeometry args={[0.07, 0.14, 0.06]} /><meshStandardMaterial color={GLOVE} roughness={0.5} /></mesh>

        {/* legs */}
        {([[-0.1, hipL, knL], [0.1, hipR, knR]] as const).map(([x, hRef, kRef], i) => (
          <group key={i} ref={hRef} position={[x, -0.05, 0]}>
            <Cap r={0.085} len={0.32} y={-0.24} color={OVERALL} />
            <group ref={kRef} position={[0, -0.48, 0]}>
              <Cap r={0.075} len={0.3} y={-0.2} color={OVERALL} />
              <mesh position={[0, -0.43, 0.05]} castShadow><boxGeometry args={[0.15, 0.1, 0.27]} /><meshStandardMaterial color={BOOT} roughness={0.5} /></mesh>
            </group>
          </group>
        ))}

        <group ref={spine}>
          {/* torso */}
          <Cap r={0.2} len={0.34} y={0.36} color={OVERALL} />
          <mesh position={[0, 0.42, 0.185]}><boxGeometry args={[0.3, 0.05, 0.03]} /><meshStandardMaterial color={HAT} emissive={HAT} emissiveIntensity={0.25} /></mesh>
          <mesh position={[0, 0.3, 0.19]}><boxGeometry args={[0.3, 0.05, 0.03]} /><meshStandardMaterial color={HAT} emissive={HAT} emissiveIntensity={0.25} /></mesh>
          <mesh position={[0, 0.6, 0.02]}><cylinderGeometry args={[0.09, 0.1, 0.1, 14]} /><meshStandardMaterial color={SHIRT} /></mesh>

          {variant === 'electrician' && (
            <mesh position={[-0.2, 0.52, 0]} rotation={[0.5, 0.3, 0.9]}><torusGeometry args={[0.13, 0.03, 8, 20]} /><meshStandardMaterial color="#ff9f1c" roughness={0.6} /></mesh>
          )}

          {/* head */}
          <group ref={head} position={[0, 0.82, 0]}>
            <mesh castShadow><sphereGeometry args={[0.165, 24, 20]} /><meshStandardMaterial color={SKIN} roughness={0.6} /></mesh>
            {/* eyes */}
            {[-0.06, 0.06].map((x) => (
              <mesh key={x} position={[x, 0.02, 0.15]}><sphereGeometry args={[0.02, 12, 10]} /><meshStandardMaterial color="#0b0f1a" /></mesh>
            ))}
            <group ref={brow}>
              {[-0.06, 0.06].map((x) => (
                <mesh key={x} position={[x, 0.065, 0.15]} rotation-z={x < 0 ? 0.12 : -0.12}><boxGeometry args={[0.055, 0.012, 0.01]} /><meshStandardMaterial color="#3a2a20" /></mesh>
              ))}
            </group>
            <mesh position={[0, -0.02, 0.165]}><sphereGeometry args={[0.022, 10, 8]} /><meshStandardMaterial color={SKIN} roughness={0.6} /></mesh>
            <mesh position={[0, -0.075, 0.148]} rotation-x={0.1}><boxGeometry args={[0.06, 0.012, 0.01]} /><meshStandardMaterial color="#7a3b32" /></mesh>
            {/* hard hat */}
            <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.185, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={HAT} roughness={0.35} metalness={0.1} /></mesh>
            <mesh position={[0, 0.06, 0.05]}><cylinderGeometry args={[0.2, 0.2, 0.02, 24]} /><meshStandardMaterial color={HAT} roughness={0.35} /></mesh>
            {variant === 'mechanic' ? (
              <mesh position={[0, 0.16, 0.12]} rotation-x={0.3}><boxGeometry args={[0.05, 0.06, 0.05]} /><meshStandardMaterial color="#04162f" /></mesh>
            ) : (
              <>
                <mesh position={[0, 0.17, 0]}><boxGeometry args={[0.05, 0.03, 0.36]} /><meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.3} /></mesh>
                <mesh position={[0, 0.03, 0.15]}><boxGeometry args={[0.27, 0.06, 0.03]} /><meshStandardMaterial color="#8fd0ff" transparent opacity={0.55} roughness={0.1} /></mesh>
              </>
            )}
            {/* speech bubble */}
            {say && <Html position={[0.05, 0.55, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
              <div ref={bubble} style={{ position: 'relative', width: 190, padding: '10px 14px', whiteSpace: 'normal', borderRadius: 16, background: 'rgba(255,255,255,.96)', color: '#04162f', fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, textAlign: 'center', boxShadow: '0 12px 34px rgba(0,0,0,.45)' }}>
                {say}
                <span style={{ position: 'absolute', left: '50%', bottom: -6, width: 12, height: 12, background: 'rgba(255,255,255,.96)', transform: 'translateX(-50%) rotate(45deg)' }} />
              </div>
            </Html>}
          </group>

          {/* arms */}
          {([[-0.285, shL, elL, false], [0.285, shR, elR, true]] as const).map(([x, sRef, eRef, right], i) => (
            <group key={i} ref={sRef} position={[x, 0.6, 0]}>
              <mesh><sphereGeometry args={[0.08, 12, 10]} /><meshStandardMaterial color={OVERALL} /></mesh>
              <Cap r={0.06} len={0.2} y={-0.17} color={SHIRT} />
              <group ref={eRef} position={[0, -0.34, 0]}>
                <Cap r={0.052} len={0.18} y={-0.14} color={SHIRT} />
                <mesh position={[0, -0.28, 0]}><sphereGeometry args={[0.062, 12, 10]} /><meshStandardMaterial color={GLOVE} roughness={0.6} /></mesh>
                {right && (
                  <group ref={wrench} position={[0, -0.3, 0.02]} rotation-x={-0.3}>
                    {variant === 'mechanic' ? (
                      <>
                        <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.035, 0.34, 0.02]} /><meshStandardMaterial color="#b9c6d8" metalness={0.9} roughness={0.25} /></mesh>
                        <mesh position={[0, -0.3, 0]}><torusGeometry args={[0.04, 0.014, 8, 14, Math.PI * 1.6]} /><meshStandardMaterial color="#b9c6d8" metalness={0.9} roughness={0.25} /></mesh>
                      </>
                    ) : (
                      <>
                        <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.028, 0.028, 0.26, 12]} /><meshStandardMaterial color="#ffd60a" roughness={0.4} /></mesh>
                        <mesh position={[0, -0.27, 0]}><cylinderGeometry args={[0.008, 0.008, 0.12, 8]} /><meshStandardMaterial color="#d6dde8" metalness={0.9} roughness={0.2} /></mesh>
                        <mesh position={[0, -0.02, 0.03]}><sphereGeometry args={[0.014, 8, 8]} /><meshBasicMaterial color="#5fa3ea" toneMapped={false} /></mesh>
                      </>
                    )}
                  </group>
                )}
              </group>
            </group>
          ))}
        </group>
      </group>

      {/* sparks live in root space so they inherit the walk */}
      <points ref={sparks} geometry={sparkGeo} frustumCulled={false}>
        <pointsMaterial size={0.05} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}
