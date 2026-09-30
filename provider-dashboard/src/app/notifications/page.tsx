'use client';
import { Bell } from 'lucide-react';
import TemplatePage from '@/components/TemplatePage';

export default function NotificationsPage() {
  return (
    <TemplatePage eyebrow="Notification Centre" title="Notification Centre" icon={Bell}
      description="Job alerts, verification updates and platform announcements in one place."
      emptyTitle="You are all caught up"
      emptyDescription="New notifications will show up here as they arrive." />
  );
}
