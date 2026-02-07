/**
 * Shared helpers for API routes
 * Consolidates common patterns to reduce duplication
 */

import { NextResponse } from 'next/server';

// Common constants
export const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Sport key mappings
export const SPORT_KEYS: Record<string, string> = {
  NBA: 'basketball_nba',
  NHL: 'icehockey_nhl',
  NFL: 'americanfootball_nfl',
  MLB: 'baseball_mlb',
  EPL: 'soccer_epl',
  MLS: 'soccer_usa_mls',
  LALIGA: 'soccer_spain_la_liga',
  BUNDESLIGA: 'soccer_germany_bundesliga',
  SERIEA: 'soccer_italy_serie_a',
  LIGUE1: 'soccer_france_ligue_one',
  UCL: 'soccer_uefa_champs_league',
};

// Parse cached data consistently
export function parseCachedData<T>(cached: unknown): T | null {
  if (!cached) return null;
  try {
    return typeof cached === 'string' ? JSON.parse(cached) : cached as T;
  } catch {
    return null;
  }
}

// Standard error responses
export function apiKeyMissingError() {
  return NextResponse.json(
    { error: 'THE_ODDS_API_KEY is not configured' },
    { status: 500 }
  );
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function notFoundError(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequestError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Standard cache response wrapper
export function cachedResponse<T extends object>(data: T, cacheEnabled = true) {
  return NextResponse.json({
    ...data,
    fromCache: true,
    cacheEnabled,
  });
}

// Standard fresh response wrapper
export function freshResponse<T extends object>(data: T, cacheEnabled = true) {
  return NextResponse.json({
    ...data,
    fromCache: false,
    cacheEnabled,
  });
}

// Check if forceFresh is requested
export function shouldBypassCache(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  return searchParams.get('fresh') === 'true';
}

// Standard meta object builder
export function buildMeta(options: {
  sport: string;
  gamesCount: number;
  totalGames?: number;
  remainingQuota?: number;
  fetchedAt?: Date;
}) {
  return {
    sport: options.sport,
    gamesCount: options.gamesCount,
    totalGames: options.totalGames ?? options.gamesCount,
    remainingQuota: options.remainingQuota,
    fetchedAt: (options.fetchedAt ?? new Date()).toISOString(),
  };
}

// Handle API errors with fallback to cache
export async function handleApiErrorWithCache<T>(
  error: unknown,
  getCachedFn: () => Promise<T | null>,
  sport: string
): Promise<NextResponse> {
  console.error(`Error fetching ${sport} odds:`, error);
  
  const cached = await getCachedFn();
  if (cached) {
    const cachedData = parseCachedData<object>(cached);
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheEnabled: true,
        warning: 'API error occurred, showing cached data',
      });
    }
  }
  
  return apiError(
    error instanceof Error ? error.message : 'Failed to fetch odds'
  );
}

// Extract quota from API response headers
export function extractQuotaFromHeaders(headers: Headers): number | undefined {
  const remaining = headers.get('x-requests-remaining');
  return remaining ? parseInt(remaining, 10) : undefined;
}
