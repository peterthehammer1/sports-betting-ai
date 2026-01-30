import { NextRequest, NextResponse } from 'next/server';
import { oddsApi } from '@/lib/api/odds';
import type { SportKey, NormalizedScore } from '@/types/odds';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sport = searchParams.get('sport') as 'nhl' | 'nba' | null;
  
  if (!sport || !['nhl', 'nba'].includes(sport)) {
    return NextResponse.json(
      { error: 'Invalid sport. Use "nhl" or "nba"' },
      { status: 400 }
    );
  }

  const sportKey: SportKey = sport === 'nhl' ? 'icehockey_nhl' : 'basketball_nba';

  try {
    // Get scores (live and upcoming)
    const scores = await oddsApi.getScores(sportKey);
    
    // Normalize scores
    const normalizedScores: NormalizedScore[] = scores.map(score => 
      oddsApi.normalizeScore(score)
    );

    // Create a map for quick lookup
    const scoresMap: Record<string, NormalizedScore> = {};
    for (const score of normalizedScores) {
      scoresMap[score.gameId] = score;
    }

    const quota = oddsApi.getQuota();

    return NextResponse.json({
      scores: normalizedScores,
      scoresMap,
      meta: {
        sport: sport.toUpperCase(),
        count: normalizedScores.length,
        liveGames: normalizedScores.filter(s => s.isLive).length,
        completedGames: normalizedScores.filter(s => s.isCompleted).length,
        fetchedAt: new Date().toISOString(),
        quota: {
          requestsRemaining: quota.requestsRemaining,
          requestsUsed: quota.requestsUsed,
        },
      },
    });
  } catch (error) {
    console.error('Scores API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}
