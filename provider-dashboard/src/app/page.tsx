'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// No SSR — Three.js needs browser WebGL
const SplashScreen = dynamic(() => import('@/components/SplashScreen'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#06080f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 18,
      }}
    >
      {/* Gold emblem */}
      <div
        style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg,#d4af37 0%,#7c5a1e 100%)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 32px rgba(212,175,55,0.5)',
          border: '1px solid rgba(255,235,170,0.3)',
          animation: 'pulse 2s infinite',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#07090e"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#f8fafc',
          }}
        >
          REPAIREASE
        </div>
        <div
          style={{
            fontSize: 9,
            color: '#64748b',
            letterSpacing: '2px',
            marginTop: 5,
            fontFamily: 'monospace',
          }}
        >
          INITIALIZING PORTAL...
        </div>
      </div>
    </div>
  ),
});

export default function RootPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  const handleComplete = useCallback(() => {
    setDone(true);
    router.push('/login');
  }, [router]);

  if (done) return null;

  return <SplashScreen onComplete={handleComplete} />;
}
