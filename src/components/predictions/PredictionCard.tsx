'use client';

import type { GamePrediction, ValueBet, RankedBet } from '@/types/prediction';

interface PredictionCardProps {
  prediction: GamePrediction;
  onClose?: () => void;
}

export function PredictionCard({ prediction, onClose }: PredictionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <p className="text-blue-100 text-xs sm:text-sm font-medium">{prediction.sport} Analysis</p>
            <h2 className="text-white text-base sm:text-xl font-bold mt-1 truncate">
              {prediction.awayTeam} @ {prediction.homeTeam}
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
        {/* Winner Prediction */}
        <Section title="🏆 Winner Prediction">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {prediction.winner.pick}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {prediction.winner.reasoning}
              </p>
            </div>
            <div className="self-start sm:self-center">
              <ConfidenceBadge confidence={prediction.winner.confidence} />
            </div>
          </div>
        </Section>

        {/* Score Prediction */}
        <Section title="📊 Predicted Score">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[80px] sm:max-w-none">{prediction.awayTeam}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {prediction.score.away}
              </p>
            </div>
            <div className="text-xl sm:text-2xl text-gray-400">vs</div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[80px] sm:max-w-none">{prediction.homeTeam}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {prediction.score.home}
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <ConfidenceBadge confidence={prediction.score.confidence} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center sm:text-left">
            {prediction.score.reasoning}
          </p>
        </Section>

        {/* Spread & Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Section title="📏 Spread Pick">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {prediction.spread.pick} {prediction.spread.line > 0 ? '+' : ''}{prediction.spread.line}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {prediction.spread.reasoning}
                </p>
              </div>
              <div className="self-start">
                <ConfidenceBadge confidence={prediction.spread.confidence} size="sm" />
              </div>
            </div>
          </Section>

          <Section title="📈 Total Pick">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {prediction.total.pick} {prediction.total.line}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                  Predicted total: {prediction.total.predictedTotal}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {prediction.total.reasoning}
                </p>
              </div>
              <div className="self-start">
                <ConfidenceBadge confidence={prediction.total.confidence} size="sm" />
              </div>
            </div>
          </Section>
        </div>

        {/* Best Bets */}
        {prediction.bestBets && prediction.bestBets.length > 0 && (
          <Section title="⭐ Best Bets">
            <div className="space-y-3">
              {prediction.bestBets.map((bet, idx) => (
                <BestBetCard key={idx} bet={bet} />
              ))}
            </div>
          </Section>
        )}

        {/* Value Bets */}
        {prediction.valueBets && prediction.valueBets.length > 0 && (
          <Section title="💰 Value Bets">
            <div className="space-y-3">
              {prediction.valueBets.map((vb, idx) => (
                <ValueBetCard key={idx} valueBet={vb} />
              ))}
            </div>
          </Section>
        )}

        {/* Key Factors & Risks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Section title="🔑 Key Factors">
            <ul className="space-y-1.5 sm:space-y-2">
              {prediction.keyFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="⚠️ Risks">
            <ul className="space-y-1.5 sm:space-y-2">
              {prediction.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-yellow-500 mt-0.5 flex-shrink-0">!</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 text-center">
            Analysis generated at {new Date(prediction.analyzedAt).toLocaleString()}
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

function BestBetCard({ bet }: { bet: RankedBet }) {
  const valueColors = {
    HIGH: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    MEDIUM: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    LOW: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
  };

  return (
    <div className={`border-l-4 ${valueColors[bet.value]} rounded-r-lg p-2.5 sm:p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="text-base sm:text-lg font-bold text-gray-400 flex-shrink-0">#{bet.rank}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-words">
              {bet.pick}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {bet.betType} • {bet.odds > 0 ? '+' : ''}{bet.odds}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <ConfidenceBadge confidence={bet.confidence} size="sm" />
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{bet.value} value</p>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
        {bet.reasoning}
      </p>
    </div>
  );
}

function ValueBetCard({ valueBet }: { valueBet: ValueBet }) {
  const edgePercent = (valueBet.edge * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2.5 sm:p-3 border border-green-200 dark:border-green-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
            {valueBet.betType}: {valueBet.pick}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-[10px] sm:text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Book: {(valueBet.bookImpliedProb * 100).toFixed(1)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Est: {(valueBet.claudeEstimatedProb * 100).toFixed(1)}%
            </span>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              +{edgePercent}% edge
            </span>
          </div>
        </div>
        <div className="self-start sm:self-center">
          <ConfidenceBadge confidence={valueBet.confidence} size="sm" />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
        {valueBet.reasoning}
      </p>
    </div>
  );
}
