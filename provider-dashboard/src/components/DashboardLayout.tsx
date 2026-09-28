'use client';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main
        className="main-content"
        style={{
          marginLeft: '260px',
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
