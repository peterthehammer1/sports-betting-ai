/**
 * API Route: GET /api/odds/nba/props
 * Fetches NBA player props from The Odds API
 * With Redis caching for when API quota is exceeded
 */

import { NextRequest, NextResponse } from 'next/server';
import { oddsApi } from '@/lib/api/odds';
import { getCachedPlayerProps, cachePlayerProps, isRedisConfigured } from '@/lib/cache/redis';
import type { NbaPlayerPropMarket } from '@/types/odds';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId');
  
  if (!eventId) {
    // Return list of available NBA events
    try {
      const games = await oddsApi.getNbaOdds(['h2h']);
      return NextResponse.json({
        message: 'No eventId provided. Here are available NBA events:',
        events: games.map(g => ({
          id: g.id,
          sport_key: g.sport_key,
          sport_title: g.sport_title,
          commence_time: g.commence_time,
          home_team: g.home_team,
          away_team: g.away_team,
        })),
        usage: 'Add ?eventId=EVENT_ID to see player props for that game',
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch events' },
        { status: 500 }
      );
    }
  }

  // Cache key
  const cacheKey = `nba-props-${eventId}`;

  try {
    // Check cache first
    const cached = await getCachedPlayerProps(cacheKey) as {
      meta: Record<string, unknown>;
      [key: string]: unknown;
    } | null;
    
    if (cached) {
      console.log('Returning cached NBA props for:', eventId);
      return NextResponse.json({
        ...cached,
        meta: { ...cached.meta, fromCache: true },
        cacheEnabled: true,
      });
    }

    // Fetch player props - EXPANDED with premium features
    const markets: NbaPlayerPropMarket[] = [
      'player_points',
      'player_rebounds', 
      'player_assists',
      'player_threes',
      'player_points_rebounds_assists',
      'player_points_rebounds',
      'player_points_assists',
      'player_rebounds_assists',
    ];
    
    const propsData = await oddsApi.getNbaPlayerProps(eventId, markets);
    
    if (!propsData) {
      // Check for cached fallback
      const fallbackCached = await getCachedPlayerProps(cacheKey) as {
        meta: Record<string, unknown>;
        [key: string]: unknown;
      } | null;
      if (fallbackCached) {
        console.log('No fresh data, returning cached NBA props for:', eventId);
        return NextResponse.json({
          ...fallbackCached,
          meta: { ...fallbackCached.meta, fromCache: true },
          message: 'Props not currently available from API, showing cached data',
        });
      }
      return NextResponse.json(
        { error: 'No player props found for this game' },
        { status: 404 }
      );
    }

    // Normalize props for each market - EXPANDED
    const pointsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_points');
    const reboundsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_rebounds');
    const assistsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_assists');
    const threesProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_threes');
    const praProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_points_rebounds_assists');
    const prProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_points_rebounds');
    const paProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_points_assists');
    const raProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_rebounds_assists');

    const quota = oddsApi.getQuota();

    const response = {
      gameId: propsData.id,
      homeTeam: propsData.home_team,
      awayTeam: propsData.away_team,
      commenceTime: propsData.commence_time,
      playerProps: {
        points: pointsProps,
        rebounds: reboundsProps,
        assists: assistsProps,
        threes: threesProps,
        // Combo props
        pointsReboundsAssists: praProps,
        pointsRebounds: prProps,
        pointsAssists: paProps,
        reboundsAssists: raProps,
      },
      meta: {
        sport: 'NBA',
        fetchedAt: new Date().toISOString(),
        quota: {
          requestsRemaining: quota.requestsRemaining,
          requestsUsed: quota.requestsUsed,
        },
        fromCache: false,
      },
    };

    // Cache the response
    await cachePlayerProps(cacheKey, response);
    console.log('Cached NBA props for:', eventId);

    return NextResponse.json({
      ...response,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('NBA Props API error:', error);
    
    // On error, try to return cached data
    const fallbackCached = await getCachedPlayerProps(cacheKey) as {
      meta: Record<string, unknown>;
      [key: string]: unknown;
    } | null;
    if (fallbackCached) {
      console.log('API error, returning cached NBA props for:', eventId);
      return NextResponse.json({
        ...fallbackCached,
        meta: { ...fallbackCached.meta, fromCache: true },
        cacheEnabled: true,
        message: 'API quota may be exceeded, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch NBA player props' },
      { status: 500 }
    );
  }
}
