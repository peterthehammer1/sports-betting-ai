import { NextRequest, NextResponse } from 'next/server';
import { oddsApi } from '@/lib/api/odds';
import { analysisClient } from '@/lib/analysis/claude';
import { getCachedPropsAnalysis, cachePropsAnalysis } from '@/lib/cache/redis';
import type { NbaPlayerPropMarket } from '@/types/odds';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `nba-props-analysis-${eventId}`;
    const cached = await getCachedPropsAnalysis(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        meta: { ...cached.meta, fromCache: true },
      });
    }

    // Fetch player props
    const markets: NbaPlayerPropMarket[] = [
      'player_points',
      'player_rebounds',
      'player_assists',
    ];
    
    const propsData = await oddsApi.getNbaPlayerProps(eventId, markets);
    
    if (!propsData) {
      return NextResponse.json(
        { error: 'No player props found for this game' },
        { status: 404 }
      );
    }

    // Normalize props
    const pointsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_points');
    const reboundsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_rebounds');
    const assistsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_assists');

    // Analyze with Claude
    const { analysis, meta } = await analysisClient.analyzeNbaPlayerProps(
      eventId,
      propsData.home_team,
      propsData.away_team,
      propsData.commence_time,
      {
        points: pointsProps,
        rebounds: reboundsProps,
        assists: assistsProps,
      }
    );

    const response = {
      analysis,
      meta: {
        ...meta,
        fromCache: false,
      },
    };

    // Cache the response
    await cachePropsAnalysis(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('NBA Props Analysis API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze NBA player props' },
      { status: 500 }
    );
  }
}
