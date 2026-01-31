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
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-slate-500">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <p className="text-slate-500">Failed to load performance data</p>
      </div>
    );
  }

  const { stats, recentPicks, pendingPicks } = data;

  return (
    <div className="space-y-4">
      {/* Header with Stats Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Pete&apos;s AI Performance</h2>
            <p className="text-slate-400 text-sm">Historical pick tracking since Nov 2025</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-400">74.3%</p>
            <p className="text-xs text-slate-400">Overall Win Rate</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalPicks}</p>
            <p className="text-xs text-slate-400">Total Picks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">+{stats.netUnits.toFixed(0)}u</p>
            <p className="text-xs text-slate-400">Net Units</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.roi.toFixed(0)}%</p>
            <p className="text-xs text-slate-400">ROI</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.longestWinStreak}</p>
            <p className="text-xs text-slate-400">Best Streak</p>
          </div>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Detailed Performance</h2>
          <p className="text-sm text-slate-500 mt-0.5">Breakdown by bet type, sport, and confidence</p>
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
        <div className="px-5 pb-2 flex gap-2 border-t border-slate-100 pt-3">
          {(['overview', 'picks', 'breakdown'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Last 7 Days</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Picks</span>
                <span className="text-slate-800 font-medium">{stats.last7Days.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Wins</span>
                <span className="text-slate-800 font-medium">{stats.last7Days.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Units</span>
                <span className={`font-medium font-mono ${stats.last7Days.netUnits >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.last7Days.netUnits >= 0 ? '+' : ''}{stats.last7Days.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Last 30 Days */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Last 30 Days</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Picks</span>
                <span className="text-slate-800 font-medium">{stats.last30Days.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Wins</span>
                <span className="text-slate-800 font-medium">{stats.last30Days.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Units</span>
                <span className={`font-medium font-mono ${stats.last30Days.netUnits >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.last30Days.netUnits >= 0 ? '+' : ''}{stats.last30Days.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Value Bets Performance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Value Bets</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Picks</span>
                <span className="text-slate-800 font-medium">{stats.valueBets.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Win Rate</span>
                <span className={`font-medium ${stats.valueBets.winRate >= 55 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {stats.valueBets.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Units</span>
                <span className={`font-medium font-mono ${stats.valueBets.netUnits >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.valueBets.netUnits >= 0 ? '+' : ''}{stats.valueBets.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* By Confidence */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">By Confidence</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">High (70%+)</span>
                <span className={`font-medium ${stats.byConfidence.high.winRate >= 60 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {stats.byConfidence.high.wins}/{stats.byConfidence.high.picks} ({stats.byConfidence.high.winRate.toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Medium (60-69%)</span>
                <span className={`font-medium ${stats.byConfidence.medium.winRate >= 55 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {stats.byConfidence.medium.wins}/{stats.byConfidence.medium.picks} ({stats.byConfidence.medium.winRate.toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Low (&lt;60%)</span>
                <span className="text-slate-800 font-medium">
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
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 bg-amber-50">
                <h3 className="text-sm font-semibold text-amber-800">🎯 Pending Picks ({pendingPicks.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {pendingPicks.map(pick => (
                  <PickRow key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Picks */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Recent Picks</h3>
            </div>
            <div className="divide-y divide-slate-100">
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">By Sport</h3>
            <div className="space-y-4">
              {(['NBA', 'NHL', 'NFL'] as const).map(sport => {
                const sportStats = stats.bySport[sport];
                if (sportStats.picks === 0) return null;
                return (
                  <div key={sport} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sport === 'NBA' ? '🏀' : sport === 'NHL' ? '🏒' : '🏈'}</span>
                      <span className="text-slate-700 font-medium">{sport}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-800 font-medium">{sportStats.wins}-{sportStats.losses}</p>
                      <p className={`text-xs font-mono ${sportStats.netUnits >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sportStats.netUnits >= 0 ? '+' : ''}{sportStats.netUnits.toFixed(1)}u
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Bet Type */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">By Bet Type</h3>
            <div className="space-y-4">
              {(['moneyline', 'spread', 'total', 'player_prop'] as const).map(betType => {
                const btStats = stats.byBetType[betType];
                if (btStats.picks === 0) return null;
                const label = betType === 'player_prop' ? 'Player Props' : 
                              betType.charAt(0).toUpperCase() + betType.slice(1);
                return (
                  <div key={betType} className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-700 font-medium capitalize">{label}</span>
                      <span className="text-xs text-slate-400 ml-2">({btStats.winRate.toFixed(0)}%)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-800 font-medium">{btStats.wins}-{btStats.losses}</p>
                      <p className={`text-xs font-mono ${btStats.netUnits >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
  const valueColor = color === 'positive' ? 'text-emerald-600' : 
                     color === 'negative' ? 'text-red-600' : 
                     'text-slate-800';
  
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}

function PickRow({ pick }: { pick: TrackedPick }) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    won: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    lost: 'bg-red-100 text-red-700 border border-red-200',
    push: 'bg-slate-100 text-slate-600 border border-slate-200',
    void: 'bg-slate-100 text-slate-500 border border-slate-200',
  };

  const formatOdds = (odds: number) => odds > 0 ? `+${odds}` : `${odds}`;
  const gameDate = new Date(pick.gameTime);
  const isToday = new Date().toDateString() === gameDate.toDateString();

  return (
    <div className="px-5 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <TeamLogo teamName={pick.homeTeam} sport={pick.sport.toLowerCase() as 'nba' | 'nhl' | 'nfl'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-800 font-medium truncate">{pick.pick}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[pick.status]}`}>
                {pick.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pick.awayTeam} @ {pick.homeTeam} • {isToday ? 'Today' : gameDate.toLocaleDateString()}
            </p>
            {pick.status !== 'pending' && pick.result?.actualScore && (
              <p className="text-xs text-slate-600 mt-1">
                Final: {pick.result.actualScore.away}-{pick.result.actualScore.home}
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-mono text-sm ${pick.odds > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
            {formatOdds(pick.odds)}
          </p>
          <p className="text-xs text-slate-500">{pick.confidence}% conf</p>
          {pick.isValueBet && (
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[9px] font-medium">
              VALUE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
