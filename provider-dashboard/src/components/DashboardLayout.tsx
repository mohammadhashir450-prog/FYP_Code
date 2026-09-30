'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from './AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace('/login');
  }, [ready, isAuthenticated, router]);

  // Keep the left-edge Quick Actions pie clear of the sidebar.
  useEffect(() => {
    document.documentElement.style.setProperty('--qp-left', `${collapsed ? 78 : 268}px`);
    return () => { document.documentElement.style.removeProperty('--qp-left'); };
  }, [collapsed]);

  if (!ready || !isAuthenticated) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <Topbar />
        <div style={{ flex: 1 }}>{children}</div>
      </main>
    </div>
  );
}
