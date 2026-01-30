/**
 * API Route: GET /api/odds/nhl/props
 * Fetches NHL player props (goal scorers) from The Odds API
 * With Redis caching for when API quota is exceeded
 * 
 * Query params:
 * - eventId: REQUIRED - the game ID to fetch props for
 * - market: Optional - 'first_goal' or 'anytime' (defaults to both)
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { getCachedPlayerProps, cachePlayerProps, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const marketParam = searchParams.get('market');

  if (!eventId) {
    return NextResponse.json(
      { error: 'eventId is required for player props' },
      { status: 400 }
    );
  }

  // Cache key
  const cacheKey = `nhl-props-${eventId}-${marketParam || 'all'}`;

  try {
    // Check cache first
    const cached = await getCachedPlayerProps(cacheKey);
    if (cached) {
      console.log('Returning cached NHL props for:', eventId);
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
      });
    }

    // Determine which markets to fetch
    let markets: ('player_goal_scorer_first' | 'player_goal_scorer_anytime')[] = [
      'player_goal_scorer_first',
      'player_goal_scorer_anytime',
    ];

    if (marketParam === 'first_goal') {
      markets = ['player_goal_scorer_first'];
    } else if (marketParam === 'anytime') {
      markets = ['player_goal_scorer_anytime'];
    }

    const client = createOddsApiClient({ apiKey });
    const game = await client.getNhlPlayerProps(eventId, markets);

    if (!game || game.bookmakers.length === 0) {
      // Check for cached fallback
      const fallbackCached = await getCachedPlayerProps(cacheKey);
      if (fallbackCached) {
        console.log('No fresh data, returning cached NHL props for:', eventId);
        const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          message: 'Props not currently available from API, showing cached data',
        });
      }
      return NextResponse.json(
        { error: 'No player props available for this game' },
        { status: 404 }
      );
    }

    const normalizedGame = client.normalizePlayerProps(game);
    const quota = client.getQuota();

    const responseData = {
      game: normalizedGame,
      meta: {
        sport: 'NHL',
        marketTypes: markets,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    };

    // Cache the result
    await cachePlayerProps(cacheKey, responseData);
    console.log('Cached NHL props for:', eventId);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching NHL player props:', error);
    
    // On error, try to return cached data
    const fallbackCached = await getCachedPlayerProps(cacheKey);
    if (fallbackCached) {
      console.log('API error, returning cached NHL props for:', eventId);
      const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
        message: 'API quota may be exceeded, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch player props' },
      { status: 500 }
    );
  }
}
