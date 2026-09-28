'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/ToastProvider';

type NType = 'job' | 'message' | 'review' | 'system';
const ALL_NOTIFS = [
  { id: 1, type: 'job' as NType, title: 'New Job Request', desc: 'Bilal Raza has requested Engine Diagnostics — Rs 1,500', time: '5 min ago', read: false, icon: '📋' },
  { id: 2, type: 'message' as NType, title: 'New Message from Sara Malik', desc: '"How much longer will it take?"', time: '12 min ago', read: false, icon: '💬' },
  { id: 3, type: 'job' as NType, title: 'New Job Request', desc: 'Zara Ahmed has requested Tyre Puncture repair — Rs 400', time: '18 min ago', read: false, icon: '📋' },
  { id: 4, type: 'review' as NType, title: 'New 5-Star Review', desc: 'Usman Ali: "Excellent service! Very professional."', time: '1 hr ago', read: true, icon: '⭐' },
  { id: 5, type: 'system' as NType, title: 'Account Verified ✅', desc: 'Your account has been fully verified by the admin.', time: '2 hrs ago', read: true, icon: '🛡️' },
  { id: 6, type: 'job' as NType, title: 'Job Completed', desc: 'Job JOB-0039 with Usman Ali marked complete. Payment pending.', time: '3 hrs ago', read: true, icon: '✓' },
  { id: 7, type: 'message' as NType, title: 'Message from Omar Farooq', desc: '"I am parked near the main entrance."', time: '4 hrs ago', read: true, icon: '💬' },
  { id: 8, type: 'review' as NType, title: 'New 5-Star Review', desc: 'Ayesha Siddiqui: "Very knowledgeable mechanic."', time: 'Yesterday', read: true, icon: '⭐' },
  { id: 9, type: 'system' as NType, title: 'Earnings Transferred', desc: 'Rs 4,500 has been transferred to your wallet.', time: 'Yesterday', read: true, icon: '💰' },
];

const TYPE_CONFIG: Record<NType, { color: string; bg: string }> = {
  job: { color: 'var(--accent)', bg: 'rgba(108,99,255,0.12)' },
  message: { color: 'var(--accent2)', bg: 'rgba(0,212,170,0.1)' },
  review: { color: 'var(--accent3)', bg: 'rgba(245,158,11,0.1)' },
  system: { color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' },
};

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifs, setNotifs] = useState(ALL_NOTIFS);
  const [filter, setFilter] = useState<'all' | NType>('all');

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    showToast('All notifications marked as read.', 'success');
  };

  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const deleteNotif = (id: number) => {
    setNotifs(n => n.filter(x => x.id !== id));
    showToast('Notification deleted.', 'info');
  };

  const clearAll = () => {
    setNotifs([]);
    showToast('All notifications cleared.', 'warning');
  };

  const filtered = notifs.filter(n => filter === 'all' || n.type === filter);

  const FILTERS: { key: 'all' | NType; label: string; icon: string }[] = [
    { key: 'all', label: `All (${notifs.length})`, icon: '🔔' },
    { key: 'job', label: 'Jobs', icon: '📋' },
    { key: 'message', label: 'Messages', icon: '💬' },
    { key: 'review', label: 'Reviews', icon: '⭐' },
    { key: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with job requests, messages, and system alerts</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {unread > 0 && (
              <button id="btn-mark-all-read" onClick={markAllRead} className="btn btn-secondary btn-sm">
                ✓ Mark All Read ({unread})
              </button>
            )}
            {notifs.length > 0 && (
              <button onClick={clearAll} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className="btn btn-sm"
              style={{
                background: filter === f.key ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--bg-card)',
                color: filter === f.key ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${filter === f.key ? 'transparent' : 'var(--border)'}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Unread banner */}
        {unread > 0 && (
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <span>You have <strong>{unread} unread notification{unread > 1 ? 's' : ''}</strong>. Click any to mark as read.</span>
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '60px', marginBottom: 16 }}>🔕</div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: 8 }}>All Clear!</h3>
            <p style={{ fontSize: '13px' }}>No notifications in this category.</p>
          </div>
        )}

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                style={{
                  display: 'flex', gap: 14, padding: '16px 20px',
                  background: notif.read ? 'var(--bg-card)' : `${cfg.bg}`,
                  border: `1px solid ${notif.read ? 'var(--border)' : cfg.color + '35'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  animation: 'slideIn 0.3s ease',
                }}
              >
                {!notif.read && (
                  <div style={{ position: 'absolute', top: 14, right: 54, width: 8, height: 8, background: cfg.color, borderRadius: '50%' }} />
                )}

                <div style={{
                  width: 46, height: 46, borderRadius: '12px',
                  background: cfg.bg, border: `1px solid ${cfg.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>
                  {notif.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: notif.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.desc}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🕐 {notif.time}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: cfg.color }}>
                      {notif.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '16px',
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '6px', transition: 'all 0.15s', flexShrink: 0,
                    alignSelf: 'center',
                  }}
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
