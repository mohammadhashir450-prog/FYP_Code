/*
 * CarModel.tsx — Premium 3D Land Cruiser 300 VX.R
 *
 * Animation flow:
 *  1. Exploded view on mount (all parts displaced outward)
 *  2. useGSAP timeline assembles them with staggered back.out / power3.out easing
 *  3. On complete → calls onAssembled() so OrbitControls can begin auto-rotating
 *  4. Material enhancement: body paint, glass, chrome, emissive lights
 */

import { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

// ─── Types ────────────────────────────────────────────────────────────────────
type GLTFResult = GLTF & {
  nodes: {
    TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_021_TMI_Exhaust_030_0:        THREE.Mesh;
    TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_022_TMI_Cabin_A_008_0:        THREE.Mesh;
    TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_023_TMI_Cabin_Leather_A_008_0: THREE.Mesh;
    TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_024_TMI_Cabin_Grid_B_012_0:   THREE.Mesh;
    TSM_Body_101_SM_Body_101_MI_Cabin_A_009_TMI_Glass_011_0:                               THREE.Mesh;
    TSM_Body_101_SM_Body_101_MI_Cabin_A_017_TMI_Cabin_Grid_A_003_0:                        THREE.Mesh;
    TSM_Body_101_SM_Body_101_MI_Cabin_A_023_TMI_1350010001_044_0:                          THREE.Mesh;
    TSM_Body_101_SM_Body_101_MI_Cabin_A_024_Mirror_0:                                      THREE.Mesh;
    TSM_Body_101_SM_Body_101_MI_Cabin_A_027_TMI_Dashboard_007_0:                           THREE.Mesh;
    TSM_Bumper_F_101_SM_Bumper_F_101_MI_1350010001_008_TMI_Logo_007_0:                     THREE.Mesh;
    TSM_Diffuser_B_101_SM_Diffuser_B_101_MI_1350010001_009_TMI_Light_011_0:                THREE.Mesh;
    TSM_Engine_101_SM_Engine_101_MI_Engine_A_001_TMI_Engine_Plastic_A1_0:                  THREE.Mesh;
    TSM_Light_B_101_SM_Light_B_101_MI_Light_012_phong1_0:                                  THREE.Mesh;
    TSK_Suspension_101_001_SK_Suspension_101_001_MI_Exhaust_040_TMI_Suspension_002_0:      THREE.Mesh;
    TSK_Suspension_101_001_SK_Suspension_101_001_MI_Exhaust_041_TMI_Suspension_B1_0:       THREE.Mesh;
    TpolySurface13_TMI_Change_Brake_002_0:                                                  THREE.Mesh;
    TTpolySurface499_rimMI_ChangeA_Rim_002_0:                                               THREE.Mesh;
  };
  materials: {
    TMI_Exhaust_030:          THREE.MeshStandardMaterial;
    TMI_Cabin_A_008:          THREE.MeshStandardMaterial;
    TMI_Cabin_Leather_A_008:  THREE.MeshStandardMaterial;
    TMI_Cabin_Grid_B_012:     THREE.MeshPhysicalMaterial;
    TMI_Glass_011:             THREE.MeshPhysicalMaterial;
    TMI_Cabin_Grid_A_003:     THREE.MeshStandardMaterial;
    TMI_1350010001_044:        THREE.MeshStandardMaterial;
    Mirror:                    THREE.MeshStandardMaterial;
    TMI_Dashboard_007:         THREE.MeshStandardMaterial;
    TMI_Logo_007:              THREE.MeshStandardMaterial;
    TMI_Light_011:             THREE.MeshStandardMaterial;
    TMI_Engine_Plastic_A1:    THREE.MeshStandardMaterial;
    phong1:                    THREE.MeshPhysicalMaterial;
    TMI_Suspension_002:       THREE.MeshStandardMaterial;
    TMI_Suspension_B1:        THREE.MeshStandardMaterial;
    TMI_Change_Brake_002:     THREE.MeshStandardMaterial;
    rimMI_ChangeA_Rim_002:    THREE.MeshStandardMaterial;
  };
};

const MODEL_URL = '/models/land-cruiser-transformed.glb';
useGLTF.preload(MODEL_URL);

// ─── Public interface ─────────────────────────────────────────────────────────
export interface CarModelControls {
  lightsOn: boolean;
  bodyColor: string;
}

interface CarModelProps {
  controls: CarModelControls;
  onAssembled?: () => void;
}

// ─── Explode offsets (initial displaced positions) ────────────────────────────
// Each entry: [x, y, z] offset from origin
const EXPLODE: Record<string, [number, number, number]> = {
  chassis:   [0,  -6,    0],
  body:      [5,   0,    0],
  cabin:     [-4.5, 0,   0],
  leather:   [-3.5, 0,   0],
  cabinGrid: [-4,   0,   0],
  glass:     [0,   5.5,  0],
  dashboard: [-3,  2.5,  0],
  mirror:    [3.5, 1.2,  0],
  bumper:    [0,   0,    5.5],
  diffuser:  [0,   0,   -5.5],
  lightB:    [0,   0,   -4.5],
  engine:    [0,   5.0,  3],
  rim:       [0,  -4.5,  0],
  brake:     [0,  -4.5,  0],
  suspA:     [0,  -3.5,  0],
  suspB:     [0,  -3.5,  0],
};

export default function CarModel({ controls, onAssembled }: CarModelProps) {
  const { nodes, materials } = useGLTF(MODEL_URL) as GLTFResult;

  // ── Mesh refs (one per part) ──────────────────────────────────────────────
  const chassisRef   = useRef<THREE.Mesh>(null!);
  const bodyRef      = useRef<THREE.Mesh>(null!);
  const cabinRef     = useRef<THREE.Mesh>(null!);
  const leatherRef   = useRef<THREE.Mesh>(null!);
  const cabinGridRef = useRef<THREE.Mesh>(null!);
  const glassRef     = useRef<THREE.Mesh>(null!);
  const dashRef      = useRef<THREE.Mesh>(null!);
  const mirrorRef    = useRef<THREE.Mesh>(null!);
  const bumperRef    = useRef<THREE.Mesh>(null!);
  const diffuserRef  = useRef<THREE.Mesh>(null!);
  const lightBRef    = useRef<THREE.Mesh>(null!);
  const engineRef    = useRef<THREE.Mesh>(null!);
  const rimRef       = useRef<THREE.Mesh>(null!);
  const brakeRef     = useRef<THREE.Mesh>(null!);
  const suspARef     = useRef<THREE.Mesh>(null!);
  const suspBRef     = useRef<THREE.Mesh>(null!);
  const gridBRef     = useRef<THREE.Mesh>(null!);  // cabin grid B (no separate explode needed)

  // Wheel refs for spinning after assembly
  const wheelRefs = useRef<THREE.Mesh[]>([]);

  // ── Enhance materials once ────────────────────────────────────────────────
  useMemo(() => {
    // Body paint — deep metallic
    const body = materials.TMI_1350010001_044;
    body.metalness = 0.92;
    body.roughness = 0.10;
    body.envMapIntensity = 2.6;

    // Glass — dark tinted
    const glass = materials.TMI_Glass_011;
    glass.transparent  = true;
    glass.opacity      = 0.76;
    glass.metalness    = 0.95;
    glass.roughness    = 0.03;
    glass.envMapIntensity = 3.2;

    // Chrome mirrors
    materials.Mirror.metalness = 0.98;
    materials.Mirror.roughness = 0.05;
    materials.Mirror.envMapIntensity = 4.2;

    // Rims
    materials.rimMI_ChangeA_Rim_002.metalness = 0.97;
    materials.rimMI_ChangeA_Rim_002.roughness = 0.07;
    materials.rimMI_ChangeA_Rim_002.envMapIntensity = 3.6;

    // Brake disc
    materials.TMI_Change_Brake_002.metalness = 0.82;
    materials.TMI_Change_Brake_002.roughness = 0.30;

    // Exhaust / underbody trim
    materials.TMI_Exhaust_030.metalness = 0.88;
    materials.TMI_Exhaust_030.roughness = 0.18;

    // Leather interior
    materials.TMI_Cabin_Leather_A_008.roughness = 0.68;
    materials.TMI_Cabin_Leather_A_008.metalness  = 0.0;

    // Back light lens — emissive
    const bl = materials.phong1;
    bl.emissive = new THREE.Color('#ff1525');
    bl.emissiveIntensity = 4.5;
    bl.transparent = true;
    bl.opacity     = 0.90;

    // Front light / diffuser glow
    const fl = materials.TMI_Light_011;
    fl.emissive = new THREE.Color('#c8e0ff');
    fl.emissiveIntensity = 5.0;

    // Engine plastic
    materials.TMI_Engine_Plastic_A1.roughness = 0.55;
    materials.TMI_Engine_Plastic_A1.metalness  = 0.15;
  }, [materials]); // eslint-disable-line

  // ── Collect wheel meshes for spinning ────────────────────────────────────
  useEffect(() => {
    wheelRefs.current = [
      nodes.TpolySurface13_TMI_Change_Brake_002_0,
      nodes.TTpolySurface499_rimMI_ChangeA_Rim_002_0,
    ];
  }, [nodes]);

  // ── GSAP Assemble Timeline ────────────────────────────────────────────────
  useGSAP(() => {
    // Guard: all refs must be mounted
    const refs = [
      chassisRef, bodyRef, cabinRef, leatherRef, cabinGridRef,
      glassRef, dashRef, mirrorRef, bumperRef, diffuserRef,
      lightBRef, engineRef, rimRef, brakeRef, suspARef, suspBRef,
    ];
    if (refs.some(r => !r.current)) return;

    const tl = gsap.timeline({ delay: 0.5, onComplete: () => onAssembled?.() });

    // ── Phase 1 (0.0 – 1.2s): Heavy structural parts ──
    tl.to(chassisRef.current.position,
      { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power3.out' }, 0)
      .to(bodyRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.2, ease: 'back.out(1.4)' }, 0.05)
      .to(cabinRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.2, ease: 'back.out(1.4)' }, 0.08)
      .to(leatherRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.1, ease: 'power3.out' }, 0.10)
      .to(cabinGridRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.1, ease: 'power2.out' }, 0.12);

    // ── Phase 2 (0.30 – 1.4s): Glass & interior ──
    tl.to(glassRef.current.position,
      { x: 0, y: 0, z: 0, duration: 1.05, ease: 'power3.out' }, 0.30)
      .to(dashRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power2.out' }, 0.38);

    // ── Phase 3 (0.50 – 1.55s): Front & rear panels ──
    tl.to(bumperRef.current.position,
      { x: 0, y: 0, z: 0, duration: 1.0, ease: 'back.out(1.7)' }, 0.50)
      .to(diffuserRef.current.position,
        { x: 0, y: 0, z: 0, duration: 1.0, ease: 'back.out(1.7)' }, 0.52)
      .to(lightBRef.current.position,
        { x: 0, y: 0, z: 0, duration: 0.9, ease: 'power3.out' }, 0.58);

    // ── Phase 4 (0.68 – 1.7s): Engine drops in ──
    tl.to(engineRef.current.position,
      { x: 0, y: 0, z: 0, duration: 1.05, ease: 'back.out(1.2)' }, 0.68);

    // ── Phase 5 (0.82 – 1.75s): Wheels & suspension rise ──
    tl.to(rimRef.current.position,
      { x: EXPLODE.rim[0], y: 0, z: EXPLODE.rim[2], duration: 1.0, ease: 'back.out(2.0)' }, 0.82)
      .to(brakeRef.current.position,
        { x: EXPLODE.brake[0], y: 0, z: EXPLODE.brake[2], duration: 0.9, ease: 'power3.out' }, 0.85)
      .to(suspARef.current.position,
        { x: 0, y: 0, z: 0, duration: 0.85, ease: 'power2.out' }, 0.88)
      .to(suspBRef.current.position,
        { x: 0, y: 0, z: 0, duration: 0.85, ease: 'power2.out' }, 0.90);

    // ── Phase 6 (1.48s): Mirror snaps in — assembly COMPLETE ──
    tl.to(mirrorRef.current.position,
      { x: 0, y: 0, z: 0, duration: 0.7, ease: 'back.out(2.5)' }, 1.48);
  });

  // ── Light on/off ──────────────────────────────────────────────────────────
  useEffect(() => {
    materials.phong1.emissiveIntensity       = controls.lightsOn ? 4.5 : 0;
    materials.phong1.needsUpdate             = true;
    materials.TMI_Light_011.emissiveIntensity = controls.lightsOn ? 5.0 : 0;
    materials.TMI_Light_011.needsUpdate       = true;
  }, [controls.lightsOn, materials]);

  // ── Body color ────────────────────────────────────────────────────────────
  useEffect(() => {
    materials.TMI_1350010001_044.color.set(controls.bodyColor);
    materials.TMI_1350010001_044.needsUpdate = true;
  }, [controls.bodyColor, materials]);

  // ── Wheel spin (continuous post-assembly) ─────────────────────────────────
  useFrame(() => {
    wheelRefs.current.forEach(w => {
      if (w) w.rotation.x -= 0.012;
    });
  });

  // ─── Convenience: initial position setter ─────────────────────────────────
  function ep(key: string): [number, number, number] {
    return EXPLODE[key] ?? [0, 0, 0];
  }

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <group dispose={null}>

      {/* ── Chassis / underbody ── */}
      <mesh
        ref={chassisRef}
        geometry={nodes.TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_021_TMI_Exhaust_030_0.geometry}
        material={materials.TMI_Exhaust_030}
        position={ep('chassis')}
        scale={0.01}
        castShadow receiveShadow
      />

      {/* ── Cabin interior A ── */}
      <mesh
        ref={cabinRef}
        geometry={nodes.TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_022_TMI_Cabin_A_008_0.geometry}
        material={materials.TMI_Cabin_A_008}
        position={ep('cabin')}
        scale={0.01}
        castShadow
      />

      {/* ── Leather interior ── */}
      <mesh
        ref={leatherRef}
        geometry={nodes.TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_023_TMI_Cabin_Leather_A_008_0.geometry}
        material={materials.TMI_Cabin_Leather_A_008}
        position={ep('leather')}
        scale={0.01}
        castShadow
      />

      {/* ── Cabin grid ── */}
      <mesh
        ref={cabinGridRef}
        geometry={nodes.TSK_Body_Bones_101_001_SK_Body_Bones_101_001_MI_Exhaust_024_TMI_Cabin_Grid_B_012_0.geometry}
        material={materials.TMI_Cabin_Grid_B_012}
        position={ep('cabinGrid')}
        scale={0.01}
        castShadow
      />

      {/* ── Glass ── */}
      <mesh
        ref={glassRef}
        geometry={nodes.TSM_Body_101_SM_Body_101_MI_Cabin_A_009_TMI_Glass_011_0.geometry}
        material={materials.TMI_Glass_011}
        position={ep('glass')}
        scale={0.01}
        castShadow
      />

      {/* ── Cabin grid B (no separate explode) ── */}
      <mesh
        ref={gridBRef}
        geometry={nodes.TSM_Body_101_SM_Body_101_MI_Cabin_A_017_TMI_Cabin_Grid_A_003_0.geometry}
        material={materials.TMI_Cabin_Grid_A_003}
        scale={0.01}
        castShadow
      />

      {/* ── Body shell (main painted surface) ── */}
      <mesh
        ref={bodyRef}
        geometry={nodes.TSM_Body_101_SM_Body_101_MI_Cabin_A_023_TMI_1350010001_044_0.geometry}
        material={materials.TMI_1350010001_044}
        position={ep('body')}
        scale={0.01}
        castShadow receiveShadow
      />

      {/* ── Chrome side mirrors ── */}
      <mesh
        ref={mirrorRef}
        geometry={nodes.TSM_Body_101_SM_Body_101_MI_Cabin_A_024_Mirror_0.geometry}
        material={materials.Mirror}
        position={ep('mirror')}
        scale={0.01}
        castShadow
      />

      {/* ── Dashboard ── */}
      <mesh
        ref={dashRef}
        geometry={nodes.TSM_Body_101_SM_Body_101_MI_Cabin_A_027_TMI_Dashboard_007_0.geometry}
        material={materials.TMI_Dashboard_007}
        position={ep('dashboard')}
        scale={0.01}
        castShadow
      />

      {/* ── Front bumper & Toyota badge ── */}
      <mesh
        ref={bumperRef}
        geometry={nodes.TSM_Bumper_F_101_SM_Bumper_F_101_MI_1350010001_008_TMI_Logo_007_0.geometry}
        material={materials.TMI_Logo_007}
        position={ep('bumper')}
        scale={0.01}
        castShadow
      />

      {/* ── Rear diffuser / front DRL accent ── */}
      <mesh
        ref={diffuserRef}
        geometry={nodes.TSM_Diffuser_B_101_SM_Diffuser_B_101_MI_1350010001_009_TMI_Light_011_0.geometry}
        material={materials.TMI_Light_011}
        position={ep('diffuser')}
        scale={0.01}
        castShadow
      />

      {/* ── Engine block ── */}
      <mesh
        ref={engineRef}
        geometry={nodes.TSM_Engine_101_SM_Engine_101_MI_Engine_A_001_TMI_Engine_Plastic_A1_0.geometry}
        material={materials.TMI_Engine_Plastic_A1}
        position={ep('engine')}
        scale={0.01}
        castShadow
      />

      {/* ── Rear light lens (emissive red) ── */}
      <mesh
        ref={lightBRef}
        geometry={nodes.TSM_Light_B_101_SM_Light_B_101_MI_Light_012_phong1_0.geometry}
        material={materials.phong1}
        position={ep('lightB')}
        scale={0.01}
        castShadow
      />

      {/* ── Suspension A ── */}
      <mesh
        ref={suspARef}
        geometry={nodes.TSK_Suspension_101_001_SK_Suspension_101_001_MI_Exhaust_040_TMI_Suspension_002_0.geometry}
        material={materials.TMI_Suspension_002}
        position={ep('suspA')}
        scale={0.01}
        castShadow
      />

      {/* ── Suspension B ── */}
      <mesh
        ref={suspBRef}
        geometry={nodes.TSK_Suspension_101_001_SK_Suspension_101_001_MI_Exhaust_041_TMI_Suspension_B1_0.geometry}
        material={materials.TMI_Suspension_B1}
        position={ep('suspB')}
        scale={0.01}
        castShadow
      />

      {/* ── Brake discs ── */}
      <mesh
        ref={brakeRef}
        geometry={nodes.TpolySurface13_TMI_Change_Brake_002_0.geometry}
        material={materials.TMI_Change_Brake_002}
        position={[EXPLODE.brake[0] - 0.008, EXPLODE.brake[1] + 0.004, EXPLODE.brake[2] - 0.013]}
        scale={0.01}
        castShadow
      />

      {/* ── Rims ── */}
      <mesh
        ref={rimRef}
        geometry={nodes.TTpolySurface499_rimMI_ChangeA_Rim_002_0.geometry}
        material={materials.rimMI_ChangeA_Rim_002}
        position={[EXPLODE.rim[0] - 0.008, EXPLODE.rim[1] + 0.004, EXPLODE.rim[2] - 0.013]}
        scale={0.01}
        castShadow
      />
    </group>
  );
}
