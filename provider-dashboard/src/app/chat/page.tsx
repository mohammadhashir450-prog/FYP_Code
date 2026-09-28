'use client';
import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

const ACTIVE_JOBS = [
  { id: 'JOB-0041', customer: 'Sara Malik', avatar: 'SM', service: 'Tyre Replacement', status: 'ongoing' },
  { id: 'JOB-0040', customer: 'Omar Farooq', avatar: 'OF', service: 'Battery Jump-start', status: 'ongoing' },
];

type Message = { id: number; text: string; sent: boolean; time: string };

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'JOB-0041': [
    { id: 1, text: 'Hello! I am on my way to your location.', sent: true, time: '1:02 PM' },
    { id: 2, text: 'Great! I am parked near the main gate.', sent: false, time: '1:04 PM' },
    { id: 3, text: 'I can see you. Be there in 2 minutes.', sent: true, time: '1:05 PM' },
    { id: 4, text: 'How long will the tyre replacement take?', sent: false, time: '1:06 PM' },
    { id: 5, text: 'About 20-30 minutes. I have all the tools ready.', sent: true, time: '1:07 PM' },
  ],
  'JOB-0040': [
    { id: 1, text: 'I am heading to your location now.', sent: true, time: '1:30 PM' },
    { id: 2, text: 'Okay, please hurry! I am stuck in the parking.', sent: false, time: '1:31 PM' },
    { id: 3, text: 'I will be there in 5 minutes.', sent: true, time: '1:32 PM' },
  ],
};

export default function ChatPage() {
  const [activeJob, setActiveJob] = useState(ACTIVE_JOBS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [calling, setCalling] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentJob = ACTIVE_JOBS.find(j => j.id === activeJob)!;
  const currentMessages = messages[activeJob] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg: Message = { id: Date.now(), text: input.trim(), sent: true, time };
    setMessages(prev => ({ ...prev, [activeJob]: [...(prev[activeJob] || []), msg] }));
    setInput('');

    // Simulate customer reply
    setTimeout(() => {
      const replies = ['Got it, thanks!', 'Okay, see you soon.', 'How much longer?', '👍', 'Alright!'];
      const reply: Message = { id: Date.now() + 1, text: replies[Math.floor(Math.random() * replies.length)], sent: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => ({ ...prev, [activeJob]: [...(prev[activeJob] || []), reply] }));
    }, 1500);
  };

  const QUICK_REPLIES = [
    'On my way! 🚗',
    'Arrived at location ✅',
    'Will take 30 min',
    'Payment received 💰',
    'Job completed! ✓',
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fadeIn" style={{ padding: '32px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h1>Live Chat</h1>
          <p>Real-time messaging with customers per active job</p>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 0 }}>
          {/* Job List */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Active Jobs</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {ACTIVE_JOBS.map(job => (
                <button
                  key={job.id}
                  id={`chat-job-${job.id}`}
                  onClick={() => setActiveJob(job.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: activeJob === job.id ? 'rgba(108,99,255,0.1)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${activeJob === job.id ? 'var(--accent)' : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div className="avatar" style={{ width: 42, height: 42, fontSize: '14px', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}>
                      {job.avatar}
                    </div>
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--bg-secondary)' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{job.customer}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.service}</div>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: 2 }}>{job.id}</div>
                  </div>
                </button>
              ))}

              {ACTIVE_JOBS.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No active jobs
                </div>
              )}
            </div>

            {/* Call button */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
              <button
                id="btn-call-customer"
                onClick={() => setCalling(c => !c)}
                className={`btn ${calling ? 'btn-danger' : 'btn-success'} btn-full`}
                style={{ justifyContent: 'center' }}
              >
                {calling ? '📵 End Call' : '📞 Call Customer'}
              </button>
              {calling && (
                <div className="animate-fadeIn" style={{ marginTop: 10, textAlign: 'center', fontSize: '12px', color: 'var(--success)' }}>
                  <span className="animate-pulse" style={{ display: 'inline-block' }}>●</span> Calling {currentJob?.customer}...
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Chat header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: '14px', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}>
                  {currentJob?.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{currentJob?.customer}</div>
                  <div style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
                    Online · {currentJob?.service}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm">📍 Location</button>
                <button onClick={() => setCalling(c => !c)} className={`btn btn-sm ${calling ? 'btn-danger' : 'btn-success'}`}>
                  {calling ? '📵 End' : '📞 Call'}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Date separator */}
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>
                Today
              </div>
              {currentMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sent ? 'flex-end' : 'flex-start', gap: 4 }}
                >
                  <div className={`chat-bubble ${msg.sent ? 'sent' : 'received'}`}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: msg.sent ? 0 : 4, paddingRight: msg.sent ? 4 : 0 }}>
                    {msg.time} {msg.sent ? '✓✓' : ''}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div style={{ padding: '8px 24px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0, borderTop: '1px solid var(--border-light)' }}>
              {QUICK_REPLIES.map(r => (
                <button
                  key={r}
                  onClick={() => setInput(r)}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: '10px' }}>📎</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '10px' }}>📷</button>
              <input
                id="chat-input"
                type="text"
                className="input"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1 }}
              />
              <button
                id="btn-send-message"
                onClick={sendMessage}
                disabled={!input.trim()}
                className="btn btn-primary btn-sm"
                style={{ padding: '10px 16px' }}
              >
                Send ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
