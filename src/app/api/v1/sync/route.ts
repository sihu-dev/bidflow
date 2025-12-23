/**
 * POST /api/v1/sync - Sync global tenders from TED & SAM.gov
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createConnector, type SourceId } from '@/lib/connectors';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SyncRequestSchema = z.object({
  source: z.enum(['ted', 'sam_gov', 'all']).default('all'),
  keywords: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(200).default(50),
  dryRun: z.boolean().default(false),
});

// ============================================================================
// POST /api/v1/sync - Sync Global Tenders
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user profile and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Check admin permission (sync is admin-only)
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const validationResult = SyncRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { source, keywords, countries, dateFrom, dateTo, limit, dryRun } =
      validationResult.data;

    // 5. Determine sources to sync
    const sources: SourceId[] =
      source === 'all' ? ['ted', 'sam_gov'] : [source as SourceId];

    // 6. Sync from each source
    const results = await Promise.all(
      sources.map(async (sourceId) => {
        try {
          // Create connector
          const connector = createConnector(sourceId);

          // Fetch tenders
          const fetchResult = await connector.fetchTenders({
            keywords,
            countries,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            limit,
          });

          // If dry run, just return count
          if (dryRun) {
            return {
              source: sourceId,
              fetched: fetchResult.bids.length,
              total: fetchResult.totalCount,
              saved: 0,
              duplicates: 0,
              errors: 0,
            };
          }

          // Save to database
          let saved = 0;
          let duplicates = 0;
          let errors = 0;

          for (const bid of fetchResult.bids) {
            try {
              // Check if bid already exists (by content hash)
              const { data: existing } = await supabase
                .from('bids')
                .select('id')
                .eq('source_id', bid.sourceId)
                .eq('source_notice_id', bid.sourceNoticeId)
                .single();

              if (existing) {
                duplicates++;
                continue;
              }

              // Insert new bid
              const { error: insertError } = await supabase.from('bids').insert({
                tenant_id: profile.tenant_id,
                source_id: bid.sourceId,
                source_notice_id: bid.sourceNoticeId,
                source_url: bid.sourceUrl,
                title: bid.title,
                description: bid.description,
                organization: bid.organization,
                country: bid.country,
                estimated_price: bid.estimatedPrice,
                currency: bid.currency,
                published_date: bid.publishedDate.toISOString(),
                deadline: bid.deadline.toISOString(),
                keywords: bid.keywords,
                status: 'open',
                raw_data: bid.rawData,
              });

              if (insertError) {
                console.error(`[Sync] Failed to insert bid ${bid.sourceNoticeId}:`, insertError);
                errors++;
              } else {
                saved++;
              }
            } catch (error) {
              console.error(`[Sync] Error processing bid ${bid.sourceNoticeId}:`, error);
              errors++;
            }
          }

          return {
            source: sourceId,
            fetched: fetchResult.bids.length,
            total: fetchResult.totalCount,
            saved,
            duplicates,
            errors,
          };
        } catch (error) {
          console.error(`[Sync] Failed to sync from ${sourceId}:`, error);
          return {
            source: sourceId,
            fetched: 0,
            total: 0,
            saved: 0,
            duplicates: 0,
            errors: 1,
            errorMessage: (error as Error).message,
          };
        }
      })
    );

    // 7. Return results
    const summary = {
      totalFetched: results.reduce((sum, r) => sum + r.fetched, 0),
      totalSaved: results.reduce((sum, r) => sum + r.saved, 0),
      totalDuplicates: results.reduce((sum, r) => sum + r.duplicates, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
    };

    return NextResponse.json({
      success: true,
      dryRun,
      summary,
      results,
      message: dryRun
        ? 'Dry run completed - no data saved'
        : `Synced ${summary.totalSaved} new tenders`,
    });
  } catch (error) {
    console.error('[Sync API] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/v1/sync - Get sync status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user profile and tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Get sync statistics
    const { data: stats } = await supabase
      .from('bids')
      .select('source_id, created_at')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!stats) {
      return NextResponse.json({
        success: true,
        stats: {
          ted: { total: 0, last24h: 0, lastSync: null },
          sam_gov: { total: 0, last24h: 0, lastSync: null },
        },
      });
    }

    // 4. Calculate statistics
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const tedBids = stats.filter((b) => b.source_id === 'ted');
    const samBids = stats.filter((b) => b.source_id === 'sam_gov');

    const statistics = {
      ted: {
        total: tedBids.length,
        last24h: tedBids.filter((b) => new Date(b.created_at) > yesterday).length,
        lastSync: tedBids[0]?.created_at || null,
      },
      sam_gov: {
        total: samBids.length,
        last24h: samBids.filter((b) => new Date(b.created_at) > yesterday).length,
        lastSync: samBids[0]?.created_at || null,
      },
    };

    return NextResponse.json({
      success: true,
      stats: statistics,
    });
  } catch (error) {
    console.error('[Sync API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
