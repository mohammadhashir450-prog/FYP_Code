'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';

// ── STAT CARD COMPONENT ────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  trendVal?: string;
  color: string;
}

function StatCard({ icon, label, value, sub, trend, trendVal, color }: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, #111827 0%, #0d1520 100%)'
          : 'linear-gradient(135deg, #0d1117 0%, #0a0e18 100%)',
        border: `1px solid ${hovered ? color : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '14px',
        padding: '22px 24px',
        transition: 'all 0.25s ease',
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}22` : '0 2px 12px rgba(0,0,0,0.4)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow accent on hover */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          transition: 'opacity 0.3s ease',
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          {icon}
        </div>
        {trendVal && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '20px',
              background: `${trendColor}12`,
              border: `1px solid ${trendColor}30`,
              fontSize: '11px',
              fontWeight: 700,
              color: trendColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span>{trendIcon}</span>
            <span>{trendVal}</span>
          </div>
        )}
      </div>

      <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '11.5px', color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
        {sub}
      </div>
    </div>
  );
}

// ── QUICK ACTION BUTTON ────────────────────────────────────────────
function QuickAction({ icon, label, desc, color }: { icon: string; label: string; desc: string; color: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        width: '100%',
        padding: '14px 16px',
        background: hovered ? `${color}0d` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? color + '50' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>{desc}</div>
      </div>
      <span style={{ color: '#4b5563', fontSize: '14px' }}>›</span>
    </button>
  );
}

// ── EMPTY STATE PLACEHOLDER ────────────────────────────────────────
function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '10px',
      }}
    >
      <div style={{ fontSize: '32px', opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{title}</div>
      <div style={{ fontSize: '11.5px', color: '#4b5563', maxWidth: '220px', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ── SECTION CARD WRAPPER ───────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  badge,
  badgeColor,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #0a0e18 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{subtitle}</div>}
          </div>
          {badge && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px',
                background: `${badgeColor || '#d4af37'}18`,
                border: `1px solid ${badgeColor || '#d4af37'}40`,
                color: badgeColor || '#d4af37',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.5px',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── MAIN DASHBOARD COMPONENT ───────────────────────────────────────
export default function DashboardHome() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(
        now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      );
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <DashboardLayout>
      <div
        style={{
          background: '#080b12',
          minHeight: '100vh',
          padding: '28px 32px 48px',
          fontFamily: "'Inter', sans-serif",
          color: '#f8fafc',
        }}
      >
        {/* ── WELCOME HEADER ───────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                  display: 'inline-block',
                  animation: 'pulse 2s infinite',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#22c55e',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                System Operational
              </span>
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              {greeting},{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {user?.name || 'Admin'}
              </span>
            </h1>
            <p style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '6px', fontWeight: 400 }}>
              {currentDate} · RepairEase Admin Portal
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live Time */}
            <div
              style={{
                padding: '10px 16px',
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#d4af37',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '2px',
                }}
              >
                {currentTime}
              </div>
              <div style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '2px', letterSpacing: '1px' }}>
                PKT TIME
              </div>
            </div>

            {/* Platform Status */}
            <div
              style={{
                padding: '10px 16px',
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '10px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>
                All Systems Online
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>99.9% uptime · No incidents</div>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ROW ───────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <StatCard
            icon="👤"
            label="Total Providers"
            value="—"
            sub="Connect your data source"
            trend="neutral"
            color="#d4af37"
          />
          <StatCard
            icon="🔧"
            label="Active Jobs"
            value="—"
            sub="Real-time job feed pending"
            trend="neutral"
            color="#3b82f6"
          />
          <StatCard
            icon="✅"
            label="Completed Today"
            value="—"
            sub="Completion rate available soon"
            trend="neutral"
            color="#22c55e"
          />
          <StatCard
            icon="⭐"
            label="Avg. Rating"
            value="—"
            sub="Customer ratings coming soon"
            trend="neutral"
            color="#f59e0b"
          />
        </div>

        {/* ── MAIN 2-COLUMN GRID ───────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          {/* ── LEFT: Recent Activity + Provider Requests ──────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Recent Provider Registrations */}
            <SectionCard
              title="Recent Provider Applications"
              subtitle="New registrations awaiting admin review"
              badge="LIVE"
              badgeColor="#22c55e"
              action={
                <button
                  style={{
                    padding: '6px 14px',
                    borderRadius: '7px',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: '#d4af37',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View All
                </button>
              }
            >
              <EmptyState
                icon="📋"
                title="No applications yet"
                desc="Provider registration applications will appear here for review and approval."
              />
            </SectionCard>

            {/* Recent Job Activity */}
            <SectionCard
              title="Job Activity Feed"
              subtitle="Real-time service request stream"
              badge="FEED"
              badgeColor="#3b82f6"
              action={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.25)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      boxShadow: '0 0 6px #3b82f6',
                    }}
                  />
                  <span style={{ fontSize: '10px', color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace" }}>
                    Connecting...
                  </span>
                </div>
              }
            >
              <EmptyState
                icon="🔧"
                title="Awaiting job data"
                desc="Job requests and service activity will stream here in real time once connected."
              />
            </SectionCard>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Platform Health */}
            <SectionCard title="Platform Health" subtitle="Service status overview">
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Authentication API', status: 'Operational', color: '#22c55e' },
                  { label: 'Job Matching Engine', status: 'Operational', color: '#22c55e' },
                  { label: 'Notification Service', status: 'Operational', color: '#22c55e' },
                  { label: 'Payment Gateway', status: 'Not Configured', color: '#f59e0b' },
                  { label: 'SMS / WhatsApp', status: 'Not Configured', color: '#f59e0b' },
                ].map(({ label, status, color }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: color,
                          boxShadow: `0 0 6px ${color}`,
                        }}
                      />
                      <span style={{ fontSize: '11px', color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard title="Quick Actions" subtitle="Common admin operations">
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <QuickAction
                  icon="👤"
                  label="Manage Providers"
                  desc="View, approve or suspend providers"
                  color="#d4af37"
                />
                <QuickAction
                  icon="📦"
                  label="View Job Requests"
                  desc="Monitor all active service requests"
                  color="#3b82f6"
                />
                <QuickAction
                  icon="⭐"
                  label="Review Ratings"
                  desc="Customer feedback and disputes"
                  color="#f59e0b"
                />
                <QuickAction
                  icon="⚙️"
                  label="System Settings"
                  desc="Configure platform and notifications"
                  color="#8b5cf6"
                />
              </div>
            </SectionCard>
          </div>
        </div>

        {/* ── BOTTOM FULL-WIDTH: Analytics Placeholder ─────────── */}
        <SectionCard
          title="Analytics Overview"
          subtitle="Platform performance metrics and trends"
          badge="COMING SOON"
          badgeColor="#8b5cf6"
          action={
            <button
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#a78bfa',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Configure
            </button>
          }
        >
          <div
            style={{
              padding: '0 22px 22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              marginTop: '16px',
            }}
          >
            {[
              { label: 'Revenue This Month', icon: '💰', color: '#22c55e', desc: 'Connect payment gateway' },
              { label: 'New Users (7 Days)', icon: '📈', color: '#3b82f6', desc: 'User registration analytics' },
              { label: 'Avg. Response Time', icon: '⚡', color: '#f59e0b', desc: 'Provider response metrics' },
            ].map(({ label, icon, color, desc }) => (
              <div
                key={label}
                style={{
                  padding: '18px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color, marginBottom: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                  —
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '10.5px', color: '#4b5563' }}>{desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
