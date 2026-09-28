import { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';

// Preload the GLTF immediately
useGLTF.preload('/models/land-cruiser.glb');

// Interpolation utilities
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};

export interface CarModelControls {
  doorsOpen: boolean;
  hoodOpen: boolean;
  trunkOpen: boolean;
  lightsOn: boolean;
  currentColor: CarColorOption;
  manualInspectionMode: boolean;
}

interface CarModelProps {
  scrollProgressRef: React.MutableRefObject<number>;
  controls: CarModelControls;
  onPhaseChange?: (phase: number) => void;
}

export default function CarModel({ scrollProgressRef, controls, onPhaseChange }: CarModelProps) {
  const { scene } = useGLTF('/models/land-cruiser.glb');
  const groupRef = useRef<THREE.Group>(null!);
  const currentPhaseRef = useRef<number>(0);

  // References to animated pivot groups
  const pivots = useRef<{
    doorFL: THREE.Group | null;
    doorFR: THREE.Group | null;
    doorBL: THREE.Group | null;
    doorBR: THREE.Group | null;
    hood: THREE.Group | null;
    trunk: THREE.Group | null;
    wheels: THREE.Object3D[];
    lightsFront: THREE.MeshStandardMaterial[];
    lightsBack: THREE.MeshStandardMaterial[];
    bodyMaterials: THREE.MeshStandardMaterial[];
    engineGroup: THREE.Group | null;
  }>({
    doorFL: null,
    doorFR: null,
    doorBL: null,
    doorBR: null,
    hood: null,
    trunk: null,
    wheels: [],
    lightsFront: [],
    lightsBack: [],
    bodyMaterials: [],
    engineGroup: null,
  });

  const { camera } = useThree();

  // ── Auto-scale and Auto-center with Box3 + Setup Pivot Hinge Hierarchies ──
  const initialized = useRef(false);

  useMemo(() => {
    if (initialized.current) return;

    // 1. Compute original bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Normalize scale so longest edge fits 4.8 units
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = 4.8 / maxDim;
    scene.scale.setScalar(targetScale);

    // Re-center around bottom contact
    scene.position.x = -center.x * targetScale;
    scene.position.y = -box.min.y * targetScale; // place wheels at y = 0
    scene.position.z = -center.z * targetScale;

    // 2. Discover nodes & assign material enhancements
    const p = pivots.current;
    const doorFL_Objects: THREE.Object3D[] = [];
    const doorFR_Objects: THREE.Object3D[] = [];
    const doorBL_Objects: THREE.Object3D[] = [];
    const doorBR_Objects: THREE.Object3D[] = [];
    const hood_Objects: THREE.Object3D[] = [];
    const trunk_Objects: THREE.Object3D[] = [];
    const engine_Objects: THREE.Object3D[] = [];
    const wheelList: THREE.Object3D[] = [];

    scene.traverse((child) => {
      const name = child.name || '';
      const nameLower = name.toLowerCase();

      // Check for Wheels (W1, W2, W3, W4 or Tyre)
      if (
        name.includes(':W1') ||
        name.includes(':W2') ||
        name.includes(':W3') ||
        name.includes(':W4') ||
        nameLower.includes('wheel') ||
        nameLower.includes('sk_tyre')
      ) {
        if (!wheelList.includes(child)) {
          wheelList.push(child);
        }
      }

      // Check Doors
      if (name.includes('SK_Door_FL')) doorFL_Objects.push(child);
      else if (name.includes('SK_Door_FR')) doorFR_Objects.push(child);
      else if (name.includes('SK_Door_BL')) doorBL_Objects.push(child);
      else if (name.includes('SK_Door_BR')) doorBR_Objects.push(child);
      else if (name.includes('SK_Hood')) hood_Objects.push(child);
      else if (name.includes('SK_Trunk')) trunk_Objects.push(child);
      else if (name.includes('SM_Engine')) engine_Objects.push(child);

      // Enhance Mesh Materials
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mats = Array.isArray(mesh.material)
          ? (mesh.material as THREE.MeshStandardMaterial[])
          : [mesh.material as THREE.MeshStandardMaterial];

        mats.forEach((mat) => {
          if (!mat || !mat.isMeshStandardMaterial) return;

          mat.envMapIntensity = 2.4;

          const matName = (mat.name || '').toLowerCase();

          // Body paint material
          if (
            matName.includes('1350010001_044') ||
            matName.includes('body') ||
            matName.includes('paint')
          ) {
            mat.roughness = 0.18;
            mat.metalness = 0.9;
            if ('clearcoat' in mat) {
              (mat as unknown as { clearcoat: number; clearcoatRoughness: number }).clearcoat = 1.0;
              (mat as unknown as { clearcoat: number; clearcoatRoughness: number }).clearcoatRoughness = 0.05;
            }
            if (!p.bodyMaterials.includes(mat)) {
              p.bodyMaterials.push(mat);
            }
          }

          // Glass & Windshield
          if (matName.includes('glass')) {
            mat.transparent = true;
            mat.opacity = 0.88;
            mat.roughness = 0.05;
            mat.metalness = 0.9;
            mat.envMapIntensity = 3.0;
          }

          // Chrome / Rims / Exhaust
          if (matName.includes('rim') || matName.includes('exhaust') || matName.includes('mirror')) {
            mat.roughness = 0.1;
            mat.metalness = 0.98;
            mat.envMapIntensity = 3.5;
          }

          // Headlights
          if (
            matName.includes('light_005') ||
            name.includes('SM_Light_F') ||
            matName.includes('light_f')
          ) {
            if (!p.lightsFront.includes(mat)) p.lightsFront.push(mat);
          }

          // Taillights
          if (
            matName.includes('light_011') ||
            matName.includes('light_015') ||
            name.includes('SM_Light_B') ||
            matName.includes('light_b')
          ) {
            if (!p.lightsBack.includes(mat)) p.lightsBack.push(mat);
          }
        });
      }
    });

    p.wheels = wheelList;

    // Helper to wrap child nodes into a hinge pivot
    const createPivotGroup = (
      objects: THREE.Object3D[],
      hingeOffset: THREE.Vector3
    ): THREE.Group | null => {
      if (objects.length === 0) return null;
      const pivot = new THREE.Group();
      pivot.name = 'HingePivot';
      pivot.position.copy(hingeOffset);

      // Parent pivot to scene
      scene.add(pivot);

      objects.forEach((obj) => {
        // Only reparent direct children of root
        if (obj.parent === scene) {
          obj.position.sub(hingeOffset);
          pivot.add(obj);
        }
      });
      return pivot;
    };

    // Calculate approximate model space hinges
    p.doorFL = createPivotGroup(doorFL_Objects, new THREE.Vector3(0.95, 1.0, 0.9));
    p.doorFR = createPivotGroup(doorFR_Objects, new THREE.Vector3(-0.95, 1.0, 0.9));
    p.doorBL = createPivotGroup(doorBL_Objects, new THREE.Vector3(0.95, 1.0, -0.15));
    p.doorBR = createPivotGroup(doorBR_Objects, new THREE.Vector3(-0.95, 1.0, -0.15));
    p.hood = createPivotGroup(hood_Objects, new THREE.Vector3(0, 1.25, 1.05));
    p.trunk = createPivotGroup(trunk_Objects, new THREE.Vector3(0, 1.82, -2.0));

    initialized.current = true;
  }, [scene]);

  // ── Update Paint Color in Realtime ──
  useEffect(() => {
    const colorHex = new THREE.Color(controls.currentColor.hex);
    pivots.current.bodyMaterials.forEach((mat) => {
      mat.color.copy(colorHex);
      mat.roughness = controls.currentColor.roughness;
      mat.metalness = controls.currentColor.metalness;
      mat.needsUpdate = true;
    });
  }, [controls.currentColor]);

  // ── Headlights and Taillights Emissive Glow ──
  useEffect(() => {
    const p = pivots.current;
    const frontGlow = controls.lightsOn ? new THREE.Color('#d4e8ff') : new THREE.Color('#000000');
    const backGlow = controls.lightsOn ? new THREE.Color('#ff1a2a') : new THREE.Color('#000000');

    p.lightsFront.forEach((mat) => {
      mat.emissive.copy(frontGlow);
      mat.emissiveIntensity = controls.lightsOn ? 4.5 : 0;
      mat.needsUpdate = true;
    });

    p.lightsBack.forEach((mat) => {
      mat.emissive.copy(backGlow);
      mat.emissiveIntensity = controls.lightsOn ? 4.0 : 0;
      mat.needsUpdate = true;
    });
  }, [controls.lightsOn]);

  // ── Per-Frame Animation Choreography ──
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const p = pivots.current;
    const t = clock.getElapsedTime();
    const sp = scrollProgressRef.current; // 0.0 → 1.0

    // Determine current phase for HUD
    let currentPhase = 0;
    if (sp < 0.16) currentPhase = 0;
    else if (sp < 0.36) currentPhase = 1;
    else if (sp < 0.54) currentPhase = 2;
    else if (sp < 0.72) currentPhase = 3;
    else if (sp < 0.88) currentPhase = 4;
    else currentPhase = 5;

    if (currentPhase !== currentPhaseRef.current) {
      currentPhaseRef.current = currentPhase;
      onPhaseChange?.(currentPhase);
    }

    // If manual inspection mode is active (user interacted via HUD buttons), prioritize manual states
    if (controls.manualInspectionMode) {
      const doorAngle = controls.doorsOpen ? Math.PI / 2.3 : 0;
      const hoodAngle = controls.hoodOpen ? Math.PI / 3.4 : 0;
      const trunkAngle = controls.trunkOpen ? Math.PI / 2.5 : 0;

      if (p.doorFL) p.doorFL.rotation.y = lerp(p.doorFL.rotation.y, doorAngle, 0.1);
      if (p.doorFR) p.doorFR.rotation.y = lerp(p.doorFR.rotation.y, -doorAngle, 0.1);
      if (p.doorBL) p.doorBL.rotation.y = lerp(p.doorBL.rotation.y, doorAngle * 0.85, 0.1);
      if (p.doorBR) p.doorBR.rotation.y = lerp(p.doorBR.rotation.y, -doorAngle * 0.85, 0.1);
      if (p.hood) p.hood.rotation.x = lerp(p.hood.rotation.x, -hoodAngle, 0.1);
      if (p.trunk) p.trunk.rotation.x = lerp(p.trunk.rotation.x, trunkAngle, 0.1);

      // Slow idle orbit
      groupRef.current.rotation.y = Math.PI * 0.25 + Math.sin(t * 0.2) * 0.1;
      groupRef.current.position.set(0, -0.4, 0);
      groupRef.current.scale.setScalar(1.0);
      return;
    }

    // ── CHOREOGRAPHY TIMELINE (Scroll 0.00 → 1.00) ──

    // 1. Transform: Position & Scale (Intro Float-in & Parallax)
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetScale = 1.0;
    let targetRotY = 0;
    let targetRotX = 0;
    let targetRotZ = 0;

    if (sp < 0.16) {
      // Phase 0: Hero Entrance (Ascent from ground, heroic front-three-quarters)
      const p0 = smoothstep(0, 0.15, sp);
      targetY = lerp(-2.0, -0.4, p0);
      targetScale = lerp(0.55, 1.0, p0);
      targetRotY = lerp(-0.7, 0.35, p0);
      targetRotX = lerp(0.12, 0.0, p0);
      targetX = lerp(0.5, 0.3, p0);
    } else if (sp < 0.36) {
      // Phase 1: Sculpted Aerodynamics (Glides across, 180° rotation)
      const p1 = smoothstep(0.16, 0.36, sp);
      targetY = -0.4;
      targetScale = 1.05;
      targetRotY = lerp(0.35, Math.PI + 0.3, p1);
      targetX = lerp(0.3, -0.6, p1);
      targetZ = lerp(0, -0.4, p1);
    } else if (sp < 0.54) {
      // Phase 2: Executive Cabin & 4-Door Reveal (Side angle, doors open)
      const p2 = smoothstep(0.36, 0.54, sp);
      targetY = -0.4;
      targetScale = 1.15;
      targetRotY = lerp(Math.PI + 0.3, Math.PI * 1.55, p2);
      targetX = lerp(-0.6, 0.45, p2);
      targetRotX = 0.02;
    } else if (sp < 0.72) {
      // Phase 3: V6 Twin-Turbocharged Powertrain (Front view, hood opens)
      const p3 = smoothstep(0.54, 0.72, sp);
      targetY = -0.4;
      targetScale = 1.2;
      targetRotY = lerp(Math.PI * 1.55, Math.PI * 2.05, p3);
      targetX = lerp(0.45, -0.35, p3);
      targetRotX = -0.05; // tilt front down towards camera
    } else if (sp < 0.88) {
      // Phase 4: Command Tailgate & Luxury Utility (Rear 3/4 view, trunk lifts)
      const p4 = smoothstep(0.72, 0.88, sp);
      targetY = -0.4;
      targetScale = 1.12;
      targetRotY = lerp(Math.PI * 2.05, Math.PI * 2.85, p4);
      targetX = lerp(-0.35, 0.4, p4);
      targetRotX = 0.04;
    } else {
      // Phase 5: High Velocity Dominance (Drop suspension, wheel burnout, launch)
      const p5 = smoothstep(0.88, 1.0, sp);
      targetY = lerp(-0.4, -0.46, p5); // squat down on suspension
      targetScale = lerp(1.12, 1.02, p5);
      targetRotY = lerp(Math.PI * 2.85, Math.PI * 3.3, p5);
      targetX = lerp(0.4, 0.0, p5);
      targetRotX = lerp(0.04, -0.02, p5);
    }

    // Smooth lerping for cinematic buttery feel
    groupRef.current.position.x = lerp(groupRef.current.position.x, targetX, 0.08);
    groupRef.current.position.y = lerp(groupRef.current.position.y, targetY + Math.sin(t * 0.8) * 0.02, 0.08);
    groupRef.current.position.z = lerp(groupRef.current.position.z, targetZ, 0.08);
    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetRotY, 0.08);
    groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    groupRef.current.rotation.z = lerp(groupRef.current.rotation.z, targetRotZ, 0.08);

    const currentScale = groupRef.current.scale.x;
    const smoothedScale = lerp(currentScale, targetScale, 0.08);
    groupRef.current.scale.setScalar(smoothedScale);

    // ── DOORS ANIMATION (Phase 2: 0.38 → 0.52) ──
    let doorProgress = 0;
    if (sp >= 0.38 && sp <= 0.46) {
      doorProgress = smoothstep(0.38, 0.44, sp); // open
    } else if (sp > 0.46 && sp <= 0.52) {
      doorProgress = 1 - smoothstep(0.46, 0.52, sp); // close
    }
    const doorAngle = doorProgress * (Math.PI / 2.3);

    if (p.doorFL) p.doorFL.rotation.y = lerp(p.doorFL.rotation.y, doorAngle, 0.1);
    if (p.doorFR) p.doorFR.rotation.y = lerp(p.doorFR.rotation.y, -doorAngle, 0.1);
    if (p.doorBL) p.doorBL.rotation.y = lerp(p.doorBL.rotation.y, doorAngle * 0.85, 0.1);
    if (p.doorBR) p.doorBR.rotation.y = lerp(p.doorBR.rotation.y, -doorAngle * 0.85, 0.1);

    // ── HOOD ANIMATION (Phase 3: 0.56 → 0.70) ──
    let hoodProgress = 0;
    if (sp >= 0.56 && sp <= 0.64) {
      hoodProgress = smoothstep(0.56, 0.62, sp); // open
    } else if (sp > 0.64 && sp <= 0.7) {
      hoodProgress = 1 - smoothstep(0.64, 0.7, sp); // close
    }
    const hoodAngle = hoodProgress * (Math.PI / 3.4);
    if (p.hood) p.hood.rotation.x = lerp(p.hood.rotation.x, -hoodAngle, 0.1);

    // ── TRUNK ANIMATION (Phase 4: 0.74 → 0.86) ──
    let trunkProgress = 0;
    if (sp >= 0.74 && sp <= 0.81) {
      trunkProgress = smoothstep(0.74, 0.79, sp);
    } else if (sp > 0.81 && sp <= 0.86) {
      trunkProgress = 1 - smoothstep(0.81, 0.86, sp);
    }
    const trunkAngle = trunkProgress * (Math.PI / 2.5);
    if (p.trunk) p.trunk.rotation.x = lerp(p.trunk.rotation.x, trunkAngle, 0.1);

    // ── WHEEL SPIN ANIMATION (High speed spin in Phase 5 & gentle roll on scroll) ──
    const isLaunchPhase = sp >= 0.88;
    const spinMultiplier = isLaunchPhase ? 28 : lerp(2.0, 10.0, sp);
    p.wheels.forEach((wheel) => {
      wheel.rotation.x += 0.04 * spinMultiplier;
    });

    // ── Dynamic Camera LookAt and Floating Subtle Drift ──
    camera.lookAt(
      lerp(0, targetX * 0.5, 0.05),
      lerp(0.8, targetY + 0.8, 0.05),
      0
    );
  });

  return (
    <group ref={groupRef} position={[0, -2.0, 0]} scale={0.5}>
      <primitive object={scene} />
    </group>
  );
}
