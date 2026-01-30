/**
 * API Route: GET /api/odds/nfl/props
 * Fetches NFL (Super Bowl) player props from The Odds API
 * With Redis caching for when API quota is exceeded
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { getCachedPlayerProps, cachePlayerProps, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// All available NFL player prop markets from The Odds API
const NFL_PROP_MARKETS = [
  // Touchdown props
  'player_anytime_td',
  'player_1st_td',
  'player_last_td',
  // Passing props
  'player_pass_yds',
  'player_pass_tds',
  'player_pass_completions',
  'player_pass_attempts',
  'player_pass_interceptions',
  'player_pass_longest_completion',
  // Rushing props
  'player_rush_yds',
  'player_rush_attempts',
  'player_rush_longest',
  'player_rush_tds',
  // Receiving props
  'player_receptions',
  'player_reception_yds',
  'player_reception_longest',
  'player_reception_tds',
  // Combined props
  'player_pass_rush_yds',
  'player_rush_reception_yds',
  'player_rush_reception_tds',
  // Kicking props
  'player_kicking_points',
  'player_field_goals',
  // Defense props
  'player_sacks',
  'player_tackles_assists',
  'player_defensive_interceptions',
];

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

  // Need eventId for props
  if (!eventId) {
    return NextResponse.json({
      error: 'eventId parameter is required',
      message: 'Provide eventId parameter to get player props',
    }, { status: 400 });
  }

  const cacheKey = `nfl-props-${eventId}`;

  try {
    // Check cache first
    const cached = await getCachedPlayerProps(cacheKey);
    if (cached) {
      console.log('Returning cached NFL props for:', eventId);
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
      });
    }

    const client = createOddsApiClient({ apiKey });

    // Fetch player props for the specified event
    const propsData = await client.getNflPlayerProps(eventId, NFL_PROP_MARKETS);
    
    if (!propsData) {
      // If no props from API, check if we have any cached data to return
      const fallbackCached = await getCachedPlayerProps(cacheKey);
      if (fallbackCached) {
        const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          message: 'Props not currently available from API, showing cached data',
        });
      }
      
      return NextResponse.json({
        error: 'Player props not available for this event',
        eventId,
      }, { status: 404 });
    }

    // Organize props by market type
    const propsByMarket: Record<string, Array<{
      playerName: string;
      line?: number;
      name?: string;
      odds: Array<{
        bookmaker: string;
        americanOdds: number;
        price: number;
      }>;
    }>> = {};

    for (const bookmaker of propsData.bookmakers) {
      for (const market of bookmaker.markets) {
        if (!propsByMarket[market.key]) {
          propsByMarket[market.key] = [];
        }

        for (const outcome of market.outcomes) {
          const playerName = outcome.description || outcome.name;
          const existingPlayer = propsByMarket[market.key].find(
            p => p.playerName === playerName && p.line === outcome.point
          );

          const oddsEntry = {
            bookmaker: bookmaker.title,
            americanOdds: outcome.price >= 2 
              ? Math.round((outcome.price - 1) * 100)
              : Math.round(-100 / (outcome.price - 1)),
            price: outcome.price,
          };

          if (existingPlayer) {
            existingPlayer.odds.push(oddsEntry);
          } else {
            propsByMarket[market.key].push({
              playerName,
              line: outcome.point,
              name: outcome.name,
              odds: [oddsEntry],
            });
          }
        }
      }
    }

    const responseData = {
      eventId,
      homeTeam: propsData.home_team,
      awayTeam: propsData.away_team,
      commenceTime: propsData.commence_time,
      propsByMarket,
      availableMarkets: Object.keys(propsByMarket),
      fetchedAt: new Date().toISOString(),
    };

    // Cache the result (for 12 hours since props don't change as frequently)
    await cachePlayerProps(cacheKey, responseData);
    console.log('Cached NFL props for:', eventId);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching NFL props:', error);
    
    // On error (including quota exceeded), try to return cached data
    const fallbackCached = await getCachedPlayerProps(cacheKey);
    if (fallbackCached) {
      console.log('API error, returning cached NFL props for:', eventId);
      const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
        message: 'API quota may be exceeded, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch props' },
      { status: 500 }
    );
  }
}
