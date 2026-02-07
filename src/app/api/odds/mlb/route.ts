/**
 * API Route: GET /api/odds/mlb
 * Fetches current MLB odds from The Odds API
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
      const cached = await getCachedOdds('MLB');
      if (cached) {
        console.log('Returning cached MLB odds');
        const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          cacheEnabled: true,
        });
      }
    }

    const client = createOddsApiClient({ apiKey });
    const games = await client.getMlbOdds(['h2h', 'spreads', 'totals']);
    
    const normalizedGames = games.map((game) => client.normalizeGameOdds(game));
    
    // Sort by commence time (soonest first)
    normalizedGames.sort((a, b) => 
      new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
    );
    
    // Filter to show games within the next 3 days (72 hours)
    const now = new Date();
    const threeDaysFromNow = now.getTime() + 72 * 60 * 60 * 1000;
    const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000; // Include recently started games
    
    let filteredGames = normalizedGames.filter(game => {
      const gameTime = new Date(game.commenceTime).getTime();
      return gameTime >= fourHoursAgo && gameTime <= threeDaysFromNow;
    });
    
    // If no games within 3 days (e.g., off-season), show next 15 upcoming games
    if (filteredGames.length === 0 && normalizedGames.length > 0) {
      filteredGames = normalizedGames.slice(0, 15);
    }
    
    const quota = client.getQuota();

    const responseData = {
      games: filteredGames,
      meta: {
        sport: 'MLB',
        gamesCount: filteredGames.length,
        totalGames: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    };

    // Cache the result
    await cacheOdds('MLB', responseData);
    console.log('Cached MLB odds, games:', filteredGames.length);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching MLB odds:', error);
    
    // On error, try to return cached data
    const fallbackCached = await getCachedOdds('MLB');
    if (fallbackCached) {
      console.log('API error, returning cached MLB odds');
      const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
        warning: 'API error occurred, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
