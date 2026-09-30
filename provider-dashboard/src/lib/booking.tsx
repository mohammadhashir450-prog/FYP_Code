'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

/**
 * Booking + live tracking state (browser-local until a backend is connected).
 * A booking carries the customer's shared location and the mechanic's route to it.
 * While the status is "enroute" the mechanic marker advances along the route so the
 * inDrive-style tracking UI can be exercised end-to-end.
 */
export type BookingStatus = 'assigned' | 'enroute' | 'arrived' | 'inservice' | 'completed';
export interface LatLng { lat: number; lng: number }
export interface Booking {
  id: string;
  service: string;
  customer: { name: string; phone: string; address: string } & LatLng;
  origin: LatLng;
  route: [number, number][]; // [lat, lng]
  distanceM: number;
  status: BookingStatus;
  progress: number; // 0..1 along the route
  createdAt: number;
  updatedAt: number;
}

export const STATUS_STEPS: { id: BookingStatus; label: string; hint: string }[] = [
  { id: 'assigned', label: 'Booking confirmed', hint: 'Customer location received' },
  { id: 'enroute', label: 'On the way', hint: 'Navigating to the customer' },
  { id: 'arrived', label: 'Arrived', hint: 'At the customer location' },
  { id: 'inservice', label: 'In service', hint: 'Work in progress' },
  { id: 'completed', label: 'Completed', hint: 'Job finished' },
];

const KEY = 'repairease.booking';
const SIM_SPEED = 25; // m/s — simulated travel speed
const DEFAULT_LOC: LatLng = { lat: 31.5204, lng: 74.3587 }; // Lahore

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;
export function haversine(a: LatLng, b: LatLng) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function routeLength(route: [number, number][]) {
  let d = 0;
  for (let i = 1; i < route.length; i++) d += haversine({ lat: route[i - 1][0], lng: route[i - 1][1] }, { lat: route[i][0], lng: route[i][1] });
  return d;
}

/** Position + heading (degrees) at a 0..1 fraction of the route. */
export function positionAt(route: [number, number][], progress: number): LatLng & { heading: number } {
  if (route.length < 2) return { lat: route[0]?.[0] ?? 0, lng: route[0]?.[1] ?? 0, heading: 0 };
  const total = routeLength(route);
  let target = Math.min(Math.max(progress, 0), 1) * total;
  for (let i = 1; i < route.length; i++) {
    const a = { lat: route[i - 1][0], lng: route[i - 1][1] }, b = { lat: route[i][0], lng: route[i][1] };
    const seg = haversine(a, b);
    if (target <= seg || i === route.length - 1) {
      const t = seg === 0 ? 0 : Math.min(1, target / seg);
      const heading = (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI;
      return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t, heading };
    }
    target -= seg;
  }
  return { lat: route[route.length - 1][0], lng: route[route.length - 1][1], heading: 0 };
}

async function fetchRoute(from: LatLng, to: LatLng): Promise<[number, number][]> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`, { signal: ctl.signal });
    clearTimeout(t);
    const json = await res.json();
    const coords: [number, number][] | undefined = json?.routes?.[0]?.geometry?.coordinates;
    if (coords && coords.length > 1) return coords.map(([lng, lat]) => [lat, lng] as [number, number]);
  } catch { /* offline / rate-limited → synthetic path below */ }
  // Fallback: gentle curve between the two points
  const pts: [number, number][] = [];
  const n = 48;
  const dx = to.lng - from.lng, dy = to.lat - from.lat;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const bend = Math.sin(t * Math.PI) * 0.18;
    pts.push([from.lat + dy * t - dx * bend, from.lng + dx * t + dy * bend]);
  }
  return pts;
}

function getLocation(): Promise<LatLng> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(DEFAULT_LOC);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(DEFAULT_LOC),
      { timeout: 4000, maximumAge: 60000 },
    );
  });
}

interface Ctx {
  booking: Booking | null;
  creating: boolean;
  mechanic: (LatLng & { heading: number }) | null;
  remainingM: number;
  etaSec: number;
  createDemoBooking: (service?: string) => Promise<void>;
  setStatus: (s: BookingStatus) => void;
  clearBooking: () => void;
}

const BookingContext = createContext<Ctx>({
  booking: null, creating: false, mechanic: null, remainingM: 0, etaSec: 0,
  createDemoBooking: async () => {}, setStatus: () => {}, clearBooking: () => {},
});
export const useBooking = () => useContext(BookingContext);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [creating, setCreating] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    // Hydrate from browser storage once on mount (unavailable during SSR).
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setBooking(JSON.parse(raw) as Booking);
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      if (booking) localStorage.setItem(KEY, JSON.stringify(booking));
      else localStorage.removeItem(KEY);
    } catch { /* ignore */ }
  }, [booking]);

  // Advance the mechanic while en route.
  const enroute = booking?.status === 'enroute';
  useEffect(() => {
    if (!enroute) return;
    const id = setInterval(() => {
      setBooking((b) => {
        if (!b || b.status !== 'enroute') return b;
        const next = Math.min(1, b.progress + (0.5 * SIM_SPEED) / Math.max(b.distanceM, 1));
        return { ...b, progress: next, status: next >= 1 ? 'arrived' : 'enroute', updatedAt: Date.now() };
      });
    }, 500);
    return () => clearInterval(id);
  }, [enroute]);

  const createDemoBooking = useCallback(async (service = 'Engine & Diagnostics') => {
    setCreating(true);
    const customer = await getLocation();
    const origin = { lat: customer.lat + 0.0125, lng: customer.lng + 0.0155 };
    const route = await fetchRoute(origin, customer);
    setBooking({
      id: `RE-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      service,
      customer: { name: 'Test Customer', phone: '', address: 'Shared pin location', ...customer },
      origin,
      route,
      distanceM: routeLength(route),
      status: 'assigned',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setCreating(false);
  }, []);

  const setStatus = useCallback((status: BookingStatus) => {
    setBooking((b) => (b ? { ...b, status, progress: status === 'arrived' || status === 'inservice' || status === 'completed' ? 1 : b.progress, updatedAt: Date.now() } : b));
  }, []);
  const clearBooking = useCallback(() => setBooking(null), []);

  const value = useMemo<Ctx>(() => {
    const mechanic = booking ? positionAt(booking.route, booking.progress) : null;
    const remainingM = booking ? booking.distanceM * (1 - booking.progress) : 0;
    return { booking, creating, mechanic, remainingM, etaSec: remainingM / SIM_SPEED, createDemoBooking, setStatus, clearBooking };
  }, [booking, creating, createDemoBooking, setStatus, clearBooking]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
