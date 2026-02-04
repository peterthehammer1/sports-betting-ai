/**
 * API Route: POST /api/picks/settle
 * Automatically settles pending picks by checking game results
 * 
 * Called by:
 * 1. Vercel cron job (every 2 hours)
 * 2. Manual trigger
 */

import { NextResponse } from 'next/server';
import { getPendingPicks, updatePickStatus, isRedisConfigured } from '@/lib/cache/redis';
import type { TrackedPick, PickStatus } from '@/types/tracker';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GameScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  completed: boolean;
}

/**
 * Fetch scores for completed games
 */
async function fetchScores(sport: string, baseUrl: string): Promise<Record<string, GameScore>> {
  try {
    const sportKey = sport === 'NHL' ? 'icehockey_nhl' 
                   : sport === 'NBA' ? 'basketball_nba'
                   : 'americanfootball_nfl';
    
    const res = await fetch(`${baseUrl}/api/scores?sport=${sportKey}&daysFrom=3`);
    if (!res.ok) return {};
    
    const data = await res.json();
    const scores: Record<string, GameScore> = {};
    
    for (const game of data.scores || []) {
      if (game.completed) {
        scores[game.id] = {
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          completed: true,
        };
      }
    }
    
    return scores;
  } catch (error) {
    console.error(`Failed to fetch ${sport} scores:`, error);
    return {};
  }
}

/**
 * Determine if a pick won based on the final score
 */
function evaluatePick(pick: TrackedPick, score: GameScore): PickStatus {
  const { homeScore, awayScore, homeTeam } = score;
  const totalPoints = homeScore + awayScore;
  const homeWon = homeScore > awayScore;
  const margin = homeScore - awayScore;

  switch (pick.betType) {
    case 'moneyline': {
      // Check if picked team won
      const pickedHome = pick.pick.includes(homeTeam);
      if (pickedHome) {
        return homeWon ? 'won' : 'lost';
      } else {
        return !homeWon ? 'won' : 'lost';
      }
    }

    case 'spread': {
      if (!pick.line) return 'void';
      
      // Determine which team was picked and their spread
      const pickedHome = pick.pick.includes(homeTeam);
      const adjustedMargin = pickedHome ? margin + pick.line : -margin + Math.abs(pick.line);
      
      if (adjustedMargin === 0) return 'push';
      return adjustedMargin > 0 ? 'won' : 'lost';
    }

    case 'total': {
      if (!pick.line) return 'void';
      
      const isOver = pick.pick.toUpperCase().includes('OVER');
      
      if (totalPoints === pick.line) return 'push';
      
      if (isOver) {
        return totalPoints > pick.line ? 'won' : 'lost';
      } else {
        return totalPoints < pick.line ? 'won' : 'lost';
      }
    }

    case 'player_prop': {
      // Player props need manual settlement or external data source
      return 'pending';
    }

    default:
      return 'void';
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Check for auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isRedisConfigured()) {
      return NextResponse.json({ 
        error: 'Redis not configured'
      }, { status: 500 });
    }

    const pendingPicks = await getPendingPicks();
    
    if (pendingPicks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending picks to settle',
        settled: 0,
      });
    }

    // Group picks by sport
    const picksBySport: Record<string, TrackedPick[]> = {};
    for (const pick of pendingPicks) {
      if (!picksBySport[pick.sport]) {
        picksBySport[pick.sport] = [];
      }
      picksBySport[pick.sport].push(pick);
    }

    const results: Array<{ pickId: string; pick: string; status: PickStatus; score?: string }> = [];

    // Process each sport
    for (const [sport, picks] of Object.entries(picksBySport)) {
      const scores = await fetchScores(sport, baseUrl);
      
      for (const pick of picks) {
        const score = scores[pick.gameId];
        
        if (!score) {
          // Game not completed yet
          continue;
        }

        const status = evaluatePick(pick, score);
        
        if (status !== 'pending') {
          const updated = await updatePickStatus(pick.id, status, {
            actualScore: { home: score.homeScore, away: score.awayScore },
            settledAt: new Date().toISOString(),
          });

          if (updated) {
            results.push({
              pickId: pick.id,
              pick: pick.pick,
              status,
              score: `${score.homeTeam} ${score.homeScore} - ${score.awayTeam} ${score.awayScore}`,
            });
            console.log(`Settled pick ${pick.id}: ${pick.pick} -> ${status}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Settled ${results.length} picks`,
      settled: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Settle picks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to settle picks' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check pending picks that need settling
 */
export async function GET() {
  try {
    if (!isRedisConfigured()) {
      return NextResponse.json({ pending: 0 });
    }

    const pendingPicks = await getPendingPicks();
    
    // Filter to picks where game time has passed
    const now = new Date();
    const needsSettlement = pendingPicks.filter(p => 
      new Date(p.gameTime) < now
    );

    return NextResponse.json({
      totalPending: pendingPicks.length,
      needsSettlement: needsSettlement.length,
      picks: needsSettlement.map(p => ({
        id: p.id,
        pick: p.pick,
        sport: p.sport,
        gameTime: p.gameTime,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check pending' }, { status: 500 });
  }
}
