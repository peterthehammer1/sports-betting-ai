/**
 * API Route: GET /api/sports
 * Lists all available sports from The Odds API
 */

import { NextResponse } from 'next/server';
import { createOddsApiClient } from '@/lib/api/odds';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.THE_ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'THE_ODDS_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const client = createOddsApiClient({ apiKey });
    const sports = await client.getSports();
    
    // Filter to show only active sports and group by category
    const activeSports = sports.filter(s => s.active);
    
    // Group by sport type
    const grouped = {
      hockey: activeSports.filter(s => s.key.includes('hockey') || s.key.includes('icehockey')),
      basketball: activeSports.filter(s => s.key.includes('basketball')),
      football: activeSports.filter(s => s.key.includes('football')),
      baseball: activeSports.filter(s => s.key.includes('baseball')),
      soccer: activeSports.filter(s => s.key.includes('soccer')),
      olympics: activeSports.filter(s => s.key.includes('olympic') || s.title.toLowerCase().includes('olympic')),
      other: activeSports.filter(s => 
        !s.key.includes('hockey') && 
        !s.key.includes('basketball') && 
        !s.key.includes('football') && 
        !s.key.includes('baseball') && 
        !s.key.includes('soccer') &&
        !s.key.includes('olympic')
      ),
    };
    
    const quota = client.getQuota();

    return NextResponse.json({
      totalSports: activeSports.length,
      grouped,
      allSports: activeSports.map(s => ({ key: s.key, title: s.title, active: s.active })),
      quota,
    });
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sports' },
      { status: 500 }
    );
  }
}
