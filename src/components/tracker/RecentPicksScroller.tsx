'use client';

import { useState, useEffect } from 'react';
import type { TrackedPick } from '@/types/tracker';

interface RecentPicksScrollerProps {
  className?: string;
}

export function RecentPicksScroller({ className = '' }: RecentPicksScrollerProps) {
  const [picks, setPicks] = useState<TrackedPick[]>([]);
  const [stats, setStats] = useState<{ winRate: number; wins: number; losses: number; netUnits: number; currentStreak: { type: string; count: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPicks();
    // Refresh every 2 minutes
    const interval = setInterval(fetchPicks, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchPicks = async () => {
    try {
      const res = await fetch('/api/tracker');
      const data = await res.json();
      // Get last 20 picks (mix of settled and pending)
      const allPicks = [...(data.recentPicks || [])].slice(0, 20);
      setPicks(allPicks);
      setStats({
        winRate: data.stats?.winRate || 0,
        wins: data.stats?.wins || 0,
        losses: data.stats?.losses || 0,
        netUnits: data.stats?.netUnits || 0,
        currentStreak: data.stats?.currentStreak || { type: 'none', count: 0 },
      });
    } catch (error) {
      console.error('Failed to fetch picks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/50 rounded-xl border border-slate-700 p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-slate-600" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const settledPicks = picks.filter(p => p.status !== 'pending');
  const recentWins = settledPicks.filter(p => p.status === 'won').length;
  const recentTotal = settledPicks.length;

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden ${className}`}>
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-lg">🔥</span>
            Live Results
          </h3>
          {stats?.currentStreak && stats.currentStreak.type !== 'none' && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              stats.currentStreak.type === 'W' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {stats.currentStreak.count}{stats.currentStreak.type} Streak
            </span>
          )}
        </div>
        
        {/* Win Rate Display */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-400">{stats?.winRate.toFixed(1)}%</span>
              <span className="text-xs text-slate-500">Win Rate</span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${stats?.winRate || 0}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{stats?.wins}-{stats?.losses}</p>
            <p className={`text-xs font-mono font-semibold ${(stats?.netUnits || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(stats?.netUnits || 0) >= 0 ? '+' : ''}{stats?.netUnits.toFixed(1)}u
            </p>
          </div>
        </div>
      </div>

      {/* Scrolling Picks List */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="divide-y divide-slate-700/50">
          {picks.map((pick, idx) => (
            <PickResultRow key={pick.id} pick={pick} index={idx} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-900/30 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-600 text-center">
          Recent {recentTotal} settled: {recentWins}W-{recentTotal - recentWins}L • Updated live
        </p>
      </div>
    </div>
  );
}

function PickResultRow({ pick, index }: { pick: TrackedPick; index: number }) {
  const isPending = pick.status === 'pending';
  const isWin = pick.status === 'won';
  const isLoss = pick.status === 'lost';
  const isPush = pick.status === 'push';

  const statusConfig = {
    won: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '✓', iconBg: 'bg-emerald-500', text: 'text-emerald-400' },
    lost: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '✗', iconBg: 'bg-red-500', text: 'text-red-400' },
    push: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: '−', iconBg: 'bg-slate-500', text: 'text-slate-400' },
    pending: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', icon: '⏳', iconBg: 'bg-amber-500/20', text: 'text-amber-400' },
    void: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: '−', iconBg: 'bg-slate-500', text: 'text-slate-400' },
  };

  const config = statusConfig[pick.status] || statusConfig.pending;
  const gameDate = new Date(pick.gameTime);
  const isToday = new Date().toDateString() === gameDate.toDateString();

  const sportEmoji = pick.sport === 'NHL' ? '🏒' : pick.sport === 'NBA' ? '🏀' : pick.sport === 'NFL' ? '🏈' : '⚽';

  return (
    <div className={`px-3 py-2.5 ${config.bg} hover:bg-white/[0.02] transition-colors`}>
      <div className="flex items-start gap-2.5">
        {/* Status Icon */}
        <div className={`w-6 h-6 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <span className="text-white text-xs">{config.icon}</span>
        </div>

        {/* Pick Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{sportEmoji}</span>
            <p className={`font-medium text-sm truncate ${isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-white'}`}>
              {pick.pick}
            </p>
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {pick.awayTeam} @ {pick.homeTeam}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.border} border ${config.text}`}>
              {pick.status.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-600">
              {isToday ? 'Today' : gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {pick.result?.actualScore && (
              <span className="text-[10px] text-slate-500">
                Final: {pick.result.actualScore.away}-{pick.result.actualScore.home}
              </span>
            )}
          </div>
        </div>

        {/* Odds & Result */}
        <div className="text-right flex-shrink-0">
          <p className={`font-mono text-xs font-semibold ${pick.odds > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {pick.odds > 0 ? '+' : ''}{pick.odds}
          </p>
          {!isPending && (
            <p className={`text-[10px] font-semibold mt-0.5 ${isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-slate-400'}`}>
              {isWin ? '+1.0u' : isLoss ? '-1.0u' : '0u'}
            </p>
          )}
          <p className="text-[10px] text-slate-600 mt-0.5">{pick.confidence}%</p>
        </div>
      </div>
    </div>
  );
}
