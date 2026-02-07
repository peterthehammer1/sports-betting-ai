/**
 * API Route: GET /api/odds/soccer
 * Fetches soccer odds from The Odds API
 * Supports EPL, MLS, La Liga, Bundesliga, Serie A, Ligue 1, Champions League
 * Note: Soccer has custom normalization for Draw outcomes
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { getCachedOdds, cacheOdds, isRedisConfigured } from '@/lib/cache/redis';
import type { GameOdds } from '@/types/odds';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Available soccer leagues with metadata
const SOCCER_LEAGUES: Record<string, { key: 'epl' | 'mls' | 'laliga' | 'bundesliga' | 'seriea' | 'ligue1' | 'ucl'; name: string; flag: string }> = {
  epl: { key: 'epl', name: 'English Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  mls: { key: 'mls', name: 'MLS', flag: '🇺🇸' },
  laliga: { key: 'laliga', name: 'La Liga', flag: '🇪🇸' },
  bundesliga: { key: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  seriea: { key: 'seriea', name: 'Serie A', flag: '🇮🇹' },
  ligue1: { key: 'ligue1', name: 'Ligue 1', flag: '🇫🇷' },
  ucl: { key: 'ucl', name: 'Champions League', flag: '🇪🇺' },
};

// Soccer-specific normalization (includes Draw outcome)
function normalizeSoccerGame(game: GameOdds) {
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
}

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

    // Use client to fetch (handles API details)
    const client = createOddsApiClient({ apiKey });
    const games = await client.getSoccerOdds(leagueConfig.key, ['h2h', 'spreads', 'totals']);
    
    // Use soccer-specific normalization (includes Draw)
    const normalizedGames = games.map(normalizeSoccerGame);
    
    // Sort by commence time (soonest first)
    normalizedGames.sort((a, b) => 
      new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
    );
    
    // Filter to show games within the next 7 days
    const now = new Date();
    const oneWeekFromNow = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000;
    
    let filteredGames = normalizedGames.filter(game => {
      const gameTime = new Date(game.commenceTime).getTime();
      return gameTime >= fourHoursAgo && gameTime <= oneWeekFromNow;
    });
    
    // If no games within a week, show next 10 upcoming games
    if (filteredGames.length === 0 && normalizedGames.length > 0) {
      filteredGames = normalizedGames.slice(0, 10);
    }
    
    const quota = client.getQuota();

    const responseData = {
      league: {
        id: league,
        key: leagueConfig.key,
        name: leagueConfig.name,
        flag: leagueConfig.flag,
      },
      games: filteredGames,
      meta: {
        sport: 'Soccer',
        league: leagueConfig.name,
        gamesCount: filteredGames.length,
        totalGames: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
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
