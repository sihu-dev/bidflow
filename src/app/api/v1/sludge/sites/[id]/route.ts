import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSiteDetails, updateSiteInfo, removeSite, getSiteDashboard } from '@/lib/sludge';
import type { SiteId } from '@/lib/sludge';

// ============================================
// Validation Schema
// ============================================

const UpdateSiteSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['public_wwtp', 'private_wwtp', 'biogas', 'industrial']).optional(),
  address: z.string().optional(),
  capacityM3Day: z.number().positive().optional(),
});

// ============================================
// GET /api/v1/sludge/sites/[id]
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const includeDashboard = url.searchParams.get('dashboard') === 'true';

    if (includeDashboard) {
      const dashboard = await getSiteDashboard(id as SiteId);
      return NextResponse.json({
        success: true,
        data: dashboard,
      });
    }

    const site = await getSiteDetails(id as SiteId);

    if (!site) {
      return NextResponse.json(
        {
          success: false,
          error: 'Site not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('[API] GET /sludge/sites/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/v1/sludge/sites/[id]
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validationResult = UpdateSiteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const site = await updateSiteInfo(id as SiteId, validationResult.data);

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('[API] PATCH /sludge/sites/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/v1/sludge/sites/[id]
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await removeSite(id as SiteId);

    return NextResponse.json({
      success: true,
      message: 'Site deleted successfully',
    });
  } catch (error) {
    console.error('[API] DELETE /sludge/sites/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
