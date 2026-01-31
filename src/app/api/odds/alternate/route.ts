/**
 * API Route: GET /api/odds/alternate
 * Fetches alternate spreads and totals (Premium Feature)
 * Allows users to find better odds at different lines
 */

import { NextResponse } from 'next/server';
import { getCachedPlayerProps, cachePlayerProps, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

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
        message: 'Provide eventId parameter to get alternate lines',
        sport,
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

  const cacheKey = `alternate-${sport}-${eventId}`;

  try {
    // Check cache
    const cached = await getCachedPlayerProps(cacheKey);
    if (cached) {
      console.log(`Returning cached alternate lines for ${sport}:`, eventId);
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
      });
    }

    // Fetch alternate spreads and totals
    const markets = 'alternate_spreads,alternate_totals,team_totals';
    const url = `${ODDS_API_BASE}/sports/${SPORT_KEYS[sport]}/events/${eventId}/odds?apiKey=${apiKey}&regions=us&markets=${markets}&oddsFormat=american`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    const requestsRemaining = response.headers.get('x-requests-remaining');
    const requestsUsed = response.headers.get('x-requests-used');

    // Organize alternate lines
    const alternateSpreads: {
      home: { line: number; odds: { bookmaker: string; price: number }[] }[];
      away: { line: number; odds: { bookmaker: string; price: number }[] }[];
    } = { home: [], away: [] };
    
    const alternateTotals: {
      over: { line: number; odds: { bookmaker: string; price: number }[] }[];
      under: { line: number; odds: { bookmaker: string; price: number }[] }[];
    } = { over: [], under: [] };
    
    const teamTotals: {
      home: { line: number; overOdds: { bookmaker: string; price: number }[]; underOdds: { bookmaker: string; price: number }[] }[];
      away: { line: number; overOdds: { bookmaker: string; price: number }[]; underOdds: { bookmaker: string; price: number }[] }[];
    } = { home: [], away: [] };

    // Group by line
    const spreadsByLine: Record<string, { home: { bookmaker: string; price: number }[]; away: { bookmaker: string; price: number }[] }> = {};
    const totalsByLine: Record<string, { over: { bookmaker: string; price: number }[]; under: { bookmaker: string; price: number }[] }> = {};
    const teamTotalsByLine: Record<string, Record<string, { over: { bookmaker: string; price: number }[]; under: { bookmaker: string; price: number }[] }>> = {};

    for (const book of data.bookmakers || []) {
      for (const market of book.markets || []) {
        if (market.key === 'alternate_spreads') {
          for (const outcome of market.outcomes) {
            const lineKey = `${outcome.point}`;
            if (!spreadsByLine[lineKey]) {
              spreadsByLine[lineKey] = { home: [], away: [] };
            }
            if (outcome.name === data.home_team) {
              spreadsByLine[lineKey].home.push({ bookmaker: book.title, price: outcome.price });
            } else {
              spreadsByLine[lineKey].away.push({ bookmaker: book.title, price: outcome.price });
            }
          }
        } else if (market.key === 'alternate_totals') {
          for (const outcome of market.outcomes) {
            const lineKey = `${outcome.point}`;
            if (!totalsByLine[lineKey]) {
              totalsByLine[lineKey] = { over: [], under: [] };
            }
            if (outcome.name === 'Over') {
              totalsByLine[lineKey].over.push({ bookmaker: book.title, price: outcome.price });
            } else {
              totalsByLine[lineKey].under.push({ bookmaker: book.title, price: outcome.price });
            }
          }
        } else if (market.key === 'team_totals') {
          for (const outcome of market.outcomes) {
            const team = outcome.description?.includes(data.home_team) ? 'home' : 'away';
            const lineKey = `${outcome.point}`;
            if (!teamTotalsByLine[team]) {
              teamTotalsByLine[team] = {};
            }
            if (!teamTotalsByLine[team][lineKey]) {
              teamTotalsByLine[team][lineKey] = { over: [], under: [] };
            }
            if (outcome.name === 'Over') {
              teamTotalsByLine[team][lineKey].over.push({ bookmaker: book.title, price: outcome.price });
            } else {
              teamTotalsByLine[team][lineKey].under.push({ bookmaker: book.title, price: outcome.price });
            }
          }
        }
      }
    }

    // Convert to arrays sorted by line
    for (const [line, data] of Object.entries(spreadsByLine).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
      if (data.home.length > 0) {
        alternateSpreads.home.push({ line: parseFloat(line), odds: data.home });
      }
      if (data.away.length > 0) {
        alternateSpreads.away.push({ line: -parseFloat(line), odds: data.away });
      }
    }

    for (const [line, data] of Object.entries(totalsByLine).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
      if (data.over.length > 0) {
        alternateTotals.over.push({ line: parseFloat(line), odds: data.over });
      }
      if (data.under.length > 0) {
        alternateTotals.under.push({ line: parseFloat(line), odds: data.under });
      }
    }

    for (const team of ['home', 'away'] as const) {
      if (teamTotalsByLine[team]) {
        for (const [line, ttData] of Object.entries(teamTotalsByLine[team]).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
          teamTotals[team].push({
            line: parseFloat(line),
            overOdds: ttData.over,
            underOdds: ttData.under,
          });
        }
      }
    }

    const responseData = {
      eventId,
      sport,
      homeTeam: data.home_team,
      awayTeam: data.away_team,
      commenceTime: data.commence_time,
      alternateLines: {
        spreads: alternateSpreads,
        totals: alternateTotals,
        teamTotals,
      },
      summary: {
        spreadLinesAvailable: Object.keys(spreadsByLine).length,
        totalLinesAvailable: Object.keys(totalsByLine).length,
        hasTeamTotals: Object.keys(teamTotalsByLine).length > 0,
      },
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
    console.log(`Cached alternate lines for ${sport}:`, eventId);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Error fetching alternate lines:', error);

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
      { error: error instanceof Error ? error.message : 'Failed to fetch alternate lines' },
      { status: 500 }
    );
  }
}
