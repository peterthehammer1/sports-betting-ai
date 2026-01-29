/**
 * API Route: POST /api/analyze
 * 
 * Analyzes a game using Claude and returns predictions.
 * 
 * Request body:
 * {
 *   "gameId": "abc123",
 *   "sport": "NHL" | "NBA"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { createAnalysisClient } from '@/lib/analysis/claude';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for Claude analysis

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
    const { gameId, sport } = body as { gameId: string; sport: 'NHL' | 'NBA' };

    if (!gameId || !sport) {
      return NextResponse.json(
        { error: 'gameId and sport are required' },
        { status: 400 }
      );
    }

    // Fetch current odds for the game
    const oddsClient = createOddsApiClient({ apiKey: oddsApiKey });
    const sportKey = sport === 'NHL' ? 'icehockey_nhl' : 'basketball_nba';
    
    const game = await oddsClient.getGameOdds(
      sportKey,
      gameId,
      ['h2h', 'spreads', 'totals']
    );

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const normalizedGame = oddsClient.normalizeGameOdds(game);

    // Analyze with Claude
    const analysisClient = createAnalysisClient({ apiKey: anthropicApiKey });
    const { prediction, meta } = await analysisClient.analyzeGame(normalizedGame, sport);

    return NextResponse.json({
      prediction,
      meta,
      oddsUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
