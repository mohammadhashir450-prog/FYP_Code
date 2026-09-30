'use client';
import { Star } from 'lucide-react';
import TemplatePage from '@/components/TemplatePage';

export default function ReviewsPage() {
  return (
    <TemplatePage eyebrow="Reviews & Ratings" title="Reviews & Ratings" icon={Star}
      description="See what customers say about your work and track your average rating."
      emptyTitle="No reviews yet"
      emptyDescription="Ratings and written feedback appear here after you complete jobs." />
  );
}
