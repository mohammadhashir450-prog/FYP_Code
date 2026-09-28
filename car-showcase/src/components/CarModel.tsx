import { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';

useGLTF.preload('/models/land-cruiser.glb');

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
  const { camera } = useThree();

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
  });

  const initialized = useRef(false);

  useMemo(() => {
    if (initialized.current) return;

    // 1. Auto-center and normalize scale with Box3
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = 4.8 / maxDim;
    scene.scale.setScalar(targetScale);

    scene.position.x = -center.x * targetScale;
    scene.position.y = -box.min.y * targetScale; // wheels sit on ground
    scene.position.z = -center.z * targetScale;

    // 2. Discover nodes & collect meshes
    const p = pivots.current;
    const doorFL_Objects: THREE.Object3D[] = [];
    const doorFR_Objects: THREE.Object3D[] = [];
    const doorBL_Objects: THREE.Object3D[] = [];
    const doorBR_Objects: THREE.Object3D[] = [];
    const hood_Objects: THREE.Object3D[] = [];
    const trunk_Objects: THREE.Object3D[] = [];
    const wheelList: THREE.Object3D[] = [];

    scene.traverse((child) => {
      const name = child.name || '';
      const nameLower = name.toLowerCase();

      if (
        name.includes(':W1') ||
        name.includes(':W2') ||
        name.includes(':W3') ||
        name.includes(':W4') ||
        nameLower.includes('wheel') ||
        nameLower.includes('sk_tyre')
      ) {
        if (!wheelList.includes(child)) wheelList.push(child);
      }

      if (name.includes('SK_Door_FL')) doorFL_Objects.push(child);
      else if (name.includes('SK_Door_FR')) doorFR_Objects.push(child);
      else if (name.includes('SK_Door_BL')) doorBL_Objects.push(child);
      else if (name.includes('SK_Door_BR')) doorBR_Objects.push(child);
      else if (name.includes('SK_Hood')) hood_Objects.push(child);
      else if (name.includes('SK_Trunk')) trunk_Objects.push(child);

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
          if (
            matName.includes('1350010001_044') ||
            matName.includes('body') ||
            matName.includes('paint')
          ) {
            mat.roughness = 0.18;
            mat.metalness = 0.9;
            if (!p.bodyMaterials.includes(mat)) p.bodyMaterials.push(mat);
          }

          if (matName.includes('glass')) {
            mat.transparent = true;
            mat.opacity = 0.88;
            mat.roughness = 0.05;
            mat.metalness = 0.9;
          }

          if (matName.includes('rim') || matName.includes('exhaust') || matName.includes('mirror')) {
            mat.roughness = 0.12;
            mat.metalness = 0.98;
          }

          if (matName.includes('light_005') || name.includes('SM_Light_F')) {
            if (!p.lightsFront.includes(mat)) p.lightsFront.push(mat);
          }
          if (matName.includes('light_011') || matName.includes('light_015') || name.includes('SM_Light_B')) {
            if (!p.lightsBack.includes(mat)) p.lightsBack.push(mat);
          }
        });
      }
    });

    p.wheels = wheelList;

    const createPivotGroup = (objects: THREE.Object3D[], hingeOffset: THREE.Vector3): THREE.Group | null => {
      if (objects.length === 0) return null;
      const pivot = new THREE.Group();
      pivot.name = 'HingePivot';
      pivot.position.copy(hingeOffset);
      scene.add(pivot);

      objects.forEach((obj) => {
        if (obj.parent === scene) {
          obj.position.sub(hingeOffset);
          pivot.add(obj);
        }
      });
      return pivot;
    };

    p.doorFL = createPivotGroup(doorFL_Objects, new THREE.Vector3(0.95, 1.0, 0.9));
    p.doorFR = createPivotGroup(doorFR_Objects, new THREE.Vector3(-0.95, 1.0, 0.9));
    p.doorBL = createPivotGroup(doorBL_Objects, new THREE.Vector3(0.95, 1.0, -0.15));
    p.doorBR = createPivotGroup(doorBR_Objects, new THREE.Vector3(-0.95, 1.0, -0.15));
    p.hood = createPivotGroup(hood_Objects, new THREE.Vector3(0, 1.25, 1.05));
    p.trunk = createPivotGroup(trunk_Objects, new THREE.Vector3(0, 1.82, -2.0));

    initialized.current = true;
  }, [scene]);

  // Update Paint Color
  useEffect(() => {
    const colorHex = new THREE.Color(controls.currentColor.hex);
    pivots.current.bodyMaterials.forEach((mat) => {
      mat.color.copy(colorHex);
      mat.roughness = controls.currentColor.roughness;
      mat.metalness = controls.currentColor.metalness;
      mat.needsUpdate = true;
    });
  }, [controls.currentColor]);

  // Headlights & Taillights
  useEffect(() => {
    const p = pivots.current;
    const frontGlow = controls.lightsOn ? new THREE.Color('#d8ebff') : new THREE.Color('#000000');
    const backGlow = controls.lightsOn ? new THREE.Color('#ff1828') : new THREE.Color('#000000');

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

  // ── Per-Frame Choreography (6 Targeted Sections) ──
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const p = pivots.current;
    const t = clock.getElapsedTime();
    const sp = scrollProgressRef.current; // 0.0 → 1.0

    // Section 1: 0.00 → 0.16 (Hero)
    // Section 2: 0.17 → 0.35 (Design)
    // Section 3: 0.36 → 0.52 (Interior / Doors)
    // Section 4: 0.53 → 0.70 (Engine / Top-down)
    // Section 5: 0.71 → 0.86 (Wheels / Low)
    // Section 6: 0.87 → 1.00 (Final CTA / Return to Hero)

    let currentPhase = 0;
    if (sp < 0.17) currentPhase = 0;
    else if (sp < 0.36) currentPhase = 1;
    else if (sp < 0.53) currentPhase = 2;
    else if (sp < 0.71) currentPhase = 3;
    else if (sp < 0.87) currentPhase = 4;
    else currentPhase = 5;

    if (currentPhase !== currentPhaseRef.current) {
      currentPhaseRef.current = currentPhase;
      onPhaseChange?.(currentPhase);
    }

    if (controls.manualInspectionMode) {
      const doorAngle = controls.doorsOpen ? Math.PI / 2.3 : 0;
      const hoodAngle = controls.hoodOpen ? Math.PI / 3.4 : 0;
      const trunkAngle = controls.trunkOpen ? Math.PI / 2.5 : 0;

      if (p.doorFL) p.doorFL.rotation.y = lerp(p.doorFL.rotation.y, doorAngle, 0.1);
      if (p.doorFR) p.doorFR.rotation.y = lerp(p.doorFR.rotation.y, -doorAngle, 0.1);
      if (p.hood) p.hood.rotation.x = lerp(p.hood.rotation.x, -hoodAngle, 0.1);
      if (p.trunk) p.trunk.rotation.x = lerp(p.trunk.rotation.x, trunkAngle, 0.1);
      return;
    }

    // ── Target Positions & Rotations ──
    let carX = 0;
    let carY = -0.4;
    let carZ = 0;
    let carRotY = 0.42; // Hero 3/4 front
    let carRotX = 0;
    let carScale = 1.0;

    let camX = 0;
    let camY = 1.1;
    let camZ = 5.2;
    let lookX = 0.15;
    let lookY = 0.5;
    let lookZ = 0;

    let doorAngle = 0;
    let hoodAngle = 0;
    let wheelSpinRate = 1.5;

    if (sp < 0.17) {
      // ──────────────────────────────────────────────────────────
      // 1. HERO: 3/4 front view, popping out, subtle floating idle
      // ──────────────────────────────────────────────────────────
      const s1 = smoothstep(0, 0.16, sp);
      const idleFloat = Math.sin(t * 1.4) * 0.035;

      carX = 0.35;
      carY = -0.4 + idleFloat;
      carZ = 0.35; // slightly forward for "popping" out feel
      carRotY = 0.42 + Math.sin(t * 0.5) * 0.02; // subtle breathe
      carRotX = 0.02;
      carScale = 1.06;

      camX = 0;
      camY = 1.15;
      camZ = 5.2;
      lookX = 0.2;
      lookY = 0.55;
      lookZ = 0;
    } else if (sp < 0.36) {
      // ──────────────────────────────────────────────────────────
      // 2. DESIGN: Car rotates to side profile, text left, cards right
      // ──────────────────────────────────────────────────────────
      const s2 = smoothstep(0.17, 0.35, sp);
      carX = lerp(0.35, 0.0, s2);
      carY = -0.4;
      carZ = lerp(0.35, -0.1, s2);
      carRotY = lerp(0.42, Math.PI * 0.52, s2); // 90° pure side profile
      carRotX = 0;
      carScale = 1.08;

      camX = lerp(0, -0.1, s2);
      camY = lerp(1.15, 0.95, s2);
      camZ = lerp(5.2, 4.9, s2);
      lookX = 0;
      lookY = 0.6;
      lookZ = 0;
    } else if (sp < 0.53) {
      // ──────────────────────────────────────────────────────────
      // 3. INTERIOR/DOORS: Front doors open, camera moves closer
      // ──────────────────────────────────────────────────────────
      const s3 = smoothstep(0.36, 0.52, sp);
      
      // Doors open smoothly to 65 degrees
      const doorOpenCurve = Math.sin(s3 * Math.PI);
      doorAngle = doorOpenCurve * (Math.PI / 2.6);

      carX = 0.2;
      carY = -0.4;
      carZ = 0;
      carRotY = lerp(Math.PI * 0.52, Math.PI * 0.40, s3); // angle slightly towards viewer
      carScale = 1.12;

      // Camera swoops close into the driver cabin
      camX = lerp(-0.1, 1.35, s3);
      camY = lerp(0.95, 0.98, s3);
      camZ = lerp(4.9, 2.7, s3);
      lookX = lerp(0, 0.3, s3);
      lookY = lerp(0.6, 0.75, s3);
      lookZ = lerp(0, 0.3, s3);
    } else if (sp < 0.71) {
      // ──────────────────────────────────────────────────────────
      // 4. ENGINE/PERFORMANCE: Hood opens, camera TOP-DOWN on V6
      // ──────────────────────────────────────────────────────────
      const s4 = smoothstep(0.53, 0.70, sp);

      // Hood lifts open
      const hoodOpenCurve = Math.sin(s4 * Math.PI);
      hoodAngle = hoodOpenCurve * (Math.PI / 3.4);

      carX = 0;
      carY = -0.4;
      carZ = 0;
      carRotY = lerp(Math.PI * 0.40, 0.05, s4); // Face camera directly
      carRotX = lerp(0, 0.08, s4); // slight tilt
      carScale = 1.15;

      // Camera moves to high top-down perspective looking into engine bay
      camX = lerp(1.35, 0.0, s4);
      camY = lerp(0.98, 3.2, s4); // high top-down Y
      camZ = lerp(2.7, 3.2, s4);  // looking downward
      lookX = 0;
      lookY = 0.6;
      lookZ = 1.3; // focus directly on engine block (z ~ 1.3)
    } else if (sp < 0.87) {
      // ──────────────────────────────────────────────────────────
      // 5. WHEELS/OFF-ROAD: Camera LOW on wheels, tyres spin fast
      // ──────────────────────────────────────────────────────────
      const s5 = smoothstep(0.71, 0.86, sp);

      carX = lerp(0, 0.25, s5);
      carY = lerp(-0.4, -0.45, s5); // squat low on suspension
      carZ = 0;
      carRotY = lerp(0.05, Math.PI * 0.35, s5);
      carRotX = 0;
      carScale = 1.18;

      // Camera LOW angle close to the asphalt
      camX = lerp(0, -1.8, s5);
      camY = lerp(3.2, 0.28, s5); // just above ground
      camZ = lerp(3.2, 2.3, s5);
      lookX = -0.7;
      lookY = 0.38;
      lookZ = 1.2; // look at front-wheel hub

      wheelSpinRate = 32.0; // intense burnout spin
    } else {
      // ──────────────────────────────────────────────────────────
      // 6. FINAL CTA: Car returns to hero pose, ready for test drive
      // ──────────────────────────────────────────────────────────
      const s6 = smoothstep(0.87, 1.0, sp);

      carX = lerp(0.25, 0.32, s6);
      carY = -0.4 + Math.sin(t * 1.2) * 0.02;
      carZ = lerp(0, 0.3, s6);
      carRotY = lerp(Math.PI * 0.35, 0.42, s6); // returns to hero 3/4
      carRotX = 0;
      carScale = 1.05;

      camX = lerp(-1.8, 0, s6);
      camY = lerp(0.28, 1.15, s6);
      camZ = lerp(2.3, 5.2, s6);
      lookX = 0.18;
      lookY = 0.55;
      lookZ = 0;

      wheelSpinRate = 1.0;
    }

    // Apply smooth car transforms
    groupRef.current.position.x = lerp(groupRef.current.position.x, carX, 0.08);
    groupRef.current.position.y = lerp(groupRef.current.position.y, carY, 0.08);
    groupRef.current.position.z = lerp(groupRef.current.position.z, carZ, 0.08);
    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, carRotY, 0.08);
    groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, carRotX, 0.08);

    const curScale = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(lerp(curScale, carScale, 0.08));

    // Apply smooth camera transforms
    camera.position.x = lerp(camera.position.x, camX, 0.08);
    camera.position.y = lerp(camera.position.y, camY, 0.08);
    camera.position.z = lerp(camera.position.z, camZ, 0.08);
    camera.lookAt(lookX, lookY, lookZ);

    // Apply door & hood rotations
    if (p.doorFL) p.doorFL.rotation.y = lerp(p.doorFL.rotation.y, doorAngle, 0.1);
    if (p.doorFR) p.doorFR.rotation.y = lerp(p.doorFR.rotation.y, -doorAngle, 0.1);
    if (p.hood) p.hood.rotation.x = lerp(p.hood.rotation.x, -hoodAngle, 0.1);

    // Wheel spin
    p.wheels.forEach((w) => {
      w.rotation.x += 0.03 * wheelSpinRate;
    });
  });

  return (
    <group ref={groupRef} position={[0.35, -0.4, 0.35]} scale={1.05}>
      <primitive object={scene} />
    </group>
  );
}
