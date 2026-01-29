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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 text-sm font-medium">{prediction.sport} Analysis</p>
            <h2 className="text-white text-xl font-bold mt-1">
              {prediction.awayTeam} @ {prediction.homeTeam}
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
        {/* Winner Prediction */}
        <Section title="🏆 Winner Prediction">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {prediction.winner.pick}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {prediction.winner.reasoning}
              </p>
            </div>
            <ConfidenceBadge confidence={prediction.winner.confidence} />
          </div>
        </Section>

        {/* Score Prediction */}
        <Section title="📊 Predicted Score">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{prediction.awayTeam}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {prediction.score.away}
              </p>
            </div>
            <div className="text-2xl text-gray-400">vs</div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{prediction.homeTeam}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {prediction.score.home}
              </p>
            </div>
            <div className="ml-auto">
              <ConfidenceBadge confidence={prediction.score.confidence} size="sm" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {prediction.score.reasoning}
          </p>
        </Section>

        {/* Spread & Total */}
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="📏 Spread Pick">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {prediction.spread.pick} {prediction.spread.line > 0 ? '+' : ''}{prediction.spread.line}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {prediction.spread.reasoning}
                </p>
              </div>
              <ConfidenceBadge confidence={prediction.spread.confidence} size="sm" />
            </div>
          </Section>

          <Section title="📈 Total Pick">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {prediction.total.pick} {prediction.total.line}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Predicted total: {prediction.total.predictedTotal}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {prediction.total.reasoning}
                </p>
              </div>
              <ConfidenceBadge confidence={prediction.total.confidence} size="sm" />
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
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="🔑 Key Factors">
            <ul className="space-y-2">
              {prediction.keyFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {factor}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="⚠️ Risks">
            <ul className="space-y-2">
              {prediction.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  {risk}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
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

function BestBetCard({ bet }: { bet: RankedBet }) {
  const valueColors = {
    HIGH: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    MEDIUM: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    LOW: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
  };

  return (
    <div className={`border-l-4 ${valueColors[bet.value]} rounded-r-lg p-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-400">#{bet.rank}</span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {bet.pick}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {bet.betType} • {bet.odds > 0 ? '+' : ''}{bet.odds}
            </p>
          </div>
        </div>
        <div className="text-right">
          <ConfidenceBadge confidence={bet.confidence} size="sm" />
          <p className="text-xs text-gray-500 mt-1">{bet.value} value</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
        {bet.reasoning}
      </p>
    </div>
  );
}

function ValueBetCard({ valueBet }: { valueBet: ValueBet }) {
  const edgePercent = (valueBet.edge * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {valueBet.betType}: {valueBet.pick}
          </p>
          <div className="flex items-center gap-4 mt-1 text-xs">
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
        <ConfidenceBadge confidence={valueBet.confidence} size="sm" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
        {valueBet.reasoning}
      </p>
    </div>
  );
}
