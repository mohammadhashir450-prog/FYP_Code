'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Everything shown in the portal comes from this profile. There is no seeded
 * data: a provider registers (or edits their profile) and the UI renders it.
 * Persistence is browser-local until a backend is connected.
 */
export interface Profile {
  photo: string;          // data URL
  fullName: string;
  designation: string;
  email: string;
  phone: string;
  nationalId: string;
  businessName: string;
  registrationNo: string;
  businessType: string;
  serviceType: string;
  experience: string;
  serviceArea: string;
  address: string;
  currency: string;
  skills: string[];       // issues the provider handles
  bio: string;
  documentName: string;
  verificationStatus: 'pending' | 'verified';
  online: boolean;
  createdAt: string;
}

export const EMPTY_PROFILE: Profile = {
  photo: '', fullName: '', designation: '', email: '', phone: '', nationalId: '',
  businessName: '', registrationNo: '', businessType: '', serviceType: '', experience: '',
  serviceArea: '', address: '', currency: 'PKR', skills: [], bio: '', documentName: '',
  verificationStatus: 'pending', online: true, createdAt: '',
};

interface AuthContextValue {
  ready: boolean;
  profile: Profile;
  isAuthenticated: boolean;
  hasAccount: boolean;
  /** Convenience view used by the shell (sidebar / topbar). */
  user: { name: string; initials: string; email: string; role: string; photo: string; verified: boolean; online: boolean } | null;
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: Partial<Profile>, password: string) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => void;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  toggleOnline: () => void;
}

const ACCOUNT_KEY = 'repairease.account';
const SESSION_KEY = 'repairease.session';

/** Digits only, last 10 - so 0300-1234567, +92 300 1234567 and 3001234567 all match. */
export const phoneKey = (p: string) => p.replace(/\D/g, '').slice(-10);

async function hash(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`repairease::${text}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface Stored { profile: Profile; pw: string }

function readAccount(): Stored | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch { return null; }
}

function writeAccount(a: Stored) {
  try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a)); } catch { /* storage full / blocked */ }
}

const AuthContext = createContext<AuthContextValue>({
  ready: false, profile: EMPTY_PROFILE, isAuthenticated: false, hasAccount: false, user: null,
  login: async () => ({ ok: false }), register: async () => {}, updateProfile: () => {},
  changePassword: async () => ({ ok: false }), logout: () => {}, toggleOnline: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function initialsOf(name: string, fallback = 'RE') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Stored | null>(null);
  const [session, setSession] = useState(false);

  useEffect(() => {
    // Hydrate from browser storage once on mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(readAccount());
    try { setSession(localStorage.getItem(SESSION_KEY) === '1'); } catch { /* ignore */ }
    setReady(true);
  }, []);

  const startSession = (on: boolean) => {
    setSession(on);
    try { on ? localStorage.setItem(SESSION_KEY, '1') : localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  };

  const login: AuthContextValue['login'] = async (phone, password) => {
    const acc = readAccount();
    if (!acc) return { ok: false, error: 'No provider account found on this device. Apply for an account first.' };
    if (phoneKey(acc.profile.phone) !== phoneKey(phone) || acc.pw !== (await hash(password))) {
      return { ok: false, error: 'Phone number or password is incorrect.' };
    }
    setAccount(acc);
    startSession(true);
    return { ok: true };
  };

  const register: AuthContextValue['register'] = async (data, password) => {
    const acc: Stored = {
      profile: { ...EMPTY_PROFILE, ...data, createdAt: new Date().toISOString() },
      pw: await hash(password),
    };
    writeAccount(acc);
    setAccount(acc);
    startSession(true);
  };

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setAccount((a) => {
      if (!a) return a;
      const next = { ...a, profile: { ...a.profile, ...patch } };
      writeAccount(next);
      return next;
    });
  }, []);

  const changePassword: AuthContextValue['changePassword'] = async (current, next) => {
    const acc = readAccount();
    if (!acc || acc.pw !== (await hash(current))) return { ok: false, error: 'Current password is incorrect.' };
    const updated = { ...acc, pw: await hash(next) };
    writeAccount(updated);
    setAccount(updated);
    return { ok: true };
  };

  const logout = () => {
    startSession(false);
    router.push('/login');
  };

  const toggleOnline = () => updateProfile({ online: !(account?.profile.online ?? true) });

  const profile = account?.profile ?? EMPTY_PROFILE;
  const isAuthenticated = ready && session && !!account;
  const user = isAuthenticated
    ? {
        name: profile.fullName || profile.phone || 'Provider',
        initials: initialsOf(profile.fullName || profile.phone),
        email: profile.email || profile.phone,
        role: profile.designation || profile.serviceType || 'Service Provider',
        photo: profile.photo,
        verified: profile.verificationStatus === 'verified',
        online: profile.online,
      }
    : null;

  return (
    <AuthContext.Provider value={{ ready, profile, isAuthenticated, hasAccount: !!account, user, login, register, updateProfile, changePassword, logout, toggleOnline }}>
      {children}
    </AuthContext.Provider>
  );
}
