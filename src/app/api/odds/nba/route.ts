/**
 * API Route: GET /api/odds/nba
 * Fetches current NBA odds from The Odds API
 * Results are cached for 5 minutes to reduce API calls
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { getCachedOdds, cacheOdds, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    // Check cache first
    const cached = await getCachedOdds('NBA');
    if (cached) {
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
      });
    }

    const client = createOddsApiClient({ apiKey });
    const games = await client.getNbaOdds(['h2h', 'spreads', 'totals']);
    
    const normalizedGames = games.map((game) => client.normalizeGameOdds(game));
    
    const quota = client.getQuota();

    const responseData = {
      games: normalizedGames,
      meta: {
        sport: 'NBA',
        gamesCount: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    };

    // Cache the result
    await cacheOdds('NBA', responseData);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching NBA odds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
