'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function PendingPage() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }} className="animate-fadeIn">
        {/* Animated icon */}
        <div style={{
          width: 100, height: 100,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(108,99,255,0.2))',
          border: '2px solid var(--accent3)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '44px',
          margin: '0 auto 32px',
          animation: 'glow 2s ease-in-out infinite',
        }}>
          ⏳
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: 12 }}>
          Account Under Review
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px', marginBottom: 32 }}>
          Your application has been submitted successfully. Our admin team is reviewing your documents and will verify your account within <strong style={{ color: 'var(--accent3)' }}>24–48 hours</strong>.
        </p>

        {/* Status steps */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          textAlign: 'left',
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)' }}>
            VERIFICATION PROGRESS
          </h3>
          {[
            { label: 'Application Submitted', desc: 'Your documents have been received', done: true, active: false },
            { label: 'Document Review', desc: 'Admin is reviewing your CNIC and license', done: false, active: true },
            { label: 'Background Check', desc: 'Identity verification in progress', done: false, active: false },
            { label: 'Account Activated', desc: 'Start accepting job requests', done: false, active: false },
          ].map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 16, marginBottom: i < 3 ? 24 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: step.done
                    ? 'var(--success)'
                    : step.active
                    ? 'linear-gradient(135deg, var(--accent), #8b5cf6)'
                    : 'var(--bg-input)',
                  border: step.active ? 'none' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                  ...(step.active ? { animation: 'glow 2s ease-in-out infinite' } : {}),
                }}>
                  {step.done ? '✓' : step.active ? (
                    <span style={{ animation: 'spin 2s linear infinite', display: 'inline-block' }}>⟳</span>
                  ) : (i + 1)}
                </div>
                {i < 3 && <div style={{ width: 2, height: 24, background: step.done ? 'var(--success)' : 'var(--border)', margin: '4px 0', borderRadius: 1 }} />}
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: step.done ? 'var(--success)' : step.active ? 'var(--text-primary)' : 'var(--text-muted)',
                  marginBottom: 2,
                }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.desc}</div>
                {step.active && (
                  <div style={{ marginTop: 8 }}>
                    <div className="progress-bar" style={{ width: 200 }}>
                      <div className="progress-fill" style={{ width: '40%' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Estimated: 24-48 hours</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: 24 }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <div>
            <strong>What happens next?</strong>
            <p style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              Once verified, you'll receive an email and app notification. You can then log in and start accepting job requests immediately.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-ghost">← Back to Login</Link>
          <button onClick={() => setShowDetails(!showDetails)} className="btn btn-secondary">
            📄 View Submission
          </button>
        </div>

        {showDetails && (
          <div className="animate-fadeIn" style={{
            marginTop: 24,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            textAlign: 'left',
          }}>
            <h4 style={{ marginBottom: 12, fontSize: '14px', color: 'var(--text-secondary)' }}>SUBMITTED INFORMATION</h4>
            {[
              ['Full Name', 'Ahmed Khan'],
              ['Email', 'ahmed@example.com'],
              ['Phone', '+92 300 1234567'],
              ['Shop Name', 'Ahmed Auto Repair'],
              ['Service Type', 'Auto Mechanic'],
              ['Submitted At', new Date().toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
