'use client';
import Link from 'next/link';
import { Settings, Radio, UserRound, ShieldCheck } from 'lucide-react';
import TemplatePage from '@/components/TemplatePage';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const { profile, toggleOnline } = useAuth();
  return (
    <TemplatePage eyebrow="Settings" title="Settings" icon={Settings}
      description="Availability, account and preferences."
      emptyTitle="More preferences coming soon"
      emptyDescription="Notification, language and payout preferences will be configurable here.">
      <section className="panel panel-pad" style={{ marginBottom: 22, display: 'grid', gap: 14 }}>
        <div className="panel-inner" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Radio size={22} color={profile.online ? 'var(--success)' : 'var(--text-muted)'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{profile.online ? 'You are online' : 'You are offline'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Offline providers do not receive new requests.</div>
          </div>
          <label className="toggle"><input type="checkbox" checked={profile.online} onChange={toggleOnline} /><span className="toggle-slider" /></label>
        </div>
        <div className="form-grid-2">
          <Link href="/profile?tab=general" className="panel-inner" style={{ padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', color: 'var(--text-primary)', textDecoration: 'none' }}><UserRound size={20} color="var(--yellow)" /> Profile & Identity</Link>
          <Link href="/profile?tab=security" className="panel-inner" style={{ padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', color: 'var(--text-primary)', textDecoration: 'none' }}><ShieldCheck size={20} color="var(--yellow)" /> Security & Access</Link>
        </div>
      </section>
    </TemplatePage>
  );
}
