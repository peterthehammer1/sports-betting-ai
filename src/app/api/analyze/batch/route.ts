/**
 * API Route: POST /api/analyze/batch
 * 
 * Quick analysis of all games for a sport.
 * Returns winner picks and best bets for each game.
 * 
 * Request body:
 * {
 *   "sport": "NHL" | "NBA"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { createAnalysisClient } from '@/lib/analysis/claude';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow up to 2 minutes for batch analysis

export async function POST(request: NextRequest) {
  const oddsApiKey = process.env.THE_ODDS_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!oddsApiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  if (!anthropicApiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { sport } = body as { sport: 'NHL' | 'NBA' };

    if (!sport) {
      return NextResponse.json(
        { error: 'sport is required' },
        { status: 400 }
      );
    }

    // Fetch all games with odds
    const oddsClient = createOddsApiClient({ apiKey: oddsApiKey });
    const games = sport === 'NHL' 
      ? await oddsClient.getNhlOdds(['h2h', 'spreads', 'totals'])
      : await oddsClient.getNbaOdds(['h2h', 'spreads', 'totals']);

    if (games.length === 0) {
      return NextResponse.json({
        predictions: [],
        meta: {
          gamesAnalyzed: 0,
          message: `No ${sport} games scheduled`,
        },
      });
    }

    // Normalize all games
    const normalizedGames = games.map(g => oddsClient.normalizeGameOdds(g));

    // Batch analyze with Claude
    const analysisClient = createAnalysisClient({ apiKey: anthropicApiKey });
    const { predictions, meta } = await analysisClient.analyzeGames(normalizedGames, sport);

    // Merge predictions with game data
    const enrichedPredictions = predictions.map((pred, idx) => ({
      ...pred,
      gameId: normalizedGames[idx]?.gameId,
      commenceTime: normalizedGames[idx]?.commenceTime,
      odds: {
        homeML: normalizedGames[idx]?.moneyline.bestHome?.americanOdds,
        awayML: normalizedGames[idx]?.moneyline.bestAway?.americanOdds,
        spread: normalizedGames[idx]?.spread.consensusLine,
        total: normalizedGames[idx]?.total.consensusLine,
      },
    }));

    return NextResponse.json({
      sport,
      predictions: enrichedPredictions,
      meta: {
        ...meta,
        gamesAnalyzed: games.length,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch analysis failed' },
      { status: 500 }
    );
  }
}
