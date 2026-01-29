'use client';

import type { GoalScorerAnalysis, GoalScorerPick } from '@/types/prediction';
import type { NormalizedPlayerProp } from '@/types/odds';

interface PlayerPropsCardProps {
  analysis: GoalScorerAnalysis;
  playerProps: {
    firstGoalScorers: NormalizedPlayerProp[];
    anytimeGoalScorers: NormalizedPlayerProp[];
  };
  onClose?: () => void;
}

export function PlayerPropsCard({ analysis, playerProps, onClose }: PlayerPropsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <p className="text-amber-100 text-xs sm:text-sm font-medium">NHL Goal Scorer Analysis</p>
            <h2 className="text-white text-base sm:text-xl font-bold mt-1 truncate">
              {analysis.awayTeam} @ {analysis.homeTeam}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 -mr-1 touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Top Value Bets */}
        {analysis.topValueBets && analysis.topValueBets.length > 0 && (
          <Section title="🔥 Top Value Bets">
            <div className="space-y-3">
              {analysis.topValueBets.map((pick, idx) => (
                <ValuePickCard key={idx} pick={pick} showMarket />
              ))}
            </div>
          </Section>
        )}

        {/* First Goal Scorer Picks */}
        <Section title="🥅 First Goal Scorer Picks">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
            Highest-value picks for scoring the game's first goal
          </p>
          <div className="space-y-2">
            {analysis.firstGoalPicks.map((pick, idx) => (
              <GoalScorerPickCard key={idx} pick={pick} />
            ))}
          </div>
        </Section>

        {/* Anytime Goal Scorer Picks */}
        <Section title="⚡ Anytime Goal Scorer Picks">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
            Best bets to score at any point during the game
          </p>
          <div className="space-y-2">
            {analysis.anytimeGoalPicks.map((pick, idx) => (
              <GoalScorerPickCard key={idx} pick={pick} />
            ))}
          </div>
        </Section>

        {/* Odds Comparison Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Section title="📊 First Goal Odds">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <OddsTable players={playerProps.firstGoalScorers.slice(0, 10)} />
            </div>
          </Section>
          <Section title="📊 Anytime Goal Odds">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <OddsTable players={playerProps.anytimeGoalScorers.slice(0, 10)} />
            </div>
          </Section>
        </div>

        {/* Analysis Notes */}
        {analysis.analysisNotes && analysis.analysisNotes.length > 0 && (
          <Section title="📝 Analysis Notes">
            <ul className="space-y-1.5 sm:space-y-2">
              {analysis.analysisNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Footer */}
        <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 text-center">
            Analysis generated at {new Date(analysis.analyzedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 sm:mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ConfidenceBadge({ 
  confidence, 
  size = 'md' 
}: { 
  confidence: number; 
  size?: 'sm' | 'md' 
}) {
  const getColor = (conf: number) => {
    if (conf >= 70) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (conf >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (conf >= 55) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs' : 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm';

  return (
    <span className={`${getColor(confidence)} ${sizeClasses} rounded-full font-medium whitespace-nowrap`}>
      {confidence}%
    </span>
  );
}

function GoalScorerPickCard({ pick }: { pick: GoalScorerPick }) {
  const formatOdds = (american: number) => 
    american > 0 ? `+${american}` : `${american}`;

  return (
    <div className={`rounded-lg p-2.5 sm:p-3 border ${
      pick.valueBet 
        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
        : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          <span className="text-base sm:text-lg font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">#{pick.rank}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
              {pick.playerName}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {pick.team}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono font-bold text-sm sm:text-base text-gray-900 dark:text-white">
            {formatOdds(pick.bestOdds)}
          </p>
          {pick.valueBet && (
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
              +{(pick.edge * 100).toFixed(1)}% edge
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex-1">
          {pick.reasoning}
        </p>
        <div className="self-start sm:self-center">
          <ConfidenceBadge confidence={pick.confidence} size="sm" />
        </div>
      </div>
    </div>
  );
}

function ValuePickCard({ pick, showMarket }: { pick: GoalScorerPick; showMarket?: boolean }) {
  const formatOdds = (american: number) => 
    american > 0 ? `+${american}` : `${american}`;

  const marketLabel = pick.market === 'first_goal_scorer' ? 'First Goal' : 'Anytime Goal';

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl font-bold text-amber-500 flex-shrink-0">#{pick.rank}</span>
          <div className="min-w-0">
            <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
              {pick.playerName}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {pick.team} {showMarket && `• ${marketLabel}`}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {formatOdds(pick.bestOdds)}
          </p>
          <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold">
            +{(pick.edge * 100).toFixed(1)}% edge
          </p>
        </div>
      </div>
      <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Implied: {(pick.impliedProbability * 100).toFixed(1)}%
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Est: {(pick.estimatedProbability * 100).toFixed(1)}%
        </span>
        <ConfidenceBadge confidence={pick.confidence} size="sm" />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
        {pick.reasoning}
      </p>
    </div>
  );
}

function OddsTable({ players }: { players: NormalizedPlayerProp[] }) {
  const formatOdds = (american: number) => 
    american > 0 ? `+${american}` : `${american}`;

  if (players.length === 0) {
    return (
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
        No odds available
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 min-w-[280px]">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Player
            </th>
            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Odds
            </th>
            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Impl %
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {players.map((player, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                {player.playerName}
              </td>
              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-mono text-right text-gray-900 dark:text-white">
                {player.bestOdds ? formatOdds(player.bestOdds.americanOdds) : '-'}
              </td>
              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-right text-gray-500 dark:text-gray-400">
                {(player.averageImpliedProb * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
