import { NextRequest, NextResponse } from 'next/server';
import { oddsApi } from '@/lib/api/odds';
import { getCachedPlayerProps, cachePlayerProps } from '@/lib/cache/redis';
import type { NbaPlayerPropMarket, NormalizedNbaPlayerProp } from '@/types/odds';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId');
  
  if (!eventId) {
    // Return list of available NBA events
    try {
      const games = await oddsApi.getNbaOdds(['h2h']);
      return NextResponse.json({
        message: 'No eventId provided. Here are available NBA events:',
        events: games.map(g => ({
          id: g.id,
          sport_key: g.sport_key,
          sport_title: g.sport_title,
          commence_time: g.commence_time,
          home_team: g.home_team,
          away_team: g.away_team,
        })),
        usage: 'Add ?eventId=EVENT_ID to see player props for that game',
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch events' },
        { status: 500 }
      );
    }
  }

  try {
    // Check cache first
    const cacheKey = `nba-props-${eventId}`;
    const cached = await getCachedPlayerProps(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        meta: { ...cached.meta, fromCache: true },
      });
    }

    // Fetch player props for points, rebounds, assists
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

    // Normalize props for each market
    const pointsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_points');
    const reboundsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_rebounds');
    const assistsProps = oddsApi.normalizeNbaPlayerProps(propsData, 'player_assists');

    const quota = oddsApi.getQuota();

    const response = {
      gameId: propsData.id,
      homeTeam: propsData.home_team,
      awayTeam: propsData.away_team,
      commenceTime: propsData.commence_time,
      playerProps: {
        points: pointsProps,
        rebounds: reboundsProps,
        assists: assistsProps,
      },
      meta: {
        sport: 'NBA',
        fetchedAt: new Date().toISOString(),
        quota: {
          requestsRemaining: quota.requestsRemaining,
          requestsUsed: quota.requestsUsed,
        },
        fromCache: false,
      },
    };

    // Cache the response
    await cachePlayerProps(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('NBA Props API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch NBA player props' },
      { status: 500 }
    );
  }
}
