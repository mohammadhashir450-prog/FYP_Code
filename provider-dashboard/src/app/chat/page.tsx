'use client';
import { MessageCircle } from 'lucide-react';
import TemplatePage from '@/components/TemplatePage';

export default function LiveChatPage() {
  return (
    <TemplatePage eyebrow="Live Chat" title="Live Chat" icon={MessageCircle}
      description="Talk to customers about their booked jobs in real time."
      emptyTitle="No conversations yet"
      emptyDescription="When a customer messages you about a job, the conversation will open here." />
  );
}
