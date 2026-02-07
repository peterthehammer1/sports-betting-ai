/**
 * API Route: GET /api/odds/mlb
 * Fetches current MLB odds from The Odds API
 * With Redis caching for when API quota is exceeded
 */

import { NextResponse } from 'next/server';
import { getCachedOdds, cacheOdds, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

export async function GET() {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    // Check cache first
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

    // Fetch fresh odds from The Odds API
    const url = `${ODDS_API_BASE}/sports/baseball_mlb/odds?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Odds API returned ${response.status}`);
    }

    const games = await response.json();
    
    // Get quota info from headers
    const requestsRemaining = response.headers.get('x-requests-remaining');
    const requestsUsed = response.headers.get('x-requests-used');

    // Filter to show games starting in the next 48 hours or started within last 4 hours
    const now = new Date();
    const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000;
    const twoDaysFromNow = now.getTime() + 48 * 60 * 60 * 1000;
    
    const todaysGames = games.filter((game: { commence_time: string }) => {
      const gameTime = new Date(game.commence_time).getTime();
      return gameTime >= fourHoursAgo && gameTime < twoDaysFromNow;
    });

    // Normalize games
    const normalizedGames = todaysGames.map((game: {
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
      // Extract best odds for each market
      const moneylineHome: { bookmaker: string; odds: number }[] = [];
      const moneylineAway: { bookmaker: string; odds: number }[] = [];
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
              } else {
                moneylineAway.push({ bookmaker: book.title, odds: outcome.price });
              }
            }
          }
          if (market.key === 'spreads') {
            for (const outcome of market.outcomes) {
              if (outcome.name === game.home_team) {
                spreadHome.push({ bookmaker: book.title, odds: outcome.price, line: outcome.point || 0 });
              } else {
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
          bestHome: moneylineHome.length > 0 ? moneylineHome.reduce((a, b) => a.odds > b.odds ? a : b) : null,
          bestAway: moneylineAway.length > 0 ? moneylineAway.reduce((a, b) => a.odds > b.odds ? a : b) : null,
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
      games: normalizedGames,
      meta: {
        sport: 'MLB',
        gamesCount: normalizedGames.length,
        totalGames: games.length,
        fetchedAt: new Date().toISOString(),
        quota: {
          requestsRemaining: requestsRemaining ? parseInt(requestsRemaining) : null,
          requestsUsed: requestsUsed ? parseInt(requestsUsed) : null,
        },
      },
    };

    // Cache the result
    await cacheOdds('MLB', responseData);
    console.log('Cached MLB odds, today/tomorrow games:', normalizedGames.length);

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
        message: 'API quota may be exceeded, showing cached data',
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
