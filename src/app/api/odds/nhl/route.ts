/**
 * API Route: GET /api/odds/nhl
 * Fetches current NHL odds from The Odds API
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';

export const dynamic = 'force-dynamic'; // Don't cache this route
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
    const games = await client.getNhlOdds(['h2h', 'spreads', 'totals']);
    
    // Normalize all games for easier frontend consumption
    const normalizedGames = games.map((game) => client.normalizeGameOdds(game));
    
    const quota = client.getQuota();

    return NextResponse.json({
      games: normalizedGames,
      meta: {
        sport: 'NHL',
        gamesCount: normalizedGames.length,
        fetchedAt: new Date().toISOString(),
        quota,
      },
    });
  } catch (error) {
    console.error('Error fetching NHL odds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
