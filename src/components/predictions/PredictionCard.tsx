'use client';

import type { GamePrediction, ValueBet, RankedBet } from '@/types/prediction';
import { TeamLogo } from '@/components/ui/TeamLogo';

interface PredictionCardProps {
  prediction: GamePrediction;
  onClose?: () => void;
}

export function PredictionCard({ prediction, onClose }: PredictionCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  {prediction.sport}
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-slate-300 bg-slate-500/20 rounded-full uppercase tracking-wider">
                  AI Analysis
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <TeamLogo 
                  teamName={prediction.awayTeam} 
                  sport={prediction.sport.toLowerCase() as 'nba' | 'nhl'} 
                  size="lg" 
                />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {prediction.awayTeam}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                <span>@</span>
                <TeamLogo 
                  teamName={prediction.homeTeam} 
                  sport={prediction.sport.toLowerCase() as 'nba' | 'nhl'} 
                  size="sm" 
                />
                <span>{prediction.homeTeam}</span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Winner Prediction - Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-5 sm:p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏆</span>
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Winner Prediction</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {prediction.winner.pick}
                </p>
                <p className="text-sm text-gray-400 mt-2 max-w-md">
                  {prediction.winner.reasoning}
                </p>
              </div>
              <ConfidenceRing confidence={prediction.winner.confidence} />
            </div>
          </div>
        </div>

        {/* Score Prediction */}
        <Section title="📊 Predicted Score" icon="score">
          <div className="flex items-center justify-center gap-6 sm:gap-10 py-4">
            <ScoreTeam team={prediction.awayTeam} score={prediction.score.away} sport={prediction.sport} />
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Final</span>
              <span className="text-2xl font-bold text-gray-500">—</span>
            </div>
            <ScoreTeam team={prediction.homeTeam} score={prediction.score.home} isHome sport={prediction.sport} />
          </div>
          <div className="text-center">
            <ConfidenceBadge confidence={prediction.score.confidence} />
            <p className="text-sm text-gray-400 mt-2">{prediction.score.reasoning}</p>
          </div>
        </Section>

        {/* Spread & Total Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <BetCard
            icon="📏"
            title="Spread Pick"
            pick={`${prediction.spread.pick} ${prediction.spread.line > 0 ? '+' : ''}${prediction.spread.line}`}
            reasoning={prediction.spread.reasoning}
            confidence={prediction.spread.confidence}
          />
          <BetCard
            icon="📈"
            title="Total Pick"
            pick={`${prediction.total.pick} ${prediction.total.line}`}
            subtitle={`Predicted: ${prediction.total.predictedTotal}`}
            reasoning={prediction.total.reasoning}
            confidence={prediction.total.confidence}
          />
        </div>

        {/* Best Bets */}
        {prediction.bestBets && prediction.bestBets.length > 0 && (
          <Section title="⭐ Best Bets" icon="star">
            <div className="space-y-3">
              {prediction.bestBets.map((bet, idx) => (
                <BestBetCard key={idx} bet={bet} />
              ))}
            </div>
          </Section>
        )}

        {/* Value Bets */}
        {prediction.valueBets && prediction.valueBets.length > 0 && (
          <Section title="💰 Value Bets" icon="money">
            <div className="space-y-3">
              {prediction.valueBets.map((vb, idx) => (
                <ValueBetCard key={idx} valueBet={vb} />
              ))}
            </div>
          </Section>
        )}

        {/* Key Factors & Risks */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InsightCard
            title="🔑 Key Factors"
            items={prediction.keyFactors}
            type="positive"
          />
          <InsightCard
            title="⚠️ Risks"
            items={prediction.risks}
            type="warning"
          />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center">
            Analysis generated {new Date(prediction.analyzedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function Section({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ConfidenceRing({ confidence }: { confidence: number }) {
  const getColor = (conf: number) => {
    if (conf >= 70) return { ring: 'stroke-green-400', bg: 'text-green-400', glow: 'shadow-green-500/30' };
    if (conf >= 60) return { ring: 'stroke-cyan-400', bg: 'text-cyan-400', glow: 'shadow-cyan-500/30' };
    if (conf >= 55) return { ring: 'stroke-amber-400', bg: 'text-amber-400', glow: 'shadow-amber-500/30' };
    return { ring: 'stroke-gray-400', bg: 'text-gray-400', glow: '' };
  };

  const colors = getColor(confidence);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className={`relative w-20 h-20 sm:w-24 sm:h-24 ${colors.glow} shadow-lg rounded-full`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
        <circle
          cx="40" cy="40" r="36" fill="none" strokeWidth="4"
          className={colors.ring}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl sm:text-2xl font-bold ${colors.bg} stat-number`}>{confidence}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Conf</span>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence, size = 'md' }: { confidence: number; size?: 'sm' | 'md' }) {
  const getColor = (conf: number) => {
    if (conf >= 70) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (conf >= 60) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    if (conf >= 55) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs';

  return (
    <span className={`${getColor(confidence)} ${sizeClasses} rounded-full font-semibold border inline-flex items-center gap-1`}>
      <span className="stat-number">{confidence}%</span>
      <span className="opacity-60">conf</span>
    </span>
  );
}

function ScoreTeam({ team, score, isHome, sport }: { team: string; score: number; isHome?: boolean; sport?: string }) {
  return (
    <div className="text-center">
      <div className="flex flex-col items-center gap-1">
        <TeamLogo teamName={team} sport={(sport?.toLowerCase() || 'nba') as 'nba' | 'nhl'} size="md" />
        <p className="text-xs text-gray-500 truncate max-w-[100px]">{team.split(' ').pop()}</p>
      </div>
      <p className="text-4xl sm:text-5xl font-bold text-white mt-1 stat-number">{score}</p>
      {isHome && <p className="text-[10px] text-gray-500 mt-1">HOME</p>}
    </div>
  );
}

function BetCard({ icon, title, pick, subtitle, reasoning, confidence }: {
  icon: string;
  title: string;
  pick: string;
  subtitle?: string;
  reasoning: string;
  confidence: number;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-lg font-semibold text-white">{pick}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          <p className="text-sm text-gray-400 mt-2">{reasoning}</p>
        </div>
        <ConfidenceBadge confidence={confidence} size="sm" />
      </div>
    </div>
  );
}

function BestBetCard({ bet }: { bet: RankedBet }) {
  const valueColors = {
    HIGH: { bg: 'bg-green-500/10', border: 'border-green-500/30', accent: 'text-green-400', badge: 'bg-green-500/20' },
    MEDIUM: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', accent: 'text-cyan-400', badge: 'bg-cyan-500/20' },
    LOW: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', accent: 'text-gray-400', badge: 'bg-gray-500/20' },
  };

  const colors = valueColors[bet.value];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${colors.badge} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-sm font-bold ${colors.accent}`}>#{bet.rank}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white">{bet.pick}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {bet.betType} • <span className={bet.odds > 0 ? 'text-green-400' : ''}>{bet.odds > 0 ? '+' : ''}{bet.odds}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <ConfidenceBadge confidence={bet.confidence} size="sm" />
              <span className={`text-[10px] font-semibold ${colors.accent} uppercase`}>{bet.value}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">{bet.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

function ValueBetCard({ valueBet }: { valueBet: ValueBet }) {
  const edgePercent = (valueBet.edge * 100).toFixed(1);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-4">
      <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold text-white">
              {valueBet.betType}: {valueBet.pick}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <StatPill label="Book" value={`${(valueBet.bookImpliedProb * 100).toFixed(1)}%`} />
              <StatPill label="Est" value={`${(valueBet.claudeEstimatedProb * 100).toFixed(1)}%`} />
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                +{edgePercent}% edge
              </span>
            </div>
          </div>
          <ConfidenceBadge confidence={valueBet.confidence} size="sm" />
        </div>
        <p className="text-sm text-gray-400 mt-3">{valueBet.reasoning}</p>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs text-gray-400">
      <span className="text-gray-500">{label}:</span> <span className="text-gray-300 stat-number">{value}</span>
    </span>
  );
}

function InsightCard({ title, items, type }: { title: string; items: string[]; type: 'positive' | 'warning' }) {
  const styles = {
    positive: { icon: '✓', iconColor: 'text-green-400', bg: 'bg-green-500/10' },
    warning: { icon: '!', iconColor: 'text-amber-400', bg: 'bg-amber-500/10' },
  };

  const style = styles[type];

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
            <span className={`w-5 h-5 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <span className={`text-xs ${style.iconColor}`}>{style.icon}</span>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
