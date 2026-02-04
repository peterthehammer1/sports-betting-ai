/**
 * Redis Cache for Analysis Results
 * 
 * Uses Upstash Redis to cache Claude analysis results
 * so we don't call the API for every visitor.
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (will use env vars UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Cache TTL in seconds
const ANALYSIS_CACHE_TTL = 24 * 60 * 60; // 24 hours for analysis
const ODDS_CACHE_TTL = 15 * 60; // 15 minutes for odds - needs to be fresh!
const PROPS_CACHE_TTL = 60 * 60; // 1 hour for player props

// Cache key prefixes
const KEYS = {
  GAME_ANALYSIS: 'analysis:game:',
  BATCH_ANALYSIS: 'analysis:batch:',
  PROPS_ANALYSIS: 'analysis:props:',
  ODDS: 'odds:',
  PLAYER_PROPS: 'props:',
  PICKS: 'picks:',
  PICKS_LIST: 'picks:list',
  ODDS_HISTORY: 'odds:history:',
  PERFORMANCE_STATS: 'stats:performance',
};

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Get cached odds for a sport
 */
export async function getCachedOdds(sport: string) {
  if (!isRedisConfigured()) return null;
  
  try {
    const key = `${KEYS.ODDS}${sport}`;
    const cached = await redis.get(key);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache odds for a sport
 */
export async function cacheOdds(sport: string, data: unknown) {
  if (!isRedisConfigured()) return;
  
  try {
    const key = `${KEYS.ODDS}${sport}`;
    await redis.set(key, JSON.stringify(data), { ex: ODDS_CACHE_TTL });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Clear cached odds for all sports (for forcing fresh data)
 */
export async function clearOddsCache() {
  if (!isRedisConfigured()) return { cleared: 0 };
  
  try {
    const sports = ['icehockey_nhl', 'basketball_nba', 'americanfootball_nfl', 'baseball_mlb', 'soccer_epl'];
    let cleared = 0;
    
    for (const sport of sports) {
      const key = `${KEYS.ODDS}${sport}`;
      const deleted = await redis.del(key);
      if (deleted) cleared++;
    }
    
    console.log(`Cleared ${cleared} odds cache entries`);
    return { cleared };
  } catch (error) {
    console.error('Redis clear cache error:', error);
    return { cleared: 0, error: String(error) };
  }
}

/**
 * Get cached player props for a game
 */
export async function getCachedPlayerProps(gameId: string) {
  if (!isRedisConfigured()) return null;
  
  try {
    const key = `${KEYS.PLAYER_PROPS}${gameId}`;
    const cached = await redis.get(key);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache player props for a game
 */
export async function cachePlayerProps(gameId: string, data: unknown) {
  if (!isRedisConfigured()) return;
  
  try {
    const key = `${KEYS.PLAYER_PROPS}${gameId}`;
    await redis.set(key, JSON.stringify(data), { ex: PROPS_CACHE_TTL });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Get cached game analysis
 */
export async function getCachedGameAnalysis(gameId: string, sport: string) {
  if (!isRedisConfigured()) return null;
  
  try {
    const key = `${KEYS.GAME_ANALYSIS}${sport}:${gameId}`;
    const cached = await redis.get(key);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache game analysis
 */
export async function cacheGameAnalysis(gameId: string, sport: string, data: unknown) {
  if (!isRedisConfigured()) return;
  
  try {
    const key = `${KEYS.GAME_ANALYSIS}${sport}:${gameId}`;
    await redis.set(key, JSON.stringify(data), { ex: ANALYSIS_CACHE_TTL });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Get cached batch analysis for a sport
 */
export async function getCachedBatchAnalysis(sport: string) {
  if (!isRedisConfigured()) return null;
  
  try {
    const key = `${KEYS.BATCH_ANALYSIS}${sport}`;
    const cached = await redis.get(key);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache batch analysis
 */
export async function cacheBatchAnalysis(sport: string, data: unknown) {
  if (!isRedisConfigured()) return;
  
  try {
    const key = `${KEYS.BATCH_ANALYSIS}${sport}`;
    await redis.set(key, JSON.stringify(data), { ex: ANALYSIS_CACHE_TTL });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Get cached player props analysis
 */
export async function getCachedPropsAnalysis(gameId: string) {
  if (!isRedisConfigured()) return null;
  
  try {
    const key = `${KEYS.PROPS_ANALYSIS}${gameId}`;
    const cached = await redis.get(key);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache player props analysis
 */
export async function cachePropsAnalysis(gameId: string, data: unknown) {
  if (!isRedisConfigured()) return;
  
  try {
    const key = `${KEYS.PROPS_ANALYSIS}${gameId}`;
    await redis.set(key, JSON.stringify(data), { ex: ANALYSIS_CACHE_TTL });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Clear all cached analysis (useful for manual refresh)
 */
export async function clearAllCache() {
  if (!isRedisConfigured()) return;
  
  try {
    // Get all keys with our prefixes and delete them
    const gameKeys = await redis.keys(`${KEYS.GAME_ANALYSIS}*`);
    const batchKeys = await redis.keys(`${KEYS.BATCH_ANALYSIS}*`);
    const propsKeys = await redis.keys(`${KEYS.PROPS_ANALYSIS}*`);
    
    const allKeys = [...gameKeys, ...batchKeys, ...propsKeys];
    
    if (allKeys.length > 0) {
      await redis.del(...allKeys);
    }
    
    return allKeys.length;
  } catch (error) {
    console.error('Redis clear error:', error);
    return 0;
  }
}

// ============================================
// PICK TRACKING FUNCTIONS
// ============================================

import type { TrackedPick, PerformanceStats, OddsMovement } from '@/types/tracker';

/**
 * Save a new pick to tracking
 */
export async function savePick(pick: TrackedPick): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  
  try {
    // Save individual pick
    const pickKey = `${KEYS.PICKS}${pick.id}`;
    await redis.set(pickKey, JSON.stringify(pick));
    
    // Add to picks list (sorted by date, newest first)
    await redis.lpush(KEYS.PICKS_LIST, pick.id);
    
    // Keep only last 500 picks in list
    await redis.ltrim(KEYS.PICKS_LIST, 0, 499);
    
    return true;
  } catch (error) {
    console.error('Redis save pick error:', error);
    return false;
  }
}

/**
 * Get a single pick by ID
 */
export async function getPick(pickId: string): Promise<TrackedPick | null> {
  if (!isRedisConfigured()) return null;
  
  try {
    const pickKey = `${KEYS.PICKS}${pickId}`;
    const pick = await redis.get(pickKey);
    return pick as TrackedPick | null;
  } catch (error) {
    console.error('Redis get pick error:', error);
    return null;
  }
}

/**
 * Update pick status (after game settles)
 */
export async function updatePickStatus(
  pickId: string, 
  status: TrackedPick['status'],
  result?: TrackedPick['result']
): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  
  try {
    const pick = await getPick(pickId);
    if (!pick) return false;
    
    pick.status = status;
    if (result) {
      pick.result = { ...pick.result, ...result, settledAt: new Date().toISOString() };
    }
    
    const pickKey = `${KEYS.PICKS}${pickId}`;
    await redis.set(pickKey, JSON.stringify(pick));
    
    // Invalidate cached stats
    await redis.del(KEYS.PERFORMANCE_STATS);
    
    return true;
  } catch (error) {
    console.error('Redis update pick error:', error);
    return false;
  }
}

/**
 * Get all picks (with pagination)
 */
export async function getPicks(limit = 50, offset = 0): Promise<TrackedPick[]> {
  if (!isRedisConfigured()) return [];
  
  try {
    // Get pick IDs from list
    const pickIds = await redis.lrange(KEYS.PICKS_LIST, offset, offset + limit - 1);
    
    if (pickIds.length === 0) return [];
    
    // Get all picks
    const picks: TrackedPick[] = [];
    for (const id of pickIds) {
      const pick = await getPick(id as string);
      if (pick) picks.push(pick);
    }
    
    return picks;
  } catch (error) {
    console.error('Redis get picks error:', error);
    return [];
  }
}

/**
 * Get pending picks only
 */
export async function getPendingPicks(): Promise<TrackedPick[]> {
  const allPicks = await getPicks(100); // Get recent 100
  return allPicks.filter(p => p.status === 'pending');
}

/**
 * Calculate performance stats from all picks
 */
export async function calculatePerformanceStats(): Promise<PerformanceStats | null> {
  if (!isRedisConfigured()) return null;
  
  try {
    // Check cache first
    const cached = await redis.get(KEYS.PERFORMANCE_STATS);
    if (cached) return cached as PerformanceStats;
    
    // Get all picks
    const allPicks = await getPicks(500);
    
    if (allPicks.length === 0) {
      return getEmptyStats();
    }
    
    const stats = computeStats(allPicks);
    
    // Cache for 5 minutes
    await redis.set(KEYS.PERFORMANCE_STATS, JSON.stringify(stats), { ex: 300 });
    
    return stats;
  } catch (error) {
    console.error('Redis calc stats error:', error);
    return getEmptyStats();
  }
}

function getEmptyStats(): PerformanceStats {
  return {
    totalPicks: 0,
    pendingPicks: 0,
    settledPicks: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    winRate: 0,
    unitsWagered: 0,
    unitsWon: 0,
    unitsLost: 0,
    netUnits: 0,
    roi: 0,
    byBetType: {
      moneyline: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
      spread: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
      total: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
      player_prop: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
    },
    bySport: {
      NBA: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
      NHL: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
      NFL: { picks: 0, wins: 0, losses: 0, winRate: 0, netUnits: 0 },
    },
    byConfidence: {
      high: { picks: 0, wins: 0, winRate: 0 },
      medium: { picks: 0, wins: 0, winRate: 0 },
      low: { picks: 0, wins: 0, winRate: 0 },
    },
    valueBets: { picks: 0, wins: 0, winRate: 0, netUnits: 0 },
    currentStreak: { type: 'none', count: 0 },
    longestWinStreak: 0,
    longestLossStreak: 0,
    last7Days: { picks: 0, wins: 0, netUnits: 0 },
    last30Days: { picks: 0, wins: 0, netUnits: 0 },
  };
}

function computeStats(picks: TrackedPick[]): PerformanceStats {
  const stats = getEmptyStats();
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  let currentStreak = { type: 'none' as 'W' | 'L' | 'none', count: 0 };
  let longestWin = 0, longestLoss = 0, currentWin = 0, currentLoss = 0;
  
  // Sort by date for streak calculation
  const sortedPicks = [...picks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  for (const pick of sortedPicks) {
    stats.totalPicks++;
    
    if (pick.status === 'pending') {
      stats.pendingPicks++;
      continue;
    }
    
    stats.settledPicks++;
    stats.unitsWagered += pick.units;
    
    // Calculate win/loss
    const isWin = pick.status === 'won';
    const isLoss = pick.status === 'lost';
    const isPush = pick.status === 'push';
    
    if (isWin) {
      stats.wins++;
      const profit = calculateProfit(pick.odds, pick.units);
      stats.unitsWon += profit;
      stats.netUnits += profit;
      currentWin++;
      currentLoss = 0;
      longestWin = Math.max(longestWin, currentWin);
    } else if (isLoss) {
      stats.losses++;
      stats.unitsLost += pick.units;
      stats.netUnits -= pick.units;
      currentLoss++;
      currentWin = 0;
      longestLoss = Math.max(longestLoss, currentLoss);
    } else if (isPush) {
      stats.pushes++;
    }
    
    // Current streak (from most recent)
    if (currentStreak.type === 'none' && (isWin || isLoss)) {
      currentStreak = { type: isWin ? 'W' : 'L', count: 1 };
    } else if ((currentStreak.type === 'W' && isWin) || (currentStreak.type === 'L' && isLoss)) {
      currentStreak.count++;
    }
    
    // By bet type
    const bt = stats.byBetType[pick.betType];
    bt.picks++;
    if (isWin) {
      bt.wins++;
      bt.netUnits += calculateProfit(pick.odds, pick.units);
    } else if (isLoss) {
      bt.losses++;
      bt.netUnits -= pick.units;
    }
    
    // By sport
    const sp = stats.bySport[pick.sport];
    sp.picks++;
    if (isWin) {
      sp.wins++;
      sp.netUnits += calculateProfit(pick.odds, pick.units);
    } else if (isLoss) {
      sp.losses++;
      sp.netUnits -= pick.units;
    }
    
    // By confidence
    const confLevel = pick.confidence >= 70 ? 'high' : pick.confidence >= 60 ? 'medium' : 'low';
    stats.byConfidence[confLevel].picks++;
    if (isWin) stats.byConfidence[confLevel].wins++;
    
    // Value bets
    if (pick.isValueBet) {
      stats.valueBets.picks++;
      if (isWin) {
        stats.valueBets.wins++;
        stats.valueBets.netUnits += calculateProfit(pick.odds, pick.units);
      } else if (isLoss) {
        stats.valueBets.netUnits -= pick.units;
      }
    }
    
    // Time-based
    const pickDate = new Date(pick.createdAt);
    if (pickDate >= sevenDaysAgo) {
      stats.last7Days.picks++;
      if (isWin) {
        stats.last7Days.wins++;
        stats.last7Days.netUnits += calculateProfit(pick.odds, pick.units);
      } else if (isLoss) {
        stats.last7Days.netUnits -= pick.units;
      }
    }
    if (pickDate >= thirtyDaysAgo) {
      stats.last30Days.picks++;
      if (isWin) {
        stats.last30Days.wins++;
        stats.last30Days.netUnits += calculateProfit(pick.odds, pick.units);
      } else if (isLoss) {
        stats.last30Days.netUnits -= pick.units;
      }
    }
  }
  
  // Calculate percentages
  const settled = stats.wins + stats.losses;
  stats.winRate = settled > 0 ? (stats.wins / settled) * 100 : 0;
  stats.roi = stats.unitsWagered > 0 ? (stats.netUnits / stats.unitsWagered) * 100 : 0;
  
  // Bet type win rates
  for (const bt of Object.values(stats.byBetType)) {
    const s = bt.wins + bt.losses;
    bt.winRate = s > 0 ? (bt.wins / s) * 100 : 0;
  }
  
  // Sport win rates
  for (const sp of Object.values(stats.bySport)) {
    const s = sp.wins + sp.losses;
    sp.winRate = s > 0 ? (sp.wins / s) * 100 : 0;
  }
  
  // Confidence win rates
  for (const conf of Object.values(stats.byConfidence)) {
    conf.winRate = conf.picks > 0 ? (conf.wins / conf.picks) * 100 : 0;
  }
  
  // Value bets win rate
  stats.valueBets.winRate = stats.valueBets.picks > 0 
    ? (stats.valueBets.wins / stats.valueBets.picks) * 100 : 0;
  
  stats.currentStreak = currentStreak;
  stats.longestWinStreak = longestWin;
  stats.longestLossStreak = longestLoss;
  
  return stats;
}

function calculateProfit(americanOdds: number, units: number): number {
  if (americanOdds > 0) {
    return (americanOdds / 100) * units;
  } else {
    return (100 / Math.abs(americanOdds)) * units;
  }
}

// ============================================
// ODDS HISTORY FUNCTIONS
// ============================================

/**
 * Save odds snapshot for a game
 */
export async function saveOddsSnapshot(
  gameId: string,
  sport: string,
  snapshot: OddsMovement['snapshots'][0]
): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  
  try {
    const key = `${KEYS.ODDS_HISTORY}${sport}:${gameId}`;
    
    // Get existing history
    const existing = await redis.get(key) as OddsMovement['snapshots'] | null;
    const snapshots = existing || [];
    
    // Add new snapshot
    snapshots.push(snapshot);
    
    // Keep last 48 snapshots (24 hours of hourly data)
    if (snapshots.length > 48) {
      snapshots.shift();
    }
    
    await redis.set(key, JSON.stringify(snapshots), { ex: 48 * 60 * 60 }); // 48 hour TTL
    
    return true;
  } catch (error) {
    console.error('Redis save odds snapshot error:', error);
    return false;
  }
}

/**
 * Get odds history for a game
 */
export async function getOddsHistory(gameId: string, sport: string): Promise<OddsMovement['snapshots']> {
  if (!isRedisConfigured()) return [];
  
  try {
    const key = `${KEYS.ODDS_HISTORY}${sport}:${gameId}`;
    const snapshots = await redis.get(key) as OddsMovement['snapshots'] | null;
    return snapshots || [];
  } catch (error) {
    console.error('Redis get odds history error:', error);
    return [];
  }
}
