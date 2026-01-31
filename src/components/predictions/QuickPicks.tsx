'use client';

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Analyzing {sport} games with Claude...
          </span>
        </div>
      </div>
    );
  }

  if (picks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No picks available
        </p>
      </div>
    );
  }

  // Sort by confidence
  const sortedPicks = [...picks].sort((a, b) => b.winnerConfidence - a.winnerConfidence);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">🎯 Quick Picks</h2>
            <p className="text-purple-100 text-sm">
              {picks.length} {sport} games analyzed
            </p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">Top Pick</p>
            <p className="text-purple-100 text-xs">
              {sortedPicks[0]?.winnerPick} ({sortedPicks[0]?.winnerConfidence}%)
            </p>
          </div>
        </div>
      </div>

      {/* Picks List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
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

  return (
    <div
      onClick={onSelect}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
        isTopPick ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          rank === 1 
            ? 'bg-yellow-400 text-yellow-900' 
            : rank === 2 
            ? 'bg-gray-300 text-gray-700'
            : rank === 3
            ? 'bg-amber-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {rank}
        </div>

        {/* Game Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {pick.awayTeam} @ {pick.homeTeam}
              </p>
              {gameTime && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {gameTime.toLocaleDateString()} • {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {pick.winnerPick}
              </p>
              <ConfidencePill confidence={pick.winnerConfidence} />
            </div>
          </div>

          {/* Quick Take */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {pick.quickTake}
          </p>

          {/* Best Bet & Odds */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                Best Bet: {pick.bestBet.type}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {pick.bestBet.pick} ({pick.bestBet.confidence}%)
              </span>
            </div>
            {pick.odds && (
              <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
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

        {/* Arrow */}
        <div className="flex-shrink-0 text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: number }) {
  const getColor = (conf: number) => {
    if (conf >= 70) return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    if (conf >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
    if (conf >= 55) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getColor(confidence)}`}>
      {confidence}%
    </span>
  );
}
