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
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-amber-100 text-sm font-medium">NHL Goal Scorer Analysis</p>
            <h2 className="text-white text-xl font-bold mt-1">
              {analysis.awayTeam} @ {analysis.homeTeam}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Best bets to score at any point during the game
          </p>
          <div className="space-y-2">
            {analysis.anytimeGoalPicks.map((pick, idx) => (
              <GoalScorerPickCard key={idx} pick={pick} />
            ))}
          </div>
        </Section>

        {/* Odds Comparison Tables */}
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="📊 First Goal Odds">
            <OddsTable players={playerProps.firstGoalScorers.slice(0, 10)} />
          </Section>
          <Section title="📊 Anytime Goal Odds">
            <OddsTable players={playerProps.anytimeGoalScorers.slice(0, 10)} />
          </Section>
        </div>

        {/* Analysis Notes */}
        {analysis.analysisNotes && analysis.analysisNotes.length > 0 && (
          <Section title="📝 Analysis Notes">
            <ul className="space-y-2">
              {analysis.analysisNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
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
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
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

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`${getColor(confidence)} ${sizeClasses} rounded-full font-medium`}>
      {confidence}% conf
    </span>
  );
}

function GoalScorerPickCard({ pick }: { pick: GoalScorerPick }) {
  const formatOdds = (american: number) => 
    american > 0 ? `+${american}` : `${american}`;

  return (
    <div className={`rounded-lg p-3 border ${
      pick.valueBet 
        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
        : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-400 dark:text-gray-500">#{pick.rank}</span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {pick.playerName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {pick.team}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-gray-900 dark:text-white">
            {formatOdds(pick.bestOdds)}
          </p>
          {pick.valueBet && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              +{(pick.edge * 100).toFixed(1)}% edge
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
          {pick.reasoning}
        </p>
        <div className="ml-3">
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
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-amber-500">#{pick.rank}</span>
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {pick.playerName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pick.team} {showMarket && `• ${marketLabel}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-bold text-gray-900 dark:text-white">
            {formatOdds(pick.bestOdds)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
            +{(pick.edge * 100).toFixed(1)}% edge
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Implied: {(pick.impliedProbability * 100).toFixed(1)}%
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Estimated: {(pick.estimatedProbability * 100).toFixed(1)}%
        </span>
        <ConfidenceBadge confidence={pick.confidence} size="sm" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
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
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        No odds available
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Player
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Best Odds
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Impl %
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {players.map((player, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                {player.playerName}
              </td>
              <td className="px-3 py-2 text-sm font-mono text-right text-gray-900 dark:text-white">
                {player.bestOdds ? formatOdds(player.bestOdds.americanOdds) : '-'}
              </td>
              <td className="px-3 py-2 text-sm text-right text-gray-500 dark:text-gray-400">
                {(player.averageImpliedProb * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
