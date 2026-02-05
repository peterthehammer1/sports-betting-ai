'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { TrackedPick } from '@/types/tracker';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';

interface PerformanceBannerProps {
  className?: string;
}

interface LiveScore {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'final' | 'scheduled';
  period?: string;
  sport: string;
  startTime?: string;
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
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLiveScores();
    // Refresh live scores every 30 seconds
    const interval = setInterval(fetchLiveScores, 30000);
    return () => clearInterval(interval);
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
      // Get last 8 settled picks with results
      const settled = (data.recentPicks || []).filter((p: TrackedPick) => p.status !== 'pending').slice(0, 8);
      setRecentPicks(settled);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveScores = async () => {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (data.scores) {
        setLiveScores(data.scores.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch live scores:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#161b22] border-y border-slate-800 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`bg-[#161b22] border-y border-slate-800 ${className}`}>
      {/* Top Bar - Performance Stats */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 overflow-x-auto">
            {/* Left - Branding */}
            <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Pete&apos;s AI Picks
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-1 sm:gap-4 px-2 sm:px-4">
              <StatItem label="Record" value={`${stats.wins}-${stats.losses}`} />
              <Divider />
              <StatItem 
                label="Win %" 
                value={`${stats.winRate.toFixed(1)}%`} 
                highlight={stats.winRate >= 60}
              />
              <Divider />
              <StatItem 
                label="Units" 
                value={`${stats.netUnits >= 0 ? '+' : ''}${stats.netUnits.toFixed(0)}`}
                highlight={stats.netUnits > 0}
                negative={stats.netUnits < 0}
              />
              <Divider className="hidden sm:block" />
              <StatItem 
                label="ROI" 
                value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(0)}%`}
                highlight={stats.roi > 0}
                negative={stats.roi < 0}
                className="hidden sm:flex"
              />
              {stats.currentStreak && stats.currentStreak.type !== 'none' && stats.currentStreak.count >= 3 && (
                <>
                  <Divider className="hidden md:block" />
                  <div className="hidden md:flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Streak</span>
                    <span className={`text-xs font-bold ${
                      stats.currentStreak.type === 'W' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stats.currentStreak.count}{stats.currentStreak.type}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right - View All Link */}
            <div className="pl-4 border-l border-slate-700">
              <a href="#" className="text-[10px] text-slate-500 hover:text-white transition-colors uppercase tracking-wide whitespace-nowrap">
                Full Stats →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Live Scores Ticker */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-stretch overflow-x-auto scrollbar-hide">
            {/* Scores Label */}
            <div className="flex items-center px-4 py-2 border-r border-slate-700 bg-slate-800/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-white uppercase tracking-wide">Scores</span>
              </div>
            </div>
            
            {/* Score Cards */}
            <div className="flex items-stretch divide-x divide-slate-700/50">
              {liveScores.length > 0 ? (
                liveScores.map((score) => (
                  <ScoreCard key={score.id} score={score} />
                ))
              ) : (
                <div className="flex items-center px-6 py-3">
                  <span className="text-xs text-slate-500">No games in progress</span>
                </div>
              )}
            </div>

            {/* Recent Picks (compact) */}
            {recentPicks.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-l border-slate-700 bg-slate-800/30 flex-shrink-0 ml-auto">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Recent</span>
                <div className="flex items-center gap-1">
                  {recentPicks.slice(0, 5).map((pick) => (
                    <RecentPickChip key={pick.id} pick={pick} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ 
  label, 
  value, 
  highlight, 
  negative,
  className = ''
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  negative?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
      <span className={`text-xs font-semibold font-mono ${
        negative ? 'text-red-500' : highlight ? 'text-green-500' : 'text-white'
      }`}>
        {value}
      </span>
    </div>
  );
}

function Divider({ className = '' }: { className?: string }) {
  return <div className={`w-px h-4 bg-slate-700 ${className}`} />;
}

function ScoreCard({ score }: { score: LiveScore }) {
  const isLive = score.status === 'live';
  const isFinal = score.status === 'final';
  const awayWinning = score.awayScore > score.homeScore;
  const homeWinning = score.homeScore > score.awayScore;
  
  // Get sport type for logo lookup
  const sportType = score.sport === 'NHL' ? 'NHL' : 
                    score.sport === 'NBA' ? 'NBA' : 
                    score.sport === 'NFL' ? 'NFL' : 
                    score.sport === 'MLB' ? 'MLB' : 'NHL';
  
  // Get logos
  const awayLogo = getTeamLogoUrl(score.awayTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  const homeLogo = getTeamLogoUrl(score.homeTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  
  // Get short team names (last word is usually the team name)
  const awayShort = score.awayTeam.split(' ').pop() || score.awayTeam;
  const homeShort = score.homeTeam.split(' ').pop() || score.homeTeam;

  // Format game time for scheduled games
  const gameTimeStr = score.startTime ? new Date(score.startTime).toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  }) : '';

  return (
    <div className="flex flex-col px-4 py-2 min-w-[140px] hover:bg-slate-800/30 transition-colors cursor-pointer">
      {/* Status */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-slate-500 uppercase">{score.sport}</span>
        {isLive && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-semibold text-red-500 uppercase">{score.period || 'LIVE'}</span>
          </span>
        )}
        {isFinal && (
          <span className="text-[10px] font-medium text-slate-500">Final</span>
        )}
        {score.status === 'scheduled' && (
          <span className="text-[10px] text-slate-500">{gameTimeStr}</span>
        )}
      </div>
      
      {/* Away Team */}
      <div className={`flex items-center justify-between gap-2 ${isFinal && !awayWinning ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TeamLogo url={awayLogo} teamName={score.awayTeam} />
          <span className={`text-xs font-medium truncate ${awayWinning ? 'text-white' : 'text-slate-400'}`}>
            {awayShort}
          </span>
        </div>
        <span className={`text-sm font-bold font-mono tabular-nums ${awayWinning ? 'text-white' : 'text-slate-400'}`}>
          {score.awayScore}
        </span>
      </div>
      
      {/* Home Team */}
      <div className={`flex items-center justify-between gap-2 mt-1 ${isFinal && !homeWinning ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TeamLogo url={homeLogo} teamName={score.homeTeam} />
          <span className={`text-xs font-medium truncate ${homeWinning ? 'text-white' : 'text-slate-400'}`}>
            {homeShort}
          </span>
        </div>
        <span className={`text-sm font-bold font-mono tabular-nums ${homeWinning ? 'text-white' : 'text-slate-400'}`}>
          {score.homeScore}
        </span>
      </div>
    </div>
  );
}

// Mini team logo for score cards
function TeamLogo({ url, teamName }: { url: string | null; teamName: string }) {
  if (!url) {
    const initials = teamName.split(' ').map(w => w[0]).join('').substring(0, 2);
    return (
      <div className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
        <span className="text-[8px] font-semibold text-slate-400">{initials}</span>
      </div>
    );
  }

  return (
    <div className="w-5 h-5 rounded relative flex-shrink-0 bg-slate-800">
      <Image
        src={url}
        alt={teamName}
        fill
        className="object-contain p-0.5"
        unoptimized
      />
    </div>
  );
}

function RecentPickChip({ pick }: { pick: TrackedPick }) {
  const isWin = pick.status === 'won';
  const isLoss = pick.status === 'lost';
  const isPush = pick.status === 'push';
  
  // Get short pick description
  const shortPick = pick.pick.length > 15 ? pick.pick.substring(0, 15) + '...' : pick.pick;
  
  // Format score if available
  const scoreText = pick.result?.actualScore 
    ? `${pick.result.actualScore.away}-${pick.result.actualScore.home}` 
    : '';

  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] whitespace-nowrap ${
        isWin ? 'bg-green-500/10 border border-green-500/20' :
        isLoss ? 'bg-red-500/10 border border-red-500/20' :
        isPush ? 'bg-slate-700/50 border border-slate-600' :
        'bg-slate-800/50 border border-slate-700'
      }`}
      title={`${pick.pick} - ${pick.awayTeam} @ ${pick.homeTeam}`}
    >
      <span className={`font-semibold ${
        isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-slate-400'
      }`}>
        {isWin ? 'W' : isLoss ? 'L' : isPush ? 'P' : '-'}
      </span>
      <span className="text-slate-400">{pick.sport}</span>
      {scoreText && (
        <span className="text-slate-500 font-mono">{scoreText}</span>
      )}
    </div>
  );
}
