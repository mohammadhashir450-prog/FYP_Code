'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const AREA_DATA = [
  { day: 'Mon', jobs: 4, earnings: 3200 },
  { day: 'Tue', jobs: 7, earnings: 5600 },
  { day: 'Wed', jobs: 5, earnings: 4000 },
  { day: 'Thu', jobs: 9, earnings: 7200 },
  { day: 'Fri', jobs: 12, earnings: 9600 },
  { day: 'Sat', jobs: 8, earnings: 6400 },
  { day: 'Sun', jobs: 6, earnings: 4800 },
];

const PIE_DATA = [
  { name: 'Completed', value: 68, color: '#22c55e' },
  { name: 'Ongoing', value: 18, color: '#6c63ff' },
  { name: 'Cancelled', value: 14, color: '#ef4444' },
];

const RECENT_JOBS = [
  { id: 'JOB-0041', customer: 'Bilal Raza', service: 'Engine Diagnostics', status: 'pending', amount: 1500, time: '10 min ago', avatar: 'BR', color: '#6c63ff' },
  { id: 'JOB-0040', customer: 'Sara Malik', service: 'Tyre Replacement', status: 'ongoing', amount: 2200, time: '1 hr ago', avatar: 'SM', color: '#00d4aa' },
  { id: 'JOB-0039', customer: 'Usman Ali', service: 'Oil Change', status: 'completed', amount: 800, time: '3 hrs ago', avatar: 'UA', color: '#8b5cf6' },
  { id: 'JOB-0038', customer: 'Fatima Khan', service: 'Brake Inspection', status: 'completed', amount: 600, time: 'Yesterday', avatar: 'FK', color: '#f59e0b' },
  { id: 'JOB-0037', customer: 'Hamza Nasir', service: 'Battery Replacement', status: 'cancelled', amount: 0, time: 'Yesterday', avatar: 'HN', color: '#ef4444' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-warning',
  ongoing: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

// Animated number counter
function Counter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

const STATS = [
  { icon: '📋', label: 'Total Jobs', value: 127, prefix: '', suffix: '', change: '+12 this week', up: true, color: '#6c63ff' },
  { icon: '⭐', label: 'Average Rating', value: 48, prefix: '', suffix: '/5', change: '+0.2 this month', up: true, color: '#f59e0b' },
  { icon: '✅', label: 'Completion Rate', value: 94, prefix: '', suffix: '%', change: '+3% vs last month', up: true, color: '#00d4aa' },
  { icon: '💰', label: 'This Week', value: 40800, prefix: 'Rs ', suffix: '', change: '+18% vs last week', up: true, color: '#8b5cf6' },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [chartMode, setChartMode] = useState<'jobs' | 'earnings'>('jobs');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate a new job notification after 4 seconds
    const t = setTimeout(() => {
      showToast('🔔 New job request from Zara Ahmed!', 'info');
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '26px', marginBottom: 4 }}>
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p>Here&apos;s your business overview for today.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: user?.online ? 'rgba(34,197,94,0.1)' : 'var(--bg-card)',
              border: `1px solid ${user?.online ? 'var(--success)' : 'var(--border)'}`,
              borderRadius: '20px', padding: '6px 14px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: user?.online ? 'var(--success)' : 'var(--text-muted)', boxShadow: user?.online ? '0 0 6px var(--success)' : 'none' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: user?.online ? 'var(--success)' : 'var(--text-muted)' }}>
                {user?.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <Link href="/jobs" className="btn btn-primary btn-sm">📋 View Jobs</Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {STATS.map((card, idx) => (
            <div key={card.label} className="stat-card" style={{ animationDelay: `${idx * 0.08}s`, animation: 'fadeIn 0.5s ease forwards', opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 46, height: 46,
                  background: `${card.color}18`,
                  border: `1px solid ${card.color}40`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: card.up ? 'var(--success)' : 'var(--danger)', background: card.up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: '10px' }}>
                  {card.up ? '↑' : '↓'} {card.change.split(' ')[0]}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '30px', fontWeight: 900, color: card.color, lineHeight: 1 }}>
                  <Counter target={card.value} prefix={card.prefix} suffix={card.suffix} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{card.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          {/* Area chart */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Weekly Performance</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {chartMode === 'jobs' ? 'Number of jobs per day' : 'Earnings per day (Rs)'}
                </p>
              </div>
              <div className="tabs" style={{ width: 'auto', gap: 4 }}>
                <button className={`tab ${chartMode === 'jobs' ? 'active' : ''}`} onClick={() => setChartMode('jobs')} style={{ flex: 'none', padding: '5px 12px', fontSize: '12px' }}>Jobs</button>
                <button className={`tab ${chartMode === 'earnings' ? 'active' : ''}`} onClick={() => setChartMode('earnings')} style={{ flex: 'none', padding: '5px 12px', fontSize: '12px' }}>Earnings</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={195}>
              <AreaChart data={AREA_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d48" />
                <XAxis dataKey="day" stroke="#4a5878" tick={{ fontSize: 11, fill: '#8898bb' }} />
                <YAxis stroke="#4a5878" tick={{ fontSize: 11, fill: '#8898bb' }} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid #2a3550', borderRadius: 8, color: '#f0f4ff', fontSize: 12 }}
                  formatter={(v: number) => chartMode === 'earnings' ? [`Rs ${v.toLocaleString()}`, 'Earnings'] : [v, 'Jobs']}
                />
                <Area type="monotone" dataKey={chartMode} stroke="#6c63ff" fill="url(#areaGrad)" strokeWidth={2.5} dot={{ fill: '#6c63ff', r: 3 }} activeDot={{ r: 5, fill: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Job Status Distribution</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>All-time job breakdown</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
                      {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>94%</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Success</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {PIE_DATA.map(d => (
                  <div key={d.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div style={{ height: '100%', width: `${d.value}%`, background: d.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* Recent Jobs table */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Job Requests</h3>
              <Link href="/jobs" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                View all →
              </Link>
            </div>
            <div>
              {RECENT_JOBS.map((job, i) => (
                <div key={job.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0',
                  borderBottom: i < RECENT_JOBS.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `${job.color}25`,
                    border: `1px solid ${job.color}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: job.color, flexShrink: 0,
                  }}>
                    {job.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.customer}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.service} · {job.time}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge ${STATUS_BADGE[job.status]}`}>{job.status}</span>
                    {job.amount > 0 && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 3 }}>Rs {job.amount.toLocaleString()}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Actions */}
            <div className="card" style={{ padding: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>⚡ QUICK ACTIONS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Pending Jobs', href: '/jobs', icon: '📋', color: '#6c63ff', count: '2' },
                  { label: 'Live Chat', href: '/chat', icon: '💬', color: '#00d4aa', count: '1' },
                  { label: 'My Reviews', href: '/reviews', icon: '⭐', color: '#f59e0b', count: '' },
                  { label: 'Go Offline', href: '/availability', icon: '📍', color: '#8b5cf6', count: '' },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: '9px', textDecoration: 'none', transition: 'all 0.2s',
                    color: 'var(--text-primary)',
                  }}>
                    <div style={{ width: 28, height: 28, background: `${a.color}18`, border: `1px solid ${a.color}30`, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{a.icon}</div>
                    <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>{a.label}</span>
                    {a.count && <span style={{ background: a.color, color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{a.count}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Today's summary */}
            <div className="card" style={{ padding: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>📅 TODAY</h4>
              {[
                { label: 'Jobs Done', value: '3', color: 'var(--success)' },
                { label: 'Earnings', value: 'Rs 4,500', color: 'var(--accent2)' },
                { label: 'Avg Response', value: '4 min', color: 'var(--text-primary)' },
                { label: 'Rating Today', value: '4.9 ⭐', color: 'var(--accent3)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
