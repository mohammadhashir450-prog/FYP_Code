'use client';
import { useRouter } from 'next/navigation';
import { Aperture, Bell, MessageCircle, Phone, Power, Settings, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';
import RadialMenu, { RadialItem } from './RadialMenu';

/**
 * Left-edge quick actions:
 * Live Chat · Call Customer · Reviews & Ratings · Availability · Notification Centre · Settings.
 */
export default function QuickPie() {
  const router = useRouter();
  const { isAuthenticated, profile, toggleOnline } = useAuth();
  const { showToast } = useToast();

  const guarded = (fn: () => void) => () => {
    if (!isAuthenticated) { showToast('Sign in to use quick actions', 'info'); router.push('/login'); return; }
    fn();
  };

  const items: RadialItem[] = [
    { id: 'chat', label: 'Live Chat', icon: MessageCircle, onSelect: guarded(() => router.push('/chat')) },
    { id: 'call', label: 'Call Customer', icon: Phone, onSelect: guarded(() => { showToast('Calling unlocks once you accept a job with a customer', 'info'); router.push('/jobs'); }) },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, onSelect: guarded(() => router.push('/reviews')) },
    {
      id: 'avail',
      label: !isAuthenticated ? 'Availability' : profile.online ? 'Go Offline' : 'Go Online',
      icon: Power,
      status: isAuthenticated ? (profile.online ? 'on' : 'off') : undefined,
      onSelect: guarded(() => {
        toggleOnline();
        showToast(profile.online ? 'You are now offline — new requests paused' : 'You are online and accepting requests', 'info');
      }),
    },
    { id: 'notif', label: 'Notification Centre', icon: Bell, onSelect: guarded(() => router.push('/notifications')) },
    { id: 'settings', label: 'Settings', icon: Settings, onSelect: guarded(() => router.push('/settings')) },
  ];

  return <RadialMenu side="left" items={items} hubIcon={Aperture} hubLabel="Quick" ariaLabel="Quick actions menu" offsetVar="qp-left" zIndex={91} />;
}
