/**
 * API Route: POST /api/analyze/props
 * 
 * Analyzes NHL goal scorer props using Claude.
 * Results are cached to avoid repeated API calls.
 * 
 * Request body:
 * {
 *   "gameId": "abc123"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { createAnalysisClient } from '@/lib/analysis/claude';
import { getCachedPropsAnalysis, cachePropsAnalysis, isRedisConfigured } from '@/lib/cache/redis';

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
    const { gameId } = body as { gameId: string };

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = await getCachedPropsAnalysis(gameId);
    if (cached) {
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
      });
    }

    // Fetch current player props for the game (uses event-specific endpoint)
    const oddsClient = createOddsApiClient({ apiKey: oddsApiKey });
    const game = await oddsClient.getNhlPlayerProps(gameId);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Check if we have any player props data
    if (game.bookmakers.length === 0) {
      return NextResponse.json(
        { error: 'No player props available for this game. Props may not be available yet or the game may have started.' },
        { status: 404 }
      );
    }

    const normalizedGame = oddsClient.normalizePlayerProps(game);

    // Check if we have goal scorers to analyze
    if (
      normalizedGame.firstGoalScorers.length === 0 &&
      normalizedGame.anytimeGoalScorers.length === 0
    ) {
      return NextResponse.json(
        { error: 'No goal scorer odds available for this game' },
        { status: 404 }
      );
    }

    // Analyze with Claude
    const analysisClient = createAnalysisClient({ apiKey: anthropicApiKey });
    const { analysis, meta } = await analysisClient.analyzeGoalScorers(normalizedGame);

    const responseData = {
      analysis,
      playerProps: {
        firstGoalScorers: normalizedGame.firstGoalScorers.slice(0, 30),
        anytimeGoalScorers: normalizedGame.anytimeGoalScorers.slice(0, 30),
      },
      meta,
      oddsUpdatedAt: new Date().toISOString(),
    };

    // Cache the result
    await cachePropsAnalysis(gameId, responseData);

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Props analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
