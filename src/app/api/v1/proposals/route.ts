/**
 * POST /api/v1/proposals - Generate proposal for global tender
 * GET  /api/v1/proposals - List proposals
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateProposal, type ProposalLanguage, type ProposalFormat } from '@/lib/ai/proposal-generator';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const GenerateProposalSchema = z.object({
  bid_id: z.string().uuid(),
  product_id: z.string().uuid(),
  language: z.enum(['en', 'de', 'fr', 'ko']).default('en'),
  format: z.enum(['technical', 'price', 'combined']).default('combined'),
  effort: z.enum(['low', 'medium', 'high']).default('medium'),
});

const ListProposalsSchema = z.object({
  bid_id: z.string().uuid().optional(),
  language: z.enum(['en', 'de', 'fr', 'ko']).optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ============================================================================
// POST /api/v1/proposals - Generate Proposal
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
      .select('id, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = GenerateProposalSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { bid_id, product_id, language, format, effort } = validationResult.data;

    // 4. Check if proposal already exists
    const { data: existingProposal } = await supabase
      .from('proposals')
      .select('id, status')
      .eq('tenant_id', profile.tenant_id)
      .eq('bid_id', bid_id)
      .eq('product_id', product_id)
      .eq('language', language)
      .eq('format', format)
      .single();

    if (existingProposal) {
      return NextResponse.json(
        {
          error: 'Proposal already exists',
          proposal_id: existingProposal.id,
          status: existingProposal.status,
        },
        { status: 409 }
      );
    }

    // 5. Generate proposal with AI
    const proposal = await generateProposal(bid_id, product_id, {
      language: language as ProposalLanguage,
      format: format as ProposalFormat,
      effort,
    });

    // 6. Save to database
    const { data: savedProposal, error: insertError } = await supabase
      .from('proposals')
      .insert({
        tenant_id: profile.tenant_id,
        bid_id: proposal.bid_id,
        product_id: proposal.product_id,
        language: proposal.language,
        format,
        status: 'draft',
        sections: proposal.sections,
        executive_summary: proposal.executive_summary,
        technical_approach: proposal.technical_approach,
        pricing: proposal.pricing,
        timeline: proposal.timeline,
        tokens_used: proposal.tokens_used,
        cost_usd: proposal.cost_usd,
        effort,
        model: 'claude-opus-4-5-20251101',
        created_by: user.id,
        generated_at: proposal.generated_at,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Proposals API] Failed to save proposal:', insertError);
      return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 });
    }

    // 7. Return success
    return NextResponse.json(
      {
        success: true,
        proposal: savedProposal,
        message: 'Proposal generated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Proposals API] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/v1/proposals - List Proposals
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

    // 3. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const validationResult = ListProposalsSchema.safeParse({
      bid_id: searchParams.get('bid_id'),
      language: searchParams.get('language'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { bid_id, language, status, limit, offset } = validationResult.data;

    // 4. Build query
    let query = supabase
      .from('proposals')
      .select('*', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (bid_id) {
      query = query.eq('bid_id', bid_id);
    }
    if (language) {
      query = query.eq('language', language);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // 5. Execute query
    const { data: proposals, error: queryError, count } = await query;

    if (queryError) {
      console.error('[Proposals API] Query error:', queryError);
      return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
    }

    // 6. Return results
    return NextResponse.json({
      success: true,
      proposals,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[Proposals API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
