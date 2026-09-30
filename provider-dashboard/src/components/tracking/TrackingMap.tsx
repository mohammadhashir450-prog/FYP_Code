'use client';
import { useEffect, useRef } from 'react';
import type { Map as LMap, Marker, Polyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Booking, positionAt } from '@/lib/booking';

const CUSTOMER_HTML = `
  <div class="tm-cust"><span class="tm-pulse"></span><span class="tm-pulse tm-p2"></span>
    <div class="tm-cust-core"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#04162f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg></div>
    <div class="tm-tag">Customer</div>
  </div>`;
const MECH_HTML = `
  <div class="tm-mech"><span class="tm-mech-ring"></span>
    <div class="tm-mech-rot"><svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="17" fill="#04162f" stroke="#ffd60a" stroke-width="2.5"/><path d="M20 8 L28 27 L20 22.5 L12 27 Z" fill="#ffd60a"/></svg></div>
  </div>`;

/**
 * Live tracking map (Leaflet + CARTO dark tiles, tinted to the brand palette).
 * Shows the customer pin, the mechanic moving along the route, travelled/remaining path and follow mode.
 */
export default function TrackingMap({ booking, follow = true, className = '', interactive = true }: { booking: Booking; follow?: boolean; className?: string; interactive?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const mech = useRef<Marker | null>(null);
  const done = useRef<Polyline | null>(null);
  const todo = useRef<Polyline | null>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null);
  const bookingRef = useRef(booking);
  const followRef = useRef(follow);

  useEffect(() => { bookingRef.current = booking; followRef.current = follow; });

  // Build the map once per booking id
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !el.current) return;
      leaflet.current = L;
      const b = bookingRef.current;
      const m = L.map(el.current, { zoomControl: false, attributionControl: true, zoomAnimation: true, dragging: interactive, scrollWheelZoom: interactive, doubleClickZoom: interactive, touchZoom: interactive, keyboard: interactive });
      map.current = m;
      // Esri "World Dark Gray" base + reference labels (free, no API key), tinted to the brand palette via CSS.
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri', maxNativeZoom: 16, maxZoom: 19,
      }).addTo(m);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 16, maxZoom: 19, opacity: 0.85,
      }).addTo(m);
      if (interactive) L.control.zoom({ position: 'bottomright' }).addTo(m);

      const line = b.route as [number, number][];
      L.polyline(line, { color: '#2b7bd6', weight: 10, opacity: 0.12 }).addTo(m);
      todo.current = L.polyline(line, { color: '#ffd60a', weight: 4, opacity: 0.85, dashArray: '2 9', lineCap: 'round' }).addTo(m);
      done.current = L.polyline([line[0]], { color: '#5fa3ea', weight: 5, opacity: 0.95 }).addTo(m);

      L.marker([b.customer.lat, b.customer.lng], { icon: L.divIcon({ html: CUSTOMER_HTML, className: 'tm-icon', iconSize: [44, 44], iconAnchor: [22, 22] }), keyboard: false }).addTo(m);
      const p = positionAt(line, b.progress);
      mech.current = L.marker([p.lat, p.lng], { icon: L.divIcon({ html: MECH_HTML, className: 'tm-icon', iconSize: [40, 40], iconAnchor: [20, 20] }), zIndexOffset: 1000, keyboard: false }).addTo(m);

      m.fitBounds(L.latLngBounds(line), { padding: [60, 60], animate: false });
      setTimeout(() => m.invalidateSize(), 250);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null; mech.current = null; done.current = null; todo.current = null;
    };
  }, [booking.id, interactive]);

  // Move the mechanic + repaint the route on every progress tick
  useEffect(() => {
    const m = map.current, L = leaflet.current;
    if (!m || !L || !mech.current || !done.current || !todo.current) return;
    const p = positionAt(booking.route, booking.progress);
    mech.current.setLatLng([p.lat, p.lng]);
    const rot = mech.current.getElement()?.querySelector<HTMLElement>('.tm-mech-rot');
    if (rot) rot.style.transform = `rotate(${p.heading}deg)`;

    // split the polyline at the mechanic's position
    const total = booking.route.length;
    const idx = Math.max(1, Math.round(booking.progress * (total - 1)));
    done.current.setLatLngs([...booking.route.slice(0, idx), [p.lat, p.lng]]);
    todo.current.setLatLngs([[p.lat, p.lng], ...booking.route.slice(idx)]);

    if (followRef.current && booking.status === 'enroute') m.panTo([p.lat, p.lng], { animate: true, duration: 0.6, easeLinearity: 0.5 });
  }, [booking.progress, booking.route, booking.status, booking.id]);

  return (
    <>
      <style>{`
        .tm-wrap .leaflet-tile-pane { filter: sepia(.9) hue-rotate(178deg) saturate(2.2) brightness(.92) contrast(1.18); }
        .tm-wrap .leaflet-container { background: #061a38; font-family: inherit; }
        .tm-wrap .leaflet-control-attribution { background: rgba(3,13,31,.7); color: #7f9dc6; font-size: 9px; }
        .tm-wrap .leaflet-control-attribution a { color: #9db4d3; }
        .tm-wrap .leaflet-bar { border: 1px solid rgba(255,214,10,.3); box-shadow: 0 8px 24px rgba(0,0,0,.5); }
        .tm-wrap .leaflet-bar a { background: rgba(4,22,47,.92); color: #ffd60a; border-bottom-color: rgba(255,255,255,.08); }
        .tm-wrap .leaflet-bar a:hover { background: #0f2f5a; }
        .tm-icon { background: none; border: 0; }
        .tm-cust { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
        .tm-cust-core { position: relative; z-index: 2; width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #ffe873, #ffd60a); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 3px rgba(4,22,47,.85), 0 6px 20px rgba(0,0,0,.5); }
        .tm-pulse { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,214,10,.7); animation: tm-ping 2.4s ease-out infinite; }
        .tm-p2 { animation-delay: 1.2s; }
        @keyframes tm-ping { 0% { transform: scale(.7); opacity: .9; } 100% { transform: scale(2.6); opacity: 0; } }
        .tm-tag { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); padding: 2px 9px; border-radius: 999px; background: rgba(4,22,47,.92); border: 1px solid rgba(255,214,10,.5); color: #ffd60a; font: 700 9px 'JetBrains Mono', monospace; letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; }
        .tm-mech { position: relative; width: 40px; height: 40px; }
        .tm-mech-ring { position: absolute; inset: -6px; border-radius: 50%; background: radial-gradient(circle, rgba(43,123,214,.5), transparent 70%); animation: tm-glow 1.8s ease-in-out infinite; }
        @keyframes tm-glow { 0%, 100% { opacity: .5; transform: scale(.9); } 50% { opacity: 1; transform: scale(1.15); } }
        .tm-mech-rot { position: relative; width: 40px; height: 40px; transition: transform .5s linear; filter: drop-shadow(0 4px 10px rgba(0,0,0,.6)); }
      `}</style>
      <div className={`tm-wrap ${className}`} style={{ position: 'absolute', inset: 0, minHeight: 240 }}>
        <div ref={el} style={{ position: 'absolute', inset: 0 }} />
      </div>
    </>
  );
}
