'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const REVIEWS = [
  { id: 1, customer: 'Usman Ali', avatar: 'UA', rating: 5, date: '27 Sep 2026', service: 'Oil Change', comment: 'Excellent service! Ahmed was very professional and fast. Will definitely use his services again.', helpful: 12 },
  { id: 2, customer: 'Ayesha Siddiqui', avatar: 'AS', rating: 5, date: '24 Sep 2026', service: 'Engine Tune-up', comment: 'Very knowledgeable mechanic. Fixed my car quickly and the price was fair. Highly recommended!', helpful: 8 },
  { id: 3, customer: 'Fatima Khan', avatar: 'FK', rating: 4, date: '26 Sep 2026', service: 'Brake Inspection', comment: 'Good service, arrived on time. Minor communication issue but overall satisfied.', helpful: 5 },
  { id: 4, customer: 'Raza Hussain', avatar: 'RH', rating: 4, date: '23 Sep 2026', service: 'Wiper Replacement', comment: 'Quick and efficient. Fair pricing.', helpful: 3 },
  { id: 5, customer: 'Bilal Raza', avatar: 'BR', rating: 5, date: '20 Sep 2026', service: 'Battery Replacement', comment: 'Saved my day! Ahmed came within 20 minutes and replaced the battery professionally. Great guy!', helpful: 15 },
  { id: 6, customer: 'Sara Malik', avatar: 'SM', rating: 3, date: '18 Sep 2026', service: 'Tyre Replacement', comment: 'Service was okay but took longer than expected.', helpful: 2 },
];

const BREAKDOWN = [
  { stars: '5 ★', count: 52, color: '#22c55e' },
  { stars: '4 ★', count: 24, color: '#6c63ff' },
  { stars: '3 ★', count: 8, color: '#f59e0b' },
  { stars: '2 ★', count: 3, color: '#f97316' },
  { stars: '1 ★', count: 2, color: '#ef4444' },
];
const totalReviews = BREAKDOWN.reduce((s, b) => s + b.count, 0);

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= rating ? '' : 'empty'}`} style={{ fontSize: '14px' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn">
        <div className="page-header">
          <h1>Reviews & Ratings</h1>
          <p>See what your customers are saying about your service</p>
        </div>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, marginBottom: 32 }}>
          {/* Big rating */}
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', fontWeight: 900, background: 'linear-gradient(135deg, var(--accent3), #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              4.8
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '8px 0' }}>
              {[1,2,3,4,5].map(i => <span key={i} className="star" style={{ fontSize: '20px' }}>★</span>)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Based on {totalReviews} reviews</div>
            <div className="badge badge-success" style={{ marginTop: 12, padding: '6px 14px' }}>🏆 Top Rated</div>
          </div>

          {/* Rating breakdown */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 20 }}>Rating Breakdown</h3>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <ResponsiveContainer width={180} height={180}>
                <BarChart data={BREAKDOWN} layout="vertical" margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" horizontal={false} />
                  <XAxis type="number" stroke="#4a5878" tick={{ fontSize: 11, fill: '#8898bb' }} />
                  <YAxis dataKey="stars" type="category" stroke="#4a5878" tick={{ fontSize: 11, fill: '#8898bb' }} width={36} />
                  <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #2a3550', borderRadius: 8, color: '#f0f4ff' }} />
                  <Bar dataKey="count" radius={4}>
                    {BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {BREAKDOWN.map(b => (
                  <div key={b.stars} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '12px', color: b.color, fontWeight: 600, minWidth: 30 }}>{b.stars}</span>
                    <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                      <div style={{ height: '100%', borderRadius: 4, background: b.color, width: `${(b.count / totalReviews) * 100}%`, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: 24, textAlign: 'right' }}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Reviews', value: totalReviews, icon: '💬', color: 'var(--accent)' },
            { label: 'Average Rating', value: '4.8', icon: '⭐', color: 'var(--accent3)' },
            { label: '5-Star Reviews', value: '52', icon: '🏆', color: 'var(--success)' },
            { label: 'Response Rate', value: '100%', icon: '📩', color: 'var(--accent2)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{ fontSize: '28px' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Customer Reviews</h3>
            <select className="input" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}>
              <option>Most Recent</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
            </select>
          </div>
          {REVIEWS.map(review => (
            <div key={review.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="avatar" style={{ width: 46, height: 46, fontSize: '15px', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', flexShrink: 0 }}>
                  {review.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700 }}>{review.customer}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.service} · {review.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRow rating={review.rating} />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent3)' }}>{review.rating}.0</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                      👍 Helpful ({review.helpful})
                    </button>
                    <button className="btn btn-ghost btn-sm">💬 Reply</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
