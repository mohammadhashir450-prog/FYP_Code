'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function ChatJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  // Redirect to main chat page with job context
  if (typeof window !== 'undefined') {
    router.push('/chat');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
      Loading chat for {jobId}...
    </div>
  );
}
