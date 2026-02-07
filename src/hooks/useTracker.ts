'use client';

import { useState, useEffect, useCallback } from 'react';

interface TrackerStats {
  winRate: number;
  wins: number;
  losses: number;
  pending: number;
  totalPicks: number;
  roi?: number;
  streak?: number;
}

interface TrackerPick {
  id: string;
  gameId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  pickType: string;
  pick: string;
  odds: number;
  confidence: number;
  result?: 'win' | 'loss' | 'push' | 'pending';
  createdAt: string;
  settledAt?: string;
}

interface TrackerData {
  stats: TrackerStats | null;
  picks: TrackerPick[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache to share data between components
let cachedData: { stats: TrackerStats | null; picks: TrackerPick[] } | null = null;
let lastFetchTime: number = 0;
let fetchPromise: Promise<void> | null = null;
const CACHE_TTL = 30000; // 30 seconds

export function useTracker(): TrackerData {
  const [stats, setStats] = useState<TrackerStats | null>(cachedData?.stats ?? null);
  const [picks, setPicks] = useState<TrackerPick[]>(cachedData?.picks ?? []);
  const [isLoading, setIsLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (!force && cachedData && (now - lastFetchTime) < CACHE_TTL) {
      setStats(cachedData.stats);
      setPicks(cachedData.picks);
      setIsLoading(false);
      return;
    }

    // Deduplicate concurrent requests
    if (fetchPromise) {
      await fetchPromise;
      if (cachedData) {
        setStats(cachedData.stats);
        setPicks(cachedData.picks);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPromise = (async () => {
      try {
        const res = await fetch('/api/tracker');
        if (!res.ok) throw new Error('Failed to fetch tracker data');
        
        const data = await res.json();
        
        cachedData = {
          stats: data.stats || null,
          picks: data.picks || [],
        };
        lastFetchTime = Date.now();
        
        setStats(cachedData.stats);
        setPicks(cachedData.picks);
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
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { stats, picks, isLoading, error, refetch };
}

// Helper to clear cache (useful after settling picks)
export function clearTrackerCache() {
  cachedData = null;
  lastFetchTime = 0;
}
