/**
 * DEBUG Route: GET /api/debug/props
 * Returns raw API response to inspect the data structure
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    // First, get list of NHL events to find an eventId
    const eventsUrl = `https://api.the-odds-api.com/v4/sports/icehockey_nhl/events?apiKey=${apiKey}`;
    const eventsRes = await fetch(eventsUrl);
    const events = await eventsRes.json();
    
    return NextResponse.json({
      message: 'No eventId provided. Here are available NHL events:',
      events: events.slice(0, 5),
      usage: 'Add ?eventId=EVENT_ID to see player props for that game',
    });
  }

  // Fetch player props for the specific event
  const propsUrl = `https://api.the-odds-api.com/v4/sports/icehockey_nhl/events/${eventId}/odds?apiKey=${apiKey}&regions=us&markets=player_goal_scorer_first,player_goal_scorer_anytime&oddsFormat=decimal`;
  
  const propsRes = await fetch(propsUrl);
  const propsData = await propsRes.json();

  // Return raw response with some structure analysis
  return NextResponse.json({
    raw_response: propsData,
    analysis: {
      has_bookmakers: !!propsData?.bookmakers?.length,
      bookmaker_count: propsData?.bookmakers?.length || 0,
      first_bookmaker: propsData?.bookmakers?.[0] ? {
        key: propsData.bookmakers[0].key,
        markets_count: propsData.bookmakers[0].markets?.length || 0,
        markets: propsData.bookmakers[0].markets?.map((m: { key: string; outcomes?: Array<{ name: string; description?: string; price: number }> }) => ({
          key: m.key,
          outcomes_count: m.outcomes?.length || 0,
          sample_outcomes: m.outcomes?.slice(0, 3),
        })),
      } : null,
    },
  });
}
