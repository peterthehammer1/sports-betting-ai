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

// Cache TTL in seconds (6 hours - odds don't change that fast)
const CACHE_TTL = 6 * 60 * 60;

// Cache key prefixes
const KEYS = {
  GAME_ANALYSIS: 'analysis:game:',
  BATCH_ANALYSIS: 'analysis:batch:',
  PROPS_ANALYSIS: 'analysis:props:',
};

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
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
    await redis.set(key, JSON.stringify(data), { ex: CACHE_TTL });
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
    await redis.set(key, JSON.stringify(data), { ex: CACHE_TTL });
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
    await redis.set(key, JSON.stringify(data), { ex: CACHE_TTL });
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
