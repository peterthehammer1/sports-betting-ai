/**
 * API Route: POST /api/analyze
 * 
 * Analyzes a game using Claude and returns predictions.
 * Results are cached to avoid repeated API calls.
 * Now includes injury data for better analysis.
 * 
 * Request body:
 * {
 *   "gameId": "abc123",
 *   "sport": "NHL" | "NBA" | "NFL" | "MLB" | "EPL"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';
import { createAnalysisClient } from '@/lib/analysis/claude';
import { getCachedGameAnalysis, cacheGameAnalysis, isRedisConfigured } from '@/lib/cache/redis';
import { fetchInjuries, getGameInjuries, formatInjuriesForAI } from '@/lib/api/injuries';
import { saveGameAnalysisPicks } from '@/lib/tracking/savePicks';
import type { SportKey } from '@/types/odds';
import type { Sport } from '@/types/tracker';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for Claude analysis

// Map sport names to API sport keys
const SPORT_KEY_MAP: Record<string, SportKey> = {
  'NHL': 'icehockey_nhl',
  'NBA': 'basketball_nba',
  'NFL': 'americanfootball_nfl',
  'MLB': 'baseball_mlb',
  'EPL': 'soccer_epl',
};

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
    const { gameId, sport } = body as { gameId: string; sport: 'NHL' | 'NBA' | 'NFL' | 'MLB' | 'EPL' };

    if (!gameId || !sport) {
      return NextResponse.json(
        { error: 'gameId and sport are required' },
        { status: 400 }
      );
    }

    // Validate sport
    const sportKey = SPORT_KEY_MAP[sport];
    if (!sportKey) {
      return NextResponse.json(
        { error: `Unsupported sport: ${sport}. Supported: NHL, NBA, NFL, MLB, EPL` },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = await getCachedGameAnalysis(gameId, sport);
    if (cached) {
      const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
      });
    }

    // Fetch current odds for the game
    const oddsClient = createOddsApiClient({ apiKey: oddsApiKey });
    
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

    // Fetch injury data for context (only for sports with injury data)
    let injuryReport = '';
    let gameInjuryData = null;
    const sportsWithInjuries = ['NHL', 'NBA', 'NFL'];
    
    if (sportsWithInjuries.includes(sport)) {
      try {
        const sportInjuries = await fetchInjuries(sport as 'NHL' | 'NBA' | 'NFL');
        const { home, away, impactLevel } = getGameInjuries(
          sportInjuries,
          normalizedGame.homeTeam,
          normalizedGame.awayTeam
        );
        
        injuryReport = formatInjuriesForAI(
          normalizedGame.homeTeam,
          normalizedGame.awayTeam,
          home,
          away
        );
        
        gameInjuryData = {
          homeTeam: home,
          awayTeam: away,
          impactLevel,
          totalInjuries: (home?.injuries.length || 0) + (away?.injuries.length || 0),
        };
      } catch (injuryError) {
        console.error('Failed to fetch injuries, continuing without:', injuryError);
        injuryReport = 'INJURY REPORT: Injury data unavailable.';
      }
    }

    // Analyze with Claude - map sport to analysis type with retry logic
    const analysisClient = createAnalysisClient({ apiKey: anthropicApiKey });
    // For analysis, treat EPL as a generic sport, NFL/MLB get their own handling
    const analysisSport = (sport === 'EPL' || sport === 'MLB') ? 'NBA' : sport; // Use NBA format for non-traditional sports
    
    // Retry logic for Claude analysis (sometimes JSON parsing fails)
    let prediction, meta;
    let lastError: Error | null = null;
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await analysisClient.analyzeGame(normalizedGame, analysisSport as 'NHL' | 'NBA', injuryReport);
        prediction = result.prediction;
        meta = result.meta;
        break; // Success, exit loop
      } catch (analysisError) {
        lastError = analysisError as Error;
        console.error(`Analysis attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!prediction || !meta) {
      return NextResponse.json(
        { error: lastError?.message || 'Analysis failed after retries - please try again' },
        { status: 500 }
      );
    }

    const responseData = {
      prediction,
      meta,
      injuries: gameInjuryData,
      oddsUpdatedAt: new Date().toISOString(),
    };

    // Cache the result
    await cacheGameAnalysis(gameId, sport, responseData);

    // Save picks to tracker (for NBA, NHL, NFL)
    if (['NBA', 'NHL', 'NFL'].includes(sport)) {
      try {
        const gameInfo = {
          gameId,
          sport: sport as Sport,
          homeTeam: normalizedGame.homeTeam,
          awayTeam: normalizedGame.awayTeam,
          gameTime: normalizedGame.commenceTime.toISOString(),
        };
        
        const savedPicks = await saveGameAnalysisPicks(gameInfo, {
          winner: prediction.winner ? {
            pick: prediction.winner.pick,
            confidence: prediction.winner.confidence,
            reasoning: prediction.winner.reasoning || '',
            odds: prediction.winner.pick === normalizedGame.homeTeam 
              ? (normalizedGame.moneyline.bestHome?.americanOdds || -150)
              : (normalizedGame.moneyline.bestAway?.americanOdds || 150),
          } : undefined,
          spread: prediction.spread ? {
            pick: `${prediction.spread.pick} ${prediction.spread.line > 0 ? '+' : ''}${prediction.spread.line}`,
            line: prediction.spread.line,
            confidence: prediction.spread.confidence,
            reasoning: prediction.spread.reasoning || '',
          } : undefined,
          total: prediction.total ? {
            pick: prediction.total.pick,
            line: prediction.total.line,
            confidence: prediction.total.confidence,
            reasoning: prediction.total.reasoning || '',
          } : undefined,
        });
        
        console.log(`Saved ${savedPicks.length} picks for ${sport} game ${gameId}`);
      } catch (trackingError) {
        console.error('Failed to save picks to tracker:', trackingError);
        // Don't fail the request if tracking fails
      }
    }

    return NextResponse.json({
      ...responseData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
