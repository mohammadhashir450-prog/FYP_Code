'use client';
import { useRouter } from 'next/navigation';
import { CircleCheck, Clock, FileSearch, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const STEPS = [
  { icon: CircleCheck, title: 'Application submitted', desc: 'Your details and documents have been received.', state: 'done' },
  { icon: FileSearch, title: 'Document review', desc: 'Our team is checking your ID and trade documents.', state: 'active' },
  { icon: ShieldCheck, title: 'Identity verification', desc: 'Your identity is confirmed against the submitted ID.', state: 'todo' },
  { icon: BadgeCheck, title: 'Account activated', desc: 'You receive the verified badge and start accepting jobs.', state: 'todo' },
] as const;

export default function PendingPage() {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="panel panel-pad animate-fadeIn" style={{ maxWidth: 580, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="RepairEase" width={72} height={72} className="logo-tile" style={{ width: 72, height: 72, margin: '0 auto 24px', boxShadow: '0 0 32px rgba(255,214,10,.25)' }} />
          <div className="eyebrow" style={{ marginBottom: 12 }}><Clock size={11} style={{ verticalAlign: '-1px' }} /> Application under review</div>
          <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, marginBottom: 12 }}>Thank you{profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14.5 }}>
            Your application is with our verification team. You can already explore your dashboard and complete your profile while we review.
          </p>
        </div>

        <div className="panel-inner" style={{ padding: 24, marginBottom: 26 }}>
          <div className="eyebrow eyebrow-muted" style={{ marginBottom: 20 }}>Verification progress</div>
          {STEPS.map(({ icon: Icon, title, desc, state }, i) => (
            <div key={title} style={{ display: 'flex', gap: 16, marginBottom: i < STEPS.length - 1 ? 22 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: state === 'done' ? 'rgba(52,211,153,.14)' : state === 'active' ? 'rgba(255,214,10,.12)' : 'transparent',
                border: `1px solid ${state === 'done' ? 'rgba(52,211,153,.4)' : state === 'active' ? 'rgba(255,214,10,.45)' : 'var(--border)'}` }}>
                <Icon size={17} color={state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--yellow)' : 'var(--text-muted)'} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: state === 'todo' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-lg btn-full" onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}>
          {isAuthenticated ? 'Go to Dashboard' : 'Back to Sign In'}
        </button>
      </div>
    </div>
  );
}
