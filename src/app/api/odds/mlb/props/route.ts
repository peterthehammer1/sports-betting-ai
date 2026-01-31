/**
 * API Route: GET /api/odds/mlb/props
 * Fetches MLB player props from The Odds API
 * Supports batter and pitcher props
 */

import { NextResponse } from 'next/server';
import { getCachedPlayerProps, cachePlayerProps, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Available MLB player prop markets
const MLB_BATTER_MARKETS = [
  'batter_home_runs',
  'batter_hits',
  'batter_total_bases',
  'batter_rbis',
  'batter_runs_scored',
  'batter_strikeouts',
  'batter_walks',
  'batter_stolen_bases',
];

const MLB_PITCHER_MARKETS = [
  'pitcher_strikeouts',
  'pitcher_hits_allowed',
  'pitcher_walks',
  'pitcher_earned_runs',
  'pitcher_outs',
  'pitcher_record_a_win',
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
  const propType = searchParams.get('type') || 'all'; // 'batter', 'pitcher', or 'all'

  if (!eventId) {
    // Return list of available MLB events
    try {
      const eventsUrl = `${ODDS_API_BASE}/sports/baseball_mlb/events?apiKey=${apiKey}`;
      const response = await fetch(eventsUrl);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const events = await response.json();
      
      return NextResponse.json({
        message: 'Provide eventId parameter to get player props',
        events: events.slice(0, 20).map((e: { id: string; home_team: string; away_team: string; commence_time: string }) => ({
          id: e.id,
          homeTeam: e.home_team,
          awayTeam: e.away_team,
          commenceTime: e.commence_time,
        })),
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch events' },
        { status: 500 }
      );
    }
  }

  const cacheKey = `mlb-props-${eventId}-${propType}`;

  try {
    // Check cache first
    const cached = await getCachedPlayerProps(cacheKey);
    if (cached) {
      console.log('Returning cached MLB props for:', eventId);
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
      });
    }

    // Determine which markets to fetch
    let markets: string[] = [];
    if (propType === 'batter') {
      markets = MLB_BATTER_MARKETS;
    } else if (propType === 'pitcher') {
      markets = MLB_PITCHER_MARKETS;
    } else {
      markets = [...MLB_BATTER_MARKETS, ...MLB_PITCHER_MARKETS];
    }

    // Fetch props for each market
    const allProps: Record<string, Array<{
      playerName: string;
      line?: number;
      overOdds: number;
      underOdds: number;
      bookmaker: string;
    }>> = {};

    for (const market of markets) {
      try {
        const url = `${ODDS_API_BASE}/sports/baseball_mlb/events/${eventId}/odds?apiKey=${apiKey}&regions=us&markets=${market}&oddsFormat=american`;
        
        const response = await fetch(url);
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (!data.bookmakers?.length) continue;

        const marketProps: Array<{
          playerName: string;
          line?: number;
          overOdds: number;
          underOdds: number;
          bookmaker: string;
        }> = [];

        for (const book of data.bookmakers) {
          const marketData = book.markets?.find((m: { key: string }) => m.key === market);
          if (!marketData) continue;

          // Group outcomes by player
          const playerOutcomes: Record<string, { over?: number; under?: number; line?: number }> = {};
          
          for (const outcome of marketData.outcomes) {
            const playerName = outcome.description || outcome.name;
            if (!playerOutcomes[playerName]) {
              playerOutcomes[playerName] = {};
            }
            
            if (outcome.name === 'Over') {
              playerOutcomes[playerName].over = outcome.price;
              playerOutcomes[playerName].line = outcome.point;
            } else if (outcome.name === 'Under') {
              playerOutcomes[playerName].under = outcome.price;
            } else {
              // Yes/No market (like home runs)
              playerOutcomes[playerName].over = outcome.price;
            }
          }

          for (const [playerName, odds] of Object.entries(playerOutcomes)) {
            if (odds.over !== undefined) {
              marketProps.push({
                playerName,
                line: odds.line,
                overOdds: odds.over,
                underOdds: odds.under || 0,
                bookmaker: book.title,
              });
            }
          }
        }

        if (marketProps.length > 0) {
          allProps[market] = marketProps;
        }
      } catch (marketError) {
        console.error(`Error fetching ${market}:`, marketError);
      }
    }

    // Get game info
    let homeTeam = '';
    let awayTeam = '';
    let commenceTime = '';
    
    try {
      const eventUrl = `${ODDS_API_BASE}/sports/baseball_mlb/events/${eventId}?apiKey=${apiKey}`;
      const eventRes = await fetch(eventUrl);
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        homeTeam = eventData.home_team;
        awayTeam = eventData.away_team;
        commenceTime = eventData.commence_time;
      }
    } catch {
      // Continue without game info
    }

    const responseData = {
      eventId,
      homeTeam,
      awayTeam,
      commenceTime,
      batterProps: {
        homeRuns: allProps['batter_home_runs'] || [],
        hits: allProps['batter_hits'] || [],
        totalBases: allProps['batter_total_bases'] || [],
        rbis: allProps['batter_rbis'] || [],
        runsScored: allProps['batter_runs_scored'] || [],
        strikeouts: allProps['batter_strikeouts'] || [],
        walks: allProps['batter_walks'] || [],
        stolenBases: allProps['batter_stolen_bases'] || [],
      },
      pitcherProps: {
        strikeouts: allProps['pitcher_strikeouts'] || [],
        hitsAllowed: allProps['pitcher_hits_allowed'] || [],
        walks: allProps['pitcher_walks'] || [],
        earnedRuns: allProps['pitcher_earned_runs'] || [],
        outs: allProps['pitcher_outs'] || [],
        recordWin: allProps['pitcher_record_a_win'] || [],
      },
      availableMarkets: Object.keys(allProps),
      fetchedAt: new Date().toISOString(),
    };

    // Cache the result
    await cachePlayerProps(cacheKey, responseData);
    console.log('Cached MLB props for:', eventId);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching MLB props:', error);

    // Try to return cached data
    const fallbackCached = await getCachedPlayerProps(cacheKey);
    if (fallbackCached) {
      const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        message: 'Returning cached data',
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch props' },
      { status: 500 }
    );
  }
}
