import { NextResponse } from 'next/server';
import { 
  savePick, 
  getPicks, 
  getPendingPicks,
  calculatePerformanceStats,
  isRedisConfigured 
} from '@/lib/cache/redis';
import type { TrackedPick, SavePickRequest } from '@/types/tracker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tracker - Get performance stats and recent picks
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'dashboard';
  
  try {
    if (!isRedisConfigured()) {
      // Return demo data if Redis not configured
      return NextResponse.json({
        stats: getDemoStats(),
        recentPicks: getDemoPicks(),
        pendingPicks: [],
        fromDemo: true,
      });
    }
    
    if (type === 'stats') {
      const stats = await calculatePerformanceStats();
      return NextResponse.json({ stats });
    }
    
    if (type === 'pending') {
      const pendingPicks = await getPendingPicks();
      return NextResponse.json({ pendingPicks });
    }
    
    // Default: return full dashboard data
    const [stats, recentPicks, pendingPicks] = await Promise.all([
      calculatePerformanceStats(),
      getPicks(20),
      getPendingPicks(),
    ]);
    
    return NextResponse.json({
      stats,
      recentPicks,
      pendingPicks,
      fromDemo: false,
    });
  } catch (error) {
    console.error('Tracker GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracker data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tracker - Save a new pick
 */
export async function POST(request: Request) {
  try {
    const body: SavePickRequest = await request.json();
    
    // Generate pick ID
    const pickId = `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pick: TrackedPick = {
      id: pickId,
      createdAt: new Date().toISOString(),
      gameId: body.gameId,
      sport: body.sport,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      gameTime: body.gameTime,
      betType: body.betType,
      pick: body.pick,
      odds: body.odds,
      line: body.line,
      confidence: body.confidence,
      reasoning: body.reasoning,
      edge: body.edge,
      isValueBet: body.isValueBet,
      status: 'pending',
      units: 1,
    };
    
    if (!isRedisConfigured()) {
      // Still return success for demo
      return NextResponse.json({ 
        success: true, 
        pick,
        message: 'Pick saved (demo mode - not persisted)'
      });
    }
    
    const success = await savePick(pick);
    
    if (success) {
      return NextResponse.json({ success: true, pick });
    } else {
      return NextResponse.json(
        { error: 'Failed to save pick' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Tracker POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save pick' },
      { status: 500 }
    );
  }
}

// Demo data for when Redis is not configured
function getDemoStats() {
  return {
    totalPicks: 127,
    pendingPicks: 8,
    settledPicks: 119,
    wins: 68,
    losses: 49,
    pushes: 2,
    winRate: 58.1,
    unitsWagered: 119,
    unitsWon: 62.4,
    unitsLost: 49,
    netUnits: 13.4,
    roi: 11.3,
    byBetType: {
      moneyline: { picks: 32, wins: 19, losses: 13, winRate: 59.4, netUnits: 4.2 },
      spread: { picks: 45, wins: 26, losses: 18, winRate: 59.1, netUnits: 5.8 },
      total: { picks: 28, wins: 15, losses: 12, winRate: 55.6, netUnits: 2.1 },
      player_prop: { picks: 14, wins: 8, losses: 6, winRate: 57.1, netUnits: 1.3 },
    },
    bySport: {
      NBA: { picks: 52, wins: 31, losses: 20, winRate: 60.8, netUnits: 7.2 },
      NHL: { picks: 48, wins: 27, losses: 20, winRate: 57.4, netUnits: 4.8 },
      NFL: { picks: 19, wins: 10, losses: 9, winRate: 52.6, netUnits: 1.4 },
    },
    byConfidence: {
      high: { picks: 34, wins: 23, winRate: 67.6 },
      medium: { picks: 58, wins: 32, winRate: 55.2 },
      low: { picks: 27, wins: 13, winRate: 48.1 },
    },
    valueBets: { picks: 41, wins: 26, winRate: 63.4, netUnits: 8.2 },
    currentStreak: { type: 'W', count: 3 },
    longestWinStreak: 7,
    longestLossStreak: 4,
    last7Days: { picks: 18, wins: 11, netUnits: 3.2 },
    last30Days: { picks: 67, wins: 39, netUnits: 8.1 },
  };
}

function getDemoPicks(): TrackedPick[] {
  const now = new Date();
  return [
    {
      id: 'demo_1',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      gameId: 'demo_game_1',
      sport: 'NBA',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Boston Celtics',
      gameTime: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      betType: 'spread',
      pick: 'Lakers -3.5',
      odds: -110,
      line: -3.5,
      confidence: 72,
      reasoning: 'Lakers playing at home with full roster. Celtics on 2nd night of back-to-back.',
      edge: 6.2,
      isValueBet: true,
      status: 'pending',
      units: 1,
    },
    {
      id: 'demo_2',
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      gameId: 'demo_game_2',
      sport: 'NHL',
      homeTeam: 'Toronto Maple Leafs',
      awayTeam: 'Montreal Canadiens',
      gameTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      betType: 'moneyline',
      pick: 'Maple Leafs ML',
      odds: -145,
      confidence: 68,
      reasoning: 'Leafs dominant at home vs division rivals. Matthews averaging 1.2 goals/game at home.',
      isValueBet: false,
      status: 'won',
      units: 1,
      result: {
        actualScore: { home: 4, away: 2 },
        settledAt: new Date(now.getTime() - 21 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 'demo_3',
      createdAt: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(),
      gameId: 'demo_game_3',
      sport: 'NBA',
      homeTeam: 'Golden State Warriors',
      awayTeam: 'Phoenix Suns',
      gameTime: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      betType: 'total',
      pick: 'Over 228.5',
      odds: -108,
      line: 228.5,
      confidence: 65,
      reasoning: 'Both teams playing at fast pace. Combined averaging 235 points in last 5 meetings.',
      edge: 4.1,
      isValueBet: true,
      status: 'won',
      units: 1,
      result: {
        actualScore: { home: 118, away: 115 },
        settledAt: new Date(now.getTime() - 45 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 'demo_4',
      createdAt: new Date(now.getTime() - 74 * 60 * 60 * 1000).toISOString(),
      gameId: 'demo_game_4',
      sport: 'NHL',
      homeTeam: 'Edmonton Oilers',
      awayTeam: 'Calgary Flames',
      gameTime: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      betType: 'spread',
      pick: 'Oilers -1.5',
      odds: +145,
      line: -1.5,
      confidence: 58,
      reasoning: 'Battle of Alberta, Oilers at home. McDavid on 5-game point streak.',
      isValueBet: false,
      status: 'lost',
      units: 1,
      result: {
        actualScore: { home: 3, away: 3 },
        settledAt: new Date(now.getTime() - 69 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 'demo_5',
      createdAt: new Date(now.getTime() - 98 * 60 * 60 * 1000).toISOString(),
      gameId: 'demo_game_5',
      sport: 'NBA',
      homeTeam: 'Denver Nuggets',
      awayTeam: 'Miami Heat',
      gameTime: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
      betType: 'moneyline',
      pick: 'Nuggets ML',
      odds: -180,
      confidence: 74,
      reasoning: 'Nuggets unbeaten at home this month. Jokic averaging triple-double vs Heat.',
      isValueBet: false,
      status: 'won',
      units: 1,
      result: {
        actualScore: { home: 112, away: 98 },
        settledAt: new Date(now.getTime() - 93 * 60 * 60 * 1000).toISOString(),
      },
    },
  ];
}
