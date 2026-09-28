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
    title: 'THE UNDISPUTED SOVEREIGN',
    subtitle: '2022 TOYOTA LAND CRUISER 300 VX-R',
    tag: 'FLAGSHIP ICON',
  },
  {
    index: 1,
    id: 'aerodynamics',
    title: 'PRECISION SCULPTED FORM',
    subtitle: 'Aero-optimized aluminum monocoque with command presence',
    tag: 'EXTERIOR ARCHITECTURE',
  },
  {
    index: 2,
    id: 'cockpit',
    title: 'EXECUTIVE COMMAND SANCTUARY',
    subtitle: 'Semi-aniline leather, bespoke craft and silent cockpit acoustics',
    tag: 'CABIN REFINEMENT',
  },
  {
    index: 3,
    id: 'powertrain',
    title: 'V6 TWIN-TURBO CHARGED HEART',
    subtitle: '3.5L V35A-FTS dual intercooled direct-injected propulsion',
    tag: 'ENGINEERING & POWER',
  },
  {
    index: 4,
    id: 'tailgate',
    title: 'VERSATILE LUXURY UTILITY',
    subtitle: 'Split-powered smart tailgate with flat-fold 3rd row cargo capacity',
    tag: 'COMMAND CARGO',
  },
  {
    index: 5,
    id: 'velocity',
    title: 'ALL-TERRAIN DOMINANCE',
    subtitle: 'E-KDSS electronic kinetic suspension conquering any frontier',
    tag: 'DYNAMIC VELOCITY',
  },
];
