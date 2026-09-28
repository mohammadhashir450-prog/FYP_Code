export interface CarColorOption {
  id: string;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
}

export const CAR_COLORS: CarColorOption[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Black Onyx',
    hex: '#0a0b0e',
    metalness: 0.92,
    roughness: 0.15,
    clearcoat: 1.0,
  },
  {
    id: 'pearl-white',
    name: 'Prestige Pearl White',
    hex: '#f5f6fa',
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 0.95,
  },
  {
    id: 'champagne-gold',
    name: 'Desert Champagne Gold',
    hex: '#c8a458',
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1.0,
  },
  {
    id: 'titanium-slate',
    name: 'Titanium Graphite',
    hex: '#2b313c',
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.9,
  },
  {
    id: 'royal-ruby',
    name: 'Imperial Crimson Red',
    hex: '#5a0c16',
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 1.0,
  },
];

export interface VehicleSpec {
  label: string;
  value: string;
  subtext: string;
}

export const KEY_SPECS: VehicleSpec[] = [
  { label: 'POWER OUTPUT', value: '409 HP', subtext: 'Twin-Turbocharged V6 Engine' },
  { label: 'MAX TORQUE', value: '650 NM', subtext: '@ 2,000 - 3,600 RPM' },
  { label: 'TRANSMISSION', value: '10-SPEED', subtext: 'Direct Shift Automatic' },
  { label: '0-100 KM/H', value: '6.7 SEC', subtext: 'Dynamic Launch Control' },
  { label: 'DRIVE SYSTEM', value: 'FULL-TIME 4WD', subtext: 'Torsen Limited-Slip Central Diff' },
  { label: 'PLATFORM', value: 'TNGA-F', subtext: 'High-Rigidity Steel Ladder Frame' },
];

export interface SectionStage {
  index: number;
  id: string;
  title: string;
  subtitle: string;
  tag: string;
}

export const SHOWCASE_SECTIONS: SectionStage[] = [
  {
    index: 0,
    id: 'hero',
    title: 'BUILT FOR ANY ROAD',
    subtitle: '2022 TOYOTA LAND CRUISER 300 VX-R',
    tag: 'HERO',
  },
  {
    index: 1,
    id: 'design',
    title: 'PRECISION DESIGN',
    subtitle: 'Side profile & aerodynamic architecture',
    tag: 'DESIGN',
  },
  {
    index: 2,
    id: 'interior',
    title: 'EXECUTIVE INTERIOR',
    subtitle: 'Open cabin & handcrafted luxury',
    tag: 'INTERIOR / DOORS',
  },
  {
    index: 3,
    id: 'engine',
    title: 'V6 TWIN-TURBO PERFORMANCE',
    subtitle: '409 HP propulsion & top-down view',
    tag: 'ENGINE',
  },
  {
    index: 4,
    id: 'wheels',
    title: 'WHEELS & OFF-ROAD',
    subtitle: 'E-KDSS dynamic low-angle stance',
    tag: 'WHEELS',
  },
  {
    index: 5,
    id: 'test-drive',
    title: 'BOOK A TEST DRIVE',
    subtitle: 'Select trim & reserve private demonstration',
    tag: 'FINAL CTA',
  },
];
