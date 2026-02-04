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
import type { TrackedPick, Sport } from '@/types/tracker';

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

/**
 * Generate a unique pick ID
 */
function generatePickId(): string {
  return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fetch today's games for a sport
 */
async function fetchGamesForSport(sport: Sport, baseUrl: string): Promise<GameForPicking[]> {
  const sportEndpoints: Record<Sport, string> = {
    NHL: '/api/odds/nhl',
    NBA: '/api/odds/nba',
    NFL: '/api/odds/nfl',
  };

  try {
    const res = await fetch(`${baseUrl}${sportEndpoints[sport]}`);
    if (!res.ok) return [];
    
    const data = await res.json();
    const games = data.games || [];
    
    // Filter to games starting in next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return games
      .filter((g: { commenceTime: string | Date }) => {
        const gameTime = new Date(g.commenceTime);
        return gameTime > now && gameTime < tomorrow;
      })
      .map((g: { gameId: string; homeTeam: string; awayTeam: string; commenceTime: string | Date }) => ({
        gameId: g.gameId,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        commenceTime: typeof g.commenceTime === 'string' ? g.commenceTime : g.commenceTime.toISOString(),
        sport,
      }));
  } catch (error) {
    console.error(`Failed to fetch ${sport} games:`, error);
    return [];
  }
}

/**
 * Get AI analysis for a game
 */
async function getGameAnalysis(game: GameForPicking, baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: game.gameId, sport: game.sport }),
    });

    if (!res.ok) return null;
    
    const data = await res.json();
    return data.prediction;
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
  baseUrl: string,
  count: number
): Promise<Array<{ game: GameForPicking; prediction: any }>> {
  const analyzed: Array<{ game: GameForPicking; prediction: any; confidence: number }> = [];

  // Analyze all games
  for (const game of games.slice(0, 6)) { // Limit to 6 to save API calls
    const prediction = await getGameAnalysis(game, baseUrl);
    if (prediction) {
      // Get highest confidence pick from this game
      const maxConfidence = Math.max(
        prediction.winner?.confidence || 0,
        prediction.spread?.confidence || 0,
        prediction.total?.confidence || 0
      );
      analyzed.push({ game, prediction, confidence: maxConfidence });
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
  prediction: any,
  pickType: 'winner' | 'spread' | 'total'
): Promise<TrackedPick | null> {
  const pickData = prediction[pickType];
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
      ? `${pickData.pick} ${pickData.line > 0 ? '+' : ''}${pickData.line}`
      : `${pickData.pick} ${prediction.total.line}`,
    odds: pickType === 'winner' ? (pickData.pick === game.homeTeam ? -150 : 150) : -110,
    line: pickType !== 'winner' ? pickData.line : undefined,
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
    // Get base URL from request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Check for auth (simple secret key)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow if no secret configured (dev) or if secret matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      
      const games = await fetchGamesForSport(sport, baseUrl);
      console.log(`Found ${games.length} ${sport} games for today`);
      
      if (games.length === 0) continue;

      const bestPicks = await selectBestPicks(games, baseUrl, PICKS_PER_SPORT);
      
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
