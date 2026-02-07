'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NormalizedScore } from '@/types/odds';

interface ScoresData {
  scores: Record<string, NormalizedScore>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache to share data between components
let cachedScores: Record<string, NormalizedScore> = {};
let lastFetchTime: number = 0;
let fetchPromise: Promise<void> | null = null;
const CACHE_TTL = 30000; // 30 seconds - scores update frequently

export function useScores(): ScoresData {
  const [scores, setScores] = useState<Record<string, NormalizedScore>>(cachedScores);
  const [isLoading, setIsLoading] = useState(Object.keys(cachedScores).length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (!force && Object.keys(cachedScores).length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      setScores(cachedScores);
      setIsLoading(false);
      return;
    }

    // Deduplicate concurrent requests
    if (fetchPromise) {
      await fetchPromise;
      setScores(cachedScores);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPromise = (async () => {
      try {
        const res = await fetch('/api/scores');
        if (!res.ok) throw new Error('Failed to fetch scores');
        
        const data = await res.json();
        
        cachedScores = data.scores || {};
        lastFetchTime = Date.now();
        
        setScores(cachedScores);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
        fetchPromise = null;
      }
    })();

    await fetchPromise;
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh scores every 30 seconds for live games
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { scores, isLoading, error, refetch };
}

// Helper to clear cache
export function clearScoresCache() {
  cachedScores = {};
  lastFetchTime = 0;
}
