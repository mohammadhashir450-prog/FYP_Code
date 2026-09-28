import { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';

gsap.registerPlugin(ScrollTrigger);

useGLTF.preload('/models/land-cruiser.glb');

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

  // Mouse Parallax tracking for Hero section
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // Single Animation State driven by GSAP timeline
  const animState = useRef({
    // Car transforms
    carX: 0.35,
    carY: -0.4,
    carZ: 0.35,
    carRotX: 0.02,
    carRotY: 0.42,
    carRotZ: 0,
    carScale: 1.06,

    // Camera transforms
    camX: 0,
    camY: 1.15,
    camZ: 5.2,
    camFov: 42,
    lookX: 0.2,
    lookY: 0.55,
    lookZ: 0,

    // Parts & dynamics
    doorAngle: 0,
    hoodAngle: 0,
    wheelSpinSpeed: 1.5,
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
    scene.position.y = -box.min.y * targetScale;
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

  // ── Single GSAP Timeline Bound to ScrollTrigger (scrub: 1) ──
  useEffect(() => {
    const s = animState.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // single GSAP timeline bound to ScrollTrigger (scrub: 1)
          onUpdate: (self) => {
            // Determine active phase for UI
            const p = self.progress;
            let currentPhase = 0;
            if (p < 0.17) currentPhase = 0;
            else if (p < 0.36) currentPhase = 1;
            else if (p < 0.53) currentPhase = 2;
            else if (p < 0.71) currentPhase = 3;
            else if (p < 0.87) currentPhase = 4;
            else currentPhase = 5;

            if (currentPhase !== currentPhaseRef.current) {
              currentPhaseRef.current = currentPhase;
              onPhaseChange?.(currentPhase);
            }
          },
        },
      });

      // SECTION 1 (0.00 → 0.16) HERO: Initial state
      tl.set(s, {
        carX: 0.35,
        carY: -0.4,
        carZ: 0.35,
        carRotX: 0.02,
        carRotY: 0.42,
        carScale: 1.06,
        camX: 0,
        camY: 1.15,
        camZ: 5.2,
        camFov: 42,
        lookX: 0.2,
        lookY: 0.55,
        lookZ: 0,
        doorAngle: 0,
        hoodAngle: 0,
        wheelSpinSpeed: 1.5,
      });

      // SECTION 2 (0.17 → 0.35) DESIGN: Car rotates to side profile, text left, cards right
      tl.to(
        s,
        {
          carX: 0.0,
          carY: -0.4,
          carZ: -0.1,
          carRotX: 0,
          carRotY: Math.PI * 0.52, // 90° pure side profile
          carScale: 1.08,
          camX: -0.1,
          camY: 0.95,
          camZ: 4.9,
          camFov: 40,
          lookX: 0,
          lookY: 0.6,
          lookZ: 0,
          doorAngle: 0,
          hoodAngle: 0,
          wheelSpinSpeed: 2.0,
          ease: 'power2.inOut',
          duration: 2.0,
        },
        '+=0.2'
      );

      // SECTION 3 (0.36 → 0.52) INTERIOR/DOORS: Front doors open, camera moves closer
      tl.to(
        s,
        {
          carX: 0.2,
          carRotY: Math.PI * 0.40,
          carScale: 1.12,
          camX: 1.35,
          camY: 0.98,
          camZ: 2.7, // camera close to cabin
          camFov: 38,
          lookX: 0.3,
          lookY: 0.75,
          lookZ: 0.3,
          doorAngle: Math.PI / 2.6, // doors open
          hoodAngle: 0,
          wheelSpinSpeed: 1.0,
          ease: 'power2.inOut',
          duration: 2.0,
        }
      );

      // Close doors slightly before engine section
      tl.to(
        s,
        {
          doorAngle: 0,
          ease: 'power1.out',
          duration: 0.6,
        }
      );

      // SECTION 4 (0.53 → 0.70) ENGINE/PERFORMANCE: Hood opens, camera top-down on V6
      tl.to(
        s,
        {
          carX: 0.0,
          carRotX: 0.08,
          carRotY: 0.05, // facing front directly
          carScale: 1.15,
          camX: 0.0,
          camY: 3.2, // high top-down perspective
          camZ: 3.2,
          camFov: 46,
          lookX: 0,
          lookY: 0.6,
          lookZ: 1.3, // focus on engine bay
          hoodAngle: Math.PI / 3.4, // hood lifts
          wheelSpinSpeed: 1.0,
          ease: 'power2.inOut',
          duration: 2.0,
        }
      );

      // Close hood before wheels section
      tl.to(
        s,
        {
          hoodAngle: 0,
          carRotX: 0,
          ease: 'power1.out',
          duration: 0.6,
        }
      );

      // SECTION 5 (0.71 → 0.86) WHEELS/OFF-ROAD: Camera low on wheels, tyres spin, dark background
      tl.to(
        s,
        {
          carX: 0.25,
          carY: -0.45, // squat low on suspension
          carRotY: Math.PI * 0.35,
          carScale: 1.18,
          camX: -1.8,
          camY: 0.28, // asphalt low angle
          camZ: 2.3,
          camFov: 48,
          lookX: -0.7,
          lookY: 0.38,
          lookZ: 1.2, // look at front wheel hub
          wheelSpinSpeed: 38.0, // high velocity burnout spin
          ease: 'power2.inOut',
          duration: 2.0,
        }
      );

      // SECTION 6 (0.87 → 1.00) FINAL CTA: Car returns to hero pose
      tl.to(
        s,
        {
          carX: 0.32,
          carY: -0.4,
          carZ: 0.3,
          carRotY: 0.42, // returns to hero 3/4 front view
          carScale: 1.05,
          camX: 0,
          camY: 1.15,
          camZ: 5.2,
          camFov: 42,
          lookX: 0.18,
          lookY: 0.55,
          lookZ: 0,
          doorAngle: 0,
          hoodAngle: 0,
          wheelSpinSpeed: 1.0,
          ease: 'power2.inOut',
          duration: 1.8,
        }
      );
    });

    return () => ctx.revert();
  }, [onPhaseChange]);

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

  // ── Render Frame Loop ──
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const s = animState.current;
    const p = pivots.current;
    const t = clock.getElapsedTime();
    const sp = scrollProgressRef.current;

    // Smooth mouse parallax in hero section
    mouse.current.x = lerp(mouse.current.x, mouse.current.targetX, 0.06);
    mouse.current.y = lerp(mouse.current.y, mouse.current.targetY, 0.06);

    const heroFade = Math.max(0, 1 - sp / 0.18);
    const mouseTiltY = mouse.current.x * 0.12 * heroFade;
    const mouseTiltX = -mouse.current.y * 0.07 * heroFade;

    // Subtle floating idle in hero and cta
    const idleFloat = Math.sin(t * 1.3) * 0.025 * (heroFade + (sp > 0.88 ? 0.7 : 0));

    // Manual overrides if user clicks HUD buttons
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

    // Apply Car transforms with mouse parallax
    groupRef.current.position.set(s.carX, s.carY + idleFloat, s.carZ);
    groupRef.current.rotation.set(s.carRotX + mouseTiltX, s.carRotY + mouseTiltY, s.carRotZ);
    groupRef.current.scale.setScalar(s.carScale);

    // Apply Camera transforms & FOV
    camera.position.set(s.camX, s.camY, s.camZ);
    const perspCam = camera as THREE.PerspectiveCamera;
    if (perspCam.fov !== s.camFov) {
      perspCam.fov = s.camFov;
      perspCam.updateProjectionMatrix();
    }
    camera.lookAt(s.lookX, s.lookY, s.lookZ);

    // Apply Doors & Hood
    if (p.doorFL) p.doorFL.rotation.y = s.doorAngle;
    if (p.doorFR) p.doorFR.rotation.y = -s.doorAngle;
    if (p.hood) p.hood.rotation.x = -s.hoodAngle;

    // Apply Wheel spin
    p.wheels.forEach((w) => {
      w.rotation.x += 0.03 * s.wheelSpinSpeed;
    });
  });

  return (
    <group ref={groupRef} position={[0.35, -0.4, 0.35]} scale={1.05}>
      <primitive object={scene} />
    </group>
  );
}
