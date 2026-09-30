'use client';
import { Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserRound, Building2, BadgeCheck, ShieldCheck, Camera, Save, FileText, Mail, Phone, Briefcase, MapPin,
  IdCard, Landmark, CircleCheck, CircleAlert, KeyRound, Eye, EyeOff, Trash2, Radio,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth, Profile } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BIO_LIMIT, BUSINESS_TYPES, CURRENCIES, EXPERIENCE, SERVICE_TYPES, completeness, fileToDataUrl, memberSince } from '@/lib/profile';

const TABS = [
  { id: 'general', label: 'General Profile', icon: UserRound },
  { id: 'business', label: 'Business Details', icon: Building2 },
  { id: 'verification', label: 'Verification', icon: BadgeCheck },
  { id: 'security', label: 'Security', icon: ShieldCheck },
] as const;
type TabId = (typeof TABS)[number]['id'];

function SectionHeader({ n, title, badge }: { n: string; title: string; badge?: React.ReactNode }) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow eyebrow-muted" style={{ marginBottom: 10 }}>Section {n}</div>
        <h2>{title}</h2>
      </div>
      {badge}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="input-wrap">
        {children}
        {Icon && <Icon className="lead" />}
      </div>
    </div>
  );
}

function Dossier({ p }: { p: Profile }) {
  const { percent } = completeness(p);
  const verified = p.verificationStatus === 'verified';
  const rows = [
    { ok: !!p.nationalId, title: 'National Identity Number', desc: p.nationalId ? 'Number on file for review' : 'Add your CNIC / national ID number', tag: p.nationalId ? 'Provided' : 'Missing' },
    { ok: !!p.documentName, title: 'Trade Licence / ID Document', desc: p.documentName || 'Upload a scan or photo of your document', tag: p.documentName ? 'Uploaded' : 'Missing' },
    { ok: !!p.photo, title: 'Profile Photograph', desc: p.photo ? 'Portrait on file' : 'Upload a clear portrait photo', tag: p.photo ? 'Provided' : 'Missing' },
  ];
  return (
    <>
      <div className="panel-inner" style={{ padding: 22, display: 'flex', gap: 18, alignItems: 'center', marginBottom: 18, borderColor: verified ? 'rgba(52,211,153,.3)' : 'rgba(255,214,10,.25)' }}>
        <div style={{ width: 58, height: 58, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: verified ? 'rgba(52,211,153,.12)' : 'rgba(255,214,10,.1)' }}>
          {verified ? <BadgeCheck size={30} color="var(--success)" /> : <ShieldCheck size={30} color="var(--yellow)" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 600, color: verified ? 'var(--success)' : 'var(--yellow)' }}>{verified ? 'Verified Provider' : 'Verification In Review'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
            {verified ? 'Your identity and documents have been cleared by the RepairEase team.' : 'The RepairEase team reviews new providers before the verified badge is granted.'}
          </div>
        </div>
        <span className={`badge ${verified ? 'badge-success' : 'badge-gold'}`}>{verified ? 'Verified' : 'Pending'}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.title} className="panel-inner" style={{ padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            {r.ok ? <CircleCheck size={20} color="var(--success)" /> : <CircleAlert size={20} color="var(--text-muted)" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflowWrap: 'anywhere' }}>{r.desc}</div>
            </div>
            <span className={`badge ${r.ok ? 'badge-success' : 'badge-muted'}`}>{r.tag}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, padding: '16px 18px', borderRadius: 12, background: 'rgba(255,214,10,.06)', border: '1px solid rgba(255,214,10,.2)', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <CircleCheck size={18} color="var(--yellow)" style={{ flexShrink: 0 }} />
        <span>Your profile is <strong style={{ color: 'var(--text-primary)' }}>{percent}% complete</strong>. {percent < 100 ? 'Finish the remaining details to speed up verification.' : 'Everything required is on file.'}</span>
      </div>
    </>
  );
}

function ProfileEditor() {
  const router = useRouter();
  const tab = ((useSearchParams().get('tab') as TabId) || 'general');
  const { profile, updateProfile, changePassword, toggleOnline, logout } = useAuth();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<Profile>(profile);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = (Object.keys(draft) as (keyof Profile)[]).some((k) => k !== 'online' && draft[k] !== profile[k]);
  const activeTab = TABS.some((t) => t.id === tab) ? tab : 'general';

  const save = async () => {
    if (!draft.email.trim() || !/^\S+@\S+\.\S+$/.test(draft.email)) return showToast('Please enter a valid email address', 'error');
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    updateProfile({ ...draft, email: draft.email.trim(), online: profile.online });
    setSaving(false);
    showToast('Profile saved successfully', 'success');
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 8 * 1024 * 1024) return showToast('Choose an image under 8MB', 'error');
    try { set('photo', await fileToDataUrl(f)); } catch { showToast('Could not read that image', 'error'); }
  };
  const onDoc = (f?: File) => {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) return showToast('Document must be under 15MB', 'error');
    set('documentName', f.name);
  };

  const submitPassword = async () => {
    if (pw.next.length < 8) return showToast('New password must be at least 8 characters', 'error');
    if (pw.next !== pw.confirm) return showToast('Passwords do not match', 'error');
    const res = await changePassword(pw.current, pw.next);
    if (!res.ok) return showToast(res.error || 'Could not change password', 'error');
    setPw({ current: '', next: '', confirm: '' });
    showToast('Password updated', 'success');
  };

  return (
    <div className="page-container animate-fadeIn">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 30 }}>
        <div style={{ maxWidth: 620 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Provider Administration <span style={{ color: 'var(--text-muted)' }}>›</span> <span style={{ color: 'var(--text-muted)' }}>Account</span></div>
          <h1 className="page-title">Profile & <br />Business Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 15, lineHeight: 1.65 }}>
            Manage your identity, business credentials and verification details. This information is shown to customers who book you.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" disabled={!dirty || saving} onClick={() => setDraft(profile)}>Cancel</button>
          <button className="btn btn-primary" disabled={!dirty || saving} onClick={save}><Save size={15} />{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </header>

      <div className="tabs" style={{ marginBottom: 26 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`tab${activeTab === id ? ' active' : ''}`} onClick={() => router.replace(`/profile?tab=${id}`)}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ───────── GENERAL ───────── */}
        {activeTab === 'general' && (
          <>
            <section className="panel panel-pad">
              <SectionHeader n="01" title="Personal Identity" badge={<span className="badge badge-gold">Account Owner</span>} />
              <div className="panel-inner" style={{ padding: 22, display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                <button onClick={() => photoRef.current?.click()} aria-label="Upload photo" style={{ position: 'relative', width: 112, height: 112, borderRadius: 18, border: '1px dashed var(--border)', background: 'var(--bg-input)', cursor: 'pointer', overflow: 'hidden', padding: 0, flexShrink: 0 }}>
                  {draft.photo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={draft.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Camera size={30} color="var(--text-muted)" />}
                </button>
                <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Profile Portrait</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.55 }}>Recommended: a clear, square photo (JPG or PNG), under 8MB.</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => photoRef.current?.click()}>Upload Photo</button>
                    {draft.photo && <button className="btn btn-danger btn-sm" onClick={() => set('photo', '')}><Trash2 size={13} /> Remove</button>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <Field label="Full legal name" icon={IdCard}><input className="input has-icon" value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Your full name" /></Field>
                <Field label="Official designation" icon={Briefcase}><input className="input has-icon" value={draft.designation} onChange={(e) => set('designation', e.target.value)} placeholder="e.g. Owner & Lead Technician" /></Field>
                <div className="form-grid-2">
                  <Field label="Email address" icon={Mail}><input className="input has-icon" type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" /></Field>
                  <Field label="Phone number" icon={Phone}><input className="input has-icon" type="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Contact number" /></Field>
                </div>
              </div>
            </section>

            <section className="panel panel-pad">
              <SectionHeader n="02" title="Verification Dossier" badge={<span className={`badge ${draft.verificationStatus === 'verified' ? 'badge-success' : 'badge-gold'}`}>{draft.verificationStatus === 'verified' ? 'Verified' : 'In review'}</span>} />
              <Dossier p={draft} />
            </section>
          </>
        )}

        {/* ───────── BUSINESS ───────── */}
        {activeTab === 'business' && (
          <section className="panel panel-pad">
            <SectionHeader n="03" title="Business Credentials" badge={<span className="badge badge-muted">Type: {draft.businessType || 'Not set'}</span>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <Field label="Registered business / workshop name" icon={Landmark}><input className="input has-icon serif" style={{ fontWeight: 600 }} value={draft.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="Your business name" /></Field>
              <div className="form-grid-2">
                <Field label="Registration / licence number"><input className="input" style={{ fontFamily: 'var(--font-mono)' }} value={draft.registrationNo} onChange={(e) => set('registrationNo', e.target.value)} placeholder="Optional" /></Field>
                <Field label="Business type">
                  <select className="select" value={draft.businessType} onChange={(e) => set('businessType', e.target.value)}>
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <div className="form-grid-2">
                <Field label="Service specialization">
                  <select className="select" value={draft.serviceType} onChange={(e) => set('serviceType', e.target.value)}>
                    <option value="">Select specialization</option>
                    {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Experience">
                  <select className="select" value={draft.experience} onChange={(e) => set('experience', e.target.value)}>
                    <option value="">Select experience</option>
                    {EXPERIENCE.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Workshop address" icon={MapPin}><input className="input has-icon" value={draft.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, area, city" /></Field>
              <Field label="Service area / coverage"><input className="input" value={draft.serviceArea} onChange={(e) => set('serviceArea', e.target.value)} placeholder="e.g. Lahore — DHA, Gulberg, Johar Town" /></Field>

              <div className="field">
                <label className="label">Pricing currency</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                  {CURRENCIES.map((c) => (
                    <button key={c.code} onClick={() => set('currency', c.code)} className="panel-inner" style={{ padding: '14px 12px', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, borderColor: draft.currency === c.code ? 'var(--yellow)' : undefined, background: draft.currency === c.code ? 'rgba(255,214,10,.08)' : undefined }}>
                      <span className="serif" style={{ fontSize: 17, fontWeight: 700, color: draft.currency === c.code ? 'var(--yellow)' : 'var(--text-primary)' }}>{c.code}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="label">Business description</label>
                  <span className="label" style={{ letterSpacing: 1 }}>Char count: {draft.bio.length} / {BIO_LIMIT}</span>
                </div>
                <textarea className="textarea" maxLength={BIO_LIMIT} value={draft.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Describe your services, tools, and what sets your work apart." />
              </div>

              <div className="panel-inner" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                  <div className="serif" style={{ fontSize: 17, fontWeight: 600 }}>Profile Completeness</div>
                  <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--yellow)' }}>{completeness(draft).percent}%</div>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${completeness(draft).percent}%` }} /></div>
              </div>
            </div>
          </section>
        )}

        {/* ───────── VERIFICATION ───────── */}
        {activeTab === 'verification' && (
          <>
            <section className="panel panel-pad">
              <SectionHeader n="01" title="Verification Dossier" badge={<span className={`badge ${draft.verificationStatus === 'verified' ? 'badge-success' : 'badge-gold'}`}>{draft.verificationStatus === 'verified' ? 'Verified' : 'In review'}</span>} />
              <Dossier p={draft} />
            </section>
            <section className="panel panel-pad">
              <SectionHeader n="02" title="Identity Documents" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <Field label="National identity number (CNIC)" icon={IdCard}><input className="input has-icon" style={{ fontFamily: 'var(--font-mono)' }} value={draft.nationalId} onChange={(e) => set('nationalId', e.target.value)} placeholder="00000-0000000-0" /></Field>
                <div className="field">
                  <label className="label">Trade licence / ID document</label>
                  <button onClick={() => docRef.current?.click()} className="panel-inner" style={{ padding: '26px 20px', border: '1px dashed var(--border)', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileText size={26} color={draft.documentName ? 'var(--yellow)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: 14, fontWeight: 600, overflowWrap: 'anywhere' }}>{draft.documentName || 'Click to upload a document'}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>PDF, PNG or JPG · max 15MB</span>
                  </button>
                  <input ref={docRef} type="file" accept=".pdf,image/*" hidden onChange={(e) => { onDoc(e.target.files?.[0]); e.target.value = ''; }} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* ───────── SECURITY ───────── */}
        {activeTab === 'security' && (
          <>
            <section className="panel panel-pad">
              <SectionHeader n="01" title="Availability" />
              <div className="panel-inner" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <Radio size={22} color={profile.online ? 'var(--success)' : 'var(--text-muted)'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{profile.online ? 'You are online' : 'You are offline'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Offline providers do not receive new service requests.</div>
                </div>
                <label className="toggle"><input type="checkbox" checked={profile.online} onChange={toggleOnline} /><span className="toggle-slider" /></label>
              </div>
            </section>
            <section className="panel panel-pad">
              <SectionHeader n="02" title="Change Password" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 520 }}>
                <Field label="Current password" icon={KeyRound}><input className="input has-icon" type={showPw ? 'text' : 'password'} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></Field>
                <Field label="New password"><input className="input" type={showPw ? 'text' : 'password'} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="At least 8 characters" autoComplete="new-password" /></Field>
                <Field label="Confirm new password"><input className="input" type={showPw ? 'text' : 'password'} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></Field>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" disabled={!pw.current || !pw.next} onClick={submitPassword}>Update Password</button>
                  <button className="btn btn-ghost" onClick={() => setShowPw((v) => !v)}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />} {showPw ? 'Hide' : 'Show'}</button>
                </div>
              </div>
            </section>
            <section className="panel panel-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="serif" style={{ fontSize: 20, fontWeight: 600 }}>Sign out of this device</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Member since {memberSince(profile) || '—'}</div>
              </div>
              <button className="btn btn-danger" onClick={logout}>Sign Out</button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <ProfileEditor />
      </Suspense>
    </DashboardLayout>
  );
}
