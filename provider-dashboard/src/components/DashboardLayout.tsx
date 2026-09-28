'use client';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
