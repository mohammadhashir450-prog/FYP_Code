'use client';
import Link from 'next/link';
import { Check, Clipboard, MessageCircle, Navigation, Phone, Route, X } from 'lucide-react';
import { STATUS_STEPS, BookingStatus, useBooking } from '@/lib/booking';
import { useToast } from '../ToastProvider';

export const fmtEta = (s: number) => (s < 5 ? 'Arriving' : s < 60 ? `${Math.round(s)} sec` : `${Math.ceil(s / 60)} min`);
export const fmtDist = (m: number) => (m < 950 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);

const NEXT: Partial<Record<BookingStatus, { label: string; to: BookingStatus }>> = {
  assigned: { label: 'Start navigation', to: 'enroute' },
  enroute: { label: 'Mark arrived', to: 'arrived' },
  arrived: { label: 'Start service', to: 'inservice' },
  inservice: { label: 'Complete job', to: 'completed' },
};

/** Status, ETA, stepper, customer card and provider actions for the active booking. */
export default function TrackingPanel() {
  const { booking, remainingM, etaSec, setStatus, clearBooking } = useBooking();
  const { showToast } = useToast();
  if (!booking) return null;

  const idx = STATUS_STEPS.findIndex((s) => s.id === booking.status);
  const next = NEXT[booking.status];
  const c = booking.customer;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ETA */}
      <div className="panel-inner" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className="eyebrow eyebrow-muted">Booking {booking.id}</span>
          <span className={`badge ${booking.status === 'completed' ? 'badge-success' : 'badge-gold'}`}>{STATUS_STEPS[idx].label}</span>
        </div>
        {booking.status === 'enroute' || booking.status === 'assigned' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="serif" style={{ fontSize: 42, fontWeight: 600, lineHeight: 1 }}>{fmtEta(etaSec)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>· {fmtDist(remainingM)} away</span>
            </div>
            <div className="progress-bar" style={{ marginTop: 16 }}><div className="progress-fill" style={{ width: `${booking.progress * 100}%` }} /></div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)' }}>Live simulation · position updates every 0.5s</div>
          </>
        ) : (
          <div className="serif" style={{ fontSize: 26, fontWeight: 600 }}>{STATUS_STEPS[idx].hint}</div>
        )}
      </div>

      {/* Stepper */}
      <div className="panel-inner" style={{ padding: '18px 22px' }}>
        {STATUS_STEPS.map((s, i) => {
          const state = i < idx ? 'done' : i === idx ? 'active' : 'todo';
          return (
            <div key={s.id} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: i < STATUS_STEPS.length - 1 ? 16 : 0 }}>
              {i < STATUS_STEPS.length - 1 && <span style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: state === 'done' ? 'var(--yellow)' : 'var(--border)' }} />}
              <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                background: state === 'done' ? 'var(--yellow)' : 'var(--navy-850)', border: `2px solid ${state === 'todo' ? 'var(--border)' : 'var(--yellow)'}`,
                boxShadow: state === 'active' ? '0 0 14px rgba(255,214,10,.6)' : 'none' }}>
                {state === 'done' ? <Check size={13} color="#04162f" strokeWidth={3} /> : state === 'active' ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)' }} /> : null}
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: state === 'todo' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{s.hint}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer */}
      <div className="panel-inner" style={{ padding: 22 }}>
        <div className="eyebrow eyebrow-muted" style={{ marginBottom: 12 }}>Customer</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--yellow-light), var(--yellow))', color: '#04162f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{c.name.slice(0, 1)}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.service}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {c.address}<br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-muted)' }}>{c.lat.toFixed(5)}, {c.lng.toFixed(5)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
          {[
            { icon: Phone, label: 'Call', on: () => (c.phone ? (window.location.href = `tel:${c.phone}`) : showToast('No phone number shared for this booking', 'info')) },
            { icon: MessageCircle, label: 'Chat', href: '/chat' },
            { icon: Navigation, label: 'Navigate', on: () => window.open(navUrl, '_blank', 'noopener') },
            { icon: Clipboard, label: 'Copy', on: () => { navigator.clipboard?.writeText(`${c.lat},${c.lng}`); showToast('Coordinates copied', 'success'); } },
          ].map(({ icon: Icon, label, on, href }) => {
            const inner = (<><Icon size={17} /><span style={{ fontSize: 10, marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span></>);
            const style: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(4,18,41,.6)', color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' };
            return href ? <Link key={label} href={href} style={style}>{inner}</Link> : <button key={label} onClick={on} style={style}>{inner}</button>;
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        {next && <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStatus(next.to)}><Route size={15} />{next.label}</button>}
        {booking.status === 'completed' && <button className="btn btn-primary" style={{ flex: 1 }} onClick={clearBooking}><Check size={15} />Close booking</button>}
        {booking.status !== 'completed' && <button className="btn btn-ghost" onClick={clearBooking} aria-label="Cancel booking"><X size={15} /></button>}
      </div>
    </div>
  );
}
