'use client';
import { useState } from 'react';
import { Briefcase, Inbox, Clock, CircleCheck, Wrench } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';

/** Page template — job data will come from the backend once it is connected. */
const FILTERS = [
  { id: 'new', label: 'New Requests', icon: Inbox },
  { id: 'active', label: 'In Progress', icon: Wrench },
  { id: 'done', label: 'Completed', icon: CircleCheck },
] as const;

const COPY: Record<(typeof FILTERS)[number]['id'], { title: string; desc: string }> = {
  new: { title: 'No new requests', desc: 'Customer requests that match your specialization will appear here for you to accept or decline.' },
  active: { title: 'No jobs in progress', desc: 'Jobs you accept move here while you work on them.' },
  done: { title: 'No completed jobs yet', desc: 'Your finished jobs and customer feedback will be listed here.' },
};

export default function JobRequestsPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<(typeof FILTERS)[number]['id']>('new');
  const copy = COPY[tab];

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <header style={{ marginBottom: 30 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Provider Workspace <span style={{ color: 'var(--text-muted)' }}>› Job Requests</span></div>
          <h1 className="page-title">Job Requests</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 14, fontSize: 15, lineHeight: 1.65, maxWidth: 620 }}>
            Review incoming service requests, track work in progress and see your completed jobs.
          </p>
        </header>

        <div className="tabs" style={{ marginBottom: 24 }}>
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}><Icon size={14} />{label}</button>
          ))}
        </div>

        <section className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '22px 30px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Briefcase size={20} color="var(--yellow)" />
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{FILTERS.find((f) => f.id === tab)!.label}</h2>
            </div>
            <span className={`badge ${profile.online ? 'badge-success' : 'badge-muted'}`}>{profile.online ? 'Accepting requests' : 'Offline'}</span>
          </div>
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, margin: '0 auto 18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,123,214,.1)', border: '1px solid rgba(43,123,214,.28)' }}>
              <Clock size={26} color="var(--blue-soft)" />
            </div>
            <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{copy.title}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.65 }}>{copy.desc}</div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
