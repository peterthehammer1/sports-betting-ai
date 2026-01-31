/**
 * API Route: GET /api/odds/periods
 * Fetches period/half/quarter betting markets (Premium Feature)
 * Supports NBA quarters, NHL periods, NFL halves, MLB innings
 */

import { NextResponse } from 'next/server';
import { getCachedPlayerProps, cachePlayerProps, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Period markets by sport
const PERIOD_MARKETS = {
  nba: ['h2h_q1', 'h2h_h1', 'spreads_q1', 'spreads_h1', 'totals_q1', 'totals_h1'],
  nhl: ['h2h_p1', 'h2h_p2', 'spreads_p1', 'spreads_p2', 'totals_p1', 'totals_p2'],
  nfl: ['h2h_q1', 'h2h_h1', 'spreads_q1', 'spreads_h1', 'totals_q1', 'totals_h1'],
  mlb: ['h2h_1st_5_innings', 'spreads_1st_5_innings', 'totals_1st_5_innings'],
};

const SPORT_KEYS: Record<string, string> = {
  nba: 'basketball_nba',
  nhl: 'icehockey_nhl',
  nfl: 'americanfootball_nfl',
  mlb: 'baseball_mlb',
};

export async function GET(request: Request) {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport')?.toLowerCase() || 'nba';
  const eventId = searchParams.get('eventId');

  if (!SPORT_KEYS[sport]) {
    return NextResponse.json({
      error: `Invalid sport. Available: ${Object.keys(SPORT_KEYS).join(', ')}`,
    }, { status: 400 });
  }

  if (!eventId) {
    // Return list of available events
    try {
      const url = `${ODDS_API_BASE}/sports/${SPORT_KEYS[sport]}/events?apiKey=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const events = await response.json();
      
      return NextResponse.json({
        message: 'Provide eventId parameter to get period markets',
        sport,
        availableMarkets: PERIOD_MARKETS[sport as keyof typeof PERIOD_MARKETS],
        events: events.slice(0, 15).map((e: { id: string; home_team: string; away_team: string; commence_time: string }) => ({
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

  const cacheKey = `periods-${sport}-${eventId}`;

  try {
    // Check cache
    const cached = await getCachedPlayerProps(cacheKey);
    if (cached) {
      console.log(`Returning cached period markets for ${sport}:`, eventId);
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
      });
    }

    const markets = PERIOD_MARKETS[sport as keyof typeof PERIOD_MARKETS];
    const marketsParam = markets.join(',');
    
    const url = `${ODDS_API_BASE}/sports/${SPORT_KEYS[sport]}/events/${eventId}/odds?apiKey=${apiKey}&regions=us&markets=${marketsParam}&oddsFormat=american`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    const requestsRemaining = response.headers.get('x-requests-remaining');
    const requestsUsed = response.headers.get('x-requests-used');

    // Organize markets by period
    const periodData: Record<string, {
      moneyline?: { home: { bookmaker: string; odds: number }[]; away: { bookmaker: string; odds: number }[] };
      spread?: { home: { bookmaker: string; odds: number; line: number }[]; away: { bookmaker: string; odds: number; line: number }[] };
      total?: { over: { bookmaker: string; odds: number; line: number }[]; under: { bookmaker: string; odds: number; line: number }[] };
    }> = {};

    for (const book of data.bookmakers || []) {
      for (const market of book.markets || []) {
        // Determine period from market key
        let period = '';
        if (market.key.includes('q1')) period = 'Q1';
        else if (market.key.includes('q2')) period = 'Q2';
        else if (market.key.includes('q3')) period = 'Q3';
        else if (market.key.includes('q4')) period = 'Q4';
        else if (market.key.includes('h1') || market.key.includes('1st_half')) period = '1H';
        else if (market.key.includes('h2') || market.key.includes('2nd_half')) period = '2H';
        else if (market.key.includes('p1')) period = 'P1';
        else if (market.key.includes('p2')) period = 'P2';
        else if (market.key.includes('p3')) period = 'P3';
        else if (market.key.includes('1st_5_innings')) period = '1st5';
        else continue;

        if (!periodData[period]) {
          periodData[period] = {};
        }

        // Determine market type
        if (market.key.startsWith('h2h')) {
          if (!periodData[period].moneyline) {
            periodData[period].moneyline = { home: [], away: [] };
          }
          for (const outcome of market.outcomes) {
            if (outcome.name === data.home_team) {
              periodData[period].moneyline!.home.push({ bookmaker: book.title, odds: outcome.price });
            } else if (outcome.name === data.away_team) {
              periodData[period].moneyline!.away.push({ bookmaker: book.title, odds: outcome.price });
            }
          }
        } else if (market.key.startsWith('spreads')) {
          if (!periodData[period].spread) {
            periodData[period].spread = { home: [], away: [] };
          }
          for (const outcome of market.outcomes) {
            if (outcome.name === data.home_team) {
              periodData[period].spread!.home.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
            } else if (outcome.name === data.away_team) {
              periodData[period].spread!.away.push({ bookmaker: book.title, odds: outcome.price, line: -(outcome.point || 0) });
            }
          }
        } else if (market.key.startsWith('totals')) {
          if (!periodData[period].total) {
            periodData[period].total = { over: [], under: [] };
          }
          for (const outcome of market.outcomes) {
            if (outcome.name === 'Over') {
              periodData[period].total!.over.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
            } else {
              periodData[period].total!.under.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
            }
          }
        }
      }
    }

    const responseData = {
      eventId,
      sport,
      homeTeam: data.home_team,
      awayTeam: data.away_team,
      commenceTime: data.commence_time,
      periodMarkets: periodData,
      availablePeriods: Object.keys(periodData),
      meta: {
        fetchedAt: new Date().toISOString(),
        quota: {
          requestsRemaining: requestsRemaining ? parseInt(requestsRemaining) : null,
          requestsUsed: requestsUsed ? parseInt(requestsUsed) : null,
        },
      },
    };

    // Cache result
    await cachePlayerProps(cacheKey, responseData);
    console.log(`Cached period markets for ${sport}:`, eventId);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching period markets:', error);

    // Try cache fallback
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
      { error: error instanceof Error ? error.message : 'Failed to fetch period markets' },
      { status: 500 }
    );
  }
}
