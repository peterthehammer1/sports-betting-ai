'use client';

import { CircularConfidenceMeter, ConfidenceMeter } from '@/components/engagement/ConfidenceMeter';
import { FollowPickButton } from '@/components/engagement/Gamification';
import { CountdownTimer } from '@/components/engagement/CountdownTimer';

interface QuickPick {
  gameIndex: number;
  gameId?: string;
  homeTeam: string;
  awayTeam: string;
  winnerPick: string;
  winnerConfidence: number;
  bestBet: {
    type: string;
    pick: string;
    confidence: number;
  };
  quickTake: string;
  commenceTime?: string;
  odds?: {
    homeML?: number;
    awayML?: number;
    spread?: number;
    total?: number;
  };
}

interface QuickPicksProps {
  picks: QuickPick[];
  sport: 'NHL' | 'NBA' | 'NFL' | 'MLB' | 'EPL';
  onGameSelect?: (gameId: string) => void;
  loading?: boolean;
}

export function QuickPicks({ picks, sport, onGameSelect, loading }: QuickPicksProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-slate-600" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
          </div>
          <span className="ml-3 text-slate-400 text-sm">
            Analyzing {sport} games with Claude...
          </span>
        </div>
      </div>
    );
  }

  if (picks.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <p className="text-center text-slate-500 text-sm">
          No picks available
        </p>
      </div>
    );
  }

  // Sort by confidence
  const sortedPicks = [...picks].sort((a, b) => b.winnerConfidence - a.winnerConfidence);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-base font-semibold">Quick Picks</h2>
            <p className="text-slate-500 text-xs">
              {picks.length} {sport} games analyzed
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-medium">Top Pick</p>
            <p className="text-white text-sm font-semibold">
              {sortedPicks[0]?.winnerPick} ({sortedPicks[0]?.winnerConfidence}%)
            </p>
          </div>
        </div>
      </div>

      {/* Picks List */}
      <div className="divide-y divide-slate-700/50">
        {sortedPicks.map((pick, idx) => (
          <QuickPickRow
            key={pick.gameId || idx}
            pick={pick}
            rank={idx + 1}
            onSelect={() => pick.gameId && onGameSelect?.(pick.gameId)}
          />
        ))}
      </div>
    </div>
  );
}

function QuickPickRow({
  pick,
  rank,
  onSelect,
}: {
  pick: QuickPick;
  rank: number;
  onSelect: () => void;
}) {
  const isTopPick = rank <= 3;
  const gameTime = pick.commenceTime ? new Date(pick.commenceTime) : null;
  const isUpcoming = gameTime && gameTime > new Date();

  return (
    <div
      className={`p-4 hover:bg-slate-700/30 transition-colors ${
        isTopPick ? 'bg-amber-500/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Confidence Meter instead of Rank */}
        <div className="flex-shrink-0">
          <CircularConfidenceMeter 
            confidence={pick.winnerConfidence} 
            size="sm" 
            showLabel={false}
            animated={rank <= 3}
          />
        </div>

        {/* Game Info */}
        <div className="flex-grow min-w-0 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white text-sm">
                {pick.awayTeam} @ {pick.homeTeam}
              </p>
              {gameTime && (
                <div className="mt-1">
                  {isUpcoming ? (
                    <CountdownTimer 
                      targetDate={gameTime}
                      variant="inline"
                      showUrgency={true}
                    />
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      {gameTime.toLocaleDateString()} • {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-white text-sm">
                {pick.winnerPick}
              </p>
              {/* Confidence bar for visual impact */}
              <div className="mt-1">
                <ConfidenceMeter 
                  confidence={pick.winnerConfidence} 
                  size="sm" 
                  showLabel={false}
                  animated={false}
                />
              </div>
            </div>
          </div>

          {/* Quick Take */}
          <p className="text-xs text-slate-400 mt-2">
            {pick.quickTake}
          </p>

          {/* Best Bet & Odds */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-purple-400 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded">
                Best Bet: {pick.bestBet.type}
              </span>
              <span className="text-[10px] text-slate-500">
                {pick.bestBet.pick} ({pick.bestBet.confidence}%)
              </span>
            </div>
            {pick.odds && (
              <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                {pick.odds.homeML && (
                  <span>ML: {pick.odds.homeML > 0 ? '+' : ''}{pick.odds.homeML}</span>
                )}
                {pick.odds.spread && (
                  <span>Sprd: {pick.odds.spread > 0 ? '+' : ''}{pick.odds.spread}</span>
                )}
                {pick.odds.total && (
                  <span>O/U: {pick.odds.total}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Follow Pick Button + Arrow */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <FollowPickButton pickId={pick.gameId || `pick-${rank}`} />
          <button 
            onClick={onSelect}
            className="text-slate-600 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: number }) {
  const getColor = (conf: number) => {
    if (conf >= 70) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (conf >= 60) return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
    if (conf >= 55) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-slate-700 text-slate-400 border border-slate-600';
  };

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getColor(confidence)}`}>
      {confidence}%
    </span>
  );
}
