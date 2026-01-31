/**
 * API Route: GET /api/injuries
 * Fetches injury data from ESPN with Redis caching
 * 
 * Query params:
 * - sport: 'NBA' | 'NHL' | 'NFL' (required)
 * - team: Optional team name to filter injuries
 */

import { NextResponse } from 'next/server';
import { fetchInjuries, getTeamInjuries } from '@/lib/api/injuries';
import { isRedisConfigured } from '@/lib/cache/redis';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Cache TTL: 30 minutes for injuries (they don't change that often)
const INJURY_CACHE_TTL = 30 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sportRaw = searchParams.get('sport')?.toUpperCase();
  const teamFilter = searchParams.get('team');

  // MLB and EPL injury data not fully supported yet - return empty
  if (sportRaw === 'MLB' || sportRaw === 'EPL') {
    return NextResponse.json({
      sport: sportRaw,
      teams: [],
      totalInjuries: 0,
      keyPlayersOut: 0,
      message: `${sportRaw} injury data coming soon`,
    });
  }
  
  const sport = sportRaw as 'NBA' | 'NHL' | 'NFL' | null;

  if (!sport || !['NBA', 'NHL', 'NFL'].includes(sport)) {
    return NextResponse.json(
      { error: 'Valid sport parameter required (NBA, NHL, NFL, MLB, or EPL)' },
      { status: 400 }
    );
  }

  const cacheKey = `injuries:${sport}`;

  try {
    // Check cache first
    if (isRedisConfigured()) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`Returning cached ${sport} injuries`);
        const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        
        // If team filter, return filtered data
        if (teamFilter && cachedData.teams) {
          const teamInjuries = getTeamInjuries(cachedData, teamFilter);
          return NextResponse.json({
            sport,
            team: teamFilter,
            injuries: teamInjuries?.injuries || [],
            keyPlayersOut: teamInjuries?.keyPlayersOut || 0,
            fromCache: true,
            lastUpdated: cachedData.lastUpdated,
          });
        }
        
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
        });
      }
    }

    // Fetch fresh data from ESPN
    console.log(`Fetching fresh ${sport} injuries from ESPN`);
    const injuryData = await fetchInjuries(sport);

    // Cache the result
    if (isRedisConfigured()) {
      await redis.set(cacheKey, JSON.stringify(injuryData), { ex: INJURY_CACHE_TTL });
      console.log(`Cached ${sport} injuries`);
    }

    // If team filter, return filtered data
    if (teamFilter) {
      const teamInjuries = getTeamInjuries(injuryData, teamFilter);
      return NextResponse.json({
        sport,
        team: teamFilter,
        injuries: teamInjuries?.injuries || [],
        keyPlayersOut: teamInjuries?.keyPlayersOut || 0,
        fromCache: false,
        lastUpdated: injuryData.lastUpdated,
      });
    }

    return NextResponse.json({
      ...injuryData,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error(`Error in injuries API for ${sport}:`, error);

    // Try to return cached data on error
    if (isRedisConfigured()) {
      const fallbackCached = await redis.get(cacheKey);
      if (fallbackCached) {
        console.log(`API error, returning cached ${sport} injuries`);
        const cachedData = typeof fallbackCached === 'string' ? JSON.parse(fallbackCached) : fallbackCached;
        return NextResponse.json({
          ...cachedData,
          fromCache: true,
          message: 'Returning cached data due to API error',
        });
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch injuries' },
      { status: 500 }
    );
  }
}
