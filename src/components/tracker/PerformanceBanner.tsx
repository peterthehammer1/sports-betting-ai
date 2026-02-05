'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { TrackedPick } from '@/types/tracker';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';

interface PerformanceBannerProps {
  className?: string;
  onNavigateToTracker?: () => void;
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

interface GameAnalysis {
  winnerPick?: string;
  winnerConfidence?: number;
  bestBet?: { type: string; pick: string; confidence: number };
  quickTake?: string;
  loading?: boolean;
}

export function PerformanceBanner({ className = '', onNavigateToTracker }: PerformanceBannerProps) {
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
  const [selectedGame, setSelectedGame] = useState<LiveScore | null>(null);
  const [selectedPick, setSelectedPick] = useState<TrackedPick | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysis | null>(null);

  useEffect(() => {
    fetchStats();
    fetchLiveScores();
    // Refresh live scores every 30 seconds
    const interval = setInterval(fetchLiveScores, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch AI analysis when a game is selected
  const fetchAnalysis = async (game: LiveScore) => {
    if (game.status === 'final') {
      // For completed games, just show the result
      setGameAnalysis(null);
      return;
    }
    
    setGameAnalysis({ loading: true });
    try {
      // Use the batch analysis endpoint to get quick picks
      const res = await fetch('/api/analyze/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sport: game.sport,
          gameId: game.id 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Find the prediction for this specific game
        const prediction = data.predictions?.find((p: { gameId?: string; homeTeam?: string }) => 
          p.gameId === game.id || p.homeTeam === game.homeTeam
        );
        
        if (prediction) {
          setGameAnalysis({
            winnerPick: prediction.winnerPick,
            winnerConfidence: prediction.winnerConfidence,
            bestBet: prediction.bestBet,
            quickTake: prediction.quickTake,
          });
        } else {
          setGameAnalysis(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setGameAnalysis(null);
    }
  };

  const handleGameClick = (game: LiveScore) => {
    setSelectedGame(game);
    fetchAnalysis(game);
  };

  const closeModal = () => {
    setSelectedGame(null);
    setSelectedPick(null);
    setGameAnalysis(null);
  };

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
              <button 
                onClick={onNavigateToTracker}
                className="text-[10px] text-slate-500 hover:text-white transition-colors uppercase tracking-wide whitespace-nowrap"
              >
                Full Stats →
              </button>
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
                  <ScoreCard key={score.id} score={score} onClick={() => handleGameClick(score)} />
                ))
              ) : (
                <div className="flex items-center px-6 py-3">
                  <span className="text-xs text-slate-500">No games in progress</span>
                </div>
              )}
            </div>

            {/* Recent Picks - as full game cards */}
            {recentPicks.length > 0 && (
              <>
                <div className="flex items-center px-4 py-2 border-l border-slate-700 bg-slate-800/30 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white uppercase tracking-wide">Recent</span>
                  </div>
                </div>
                <div className="flex items-stretch divide-x divide-slate-700/50">
                  {recentPicks.slice(0, 5).map((pick) => (
                    <RecentPickCard key={pick.id} pick={pick} onClick={() => setSelectedPick(pick)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <GameDetailModal 
          game={selectedGame} 
          analysis={gameAnalysis}
          onClose={closeModal} 
        />
      )}

      {/* Pick Detail Modal */}
      {selectedPick && (
        <PickDetailModal 
          pick={selectedPick}
          onClose={closeModal} 
        />
      )}
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

function ScoreCard({ score, onClick }: { score: LiveScore; onClick: () => void }) {
  const isLive = score.status === 'live';
  const isFinal = score.status === 'final';
  const isScheduled = score.status === 'scheduled';
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

  // Format game time for scheduled games
  const gameTime = score.startTime ? new Date(score.startTime) : null;
  const gameTimeStr = gameTime ? gameTime.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  }) : '';
  const gameDateStr = gameTime ? gameTime.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  }) : '';

  return (
    <div 
      className="flex flex-col px-4 py-2.5 min-w-[180px] hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{score.sport}</span>
        {isLive && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 rounded">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 uppercase">{score.period || 'LIVE'}</span>
          </span>
        )}
        {isFinal && (
          <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">Final</span>
        )}
        {isScheduled && (
          <span className="text-[10px] text-slate-400">{gameDateStr} {gameTimeStr}</span>
        )}
      </div>
      
      {/* Away Team */}
      <div className={`flex items-center justify-between gap-3 ${isFinal && !awayWinning ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <TeamLogo url={awayLogo} teamName={score.awayTeam} size="md" />
          <span className={`text-sm font-medium truncate ${awayWinning || isScheduled || isLive ? 'text-white' : 'text-slate-400'}`}>
            {score.awayTeam}
          </span>
        </div>
        {!isScheduled && (
          <span className={`text-base font-bold font-mono tabular-nums ${awayWinning ? 'text-white' : 'text-slate-400'}`}>
            {score.awayScore}
          </span>
        )}
      </div>
      
      {/* Home Team */}
      <div className={`flex items-center justify-between gap-3 mt-1.5 ${isFinal && !homeWinning ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <TeamLogo url={homeLogo} teamName={score.homeTeam} size="md" />
          <span className={`text-sm font-medium truncate ${homeWinning || isScheduled || isLive ? 'text-white' : 'text-slate-400'}`}>
            {score.homeTeam}
          </span>
        </div>
        {!isScheduled && (
          <span className={`text-base font-bold font-mono tabular-nums ${homeWinning ? 'text-white' : 'text-slate-400'}`}>
            {score.homeScore}
          </span>
        )}
      </div>

      {/* Click hint */}
      <div className="mt-2 pt-1.5 border-t border-slate-700/50">
        <span className="text-[9px] text-slate-500 uppercase tracking-wide">
          {isScheduled ? 'Click for AI Analysis →' : 'Click for Details →'}
        </span>
      </div>
    </div>
  );
}

// Team logo component with size variants
function TeamLogo({ url, teamName, size = 'sm' }: { url: string | null; teamName: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-12 h-12',
  };
  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-sm',
  };
  
  if (!url) {
    const initials = teamName.split(' ').map(w => w[0]).join('').substring(0, 2);
    return (
      <div className={`${sizeClasses[size]} rounded bg-slate-700 flex items-center justify-center flex-shrink-0`}>
        <span className={`${textSizes[size]} font-semibold text-slate-400`}>{initials}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded relative flex-shrink-0 bg-slate-800`}>
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

// Game Detail Modal
function GameDetailModal({ 
  game, 
  analysis,
  onClose 
}: { 
  game: LiveScore; 
  analysis: GameAnalysis | null;
  onClose: () => void;
}) {
  const isLive = game.status === 'live';
  const isFinal = game.status === 'final';
  const isScheduled = game.status === 'scheduled';
  const awayWinning = game.awayScore > game.homeScore;
  const homeWinning = game.homeScore > game.awayScore;
  
  // Get sport type for logo lookup
  const sportType = game.sport === 'NHL' ? 'NHL' : 
                    game.sport === 'NBA' ? 'NBA' : 
                    game.sport === 'NFL' ? 'NFL' : 
                    game.sport === 'MLB' ? 'MLB' : 'NHL';
  
  const awayLogo = getTeamLogoUrl(game.awayTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  const homeLogo = getTeamLogoUrl(game.homeTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  
  // Format game time
  const gameTime = game.startTime ? new Date(game.startTime) : null;
  const gameTimeStr = gameTime ? gameTime.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  }) : '';
  const gameDateStr = gameTime ? gameTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) : '';

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#161b22] border border-slate-700 rounded-lg max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{game.sport}</span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded text-xs font-semibold text-red-500">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {game.period || 'LIVE'}
              </span>
            )}
            {isFinal && (
              <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-semibold text-slate-400">Final</span>
            )}
            {isScheduled && (
              <span className="text-xs text-slate-400">{gameDateStr} • {gameTimeStr}</span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Matchup */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Away Team */}
            <div className={`flex-1 text-center ${isFinal && !awayWinning ? 'opacity-50' : ''}`}>
              <div className="flex justify-center mb-3">
                <TeamLogo url={awayLogo} teamName={game.awayTeam} size="lg" />
              </div>
              <p className={`text-lg font-bold ${awayWinning || isScheduled ? 'text-white' : 'text-slate-400'}`}>
                {game.awayTeam}
              </p>
              {!isScheduled && (
                <p className={`text-4xl font-bold font-mono mt-2 ${awayWinning ? 'text-white' : 'text-slate-500'}`}>
                  {game.awayScore}
                </p>
              )}
            </div>

            {/* VS / Score divider */}
            <div className="flex-shrink-0 text-center px-4">
              {isScheduled ? (
                <div>
                  <p className="text-2xl font-bold text-slate-600">VS</p>
                  <p className="text-xs text-slate-500 mt-1">{gameTimeStr}</p>
                </div>
              ) : (
                <p className="text-slate-600 text-sm font-medium">—</p>
              )}
            </div>

            {/* Home Team */}
            <div className={`flex-1 text-center ${isFinal && !homeWinning ? 'opacity-50' : ''}`}>
              <div className="flex justify-center mb-3">
                <TeamLogo url={homeLogo} teamName={game.homeTeam} size="lg" />
              </div>
              <p className={`text-lg font-bold ${homeWinning || isScheduled ? 'text-white' : 'text-slate-400'}`}>
                {game.homeTeam}
              </p>
              {!isScheduled && (
                <p className={`text-4xl font-bold font-mono mt-2 ${homeWinning ? 'text-white' : 'text-slate-500'}`}>
                  {game.homeScore}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Section - Only for scheduled/live games */}
        {(isScheduled || isLive) && (
          <div className="px-5 py-4 border-t border-slate-700 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🤖</span>
              <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
            </div>
            
            {analysis?.loading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Generating analysis...</span>
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                {/* Winner Pick */}
                {analysis.winnerPick && (
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-sm text-slate-400">Predicted Winner</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{analysis.winnerPick}</span>
                      {analysis.winnerConfidence && (
                        <span className="text-xs font-medium text-green-500">
                          {analysis.winnerConfidence}% conf
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Best Bet */}
                {analysis.bestBet && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-500 font-semibold uppercase mb-1">Best Bet</p>
                    <p className="text-sm font-bold text-white">{analysis.bestBet.pick}</p>
                    <p className="text-xs text-slate-400 mt-1">{analysis.bestBet.type}</p>
                  </div>
                )}
                
                {/* Quick Take */}
                {analysis.quickTake && (
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase mb-1">Quick Take</p>
                    <p className="text-sm text-slate-300">{analysis.quickTake}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-2">
                Analysis not available for this game.
              </p>
            )}
          </div>
        )}

        {/* Final Game Summary - For completed games */}
        {isFinal && (
          <div className="px-5 py-4 border-t border-slate-700 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase">Final Score</p>
                <p className="text-lg font-bold text-white mt-1">
                  {game.awayTeam} {game.awayScore} - {game.homeScore} {game.homeTeam}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase">Winner</p>
                <p className="text-lg font-bold text-green-500 mt-1">
                  {awayWinning ? game.awayTeam : homeWinning ? game.homeTeam : 'Tie'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Recent Pick Card - matches ScoreCard styling for past games
function RecentPickCard({ pick, onClick }: { pick: TrackedPick; onClick: () => void }) {
  const isWin = pick.status === 'won';
  const isLoss = pick.status === 'lost';
  const isPush = pick.status === 'push';
  
  // Get sport type for logo lookup
  const sportType = pick.sport === 'NHL' ? 'NHL' : 
                    pick.sport === 'NBA' ? 'NBA' : 
                    pick.sport === 'NFL' ? 'NFL' : 
                    pick.sport === 'MLB' ? 'MLB' : 'NHL';
  
  // Get logos
  const awayLogo = getTeamLogoUrl(pick.awayTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  const homeLogo = getTeamLogoUrl(pick.homeTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  
  // Get scores
  const awayScore = pick.result?.actualScore?.away ?? 0;
  const homeScore = pick.result?.actualScore?.home ?? 0;
  const awayWon = awayScore > homeScore;
  const homeWon = homeScore > awayScore;
  
  // Format game date
  const gameDate = new Date(pick.gameTime);
  const gameDateStr = gameDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className="flex flex-col px-4 py-2.5 min-w-[180px] hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{pick.sport}</span>
        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
          isWin ? 'bg-green-500/10 text-green-500' :
          isLoss ? 'bg-red-500/10 text-red-500' :
          isPush ? 'bg-slate-700 text-slate-400' :
          'bg-slate-800 text-slate-400'
        }`}>
          {isWin ? '✓ WIN' : isLoss ? '✗ LOSS' : isPush ? 'PUSH' : 'PENDING'}
        </span>
      </div>
      
      {/* Away Team */}
      <div className={`flex items-center justify-between gap-3 ${!awayWon ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <TeamLogo url={awayLogo} teamName={pick.awayTeam} size="md" />
          <span className={`text-sm font-medium truncate ${awayWon ? 'text-white' : 'text-slate-400'}`}>
            {pick.awayTeam}
          </span>
        </div>
        <span className={`text-base font-bold font-mono tabular-nums ${awayWon ? 'text-white' : 'text-slate-400'}`}>
          {awayScore}
        </span>
      </div>
      
      {/* Home Team */}
      <div className={`flex items-center justify-between gap-3 mt-1.5 ${!homeWon ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <TeamLogo url={homeLogo} teamName={pick.homeTeam} size="md" />
          <span className={`text-sm font-medium truncate ${homeWon ? 'text-white' : 'text-slate-400'}`}>
            {pick.homeTeam}
          </span>
        </div>
        <span className={`text-base font-bold font-mono tabular-nums ${homeWon ? 'text-white' : 'text-slate-400'}`}>
          {homeScore}
        </span>
      </div>

      {/* Date */}
      <div className="mt-2 pt-1.5 border-t border-slate-700/50">
        <span className="text-[9px] text-slate-500 uppercase tracking-wide">
          {gameDateStr} • Click for Details →
        </span>
      </div>
    </div>
  );
}

// Pick Detail Modal
function PickDetailModal({ 
  pick, 
  onClose 
}: { 
  pick: TrackedPick;
  onClose: () => void;
}) {
  const isWin = pick.status === 'won';
  const isLoss = pick.status === 'lost';
  const isPush = pick.status === 'push';
  
  // Get sport type for logo lookup
  const sportType = pick.sport === 'NHL' ? 'NHL' : 
                    pick.sport === 'NBA' ? 'NBA' : 
                    pick.sport === 'NFL' ? 'NFL' : 
                    pick.sport === 'MLB' ? 'MLB' : 'NHL';
  
  const awayLogo = getTeamLogoUrl(pick.awayTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  const homeLogo = getTeamLogoUrl(pick.homeTeam, sportType as 'NHL' | 'NBA' | 'MLB' | 'NFL' | 'EPL');
  
  // Get scores
  const awayScore = pick.result?.actualScore?.away ?? 0;
  const homeScore = pick.result?.actualScore?.home ?? 0;
  const awayWon = awayScore > homeScore;
  const homeWon = homeScore > awayScore;
  
  // Format game date
  const gameDate = new Date(pick.gameTime);
  const gameDateStr = gameDate.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#161b22] border border-slate-700 rounded-lg max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{pick.sport}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              isWin ? 'bg-green-500/10 text-green-500' :
              isLoss ? 'bg-red-500/10 text-red-500' :
              isPush ? 'bg-slate-800 text-slate-400' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {isWin ? '✓ WIN' : isLoss ? '✗ LOSS' : isPush ? 'PUSH' : 'PENDING'}
            </span>
            <span className="text-xs text-slate-400">{gameDateStr}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Matchup */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Away Team */}
            <div className={`flex-1 text-center ${!awayWon ? 'opacity-50' : ''}`}>
              <div className="flex justify-center mb-3">
                <TeamLogo url={awayLogo} teamName={pick.awayTeam} size="lg" />
              </div>
              <p className={`text-lg font-bold ${awayWon ? 'text-white' : 'text-slate-400'}`}>
                {pick.awayTeam}
              </p>
              <p className={`text-4xl font-bold font-mono mt-2 ${awayWon ? 'text-white' : 'text-slate-500'}`}>
                {awayScore}
              </p>
            </div>

            {/* VS divider */}
            <div className="flex-shrink-0 text-center px-4">
              <p className="text-slate-600 text-sm font-medium">Final</p>
            </div>

            {/* Home Team */}
            <div className={`flex-1 text-center ${!homeWon ? 'opacity-50' : ''}`}>
              <div className="flex justify-center mb-3">
                <TeamLogo url={homeLogo} teamName={pick.homeTeam} size="lg" />
              </div>
              <p className={`text-lg font-bold ${homeWon ? 'text-white' : 'text-slate-400'}`}>
                {pick.homeTeam}
              </p>
              <p className={`text-4xl font-bold font-mono mt-2 ${homeWon ? 'text-white' : 'text-slate-500'}`}>
                {homeScore}
              </p>
            </div>
          </div>
        </div>

        {/* Pick Details */}
        <div className="px-5 py-4 border-t border-slate-700 bg-slate-800/30">
          <div className="space-y-3">
            {/* Our Pick */}
            <div className={`p-3 rounded-lg ${
              isWin ? 'bg-green-500/10 border border-green-500/20' :
              isLoss ? 'bg-red-500/10 border border-red-500/20' :
              'bg-slate-800 border border-slate-700'
            }`}>
              <p className={`text-xs font-semibold uppercase mb-1 ${
                isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-slate-500'
              }`}>
                Our Pick
              </p>
              <p className="text-sm font-bold text-white">{pick.pick}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>Odds: {pick.odds > 0 ? '+' : ''}{pick.odds}</span>
                <span>•</span>
                <span>{pick.units} unit{pick.units !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {/* Result */}
            {(isWin || isLoss || isPush) && (
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="text-sm text-slate-400">Result</span>
                <span className={`text-sm font-bold ${
                  isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {isWin ? `+${(pick.odds > 0 ? pick.odds / 100 : 100 / Math.abs(pick.odds)).toFixed(2)}` : 
                   isLoss ? `-${pick.units.toFixed(2)}` : 
                   '0.00'} units
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
