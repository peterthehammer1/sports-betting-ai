/**
 * API Route: GET /api/odds/soccer
 * Fetches soccer odds from The Odds API
 * Supports EPL, MLS, La Liga, Bundesliga, Serie A, Ligue 1, Champions League
 */

import { NextResponse } from 'next/server';
import { getCachedOdds, cacheOdds, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Available soccer leagues
const SOCCER_LEAGUES: Record<string, { key: string; name: string; flag: string }> = {
  epl: { key: 'soccer_epl', name: 'English Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  mls: { key: 'soccer_usa_mls', name: 'MLS', flag: '🇺🇸' },
  laliga: { key: 'soccer_spain_la_liga', name: 'La Liga', flag: '🇪🇸' },
  bundesliga: { key: 'soccer_germany_bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  seriea: { key: 'soccer_italy_serie_a', name: 'Serie A', flag: '🇮🇹' },
  ligue1: { key: 'soccer_france_ligue_one', name: 'Ligue 1', flag: '🇫🇷' },
  ucl: { key: 'soccer_uefa_champs_league', name: 'Champions League', flag: '🇪🇺' },
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
  const league = searchParams.get('league') || 'epl';
  const forceFresh = searchParams.get('fresh') === 'true';

  const leagueConfig = SOCCER_LEAGUES[league.toLowerCase()];
  if (!leagueConfig) {
    return NextResponse.json({
      error: `Invalid league. Available: ${Object.keys(SOCCER_LEAGUES).join(', ')}`,
      availableLeagues: Object.entries(SOCCER_LEAGUES).map(([id, config]) => ({
        id,
        ...config,
      })),
    }, { status: 400 });
  }

  const cacheKey = `SOCCER_${league.toUpperCase()}`;

  try {
    // Check cache first (unless fresh=true)
    if (!forceFresh) {
      const cached = await getCachedOdds(cacheKey);
      if (cached) {
        console.log(`Returning cached ${league} odds`);
        const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          cacheEnabled: true,
        });
      }
    }

    // Fetch odds - include draw for soccer
    const url = `${ODDS_API_BASE}/sports/${leagueConfig.key}/odds?apiKey=${apiKey}&regions=us,uk&markets=h2h,spreads,totals&oddsFormat=american`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Odds API returned ${response.status}`);
    }

    const games = await response.json();
    
    const requestsRemaining = response.headers.get('x-requests-remaining');
    const requestsUsed = response.headers.get('x-requests-used');

    // Normalize games with draw support
    const normalizedGames = games.map((game: {
      id: string;
      home_team: string;
      away_team: string;
      commence_time: string;
      bookmakers: Array<{
        key: string;
        title: string;
        markets: Array<{
          key: string;
          outcomes: Array<{
            name: string;
            price: number;
            point?: number;
          }>;
        }>;
      }>;
    }) => {
      const moneylineHome: { bookmaker: string; odds: number }[] = [];
      const moneylineAway: { bookmaker: string; odds: number }[] = [];
      const moneylineDraw: { bookmaker: string; odds: number }[] = [];
      const spreadHome: { bookmaker: string; odds: number; line: number }[] = [];
      const spreadAway: { bookmaker: string; odds: number; line: number }[] = [];
      const totalOver: { bookmaker: string; odds: number; line: number }[] = [];
      const totalUnder: { bookmaker: string; odds: number; line: number }[] = [];

      for (const book of game.bookmakers) {
        for (const market of book.markets) {
          if (market.key === 'h2h') {
            for (const outcome of market.outcomes) {
              if (outcome.name === game.home_team) {
                moneylineHome.push({ bookmaker: book.title, odds: outcome.price });
              } else if (outcome.name === game.away_team) {
                moneylineAway.push({ bookmaker: book.title, odds: outcome.price });
              } else if (outcome.name === 'Draw') {
                moneylineDraw.push({ bookmaker: book.title, odds: outcome.price });
              }
            }
          }
          if (market.key === 'spreads') {
            for (const outcome of market.outcomes) {
              if (outcome.name === game.home_team) {
                spreadHome.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
              } else if (outcome.name === game.away_team) {
                spreadAway.push({ bookmaker: book.title, odds: outcome.price, line: -(outcome.point || 0) });
              }
            }
          }
          if (market.key === 'totals') {
            for (const outcome of market.outcomes) {
              if (outcome.name === 'Over') {
                totalOver.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
              } else {
                totalUnder.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
              }
            }
          }
        }
      }

      return {
        gameId: game.id,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commenceTime: game.commence_time,
        moneyline: {
          home: moneylineHome,
          away: moneylineAway,
          draw: moneylineDraw, // Soccer-specific
          bestHome: moneylineHome.length > 0 ? moneylineHome.reduce((a, b) => a.odds > b.odds ? a : b) : null,
          bestAway: moneylineAway.length > 0 ? moneylineAway.reduce((a, b) => a.odds > b.odds ? a : b) : null,
          bestDraw: moneylineDraw.length > 0 ? moneylineDraw.reduce((a, b) => a.odds > b.odds ? a : b) : null,
        },
        spread: {
          home: spreadHome,
          away: spreadAway,
          consensusLine: spreadHome.length > 0 ? spreadHome[0].line : null,
        },
        total: {
          over: totalOver,
          under: totalUnder,
          consensusLine: totalOver.length > 0 ? totalOver[0].line : null,
        },
      };
    });

    const responseData = {
      league: {
        id: league,
        ...leagueConfig,
      },
      games: normalizedGames,
      meta: {
        sport: 'Soccer',
        league: leagueConfig.name,
        gamesCount: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota: {
          requestsRemaining: requestsRemaining ? parseInt(requestsRemaining) : null,
          requestsUsed: requestsUsed ? parseInt(requestsUsed) : null,
        },
      },
    };

    // Cache the result
    await cacheOdds(cacheKey, responseData);
    console.log(`Cached ${league} odds, games:`, normalizedGames.length);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error(`Error fetching ${league} odds:`, error);
    
    // Try cached data
    const fallbackCached = await getCachedOdds(cacheKey);
    if (fallbackCached) {
      const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        message: 'Returning cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
