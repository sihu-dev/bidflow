/**
 * Inngest API Route
 */
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { scheduledCrawl } from '@/inngest/functions/crawl-scheduler';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scheduledCrawl],
});
