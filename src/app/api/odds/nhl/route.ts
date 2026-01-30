/**
 * API Route: GET /api/odds/nhl
 * Fetches current NHL odds from The Odds API
 * With Redis caching for when API quota is exceeded
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
    const cached = await getCachedOdds('NHL');
    if (cached) {
      console.log('Returning cached NHL odds');
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
      });
    }

    const client = createOddsApiClient({ apiKey });
    const games = await client.getNhlOdds(['h2h', 'spreads', 'totals']);
    
    // Normalize all games for easier frontend consumption
    const normalizedGames = games.map((game) => client.normalizeGameOdds(game));
    
    const quota = client.getQuota();

    const responseData = {
      games: normalizedGames,
      meta: {
        sport: 'NHL',
        gamesCount: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    };

    // Cache the result
    await cacheOdds('NHL', responseData);
    console.log('Cached NHL odds, games:', normalizedGames.length);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching NHL odds:', error);
    
    // On error (including quota exceeded), try to return cached data
    const fallbackCached = await getCachedOdds('NHL');
    if (fallbackCached) {
      console.log('API error, returning cached NHL odds');
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
