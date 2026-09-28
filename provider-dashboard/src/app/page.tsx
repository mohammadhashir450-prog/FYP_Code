'use client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function RootPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>🔧</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: 8 }}>
          <span className="gradient-text">ProServe</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Service Provider Portal</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
