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
      <div className={`bg-[#161b22] rounded border border-slate-800 p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const settledPicks = picks.filter(p => p.status !== 'pending');
  const recentWins = settledPicks.filter(p => p.status === 'won').length;
  const recentTotal = settledPicks.length;

  return (
    <div className={`bg-[#161b22] rounded border border-slate-800 overflow-hidden ${className}`}>
      {/* Header - ESPN Style */}
      <div className="bg-[#1a1f26] px-3 py-2 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wide">
            Pick Results
          </h3>
          {stats?.currentStreak && stats.currentStreak.type !== 'none' && stats.currentStreak.count >= 3 && (
            <span className={`text-[10px] font-semibold ${
              stats.currentStreak.type === 'W' ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.currentStreak.count}{stats.currentStreak.type}
            </span>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-3 py-2 border-b border-slate-800 bg-[#1a1f26]/50">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-500">Record</span>
              <span className="ml-1.5 font-semibold text-white">{stats?.wins}-{stats?.losses}</span>
            </div>
            <div>
              <span className="text-slate-500">Win%</span>
              <span className={`ml-1.5 font-semibold ${(stats?.winRate || 0) >= 55 ? 'text-green-500' : 'text-white'}`}>
                {stats?.winRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-500">Units</span>
            <span className={`ml-1.5 font-semibold font-mono ${(stats?.netUnits || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(stats?.netUnits || 0) >= 0 ? '+' : ''}{stats?.netUnits.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Picks List */}
      <div className="max-h-[450px] overflow-y-auto">
        <div className="divide-y divide-slate-800/50">
          {picks.map((pick) => (
            <PickResultRow key={pick.id} pick={pick} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-[#1a1f26] border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {recentTotal} settled • {recentWins}W-{recentTotal - recentWins}L
        </p>
      </div>
    </div>
  );
}

function PickResultRow({ pick }: { pick: TrackedPick }) {
  const isPending = pick.status === 'pending';
  const isWin = pick.status === 'won';
  const isLoss = pick.status === 'lost';
  const isPush = pick.status === 'push';

  const gameDate = new Date(pick.gameTime);
  const isToday = new Date().toDateString() === gameDate.toDateString();
  
  // Short team names
  const awayShort = pick.awayTeam.split(' ').pop() || pick.awayTeam;
  const homeShort = pick.homeTeam.split(' ').pop() || pick.homeTeam;

  return (
    <div className={`px-3 py-2 hover:bg-slate-800/30 transition-colors ${
      isWin ? 'border-l-2 border-l-green-500' : 
      isLoss ? 'border-l-2 border-l-red-500' : 
      isPush ? 'border-l-2 border-l-slate-500' :
      'border-l-2 border-l-amber-500/50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        {/* Left - Game & Pick Info */}
        <div className="flex-1 min-w-0">
          {/* Matchup */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">{pick.sport}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{awayShort} @ {homeShort}</span>
          </div>
          
          {/* Pick */}
          <p className={`text-xs font-medium mt-0.5 truncate ${
            isWin ? 'text-green-500' : isLoss ? 'text-red-500' : isPush ? 'text-slate-400' : 'text-white'
          }`}>
            {pick.pick}
          </p>
          
          {/* Score & Date */}
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-600">
            {pick.result?.actualScore && (
              <span className="font-mono">
                {pick.result.actualScore.away}-{pick.result.actualScore.home}
              </span>
            )}
            <span>
              {isToday ? 'Today' : gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Right - Result & Odds */}
        <div className="text-right flex-shrink-0">
          <div className={`text-xs font-semibold ${
            isWin ? 'text-green-500' : isLoss ? 'text-red-500' : isPush ? 'text-slate-500' : 'text-amber-500'
          }`}>
            {isWin ? 'W' : isLoss ? 'L' : isPush ? 'P' : 'PEND'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {pick.odds > 0 ? '+' : ''}{pick.odds}
          </div>
        </div>
      </div>
    </div>
  );
}
