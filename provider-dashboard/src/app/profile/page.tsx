'use client';
import { useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: user?.name || 'Ahmed Khan',
    email: user?.email || 'ahmed.khan@example.com',
    phone: '+92 300 1234567',
    cnic: '42201-1234567-1',
    shopName: 'Ahmed Auto Repair',
    shopAddress: 'Street 5, Model Town, Lahore',
    serviceType: user?.role || 'Auto Mechanic',
    experience: '8',
    bio: 'Expert auto mechanic with 8+ years of experience in engine repair, diagnostics, and maintenance. Certified technician specializing in Japanese and Korean vehicles.',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    setEditing(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      showToast('Profile picture updated!', 'success');
    }
  };

  const VERIFICATIONS = [
    { icon: '🪪', label: 'CNIC Verified', verified: true },
    { icon: '📋', label: 'Business License Verified', verified: true },
    { icon: '🤳', label: 'Live Photo Verified', verified: true },
    { icon: '✅', label: 'Background Check Passed', verified: true },
  ];

  const PERF_STATS = [
    { label: 'Total Jobs', value: '127' },
    { label: 'Completion Rate', value: '94%' },
    { label: 'Avg Response Time', value: '< 5 min' },
    { label: 'Member Since', value: 'Jan 2024' },
    { label: 'Reviews', value: '89' },
    { label: 'Last Active', value: 'Just now' },
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Profile Management</h1>
            <p>Manage your shop details, profile picture, and verification status</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); showToast('Changes discarded.', 'warning'); }} className="btn btn-ghost">Discard</button>
                <button id="btn-save-profile" onClick={handleSave} className="btn btn-primary">💾 Save Changes</button>
              </>
            ) : (
              <button id="btn-edit-profile" onClick={() => setEditing(true)} className="btn btn-secondary">✏️ Edit Profile</button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar card */}
            <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: avatar ? 'transparent' : 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                  border: '3px solid var(--accent)',
                  boxShadow: '0 0 0 6px rgba(108,99,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: 900, color: 'white',
                  margin: '0 auto',
                  overflow: 'hidden',
                }}>
                  {avatar
                    ? <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (user?.avatar || 'AK')}
                </div>
                {editing && (
                  <button
                    id="btn-change-avatar"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 30, height: 30,
                      background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                      border: '2px solid var(--bg-primary)',
                      borderRadius: '50%', cursor: 'pointer', fontSize: '13px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Change photo"
                  >📷</button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 3 }}>{form.fullName}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 12 }}>{form.serviceType} · {form.experience} yrs exp.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div className="verified-badge">✓ Identity Verified</div>
                <div className="badge badge-success">🏆 Top Rated Provider</div>
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 16 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: i < 5 ? '#f59e0b' : '#f59e0b', fontSize: '18px' }}>★</span>)}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>4.8 / 5.0 · 89 reviews</p>
            </div>

            {/* Performance */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>Performance</h4>
              {PERF_STATS.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Personal Info */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 18 }}>👤 Personal Information</h3>
              <div className="grid-2" style={{ gap: 14 }}>
                {[
                  { key: 'fullName', label: 'Full Name', type: 'text', locked: false },
                  { key: 'email', label: 'Email Address', type: 'email', locked: true },
                  { key: 'phone', label: 'Phone Number', type: 'tel', locked: false },
                  { key: 'cnic', label: 'CNIC Number', type: 'text', locked: true },
                ].map(f => (
                  <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label" htmlFor={`pf-${f.key}`}>
                      {f.label} {f.locked && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(cannot change)</span>}
                    </label>
                    <input
                      id={`pf-${f.key}`} type={f.type} className="input"
                      value={form[f.key as keyof typeof form]}
                      onChange={e => update(f.key, e.target.value)}
                      disabled={!editing || f.locked}
                      style={{ opacity: (!editing || f.locked) ? 0.55 : 1 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Shop Details */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 18 }}>🏪 Shop Details</h3>
              <div className="form-group">
                <label className="label" htmlFor="pf-shopName">Business Name</label>
                <input id="pf-shopName" type="text" className="input" value={form.shopName} onChange={e => update('shopName', e.target.value)} disabled={!editing} style={{ opacity: !editing ? 0.55 : 1 }} />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="pf-shopAddress">Shop Address</label>
                <input id="pf-shopAddress" type="text" className="input" value={form.shopAddress} onChange={e => update('shopAddress', e.target.value)} disabled={!editing} style={{ opacity: !editing ? 0.55 : 1 }} />
              </div>
              <div className="grid-2" style={{ gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label" htmlFor="pf-service">Service Type</label>
                  <input id="pf-service" type="text" className="input" value={form.serviceType} onChange={e => update('serviceType', e.target.value)} disabled={!editing} style={{ opacity: !editing ? 0.55 : 1 }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label" htmlFor="pf-exp">Experience (years)</label>
                  <input id="pf-exp" type="number" className="input" value={form.experience} onChange={e => update('experience', e.target.value)} disabled={!editing} style={{ opacity: !editing ? 0.55 : 1 }} min="0" max="60" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 18 }}>📝 Professional Bio</h3>
              <textarea id="pf-bio" className="input" rows={4} value={form.bio}
                onChange={e => update('bio', e.target.value)}
                disabled={!editing}
                style={{ opacity: !editing ? 0.55 : 1, resize: 'vertical', minHeight: 100 }} />
              {editing && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 6 }}>
                  {form.bio.length}/500 characters
                </div>
              )}
            </div>

            {/* Verification */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 18 }}>🛡️ Verification Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {VERIFICATIONS.map(v => (
                  <div key={v.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(34,197,94,0.04)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '18px' }}>{v.icon}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{v.label}</span>
                    </div>
                    <span className="badge badge-success">✓ Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
