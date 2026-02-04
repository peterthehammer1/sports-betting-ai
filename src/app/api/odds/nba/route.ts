/**
 * API Route: GET /api/odds/nba
 * Fetches current NBA odds from The Odds API
 * With Redis caching for when API quota is exceeded
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { getCachedOdds, cacheOdds, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const apiKey = process.env.THE_ODDS_API_KEY;
  const { searchParams } = new URL(request.url);
  const forceFresh = searchParams.get('fresh') === 'true';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    // Check cache first (unless fresh=true)
    if (!forceFresh) {
      const cached = await getCachedOdds('NBA');
      if (cached) {
        console.log('Returning cached NBA odds');
        const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          cacheEnabled: true,
        });
      }
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
    console.log('Cached NBA odds, games:', normalizedGames.length);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching NBA odds:', error);
    
    // On error (including quota exceeded), try to return cached data
    const fallbackCached = await getCachedOdds('NBA');
    if (fallbackCached) {
      console.log('API error, returning cached NBA odds');
      const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
        message: 'API quota may be exceeded, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
