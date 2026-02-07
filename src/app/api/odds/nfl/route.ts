/**
 * API Route: GET /api/odds/nfl
 * Fetches current NFL odds (Super Bowl) from The Odds API
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
    // Check cache first (unless forceFresh)
    if (!forceFresh) {
      const cached = await getCachedOdds('NFL');
      if (cached) {
        console.log('Returning cached NFL odds');
        const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          cacheEnabled: true,
        });
      }
    }

    const client = createOddsApiClient({ apiKey });
    const games = await client.getNflOdds(['h2h', 'spreads', 'totals']);
    
    // Normalize all games for easier frontend consumption
    const normalizedGames = games.map((game) => client.normalizeGameOdds(game));
    
    // Filter to show games within the next 7 days (NFL games are less frequent)
    const now = new Date();
    const oneWeekFromNow = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000;
    
    const filteredGames = normalizedGames.filter(game => {
      const gameTime = new Date(game.commenceTime).getTime();
      return gameTime >= fourHoursAgo && gameTime <= oneWeekFromNow;
    });
    
    const quota = client.getQuota();

    const responseData = {
      games: filteredGames,
      meta: {
        sport: 'NFL',
        gamesCount: filteredGames.length,
        totalGames: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    };

    // Cache the result
    await cacheOdds('NFL', responseData);
    console.log('Cached NFL odds, games:', normalizedGames.length);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching NFL odds:', error);
    
    // On error (including quota exceeded), try to return cached data
    const fallbackCached = await getCachedOdds('NFL');
    if (fallbackCached) {
      console.log('API error, returning cached NFL odds');
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
