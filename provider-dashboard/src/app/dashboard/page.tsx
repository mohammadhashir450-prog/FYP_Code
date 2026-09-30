'use client';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, Clock, CircleCheck, Circle, Mail, MapPin, Phone, Radio, ShieldCheck, Wrench } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';
import { Avatar } from '@/components/Topbar';
import { completeness, memberSince } from '@/lib/profile';

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Clock; label: string; value: string; sub: string }) {
  return (
    <div className="panel rail" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span className="eyebrow eyebrow-muted">{label}</span>
        <span style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,214,10,.08)', border: '1px solid rgba(255,214,10,.2)' }}>
          <Icon size={17} color="var(--yellow)" />
        </span>
      </div>
      <div className="serif" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

function Empty({ icon: Icon, title, desc }: { icon: typeof Clock; title: string; desc: string }) {
  return (
    <div style={{ padding: '44px 24px', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,123,214,.1)', border: '1px solid rgba(43,123,214,.25)' }}>
        <Icon size={22} color="var(--blue-soft)" />
      </div>
      <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function Detail({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)' }}>
      <Icon size={15} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  );
}

export default function DashboardHome() {
  const { profile, user } = useAuth();
  const { percent, missing } = completeness(profile);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (profile.fullName || user?.name || '').split(' ')[0];
  const verified = profile.verificationStatus === 'verified';

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <header style={{ marginBottom: 34 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Provider Workspace <span style={{ color: 'var(--text-muted)' }}>· {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
          <h1 className="page-title">{greeting}{firstName ? ',' : ''} {firstName && <span className="gradient-text" style={{ fontStyle: 'italic' }}>{firstName}</span>}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 15, maxWidth: 620, lineHeight: 1.6 }}>
            {profile.businessName ? `Managing ${profile.businessName}. ` : ''}Keep your profile complete so customers can trust and book you.
          </p>
        </header>

        <section className="grid-4" style={{ marginBottom: 24 }}>
          <Stat icon={BadgeCheck} label="Verification" value={verified ? 'Verified' : 'In Review'} sub={verified ? 'Identity and documents cleared' : 'Our team is reviewing your documents'} />
          <Stat icon={Radio} label="Availability" value={profile.online ? 'Online' : 'Offline'} sub={profile.online ? 'Accepting new requests' : 'New requests are paused'} />
          <Stat icon={ShieldCheck} label="Profile Strength" value={`${percent}%`} sub={missing.length ? `${missing.length} item${missing.length > 1 ? 's' : ''} left to complete` : 'Profile fully complete'} />
          <Stat icon={Clock} label="Member Since" value={memberSince(profile) || '—'} sub="Provider account created" />
        </section>

        <div className="split-main">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
            {/* Profile completion */}
            <section className="panel panel-pad">
              <div className="section-head" style={{ marginBottom: 20 }}>
                <div>
                  <div className="eyebrow eyebrow-muted" style={{ marginBottom: 8 }}>Setup</div>
                  <h2>{missing.length ? 'Complete your profile' : 'Your profile is complete'}</h2>
                </div>
                <span className={`badge ${missing.length ? 'badge-gold' : 'badge-success'}`}>{percent}%</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 22 }}><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
              {missing.length === 0 ? (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Everything is in place. Update your details any time from Profile & Identity.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {missing.map((m) => (
                    <Link key={m.key} href={`/profile?tab=${m.tab}`} className="panel-inner" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13.5 }}>
                      <Circle size={16} color="var(--text-muted)" />
                      <span style={{ flex: 1 }}>{m.label}</span>
                      <ArrowRight size={15} color="var(--yellow)" />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Job feed */}
            <section className="panel" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '26px 30px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="eyebrow eyebrow-muted" style={{ marginBottom: 8 }}>Service Requests</div>
                  <h2 className="serif" style={{ fontSize: 24, fontWeight: 600 }}>Job Activity</h2>
                </div>
                <span className="badge badge-info"><Wrench size={12} /> Live</span>
              </div>
              <Empty icon={Wrench} title="No job requests yet" desc={verified || profile.online ? 'New customer requests matching your specialization will appear here as soon as they are placed.' : 'Go online to start receiving customer requests.'} />
            </section>
          </div>

          {/* Right column: identity card */}
          <aside className="panel panel-pad" style={{ alignSelf: 'flex-start', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 22, borderBottom: '1px solid var(--border-light)', marginBottom: 22 }}>
              <Avatar size={84} />
              <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 16 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{profile.designation || profile.serviceType || 'Service Provider'}</div>
              <span className={`badge ${verified ? 'badge-success' : 'badge-gold'}`} style={{ marginTop: 14 }}>
                {verified ? <><BadgeCheck size={12} /> Verified</> : <><Clock size={12} /> Pending review</>}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Detail icon={Mail} value={profile.email} />
              <Detail icon={Phone} value={profile.phone} />
              <Detail icon={Building2} value={profile.businessName} />
              <Detail icon={MapPin} value={profile.address} />
              {!profile.phone && !profile.businessName && !profile.address && (
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>Add your contact and business details to display them here.</div>
              )}
            </div>
            <Link href="/profile" className="btn btn-secondary btn-full" style={{ marginTop: 24 }}>Edit Profile</Link>
            {missing.length === 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--success)', justifyContent: 'center' }}>
                <CircleCheck size={14} /> All details on file
              </div>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
