'use client';
import type { LucideIcon } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

/** Shared shell for pages whose content will be wired to the backend later. */
export default function TemplatePage({ eyebrow, title, description, icon: Icon, emptyTitle, emptyDescription, badge, children }: Props) {
  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <header style={{ marginBottom: 30 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Provider Workspace <span style={{ color: 'var(--text-muted)' }}>› {eyebrow}</span></div>
          <h1 className="page-title">{title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 14, fontSize: 15, lineHeight: 1.65, maxWidth: 620 }}>{description}</p>
        </header>
        {children}
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '22px 30px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon size={20} color="var(--yellow)" />
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{title}</h2>
            </div>
            {badge}
          </div>
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, margin: '0 auto 18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,123,214,.1)', border: '1px solid rgba(43,123,214,.28)' }}>
              <Icon size={26} color="var(--blue-soft)" />
            </div>
            <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{emptyTitle}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.65 }}>{emptyDescription}</div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
