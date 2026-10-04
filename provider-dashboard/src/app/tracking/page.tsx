'use client';
import dynamic from 'next/dynamic';
import { LocateFixed, MapPin, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TrackingPanel from '@/components/tracking/TrackingPanel';
import { useBooking } from '@/lib/booking';

const TrackingMap = dynamic(() => import('@/components/tracking/TrackingMap'), { ssr: false });

export default function TrackingPage() {
  const { booking, creating, createDemoBooking } = useBooking();
  const [follow, setFollow] = useState(true);

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <header style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Provider Workspace <span style={{ color: 'var(--text-muted)' }}>› Live Tracking</span></div>
          <h1 className="page-title">Live Tracking</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 14, fontSize: 15, lineHeight: 1.65, maxWidth: 640 }}>
            Once a booking is confirmed you see the customer&apos;s location and follow your route to them in real time — just like a ride-hailing app.
          </p>
        </header>

        {booking ? (
          <div className="split-main" style={{ alignItems: 'start' }}>
            <section className="panel" style={{ overflow: 'hidden', position: 'relative', height: 'min(72vh, 680px)', minHeight: 420 }}>
              <TrackingMap booking={booking} follow={follow} className="" />
              <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 500, display: 'flex', gap: 8 }}>
                <span className="badge badge-gold" style={{ backdropFilter: 'blur(8px)', background: 'rgba(4,22,47,.85)' }}><MapPin size={12} /> {booking.service}</span>
                <button onClick={() => setFollow((f) => !f)} className={`badge ${follow ? 'badge-success' : 'badge-muted'}`} style={{ cursor: 'pointer', background: 'rgba(4,22,47,.85)' }}>
                  <LocateFixed size={12} /> Follow {follow ? 'on' : 'off'}
                </button>
              </div>
            </section>
            <TrackingPanel />
          </div>
        ) : (
          <section className="panel" style={{ padding: '72px 24px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, margin: '0 auto 22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,123,214,.1)', border: '1px solid rgba(43,123,214,.3)' }}>
              <MapPin size={30} color="var(--blue-soft)" />
            </div>
            <div className="serif" style={{ fontSize: 26, fontWeight: 600, marginBottom: 10 }}>No active booking</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 440, margin: '0 auto 26px', lineHeight: 1.7 }}>
              When a customer confirms a booking, their location appears here with a live route to follow.
            </p>
            <button className="btn btn-primary" disabled={creating} onClick={() => createDemoBooking()}>
              <FlaskConical size={15} />{creating ? 'Locating…' : 'Create test booking'}
            </button>
            <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>Test tool · uses your browser location (or Lahore) as the customer pin</div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
