'use client';

import { useState, useEffect } from 'react';
import type { PerformanceStats, TrackedPick } from '@/types/tracker';
import { TeamLogo } from '@/components/ui/TeamLogo';

interface DashboardData {
  stats: PerformanceStats;
  recentPicks: TrackedPick[];
  pendingPicks: TrackedPick[];
  fromDemo?: boolean;
}

export function PerformanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'picks' | 'breakdown'>('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/tracker');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
          <span className="text-slate-400">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-8 text-center">
        <p className="text-slate-400">Failed to load performance data</p>
      </div>
    );
  }

  const { stats, recentPicks, pendingPicks, fromDemo } = data;

  return (
    <div className="space-y-4">
      {/* Demo Banner */}
      {fromDemo && (
        <div className="bg-[#2a3444] border border-slate-600/50 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-slate-400 text-sm">
            📊 Showing demo data. Real picks will be tracked automatically when AI analysis is generated.
          </span>
        </div>
      )}

      {/* Header Stats */}
      <div className="bg-[#161d29] border border-slate-700/40 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <h2 className="text-lg font-semibold text-slate-200">Performance Tracker</h2>
          <p className="text-sm text-slate-500 mt-0.5">AI pick performance over time</p>
        </div>

        {/* Key Metrics */}
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Record" 
              value={`${stats.wins}-${stats.losses}${stats.pushes > 0 ? `-${stats.pushes}` : ''}`}
              sublabel={`${stats.winRate.toFixed(1)}% Win Rate`}
              color="default"
            />
            <StatCard 
              label="Net Units" 
              value={stats.netUnits >= 0 ? `+${stats.netUnits.toFixed(1)}` : stats.netUnits.toFixed(1)}
              sublabel={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}% ROI`}
              color={stats.netUnits >= 0 ? 'positive' : 'negative'}
            />
            <StatCard 
              label="Current Streak" 
              value={stats.currentStreak.type === 'none' ? '-' : `${stats.currentStreak.count}${stats.currentStreak.type}`}
              sublabel={`Best: ${stats.longestWinStreak}W`}
              color={stats.currentStreak.type === 'W' ? 'positive' : stats.currentStreak.type === 'L' ? 'negative' : 'default'}
            />
            <StatCard 
              label="Pending" 
              value={stats.pendingPicks.toString()}
              sublabel={`${stats.totalPicks} total picks`}
              color="default"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-2 flex gap-2">
          {(['overview', 'picks', 'breakdown'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-[#2a3444] text-slate-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Last 7 Days */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Last 7 Days</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Picks</span>
                <span className="text-slate-200 font-medium">{stats.last7Days.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Wins</span>
                <span className="text-slate-200 font-medium">{stats.last7Days.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Net Units</span>
                <span className={`font-medium font-mono ${stats.last7Days.netUnits >= 0 ? 'text-[#5a9a7e]' : 'text-[#9e7a7a]'}`}>
                  {stats.last7Days.netUnits >= 0 ? '+' : ''}{stats.last7Days.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Last 30 Days */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Last 30 Days</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Picks</span>
                <span className="text-slate-200 font-medium">{stats.last30Days.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Wins</span>
                <span className="text-slate-200 font-medium">{stats.last30Days.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Net Units</span>
                <span className={`font-medium font-mono ${stats.last30Days.netUnits >= 0 ? 'text-[#5a9a7e]' : 'text-[#9e7a7a]'}`}>
                  {stats.last30Days.netUnits >= 0 ? '+' : ''}{stats.last30Days.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Value Bets Performance */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Value Bets</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Picks</span>
                <span className="text-slate-200 font-medium">{stats.valueBets.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Win Rate</span>
                <span className={`font-medium ${stats.valueBets.winRate >= 55 ? 'text-[#5a9a7e]' : 'text-slate-200'}`}>
                  {stats.valueBets.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Net Units</span>
                <span className={`font-medium font-mono ${stats.valueBets.netUnits >= 0 ? 'text-[#5a9a7e]' : 'text-[#9e7a7a]'}`}>
                  {stats.valueBets.netUnits >= 0 ? '+' : ''}{stats.valueBets.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* By Confidence */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">By Confidence</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">High (70%+)</span>
                <span className={`font-medium ${stats.byConfidence.high.winRate >= 60 ? 'text-[#5a9a7e]' : 'text-slate-200'}`}>
                  {stats.byConfidence.high.wins}/{stats.byConfidence.high.picks} ({stats.byConfidence.high.winRate.toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Medium (60-69%)</span>
                <span className={`font-medium ${stats.byConfidence.medium.winRate >= 55 ? 'text-[#5a9a7e]' : 'text-slate-200'}`}>
                  {stats.byConfidence.medium.wins}/{stats.byConfidence.medium.picks} ({stats.byConfidence.medium.winRate.toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Low (&lt;60%)</span>
                <span className="text-slate-200 font-medium">
                  {stats.byConfidence.low.wins}/{stats.byConfidence.low.picks} ({stats.byConfidence.low.winRate.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'picks' && (
        <div className="space-y-4">
          {/* Pending Picks */}
          {pendingPicks.length > 0 && (
            <div className="bg-[#161d29] border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700/40">
                <h3 className="text-sm font-semibold text-slate-300">Pending Picks ({pendingPicks.length})</h3>
              </div>
              <div className="divide-y divide-slate-700/30">
                {pendingPicks.map(pick => (
                  <PickRow key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Picks */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700/40">
              <h3 className="text-sm font-semibold text-slate-300">Recent Picks</h3>
            </div>
            <div className="divide-y divide-slate-700/30">
              {recentPicks.filter(p => p.status !== 'pending').map(pick => (
                <PickRow key={pick.id} pick={pick} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* By Sport */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">By Sport</h3>
            <div className="space-y-4">
              {(['NBA', 'NHL', 'NFL'] as const).map(sport => {
                const sportStats = stats.bySport[sport];
                if (sportStats.picks === 0) return null;
                return (
                  <div key={sport} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sport === 'NBA' ? '🏀' : sport === 'NHL' ? '🏒' : '🏈'}</span>
                      <span className="text-slate-300 font-medium">{sport}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-200 font-medium">{sportStats.wins}-{sportStats.losses}</p>
                      <p className={`text-xs font-mono ${sportStats.netUnits >= 0 ? 'text-[#5a9a7e]' : 'text-[#9e7a7a]'}`}>
                        {sportStats.netUnits >= 0 ? '+' : ''}{sportStats.netUnits.toFixed(1)}u
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Bet Type */}
          <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">By Bet Type</h3>
            <div className="space-y-4">
              {(['moneyline', 'spread', 'total', 'player_prop'] as const).map(betType => {
                const btStats = stats.byBetType[betType];
                if (btStats.picks === 0) return null;
                const label = betType === 'player_prop' ? 'Player Props' : 
                              betType.charAt(0).toUpperCase() + betType.slice(1);
                return (
                  <div key={betType} className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium capitalize">{label}</span>
                    <div className="text-right">
                      <p className="text-slate-200 font-medium">{btStats.wins}-{btStats.losses}</p>
                      <p className={`text-xs font-mono ${btStats.netUnits >= 0 ? 'text-[#5a9a7e]' : 'text-[#9e7a7a]'}`}>
                        {btStats.netUnits >= 0 ? '+' : ''}{btStats.netUnits.toFixed(1)}u
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sublabel, color }: { 
  label: string; 
  value: string; 
  sublabel: string;
  color: 'positive' | 'negative' | 'default';
}) {
  const valueColor = color === 'positive' ? 'text-[#5a9a7e]' : 
                     color === 'negative' ? 'text-[#9e7a7a]' : 
                     'text-slate-200';
  
  return (
    <div className="bg-[#0c1017] rounded-lg p-4 border border-slate-700/30">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}

function PickRow({ pick }: { pick: TrackedPick }) {
  const statusColors = {
    pending: 'bg-[#a38f5c]/20 text-[#a38f5c]',
    won: 'bg-[#4a8a6e]/20 text-[#5a9a7e]',
    lost: 'bg-[#9e5a5a]/20 text-[#9e7a7a]',
    push: 'bg-slate-600/20 text-slate-400',
    void: 'bg-slate-600/20 text-slate-500',
  };

  const formatOdds = (odds: number) => odds > 0 ? `+${odds}` : `${odds}`;
  const gameDate = new Date(pick.gameTime);
  const isToday = new Date().toDateString() === gameDate.toDateString();

  return (
    <div className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <TeamLogo teamName={pick.homeTeam} sport={pick.sport.toLowerCase() as 'nba' | 'nhl' | 'nfl'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-200 font-medium truncate">{pick.pick}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[pick.status]}`}>
                {pick.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pick.awayTeam} @ {pick.homeTeam} • {isToday ? 'Today' : gameDate.toLocaleDateString()}
            </p>
            {pick.status !== 'pending' && pick.result?.actualScore && (
              <p className="text-xs text-slate-400 mt-1">
                Final: {pick.result.actualScore.away}-{pick.result.actualScore.home}
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-mono text-sm ${pick.odds > 0 ? 'text-[#5a9a7e]' : 'text-slate-300'}`}>
            {formatOdds(pick.odds)}
          </p>
          <p className="text-xs text-slate-500">{pick.confidence}% conf</p>
          {pick.isValueBet && (
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#a38f5c]/20 text-[#a38f5c] rounded text-[9px] font-medium">
              VALUE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
