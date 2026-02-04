/**
 * API Route: POST /api/picks/daily
 * Generates Pete's Daily Picks - automated AI picks for each sport
 * 
 * Called by:
 * 1. Vercel cron job (daily at 10am ET)
 * 2. Manual trigger from admin
 */

import { NextResponse } from 'next/server';
import { savePick, getPicks, isRedisConfigured } from '@/lib/cache/redis';
import { createOddsApiClient } from '@/lib/api/odds';
import type { TrackedPick, Sport } from '@/types/tracker';
import type { SportKey } from '@/types/odds';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for multiple AI calls

const PICKS_PER_SPORT = 2;

interface GameForPicking {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  sport: Sport;
}

// Type for AI prediction response
interface GamePredictionResult {
  winner?: { pick: string; confidence: number; reasoning: string };
  spread?: { pick: string; line: number; confidence: number; reasoning: string };
  total?: { pick: string; line: number; confidence: number; reasoning: string };
}

/**
 * Generate a unique pick ID
 */
function generatePickId(): string {
  return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fetch today's games for a sport directly from The Odds API
 */
async function fetchGamesForSport(sport: Sport): Promise<GameForPicking[]> {
  const apiKey = process.env.THE_ODDS_API_KEY;
  if (!apiKey) {
    console.error('THE_ODDS_API_KEY not configured');
    return [];
  }

  try {
    const oddsClient = createOddsApiClient({ apiKey });
    
    // Use sport-specific methods
    let games;
    if (sport === 'NHL') {
      games = await oddsClient.getNhlOdds(['h2h', 'spreads', 'totals']);
    } else if (sport === 'NBA') {
      games = await oddsClient.getNbaOdds(['h2h', 'spreads', 'totals']);
    } else {
      games = await oddsClient.getNflOdds(['h2h', 'spreads', 'totals']);
    }
    
    console.log(`Fetched ${games.length} ${sport} games from Odds API`);
    
    // Map to our format and take up to 6 games
    return games.slice(0, 6).map(game => {
      const normalized = oddsClient.normalizeGameOdds(game);
      return {
        gameId: normalized.gameId,
        homeTeam: normalized.homeTeam,
        awayTeam: normalized.awayTeam,
        commenceTime: normalized.commenceTime.toISOString(),
        sport,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch ${sport} games:`, error);
    return [];
  }
}

/**
 * Get AI analysis for a game using Claude directly
 */
async function getGameAnalysis(game: GameForPicking) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const oddsApiKey = process.env.THE_ODDS_API_KEY;
  
  if (!apiKey || !oddsApiKey) {
    console.error('API keys not configured');
    return null;
  }

  try {
    const sportKeys: Record<Sport, SportKey> = {
      NHL: 'icehockey_nhl',
      NBA: 'basketball_nba',
      NFL: 'americanfootball_nfl',
    };
    
    const oddsClient = createOddsApiClient({ apiKey: oddsApiKey });
    const gameData = await oddsClient.getGameOdds(sportKeys[game.sport], game.gameId, ['h2h', 'spreads', 'totals']);
    
    if (!gameData) {
      console.log(`Game ${game.gameId} not found`);
      return null;
    }
    
    const normalizedGame = oddsClient.normalizeGameOdds(gameData);
    
    // Import and use analysis client
    const { createAnalysisClient } = await import('@/lib/analysis/claude');
    const analysisClient = createAnalysisClient({ apiKey });
    
    const analysisSport = game.sport === 'NFL' ? 'NBA' : game.sport; // NFL uses NBA format
    const { prediction } = await analysisClient.analyzeGame(normalizedGame, analysisSport as 'NHL' | 'NBA', '');
    
    console.log(`Analyzed ${game.homeTeam} vs ${game.awayTeam}: ${prediction.winner?.pick} (${prediction.winner?.confidence}%)`);
    return prediction;
  } catch (error) {
    console.error(`Failed to analyze game ${game.gameId}:`, error);
    return null;
  }
}

/**
 * Select the best games to pick (highest confidence from AI)
 */
async function selectBestPicks(
  games: GameForPicking[],
  count: number
): Promise<Array<{ game: GameForPicking; prediction: GamePredictionResult }>> {
  const analyzed: Array<{ game: GameForPicking; prediction: GamePredictionResult; confidence: number }> = [];

  // Analyze games (limit to save API calls)
  for (const game of games.slice(0, 4)) {
    const prediction = await getGameAnalysis(game);
    if (prediction) {
      // Get highest confidence pick from this game
      const maxConfidence = Math.max(
        prediction.winner?.confidence || 0,
        prediction.spread?.confidence || 0,
        prediction.total?.confidence || 0
      );
      analyzed.push({ game, prediction, confidence: maxConfidence });
      console.log(`${game.sport}: ${game.awayTeam} @ ${game.homeTeam} - max conf: ${maxConfidence}%`);
    }
  }

  // Sort by confidence and take top picks
  return analyzed
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, count);
}

/**
 * Save a daily pick
 */
async function saveDailyPick(
  game: GameForPicking,
  prediction: GamePredictionResult,
  pickType: 'winner' | 'spread' | 'total'
): Promise<TrackedPick | null> {
  const pickData = prediction[pickType] as { pick: string; confidence: number; reasoning: string; line?: number } | undefined;
  if (!pickData || pickData.confidence < 60) return null;

  const pick: TrackedPick = {
    id: generatePickId(),
    createdAt: new Date().toISOString(),
    gameId: game.gameId,
    sport: game.sport,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    gameTime: game.commenceTime,
    betType: pickType === 'winner' ? 'moneyline' : pickType,
    pick: pickType === 'winner' 
      ? `${pickData.pick} ML`
      : pickType === 'spread'
      ? `${pickData.pick} ${(pickData.line || 0) > 0 ? '+' : ''}${pickData.line || 0}`
      : `${pickData.pick} ${prediction.total?.line || 0}`,
    odds: pickType === 'winner' ? (pickData.pick === game.homeTeam ? -150 : 150) : -110,
    line: pickType !== 'winner' ? (pickData.line || 0) : undefined,
    confidence: pickData.confidence,
    reasoning: pickData.reasoning || '',
    isValueBet: pickData.confidence >= 70,
    status: 'pending',
    units: 1,
  };

  const saved = await savePick(pick);
  return saved ? pick : null;
}

export async function POST(request: Request) {
  try {
    // Check for auth (simple secret key)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow if no secret configured (dev) or if secret matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check API keys
    if (!process.env.THE_ODDS_API_KEY) {
      return NextResponse.json({ error: 'THE_ODDS_API_KEY not configured' }, { status: 500 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    if (!isRedisConfigured()) {
      return NextResponse.json({ 
        error: 'Redis not configured - picks cannot be saved',
        suggestion: 'Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
      }, { status: 500 });
    }

    const results: Record<Sport, TrackedPick[]> = {
      NHL: [],
      NBA: [],
      NFL: [],
    };

    // Process each sport
    for (const sport of ['NHL', 'NBA'] as Sport[]) {
      console.log(`Processing ${sport} daily picks...`);
      
      const games = await fetchGamesForSport(sport);
      console.log(`Found ${games.length} ${sport} games`);
      
      if (games.length === 0) continue;

      const bestPicks = await selectBestPicks(games, PICKS_PER_SPORT);
      
      for (const { game, prediction } of bestPicks) {
        // Pick the highest confidence bet type for each game
        const confidences = [
          { type: 'spread' as const, conf: prediction.spread?.confidence || 0 },
          { type: 'winner' as const, conf: prediction.winner?.confidence || 0 },
          { type: 'total' as const, conf: prediction.total?.confidence || 0 },
        ].sort((a, b) => b.conf - a.conf);

        const bestType = confidences[0].type;
        const savedPick = await saveDailyPick(game, prediction, bestType);
        
        if (savedPick) {
          results[sport].push(savedPick);
          console.log(`Saved ${sport} pick: ${savedPick.pick} (${savedPick.confidence}%)`);
        }
      }
    }

    // Count total picks saved
    const totalPicks = Object.values(results).flat().length;

    return NextResponse.json({
      success: true,
      message: `Generated ${totalPicks} daily picks`,
      picks: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Daily picks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate daily picks' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check today's picks status
 */
export async function GET() {
  try {
    if (!isRedisConfigured()) {
      return NextResponse.json({ 
        hasPicks: false,
        message: 'Redis not configured'
      });
    }

    const recentPicks = await getPicks(10);
    const today = new Date().toDateString();
    
    const todaysPicks = recentPicks.filter(p => 
      new Date(p.createdAt).toDateString() === today
    );

    return NextResponse.json({
      hasPicks: todaysPicks.length > 0,
      count: todaysPicks.length,
      picks: todaysPicks,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check picks' }, { status: 500 });
  }
}
