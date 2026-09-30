'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, Hourglass, LayoutDashboard, UserRound, Briefcase, MapPinned, Wrench } from 'lucide-react';
import RadialMenu, { RadialItem } from './RadialMenu';

const PAGES = [
  { label: 'Login', href: '/login', icon: LogIn },
  { label: 'Verification', href: '/pending', icon: Hourglass },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/profile', icon: UserRound },
  { label: 'Job Requests', href: '/jobs', icon: Briefcase },
  { label: 'Live Tracking', href: '/tracking', icon: MapPinned },
];

/** Right-edge radial menu: one wedge per portal page. */
export default function PieMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const items: RadialItem[] = PAGES.map((p) => ({
    id: p.href, label: p.label, icon: p.icon, active: pathname === p.href, onSelect: () => router.push(p.href),
  }));
  return <RadialMenu side="right" items={items} hubIcon={Wrench} hubLabel="Services" ariaLabel="Portal pages menu" zIndex={90} />;
}
