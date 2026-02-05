'use client';

import { useState, useEffect } from 'react';
import type { TrackedPick } from '@/types/tracker';

interface PerformanceBannerProps {
  className?: string;
}

export function PerformanceBanner({ className = '' }: PerformanceBannerProps) {
  const [stats, setStats] = useState<{
    winRate: number;
    wins: number;
    losses: number;
    netUnits: number;
    currentStreak: { type: string; count: number };
    roi: number;
  } | null>(null);
  const [recentPicks, setRecentPicks] = useState<TrackedPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tracker');
      const data = await res.json();
      setStats({
        winRate: data.stats?.winRate || 0,
        wins: data.stats?.wins || 0,
        losses: data.stats?.losses || 0,
        netUnits: data.stats?.netUnits || 0,
        currentStreak: data.stats?.currentStreak || { type: 'none', count: 0 },
        roi: data.stats?.roi || 0,
      });
      // Get last 5 settled picks
      const settled = (data.recentPicks || []).filter((p: TrackedPick) => p.status !== 'pending').slice(0, 5);
      setRecentPicks(settled);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border-y border-emerald-500/20 ${className}`}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border-y border-emerald-500/20 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Win Rate - Hero Stat */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/50">
                  <span className="text-lg font-bold text-emerald-400">{stats.winRate.toFixed(0)}%</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white">✓</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Win Rate</p>
                <p className="text-sm font-bold text-white">{stats.wins}-{stats.losses}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/10 hidden sm:block" />

            {/* Net Units */}
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Profit</p>
              <p className={`text-sm font-bold font-mono ${stats.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.netUnits >= 0 ? '+' : ''}{stats.netUnits.toFixed(1)}u
              </p>
            </div>

            {/* ROI */}
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 uppercase tracking-wide">ROI</p>
              <p className={`text-sm font-bold ${stats.roi >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(0)}%
              </p>
            </div>

            {/* Current Streak */}
            {stats.currentStreak && stats.currentStreak.type !== 'none' && stats.currentStreak.count >= 3 && (
              <>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🔥</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    stats.currentStreak.type === 'W' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {stats.currentStreak.count}{stats.currentStreak.type} Streak
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Recent Results - Scrolling ticker */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-[300px]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide whitespace-nowrap">Recent:</span>
            <div className="flex items-center gap-1.5">
              {recentPicks.map((pick, idx) => (
                <div
                  key={pick.id}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${
                    pick.status === 'won'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : pick.status === 'lost'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                  title={pick.pick}
                >
                  {pick.status === 'won' ? '✓' : pick.status === 'lost' ? '✗' : '−'}
                  <span className="ml-1 hidden sm:inline">{pick.sport}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
