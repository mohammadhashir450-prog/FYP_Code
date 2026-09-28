'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AvailabilityPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [coords, setCoords] = useState({ lat: 31.5204, lng: 74.3587 }); // Lahore
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState('Model Town, Lahore');
  const [radius, setRadius] = useState(10);
  const [serviceHours, setServiceHours] = useState({ start: '08:00', end: '20:00' });

  // Simulate position drift when online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      setCoords(c => ({
        lat: c.lat + (Math.random() - 0.5) * 0.0005,
        lng: c.lng + (Math.random() - 0.5) * 0.0005,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const updateLocation = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      setLocationName('DHA Phase 5, Lahore');
      setCoords({ lat: 31.4804, lng: 74.4013 });
    }, 2000);
  };

  // Generate map grid dots for visual
  const dots: { x: number; y: number; type: string }[] = [];
  for (let i = 0; i < 40; i++) {
    dots.push({ x: Math.random() * 100, y: Math.random() * 100, type: Math.random() > 0.9 ? 'customer' : 'road' });
  }

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Availability & Location</h1>
            <p>Toggle your online status and track your live position</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'var(--bg-card)',
            border: `2px solid ${isOnline ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '12px 20px',
            transition: 'border-color 0.3s',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: isOnline ? 'var(--success)' : 'var(--text-muted)' }}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isOnline ? 'Accepting new jobs' : 'Not accepting jobs'}
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={e => setIsOnline(e.target.checked)}
                id="availability-toggle"
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Toggle banner */}
        {!isOnline && (
          <div className="alert alert-warning animate-fadeIn">
            ⚠️ You are currently <strong>Offline</strong>. Customers cannot find you or send job requests. Toggle online to start accepting jobs.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Map */}
          <div>
            <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📍 Live Location</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                  <button
                    id="btn-update-location"
                    onClick={updateLocation}
                    disabled={locating}
                    className="btn btn-secondary btn-sm"
                  >
                    {locating ? (
                      <><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> Locating...</>
                    ) : '📡 Update'}
                  </button>
                </div>
              </div>

              {/* Stylized map */}
              <div className="map-container" style={{ height: 380 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
                  {/* Grid lines */}
                  {[10,20,30,40,50,60,70,80,90].map(v => (
                    <g key={v}>
                      <line x1={v} y1="0" x2={v} y2="100" stroke="#1e2d48" strokeWidth="0.5" />
                      <line x1="0" y1={v} x2="100" y2={v} stroke="#1e2d48" strokeWidth="0.5" />
                    </g>
                  ))}
                  {/* Simulated roads */}
                  <line x1="0" y1="45" x2="100" y2="48" stroke="#2a3550" strokeWidth="2" />
                  <line x1="55" y1="0" x2="53" y2="100" stroke="#2a3550" strokeWidth="2" />
                  <line x1="0" y1="70" x2="100" y2="72" stroke="#2a3550" strokeWidth="1.5" />
                  <line x1="25" y1="0" x2="27" y2="100" stroke="#2a3550" strokeWidth="1" />
                  <line x1="80" y1="0" x2="78" y2="100" stroke="#2a3550" strokeWidth="1" />

                  {/* Service radius circle */}
                  <circle cx="50" cy="50" r={radius * 1.8} fill="rgba(108,99,255,0.05)" stroke="rgba(108,99,255,0.3)" strokeWidth="0.8" strokeDasharray="3,2" />

                  {/* Random customer dots */}
                  {[
                    { x: 30, y: 35 }, { x: 65, y: 28 }, { x: 42, y: 68 }, { x: 72, y: 61 },
                  ].map((d, i) => (
                    <g key={i}>
                      <circle cx={d.x} cy={d.y} r="2.5" fill="#f59e0b" opacity="0.8" />
                      <circle cx={d.x} cy={d.y} r="5" fill="rgba(245,158,11,0.15)" />
                    </g>
                  ))}

                  {/* Provider dot (you) */}
                  <circle cx="50" cy="50" r="18" fill="rgba(108,99,255,0.08)" />
                  <circle cx="50" cy="50" r="12" fill="rgba(108,99,255,0.12)" />
                  {isOnline && (
                    <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(108,99,255,0.4)" strokeWidth="1">
                      <animate attributeName="r" values="10;24;10" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx="50" cy="50" r="6" fill={isOnline ? '#6c63ff' : '#4a5878'} />
                  <circle cx="50" cy="50" r="3" fill="white" />

                  {/* North indicator */}
                  <text x="96" y="6" fontSize="4" fill="#4a5878" fontFamily="Inter, sans-serif">N</text>
                  <line x1="97" y1="7" x2="97" y2="12" stroke="#4a5878" strokeWidth="0.5" />
                </svg>

                {/* Map overlay info */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(10,15,30,0.85)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ marginBottom: 4, color: 'var(--text-primary)', fontWeight: 600 }}>📍 {locationName}</div>
                  <div>Customers nearby: <strong style={{ color: 'var(--accent3)' }}>4</strong></div>
                  <div>Active radius: <strong style={{ color: 'var(--accent)' }}>{radius} km</strong></div>
                </div>

                {/* Legend */}
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(10,15,30,0.85)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>You</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent3)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Customers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status card */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 16 }}>🎯 Current Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Status', value: isOnline ? 'Online' : 'Offline', color: isOnline ? 'var(--success)' : 'var(--danger)' },
                  { label: 'Location', value: locationName, color: 'var(--text-primary)' },
                  { label: 'Active Since', value: isOnline ? '2h 15m' : '—', color: 'var(--text-primary)' },
                  { label: 'Jobs Today', value: '3', color: 'var(--text-primary)' },
                  { label: 'Earnings Today', value: 'Rs 4,500', color: 'var(--success)' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Radius */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 16 }}>🗺️ Service Radius</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Radius</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{radius} km</span>
              </div>
              <input
                id="radius-slider"
                type="range"
                min="1" max="30"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>1 km</span><span>30 km</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 12 }}>
                Customers within {radius} km will see you in search results.
              </p>
            </div>

            {/* Working Hours */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 16 }}>🕐 Working Hours</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label" htmlFor="hours-start">Start</label>
                  <input
                    id="hours-start"
                    type="time"
                    className="input"
                    value={serviceHours.start}
                    onChange={e => setServiceHours(h => ({ ...h, start: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label" htmlFor="hours-end">End</label>
                  <input
                    id="hours-end"
                    type="time"
                    className="input"
                    value={serviceHours.end}
                    onChange={e => setServiceHours(h => ({ ...h, end: e.target.value }))}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-sm">Save Hours</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
