'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

type TabKey = 'incoming' | 'ongoing' | 'history';

const INCOMING = [
  { id: 'JOB-0043', customer: 'Bilal Raza', avatar: 'BR', avatarColor: '#6c63ff', service: 'Engine Diagnostics', detail: 'Car not starting, engine making noise', location: 'DHA Phase 5, Lahore', distance: '2.3 km', time: '5 min ago', amount: 1500, rating: 4.9, totalJobs: 12 },
  { id: 'JOB-0042', customer: 'Zara Ahmed', avatar: 'ZA', avatarColor: '#f59e0b', service: 'Tyre Puncture', detail: 'Front left tyre punctured', location: 'Johar Town, Lahore', distance: '3.8 km', time: '18 min ago', amount: 400, rating: 4.7, totalJobs: 5 },
];

const ONGOING = [
  { id: 'JOB-0041', customer: 'Sara Malik', avatar: 'SM', avatarColor: '#00d4aa', service: 'Tyre Replacement', location: 'Gulberg III, Lahore', startTime: '1:00 PM', elapsed: '1 hr 12 min', amount: 2200, progress: 65, notes: 'Replace front 2 tyres, customer waiting on-site.' },
  { id: 'JOB-0040', customer: 'Omar Farooq', avatar: 'OF', avatarColor: '#8b5cf6', service: 'Battery Jump-start', location: 'Liberty Market, Lahore', startTime: '1:30 PM', elapsed: '42 min', amount: 800, progress: 40, notes: 'Car battery dead, needs jump-start.' },
];

const HISTORY = [
  { id: 'JOB-0039', customer: 'Usman Ali', avatar: 'UA', service: 'Oil Change', date: '27 Sep 2026', amount: 800, status: 'completed', rating: 5 },
  { id: 'JOB-0038', customer: 'Fatima Khan', avatar: 'FK', service: 'Brake Inspection', date: '26 Sep 2026', amount: 600, status: 'completed', rating: 4 },
  { id: 'JOB-0037', customer: 'Hamza Nasir', avatar: 'HN', service: 'Battery Replacement', date: '25 Sep 2026', amount: 0, status: 'cancelled', rating: null },
  { id: 'JOB-0036', customer: 'Ayesha Siddiqui', avatar: 'AS', service: 'Engine Tune-up', date: '24 Sep 2026', amount: 3500, status: 'completed', rating: 5 },
  { id: 'JOB-0035', customer: 'Raza Hussain', avatar: 'RH', service: 'Wiper Replacement', date: '23 Sep 2026', amount: 350, status: 'completed', rating: 4 },
  { id: 'JOB-0034', customer: 'Nadia Iqbal', avatar: 'NI', service: 'AC Repair', date: '22 Sep 2026', amount: 2800, status: 'completed', rating: 5 },
];

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : 'var(--border)', fontSize: '13px' }}>★</span>
      ))}
    </div>
  );
}

export default function JobsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabKey>('incoming');
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [histFilter, setHistFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState<{ type: 'accept' | 'reject'; jobId: string; customer: string } | null>(null);

  const doAccept = (jobId: string, customer: string) => {
    setAccepted(s => new Set([...s, jobId]));
    setConfirmModal(null);
    showToast(`✅ Job accepted! Heading to ${customer}`, 'success');
  };

  const doReject = (jobId: string) => {
    setRejected(s => new Set([...s, jobId]));
    setConfirmModal(null);
    showToast('Job rejected and removed from queue.', 'warning');
  };

  const doComplete = (jobId: string, customer: string) => {
    setCompleted(s => new Set([...s, jobId]));
    showToast(`🎉 Job with ${customer} marked complete!`, 'success');
  };

  const filteredHistory = histFilter === 'all'
    ? HISTORY
    : HISTORY.filter(j => j.status === histFilter);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'incoming', label: `Incoming (${INCOMING.filter(j => !accepted.has(j.id) && !rejected.has(j.id)).length})` },
    { key: 'ongoing', label: `Ongoing (${ONGOING.filter(j => !completed.has(j.id)).length})` },
    { key: 'history', label: `History (${HISTORY.length})` },
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <div className="page-header">
          <h1>Job Requests</h1>
          <p>Manage incoming requests, track ongoing jobs, and review your history</p>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: 420, marginBottom: 28 }}>
          {tabs.map(t => (
            <button key={t.key} id={`tab-jobs-${t.key}`} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── INCOMING ─── */}
        {tab === 'incoming' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {INCOMING.filter(j => !accepted.has(j.id) && !rejected.has(j.id)).length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '56px', marginBottom: 14 }}>📭</div>
                <h3 style={{ fontSize: '18px', marginBottom: 8, color: 'var(--text-secondary)' }}>No Pending Requests</h3>
                <p style={{ fontSize: '13px' }}>You&apos;re all caught up! New job requests will appear here.</p>
              </div>
            )}

            {INCOMING.map(job => {
              const isAcc = accepted.has(job.id);
              const isRej = rejected.has(job.id);
              if (isRej) return null;

              return (
                <div key={job.id} className="card animate-slideIn" style={{ padding: '24px', opacity: isAcc ? 0.7 : 1 }}>
                  {/* New badge */}
                  {!isAcc && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Request</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{job.id}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: `${job.avatarColor}20`,
                      border: `2px solid ${job.avatarColor}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: 700, color: job.avatarColor, flexShrink: 0,
                    }}>
                      {job.avatar}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 700 }}>{job.customer}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <Stars n={Math.round(job.rating)} />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.rating} · {job.totalJobs} jobs completed</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent2)' }}>Rs {job.amount.toLocaleString()}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.time}</div>
                        </div>
                      </div>

                      <div style={{
                        background: 'var(--bg-input)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                        fontSize: '13px', color: 'var(--text-secondary)',
                      }}>
                        <strong style={{ color: 'var(--text-primary)' }}>🔧 {job.service}</strong>
                        <div style={{ marginTop: 4 }}>{job.detail}</div>
                      </div>

                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>📍 {job.location}</span>
                        <span>🗺️ {job.distance} away</span>
                      </div>

                      {isAcc ? (
                        <div className="alert alert-success" style={{ margin: 0, padding: '10px 14px' }}>
                          ✅ Accepted! Navigate to {job.location} to meet {job.customer}.
                          <Link href="/chat" style={{ marginLeft: 12, color: 'var(--success)', fontWeight: 700, textDecoration: 'underline' }}>Open Chat</Link>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <button id={`btn-accept-${job.id}`}
                            onClick={() => setConfirmModal({ type: 'accept', jobId: job.id, customer: job.customer })}
                            className="btn btn-success">
                            ✓ Accept Job
                          </button>
                          <button id={`btn-reject-${job.id}`}
                            onClick={() => setConfirmModal({ type: 'reject', jobId: job.id, customer: job.customer })}
                            className="btn btn-danger">
                            ✕ Reject
                          </button>
                          <Link href="/chat" className="btn btn-ghost">💬 Chat</Link>
                          <button className="btn btn-ghost" onClick={() => showToast('Calling customer...', 'info')}>📞 Call</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── ONGOING ─── */}
        {tab === 'ongoing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ONGOING.filter(j => !completed.has(j.id)).length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '56px', marginBottom: 14 }}>🎉</div>
                <h3 style={{ fontSize: '18px', marginBottom: 8, color: 'var(--text-secondary)' }}>All Jobs Completed!</h3>
                <p style={{ fontSize: '13px' }}>Great work! Accept new incoming jobs to continue.</p>
              </div>
            )}
            {ONGOING.filter(j => !completed.has(j.id)).map(job => (
              <div key={job.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: `${job.avatarColor}20`,
                    border: `2px solid ${job.avatarColor}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 700, color: job.avatarColor, flexShrink: 0,
                  }}>
                    {job.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700 }}>{job.customer}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Started {job.startTime} · Elapsed: {job.elapsed}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent2)' }}>Rs {job.amount.toLocaleString()}</div>
                        <span className="badge badge-info">Ongoing</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      🔧 <strong style={{ color: 'var(--text-primary)' }}>{job.service}</strong> · 📍 {job.location}
                    </div>

                    {job.notes && (
                      <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
                        📝 {job.notes}
                      </div>
                    )}

                    {/* Progress */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Job Progress</span>
                        <span style={{ fontWeight: 700, color: job.avatarColor }}>{job.progress}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 8 }}>
                        <div style={{ height: '100%', width: `${job.progress}%`, background: `linear-gradient(90deg, ${job.avatarColor}, var(--accent2))`, borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <Link href="/chat" className="btn btn-primary btn-sm">💬 Open Chat</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => showToast('Calling customer...', 'info')}>📞 Call Customer</button>
                      <button className="btn btn-success btn-sm" id={`btn-complete-${job.id}`}
                        onClick={() => doComplete(job.id, job.customer)}>
                        ✓ Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── HISTORY ─── */}
        {tab === 'history' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Job History</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {['all', 'completed', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setHistFilter(f)}
                    className="btn btn-sm"
                    style={{
                      background: histFilter === f ? 'var(--accent)' : 'var(--bg-input)',
                      color: histFilter === f ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.map((job, i) => (
              <div key={job.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 24px',
                borderBottom: i < filteredHistory.length - 1 ? '1px solid var(--border-light)' : 'none',
                transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0,
                }}>
                  {job.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{job.customer}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.service} · {job.date}</div>
                </div>
                <div>
                  {job.rating !== null
                    ? <Stars n={job.rating} />
                    : <span className="badge badge-secondary">No Rating</span>}
                </div>
                <div style={{ textAlign: 'right', minWidth: 110 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: job.amount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {job.amount > 0 ? `Rs ${job.amount.toLocaleString()}` : '—'}
                  </div>
                  <span className={`badge ${job.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>{job.status}</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: 72, textAlign: 'right' }}>{job.id}</span>
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                No {histFilter} jobs found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card animate-fadeIn" style={{ padding: '32px', maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: 12 }}>
              {confirmModal.type === 'accept' ? '✅' : '❌'}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 8 }}>
              {confirmModal.type === 'accept' ? 'Accept Job?' : 'Reject Job?'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 24 }}>
              {confirmModal.type === 'accept'
                ? `Accept the job from ${confirmModal.customer}? You will be navigated to their location.`
                : `Reject the job from ${confirmModal.customer}? This cannot be undone.`}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={() => confirmModal.type === 'accept' ? doAccept(confirmModal.jobId, confirmModal.customer) : doReject(confirmModal.jobId)}
                className={`btn ${confirmModal.type === 'accept' ? 'btn-success' : 'btn-danger'}`}
                style={{ flex: 1 }}
              >
                {confirmModal.type === 'accept' ? '✓ Accept' : '✕ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
