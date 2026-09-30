import type { Profile } from '@/components/AuthProvider';

/** Specializations a provider can register under, grouped for <optgroup> selects. */
export const SERVICE_GROUPS = [
  {
    label: 'Car repair',
    items: [
      'Master Auto Mechanic',
      'Engine Tuning & Diagnostics',
      'Car AC & Cooling',
      'Suspension, Steering & Alignment',
      'Auto Electrician & ECU',
      'Denting, Painting & Polish',
      'CNG / LPG Kit Specialist',
      'Tyre & Wheel Balancing',
    ],
  },
  {
    label: 'Home appliances',
    items: [
      'Air Conditioner (Split / Window)',
      'Refrigerator & Deep Freezer',
      'Washing Machine',
      'Geyser (Gas / Electric)',
      'UPS, Inverter & Battery',
      'Water Pump & Motor',
      'Fans, Microwave & Small Appliances',
      'LED TV & Electronics',
      'Electrician (Wiring & DB)',
    ],
  },
  { label: 'Other', items: ['Generator & Power Systems', 'Heavy Machinery Repair', 'Other Accredited Service'] },
];
export const SERVICE_TYPES = SERVICE_GROUPS.flatMap((g) => g.items);

/** Common vehicles on Pakistani roads. */
export const LOCAL_CARS = [
  'Suzuki Mehran / Alto / Cultus / Wagon R / Swift',
  'Toyota Corolla / Yaris / Vitz / Hilux',
  'Honda City / Civic / BR-V',
  'Changan Alsvin / Oshan X7',
  'KIA Sportage / Picanto',
  'Hyundai Tucson / Elantra',
  'Daihatsu Mira / Cuore',
];

/** Everyday car problems (local conditions: heat, dust, broken roads, CNG, weak batteries). */
export const CAR_ISSUES = [
  { title: 'AC not cooling / gas refill', desc: 'Weak cooling in summer heat, compressor, condenser and blower faults.' },
  { title: 'Battery dead & self-starter', desc: 'Jump start, battery replacement, starter motor and alternator charging.' },
  { title: 'Overheating & coolant leak', desc: 'Radiator, water pump, thermostat and fan relay problems.' },
  { title: 'Suspension noise on rough roads', desc: 'Shock absorbers, bushes, ball joints, links and stabiliser rubbers.' },
  { title: 'Clutch plate & gearbox', desc: 'Slipping or hard clutch, pressure plate, auto transmission jerks.' },
  { title: 'Brake pads, discs & ABS light', desc: 'Squealing brakes, spongy pedal, ABS sensor faults.' },
  { title: 'Engine tuning & high fuel use', desc: 'Misfire, low mileage, injector cleaning, spark plugs, throttle body.' },
  { title: 'CNG / LPG kit tuning & leakage', desc: 'Kit calibration, regulator, cylinder fitness and leak checks.' },
  { title: 'Steering & wheel alignment', desc: 'Pulling to one side, vibration, tie-rod ends, balancing.' },
  { title: 'Tyre puncture & replacement', desc: 'Puncture repair, tyre change, nitrogen fill and rim repair.' },
  { title: 'Dent, paint & polish', desc: 'Dents from traffic, scratches, full paint and ceramic polish.' },
  { title: 'Wiring, power windows & central lock', desc: 'Short circuits, window regulators, door lock actuators, lights.' },
  { title: 'Check-engine light / ECU scan', desc: 'Computerised diagnosis, sensor replacement and ECU reset.' },
  { title: 'Timing belt & oil service', desc: 'Scheduled service, engine oil, filters and belt replacement.' },
];

/** Appliances found in most Pakistani homes and their usual faults. */
export const APPLIANCES = [
  { name: 'Air Conditioner', issues: ['Not cooling', 'Gas leak / refill', 'Water dripping indoors', 'Compressor / capacitor', 'Inverter PCB error', 'Noisy outdoor fan'] },
  { name: 'Refrigerator & Deep Freezer', issues: ['Not cooling', 'Frost build-up', 'Compressor relay / overload', 'Door gasket', 'Water leakage', 'Noise'] },
  { name: 'Washing Machine', issues: ['Motor / spinner', 'Drain pump', 'Belt slipping', 'Not spinning', 'Water inlet valve', 'PCB / timer'] },
  { name: 'Geyser (Gas / Electric)', issues: ['Pilot not lighting', 'Thermostat', 'Gas leakage', 'Heating element burnt', 'Low water pressure', 'Instant geyser tripping'] },
  { name: 'UPS, Inverter & Battery', issues: ['Not charging', 'Continuous beeping', 'Battery replacement', 'Overload trip', 'Stabiliser / AVR', 'Solar hybrid setup'] },
  { name: 'Water Pump & Motor', issues: ['Not lifting water', 'Winding burnt', 'Capacitor', 'Pressure switch', 'Leakage', 'Booster pump'] },
  { name: 'Fans, Microwave & Small Appliances', issues: ['Ceiling fan slow / noisy', 'Pedestal fan', 'Microwave not heating', 'Iron / kettle', 'Blender / juicer', 'Gas stove'] },
  { name: 'Water Dispenser & Cooler', issues: ['Not cooling / heating', 'Tap leakage', 'Compressor', 'Tank cleaning'] },
  { name: 'LED / LCD TV', issues: ['No display / backlight', 'Panel damage', 'HDMI / sound', 'Power board', 'Remote / software'] },
  { name: 'Home Electrician', issues: ['Wiring & rewiring', 'Breaker / DB tripping', 'Short circuit', 'Sockets & switches', 'Load-shedding changeover', 'Earthing & LED lights'] },
];

export const BUSINESS_TYPES = ['Individual / Freelancer', 'Sole Proprietorship', 'Partnership', 'Private Limited Company', 'Workshop / Garage'];
export const CURRENCIES = [
  { code: 'PKR', name: 'Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'AED', name: 'Dirham' },
  { code: 'GBP', name: 'Sterling' },
];
export const EXPERIENCE = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'];
export const BIO_LIMIT = 500;

export interface CheckItem { key: keyof Profile; label: string; tab: 'general' | 'business' | 'verification' }

/** Fields that count towards profile completeness. */
export const CHECKLIST: CheckItem[] = [
  { key: 'photo', label: 'Upload a profile photo', tab: 'general' },
  { key: 'fullName', label: 'Add your full legal name', tab: 'general' },
  { key: 'designation', label: 'Add your official designation', tab: 'general' },
  { key: 'phone', label: 'Add a contact phone number', tab: 'general' },
  { key: 'businessName', label: 'Add your business or workshop name', tab: 'business' },
  { key: 'serviceType', label: 'Choose your service specialization', tab: 'business' },
  { key: 'address', label: 'Add your workshop address', tab: 'business' },
  { key: 'bio', label: 'Write a short business description', tab: 'business' },
  { key: 'nationalId', label: 'Add your national identity number', tab: 'verification' },
  { key: 'documentName', label: 'Upload a trade licence / ID document', tab: 'verification' },
];

export function completeness(p: Profile) {
  const done = CHECKLIST.filter((c) => String(p[c.key] ?? '').trim() !== '');
  const missing = CHECKLIST.filter((c) => String(p[c.key] ?? '').trim() === '');
  return { percent: Math.round((done.length / CHECKLIST.length) * 100), done, missing };
}

export function memberSince(p: Profile) {
  if (!p.createdAt) return '';
  return new Date(p.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function fileToDataUrl(file: File, maxSize = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
