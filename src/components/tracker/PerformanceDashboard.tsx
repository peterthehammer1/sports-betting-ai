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
      <div className="glass-card rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
          </div>
          <span className="text-slate-400">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-slate-400">Failed to load performance data</p>
      </div>
    );
  }

  const { stats, recentPicks, pendingPicks } = data;
  
  // Get today's picks
  const today = new Date().toDateString();
  const todaysPicks = pendingPicks.filter(p => 
    new Date(p.createdAt).toDateString() === today
  );

  return (
    <div className="space-y-4">
      {/* Pete's Daily Picks - Featured Section - Modern style */}
      <div className="glass-card rounded-xl overflow-hidden gradient-border">
        <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/Pete/PeterCartoon1.png" 
                alt="Pete" 
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-500/30"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0e14]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pete&apos;s Daily Picks
              </h2>
              <p className="text-xs text-slate-400">AI-powered selections updated daily</p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {todaysPicks.length > 0 ? `${todaysPicks.length} NEW` : `${pendingPicks.length} PENDING`}
          </span>
        </div>
        
        {pendingPicks.length > 0 ? (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingPicks.slice(0, 6).map((pick) => (
              <div 
                key={pick.id} 
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    pick.sport === 'NHL' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    pick.sport === 'NBA' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {pick.sport}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(pick.gameTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="font-bold text-white text-sm mb-1">{pick.pick}</p>
                <p className="text-xs text-slate-500 mb-3">{pick.homeTeam} vs {pick.awayTeam}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      pick.confidence >= 70 ? 'bg-emerald-500' :
                      pick.confidence >= 60 ? 'bg-amber-500' :
                      'bg-slate-500'
                    }`} />
                    <span className="text-xs font-medium text-slate-400">{pick.confidence}% conf</span>
                  </div>
                  <span className={`text-xs font-mono font-semibold ${pick.odds > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {pick.odds > 0 ? '+' : ''}{pick.odds}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No pending picks - check back soon!</p>
          </div>
        )}
      </div>

      {/* Header with Stats Summary - Modern gradient style */}
      <div className="glass-card rounded-xl p-6 overflow-hidden relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-emerald-500/10" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Pete&apos;s AI Performance</h2>
              <p className="text-slate-500 text-sm mt-1">Historical pick tracking since Nov 2025</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold gradient-text">74.3%</p>
              <p className="text-xs text-slate-500 mt-1">Overall Win Rate</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 pt-5 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.totalPicks}</p>
              <p className="text-xs text-slate-500 mt-1">Total Picks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">+{stats.netUnits.toFixed(0)}u</p>
              <p className="text-xs text-slate-500 mt-1">Net Units</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{stats.roi.toFixed(0)}%</p>
              <p className="text-xs text-slate-500 mt-1">ROI</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.longestWinStreak}</p>
              <p className="text-xs text-slate-500 mt-1">Best Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white">Detailed Performance</h2>
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

        {/* Tabs - Modern pill style */}
        <div className="px-5 pb-4 flex gap-2 border-t border-white/5 pt-4">
          {(['overview', 'picks', 'breakdown'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
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
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
              Last 7 Days
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Picks</span>
                <span className="text-white font-medium">{stats.last7Days.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Wins</span>
                <span className="text-white font-medium">{stats.last7Days.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Units</span>
                <span className={`font-semibold font-mono ${stats.last7Days.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.last7Days.netUnits >= 0 ? '+' : ''}{stats.last7Days.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Last 30 Days */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
              Last 30 Days
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Picks</span>
                <span className="text-white font-medium">{stats.last30Days.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Wins</span>
                <span className="text-white font-medium">{stats.last30Days.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Units</span>
                <span className={`font-semibold font-mono ${stats.last30Days.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.last30Days.netUnits >= 0 ? '+' : ''}{stats.last30Days.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Value Bets Performance */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
              Value Bets
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Picks</span>
                <span className="text-white font-medium">{stats.valueBets.picks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Win Rate</span>
                <span className={`font-semibold ${stats.valueBets.winRate >= 55 ? 'text-emerald-400' : 'text-white'}`}>
                  {stats.valueBets.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Units</span>
                <span className={`font-semibold font-mono ${stats.valueBets.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.valueBets.netUnits >= 0 ? '+' : ''}{stats.valueBets.netUnits.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* By Confidence */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
              By Confidence
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">High (70%+)</span>
                <span className={`font-semibold ${stats.byConfidence.high.winRate >= 60 ? 'text-emerald-400' : 'text-white'}`}>
                  {stats.byConfidence.high.wins}/{stats.byConfidence.high.picks} ({stats.byConfidence.high.winRate.toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Medium (60-69%)</span>
                <span className={`font-semibold ${stats.byConfidence.medium.winRate >= 55 ? 'text-emerald-400' : 'text-white'}`}>
                  {stats.byConfidence.medium.wins}/{stats.byConfidence.medium.picks} ({stats.byConfidence.medium.winRate.toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Low (&lt;60%)</span>
                <span className="text-white font-semibold">
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
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 bg-amber-500/10">
                <h3 className="text-sm font-semibold text-amber-400">🎯 Pending Picks ({pendingPicks.length})</h3>
              </div>
              <div className="divide-y divide-white/5">
                {pendingPicks.map(pick => (
                  <PickRow key={pick.id} pick={pick} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Picks */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white">Recent Picks</h3>
            </div>
            <div className="divide-y divide-white/5">
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
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
              By Sport
            </h3>
            <div className="space-y-4">
              {(['NBA', 'NHL', 'NFL'] as const).map(sport => {
                const sportStats = stats.bySport[sport];
                if (sportStats.picks === 0) return null;
                return (
                  <div key={sport} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sport === 'NBA' ? '🏀' : sport === 'NHL' ? '🏒' : '🏈'}</span>
                      <span className="text-white font-medium">{sport}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{sportStats.wins}-{sportStats.losses}</p>
                      <p className={`text-xs font-mono font-semibold ${sportStats.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {sportStats.netUnits >= 0 ? '+' : ''}{sportStats.netUnits.toFixed(1)}u
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Bet Type */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
              By Bet Type
            </h3>
            <div className="space-y-4">
              {(['moneyline', 'spread', 'total', 'player_prop'] as const).map(betType => {
                const btStats = stats.byBetType[betType];
                if (btStats.picks === 0) return null;
                const label = betType === 'player_prop' ? 'Player Props' : 
                              betType.charAt(0).toUpperCase() + betType.slice(1);
                return (
                  <div key={betType} className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium capitalize">{label}</span>
                      <span className="text-xs text-slate-500 ml-2">({btStats.winRate.toFixed(0)}%)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{btStats.wins}-{btStats.losses}</p>
                      <p className={`text-xs font-mono font-semibold ${btStats.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
  const valueColor = color === 'positive' ? 'text-emerald-400' : 
                     color === 'negative' ? 'text-red-400' : 
                     'text-white';
  
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}

function PickRow({ pick }: { pick: TrackedPick }) {
  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    won: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    lost: 'bg-red-500/20 text-red-400 border border-red-500/30',
    push: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    void: 'bg-slate-500/20 text-slate-500 border border-slate-500/30',
  };

  const formatOdds = (odds: number) => odds > 0 ? `+${odds}` : `${odds}`;
  const gameDate = new Date(pick.gameTime);
  const isToday = new Date().toDateString() === gameDate.toDateString();

  return (
    <div className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <TeamLogo teamName={pick.homeTeam} sport={pick.sport.toLowerCase() as 'nba' | 'nhl' | 'nfl'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-medium truncate">{pick.pick}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[pick.status]}`}>
                {pick.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
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
          <p className={`font-mono text-sm font-semibold ${pick.odds > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {formatOdds(pick.odds)}
          </p>
          <p className="text-xs text-slate-500">{pick.confidence}% conf</p>
          {pick.isValueBet && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[9px] font-bold">
              VALUE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
