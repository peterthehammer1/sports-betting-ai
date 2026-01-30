/**
 * API Route: GET /api/odds/nfl/props
 * Fetches NFL (Super Bowl) player props from The Odds API
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// All available NFL player prop markets
const NFL_PROP_MARKETS = [
  'player_pass_tds',
  'player_pass_yds',
  'player_pass_completions',
  'player_pass_attempts',
  'player_pass_interceptions',
  'player_rush_yds',
  'player_rush_attempts',
  'player_receptions',
  'player_reception_yds',
  'player_anytime_td',
  'player_first_td',
  'player_last_td',
  'player_kicking_points',
];

export async function GET(request: Request) {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  try {
    const client = createOddsApiClient({ apiKey });

    // If no eventId provided, return available NFL events
    if (!eventId) {
      const games = await client.getNflOdds(['h2h']);
      return NextResponse.json({
        events: games.map(g => ({
          id: g.id,
          homeTeam: g.home_team,
          awayTeam: g.away_team,
          commenceTime: g.commence_time,
        })),
        message: 'Provide eventId parameter to get player props',
      });
    }

    // Fetch player props for the specified event
    const propsData = await client.getNflPlayerProps(eventId, NFL_PROP_MARKETS);
    
    if (!propsData) {
      return NextResponse.json({
        error: 'Player props not available for this event',
        eventId,
      }, { status: 404 });
    }

    // Organize props by market type
    const propsByMarket: Record<string, Array<{
      playerName: string;
      line?: number;
      name?: string;
      odds: Array<{
        bookmaker: string;
        americanOdds: number;
        price: number;
      }>;
    }>> = {};

    for (const bookmaker of propsData.bookmakers) {
      for (const market of bookmaker.markets) {
        if (!propsByMarket[market.key]) {
          propsByMarket[market.key] = [];
        }

        for (const outcome of market.outcomes) {
          const playerName = outcome.description || outcome.name;
          const existingPlayer = propsByMarket[market.key].find(
            p => p.playerName === playerName && p.line === outcome.point
          );

          const oddsEntry = {
            bookmaker: bookmaker.title,
            americanOdds: outcome.price >= 2 
              ? Math.round((outcome.price - 1) * 100)
              : Math.round(-100 / (outcome.price - 1)),
            price: outcome.price,
          };

          if (existingPlayer) {
            existingPlayer.odds.push(oddsEntry);
          } else {
            propsByMarket[market.key].push({
              playerName,
              line: outcome.point,
              name: outcome.name,
              odds: [oddsEntry],
            });
          }
        }
      }
    }

    return NextResponse.json({
      eventId,
      homeTeam: propsData.home_team,
      awayTeam: propsData.away_team,
      commenceTime: propsData.commence_time,
      propsByMarket,
      availableMarkets: Object.keys(propsByMarket),
      quota: client.getQuota(),
    });
  } catch (error) {
    console.error('Error fetching NFL props:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch props' },
      { status: 500 }
    );
  }
}
