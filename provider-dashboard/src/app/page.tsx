'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import SplashScreen (no SSR — needs WebGL)
const SplashScreen = dynamic(() => import('@/components/SplashScreen'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#05070d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Minimal pre-hydration loader */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, #d4af37 0%, #7c5a1e 100%)',
            borderRadius: '10px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(212,175,55,0.4)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 9L12 16L22 9L12 2Z" fill="#080c14" />
            <path d="M2 15L12 22L22 15" stroke="#080c14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#f8fafc',
          }}
        >
          REPAIREASE
        </div>
        <div
          style={{
            fontSize: '9px',
            color: '#64748b',
            letterSpacing: '2px',
            marginTop: '4px',
            fontFamily: 'monospace',
          }}
        >
          INITIALIZING...
        </div>
      </div>
    </div>
  ),
});

export default function RootPage() {
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
    router.push('/login');
  }, [router]);

  // Once splash done, show nothing (router will handle redirect)
  if (splashDone) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#05070d',
          zIndex: 9999,
        }}
      />
    );
  }

  return <SplashScreen onComplete={handleSplashComplete} />;
}
