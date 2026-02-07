/**
 * API Route: GET /api/odds/nba
 * Fetches current NBA odds from The Odds API
 * First fetches events (all scheduled games), then fetches odds
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
    
    // First, get all scheduled events (includes games without odds)
    const events = await client.getEvents('basketball_nba');
    
    // Then get odds for games that have them
    const gamesWithOdds = await client.getNbaOdds(['h2h', 'spreads', 'totals']);
    
    // Create a map of games with odds
    const oddsMap = new Map(gamesWithOdds.map(g => [g.id, g]));
    
    // Merge: use odds data if available, otherwise create placeholder
    const allGames = events.map(event => {
      const gameWithOdds = oddsMap.get(event.id);
      if (gameWithOdds) {
        return client.normalizeGameOdds(gameWithOdds);
      }
      // Game without odds yet - create minimal entry
      return {
        gameId: event.id,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        commenceTime: new Date(event.commence_time),
        moneyline: { home: [], away: [], bestHome: null, bestAway: null },
        spread: { home: [], away: [], consensusLine: null },
        total: { over: [], under: [], consensusLine: null },
      };
    });
    
    // Sort by commence time (soonest first)
    allGames.sort((a, b) => 
      new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
    );
    
    // Filter to show games within the next 3 days
    const now = new Date();
    const threeDaysFromNow = now.getTime() + 3 * 24 * 60 * 60 * 1000;
    const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000;
    
    let filteredGames = allGames.filter(game => {
      const gameTime = new Date(game.commenceTime).getTime();
      return gameTime >= fourHoursAgo && gameTime <= threeDaysFromNow;
    });
    
    // If no games within 3 days, show next 15 upcoming games
    if (filteredGames.length === 0 && allGames.length > 0) {
      filteredGames = allGames.slice(0, 15);
    }
    
    const quota = client.getQuota();

    const responseData = {
      games: filteredGames,
      meta: {
        sport: 'NBA',
        gamesCount: filteredGames.length,
        totalGames: allGames.length,
        eventsCount: events.length,
        gamesWithOdds: gamesWithOdds.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    };

    // Cache the result
    await cacheOdds('NBA', responseData);
    console.log('Cached NBA odds, showing:', filteredGames.length, 'of', allGames.length, 'total events');

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
        warning: 'API error occurred, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
