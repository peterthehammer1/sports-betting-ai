/**
 * API Route: POST /api/cache/clear
 * Clears the odds cache to force fresh data
 */

import { NextResponse } from 'next/server';
import { clearOddsCache, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow if no secret configured (dev) or if secret matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isRedisConfigured()) {
      return NextResponse.json({ 
        message: 'Redis not configured - no cache to clear'
      });
    }

    const result = await clearOddsCache();
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${result.cleared} cached odds entries`,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to clear the cache',
    cacheEnabled: isRedisConfigured(),
  });
}
