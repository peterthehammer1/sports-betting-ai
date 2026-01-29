/**
 * API Route: GET /api/odds/nba
 * Fetches current NBA odds from The Odds API
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const client = createOddsApiClient({ apiKey });
    const games = await client.getNbaOdds(['h2h', 'spreads', 'totals']);
    
    const normalizedGames = games.map((game) => client.normalizeGameOdds(game));
    
    const quota = client.getQuota();

    return NextResponse.json({
      games: normalizedGames,
      meta: {
        sport: 'NBA',
        gamesCount: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    });
  } catch (error) {
    console.error('Error fetching NBA odds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
