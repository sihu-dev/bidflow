import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllSites, createNewSite } from '@/lib/sludge';

// ============================================
// Validation Schema
// ============================================

const CreateSiteSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['public_wwtp', 'private_wwtp', 'biogas', 'industrial']),
  address: z.string().optional(),
  capacityM3Day: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ============================================
// GET /api/v1/sludge/sites
// ============================================

export async function GET() {
  try {
    const sites = await getAllSites();

    return NextResponse.json({
      success: true,
      data: sites,
      meta: {
        total: sites.length,
      },
    });
  } catch (error) {
    console.error('[API] GET /sludge/sites error:', error);
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
// POST /api/v1/sludge/sites
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = CreateSiteSchema.safeParse(body);

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

    const site = await createNewSite(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: site,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /sludge/sites error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
