'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="toggle" htmlFor={id} style={{ cursor: 'pointer' }}>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  );
}

function SettingRow({ id, label, desc, checked, onChange }: { id: string; label: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ flex: 1, marginRight: 24 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [logoutModal, setLogoutModal] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState('');

  const [notif, setNotif] = useState({ newJobs: true, messages: true, reviews: true, payments: true, system: false, email: true, sms: false, push: true });
  const [privacy, setPrivacy] = useState({ location: true, phone: false, email: false, profilePublic: true });
  const [theme, setTheme] = useState('dark');

  const tgl = (obj: any, set: any, key: string) => set((o: any) => ({ ...o, [key]: !o[key] }));

  const strength = (() => {
    let s = 0; const p = pw.next;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strColor = ['', 'var(--danger)', '#f97316', 'var(--accent3)', 'var(--accent)', 'var(--success)'][strength];
  const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];

  const saveNotifs = () => showToast('Notification preferences saved!', 'success');
  const savePrivacy = () => showToast('Privacy settings updated.', 'success');

  const changePassword = () => {
    if (!pw.current) return setPwErr('Enter your current password.');
    if (pw.next.length < 6) return setPwErr('New password must be at least 6 characters.');
    if (pw.next !== pw.confirm) return setPwErr('Passwords do not match.');
    setPwErr('');
    setPw({ current: '', next: '', confirm: '' });
    showToast('Password changed successfully! 🔐', 'success');
  };

  const handleLogout = () => {
    setLogoutModal(false);
    logout();
    showToast('Logged out successfully.', 'info');
  };

  const handleDelete = () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteModal(false);
    showToast('Account deleted. Redirecting...', 'error');
    setTimeout(() => router.push('/login'), 1500);
  };

  const THEMES = [
    { id: 'dark', name: 'Dark', bg: '#0a0f1e' },
    { id: 'midnight', name: 'Midnight', bg: '#0d0d2b' },
    { id: 'slate', name: 'Slate', bg: '#1e293b' },
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your account preferences, security, and privacy</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Nav */}
          <div className="card" style={{ padding: '8px', position: 'sticky', top: 80 }}>
            {[
              { anchor: '#notifs', label: '🔔 Notifications' },
              { anchor: '#password', label: '🔐 Password' },
              { anchor: '#privacy', label: '🛡️ Privacy' },
              { anchor: '#appearance', label: '🎨 Appearance' },
              { anchor: '#danger', label: '⚠️ Danger Zone' },
            ].map(s => (
              <a key={s.anchor} href={s.anchor} style={{
                display: 'block', padding: '9px 12px', borderRadius: '7px',
                fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none',
                transition: 'all 0.2s', marginBottom: 2,
              }}>
                {s.label}
              </a>
            ))}
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Notification Preferences */}
            <div className="card" style={{ padding: '24px' }} id="notifs">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 3 }}>🔔 Notification Preferences</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>Choose what updates you receive</p>
              <SettingRow id="n-jobs" label="New Job Requests" desc="Get notified when a customer sends a job request" checked={notif.newJobs} onChange={() => tgl(notif, setNotif, 'newJobs')} />
              <SettingRow id="n-msg" label="New Messages" desc="Customer chat messages in real-time" checked={notif.messages} onChange={() => tgl(notif, setNotif, 'messages')} />
              <SettingRow id="n-reviews" label="Reviews & Ratings" desc="When a customer leaves you a review" checked={notif.reviews} onChange={() => tgl(notif, setNotif, 'reviews')} />
              <SettingRow id="n-pay" label="Payment Notifications" desc="Wallet credits and earnings updates" checked={notif.payments} onChange={() => tgl(notif, setNotif, 'payments')} />
              <SettingRow id="n-sys" label="System Announcements" desc="Platform updates and announcements" checked={notif.system} onChange={() => tgl(notif, setNotif, 'system')} />
              <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Channels</div>
              <SettingRow id="n-email" label="Email Notifications" desc="Daily summary digest via email" checked={notif.email} onChange={() => tgl(notif, setNotif, 'email')} />
              <SettingRow id="n-sms" label="SMS Alerts" desc="Critical notifications via SMS" checked={notif.sms} onChange={() => tgl(notif, setNotif, 'sms')} />
              <SettingRow id="n-push" label="Push Notifications" desc="In-browser push notifications" checked={notif.push} onChange={() => tgl(notif, setNotif, 'push')} />
              <div style={{ marginTop: 18 }}>
                <button id="btn-save-notifs" onClick={saveNotifs} className="btn btn-primary btn-sm">💾 Save Preferences</button>
              </div>
            </div>

            {/* Password */}
            <div className="card" style={{ padding: '24px' }} id="password">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 3 }}>🔐 Change Password</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>Update your account password for security</p>
              {pwErr && <div className="alert alert-danger">{pwErr}</div>}
              <div style={{ maxWidth: 420 }}>
                <div className="form-group">
                  <label className="label" htmlFor="pw-current">Current Password</label>
                  <input id="pw-current" type="password" className="input" placeholder="Enter current password"
                    value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="pw-new">New Password</label>
                  <input id="pw-new" type="password" className="input" placeholder="Minimum 6 characters"
                    value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} />
                  {pw.next && (
                    <div style={{ marginTop: 8 }}>
                      <div className="progress-bar">
                        <div style={{ height: '100%', width: `${(strength / 5) * 100}%`, background: strColor, borderRadius: 3, transition: 'all 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '11px', color: strColor, marginTop: 4, display: 'block' }}>Strength: {strLabel}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="pw-confirm">Confirm New Password</label>
                  <input id="pw-confirm" type="password" className="input" placeholder="Repeat new password"
                    value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                    style={{ borderColor: pw.confirm && pw.confirm !== pw.next ? 'var(--danger)' : '' }} />
                </div>
                <button id="btn-change-password" onClick={changePassword} className="btn btn-primary btn-sm">🔐 Update Password</button>
              </div>
            </div>

            {/* Privacy */}
            <div className="card" style={{ padding: '24px' }} id="privacy">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 3 }}>🛡️ Privacy</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>Control what information is visible to customers</p>
              <SettingRow id="pv-loc" label="Show Live Location" desc="Let customers see your real-time position on map" checked={privacy.location} onChange={() => tgl(privacy, setPrivacy, 'location')} />
              <SettingRow id="pv-phone" label="Show Phone Number" desc="Display your number on your public profile" checked={privacy.phone} onChange={() => tgl(privacy, setPrivacy, 'phone')} />
              <SettingRow id="pv-email" label="Show Email Address" desc="Show email on public profile" checked={privacy.email} onChange={() => tgl(privacy, setPrivacy, 'email')} />
              <SettingRow id="pv-public" label="Public Profile" desc="Allow customers to view your profile" checked={privacy.profilePublic} onChange={() => tgl(privacy, setPrivacy, 'profilePublic')} />
              <div style={{ marginTop: 18 }}>
                <button id="btn-save-privacy" onClick={savePrivacy} className="btn btn-primary btn-sm">💾 Save Privacy Settings</button>
              </div>
            </div>

            {/* Appearance */}
            <div className="card" style={{ padding: '24px' }} id="appearance">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 3 }}>🎨 Appearance</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>Customize the look of your dashboard</p>
              <div style={{ display: 'flex', gap: 14 }}>
                {THEMES.map(t => (
                  <div key={t.id} onClick={() => { setTheme(t.id); showToast(`Theme changed to ${t.name}`, 'info'); }}
                    style={{
                      border: `2px solid ${theme === t.id ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '12px', padding: '16px', cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.2s', minWidth: 90,
                      background: theme === t.id ? 'rgba(108,99,255,0.08)' : 'var(--bg-input)',
                    }}
                  >
                    <div style={{ width: 44, height: 44, background: t.bg, borderRadius: '10px', margin: '0 auto 10px', border: '1px solid var(--border)' }} />
                    <div style={{ fontSize: '12px', fontWeight: theme === t.id ? 700 : 400, color: theme === t.id ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {t.name}
                    </div>
                    {theme === t.id && <div style={{ fontSize: '10px', color: 'var(--success)', marginTop: 4 }}>✓ Active</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ border: '1px solid rgba(239,68,68,0.35)', borderRadius: 'var(--radius)', padding: '24px', background: 'rgba(239,68,68,0.03)' }} id="danger">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 3, color: 'var(--danger)' }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 20 }}>These actions are permanent and cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button id="btn-logout" onClick={() => setLogoutModal(true)} className="btn btn-ghost" style={{ borderColor: 'rgba(239,68,68,0.4)', color: 'var(--danger)' }}>
                  🚪 Logout
                </button>
                <button id="btn-delete-account" onClick={() => setDeleteModal(true)} className="btn btn-danger">
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout modal */}
      {logoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card animate-fadeIn" style={{ padding: '32px', maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: 12 }}>🚪</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 8 }}>Logout?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 24 }}>You will be signed out and redirected to the login page.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setLogoutModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button id="btn-confirm-logout" onClick={handleLogout} className="btn btn-danger" style={{ flex: 1 }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card animate-fadeIn" style={{ padding: '32px', maxWidth: 400, width: '90%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '48px', marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: 'var(--danger)' }}>Delete Account</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This will permanently delete your account, job history, reviews, and all data. This action <strong>cannot be undone</strong>.
              </p>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="delete-confirm">
                Type <strong style={{ color: 'var(--danger)' }}>DELETE</strong> to confirm
              </label>
              <input id="delete-confirm" type="text" className="input" placeholder="DELETE"
                value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setDeleteModal(false); setDeleteConfirm(''); }} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button id="btn-confirm-delete" onClick={handleDelete}
                disabled={deleteConfirm !== 'DELETE'}
                className="btn btn-danger" style={{ flex: 1, opacity: deleteConfirm !== 'DELETE' ? 0.4 : 1 }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
