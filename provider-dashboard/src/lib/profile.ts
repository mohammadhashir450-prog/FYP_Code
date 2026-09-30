import type { Profile } from '@/components/AuthProvider';

export const SERVICE_TYPES = [
  'Master Auto Mechanic',
  'Automotive Diagnostics & Engineering',
  'Automotive Electrical & ECU Specialist',
  'Tyre & Wheel Balancing',
  'HVAC & Climate Control',
  'Bodywork & Paint',
  'Generator & Power Systems',
  'Heavy Machinery Repair',
  'Other Accredited Service',
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
