import { NextRequest, NextResponse } from 'next/server';
import { oddsApi } from '@/lib/api/odds';
import type { SportKey, NormalizedScore } from '@/types/odds';

interface CombinedScore {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'final' | 'scheduled';
  period?: string;
  sport: string;
  startTime?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sport = searchParams.get('sport') as 'nhl' | 'nba' | 'all' | null;
  
  // If no sport specified or 'all', return combined scores from multiple sports
  if (!sport || sport === 'all') {
    try {
      const allScores: CombinedScore[] = [];
      
      // Fetch NHL and NBA scores in parallel
      const [nhlScores, nbaScores] = await Promise.allSettled([
        oddsApi.getScores('icehockey_nhl'),
        oddsApi.getScores('basketball_nba'),
      ]);
      
      // Process NHL scores
      if (nhlScores.status === 'fulfilled') {
        for (const score of nhlScores.value) {
          const normalized = oddsApi.normalizeScore(score);
          allScores.push({
            id: normalized.gameId,
            homeTeam: normalized.homeTeam,
            awayTeam: normalized.awayTeam,
            homeScore: normalized.homeScore || 0,
            awayScore: normalized.awayScore || 0,
            status: normalized.isLive ? 'live' : normalized.isCompleted ? 'final' : 'scheduled',
            period: normalized.lastUpdate ? 'LIVE' : undefined,
            sport: 'NHL',
            startTime: normalized.commenceTime?.toString(),
          });
        }
      }
      
      // Process NBA scores
      if (nbaScores.status === 'fulfilled') {
        for (const score of nbaScores.value) {
          const normalized = oddsApi.normalizeScore(score);
          allScores.push({
            id: normalized.gameId,
            homeTeam: normalized.homeTeam,
            awayTeam: normalized.awayTeam,
            homeScore: normalized.homeScore || 0,
            awayScore: normalized.awayScore || 0,
            status: normalized.isLive ? 'live' : normalized.isCompleted ? 'final' : 'scheduled',
            period: normalized.lastUpdate ? 'LIVE' : undefined,
            sport: 'NBA',
            startTime: normalized.commenceTime?.toString(),
          });
        }
      }
      
      // Sort: live games first, then by start time
      allScores.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;
        if (a.status === 'final' && b.status !== 'final') return -1;
        if (b.status === 'final' && a.status !== 'final') return 1;
        return new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime();
      });
      
      return NextResponse.json({
        scores: allScores.slice(0, 10),
        meta: {
          totalGames: allScores.length,
          liveGames: allScores.filter(s => s.status === 'live').length,
          completedGames: allScores.filter(s => s.status === 'final').length,
          fetchedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Combined scores API error:', error);
      return NextResponse.json({
        scores: [],
        meta: { error: 'Failed to fetch scores' },
      });
    }
  }
  
  // Single sport mode
  if (!['nhl', 'nba'].includes(sport)) {
    return NextResponse.json(
      { error: 'Invalid sport. Use "nhl", "nba", or "all"' },
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
