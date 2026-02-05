'use client';

import type { GamePrediction, ValueBet, RankedBet } from '@/types/prediction';
import { TeamLogo } from '@/components/ui/TeamLogo';

interface PredictionCardProps {
  prediction: GamePrediction;
  onClose?: () => void;
}

export function PredictionCard({ prediction, onClose }: PredictionCardProps) {
  const isHomePick = prediction.winner.pick === prediction.homeTeam;
  
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden max-w-2xl mx-auto">
      {/* Compact Header */}
      <div className="bg-slate-900/50 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded uppercase">
            {prediction.sport}
          </span>
          <span className="text-xs text-slate-500">AI Analysis</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Matchup - Equal sizing for both teams */}
      <div className="bg-slate-900/30 px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between gap-4">
          <TeamDisplay 
            team={prediction.awayTeam} 
            sport={prediction.sport} 
            isPick={!isHomePick}
          />
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-slate-600">@</span>
          </div>
          <TeamDisplay 
            team={prediction.homeTeam} 
            sport={prediction.sport} 
            isPick={isHomePick}
            isHome
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Winner Pick - Clear and prominent */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <span className="text-lg">🏆</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Pete&apos;s Pick</p>
                <p className="text-xl font-bold text-white">{prediction.winner.pick}</p>
              </div>
            </div>
            <ConfidenceCircle confidence={prediction.winner.confidence} />
          </div>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">{prediction.winner.reasoning}</p>
        </div>

        {/* Predicted Score - Compact */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Predicted Score</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <TeamLogo teamName={prediction.awayTeam} sport={prediction.sport.toLowerCase() as 'nba' | 'nhl'} size="sm" />
              <p className="text-2xl font-bold text-white mt-1">{prediction.score.away}</p>
            </div>
            <span className="text-slate-600 font-medium">-</span>
            <div className="text-center">
              <TeamLogo teamName={prediction.homeTeam} sport={prediction.sport.toLowerCase() as 'nba' | 'nhl'} size="sm" />
              <p className="text-2xl font-bold text-white mt-1">{prediction.score.home}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center mt-2">{prediction.score.confidence}% conf</p>
        </div>

        {/* Spread & Total - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          <CompactBetCard
            label="Spread"
            pick={`${prediction.spread.pick} ${prediction.spread.line > 0 ? '+' : ''}${prediction.spread.line}`}
            confidence={prediction.spread.confidence}
            reasoning={prediction.spread.reasoning}
          />
          <CompactBetCard
            label="Total"
            pick={`${prediction.total.pick} ${prediction.total.line}`}
            confidence={prediction.total.confidence}
            reasoning={prediction.total.reasoning}
            subtitle={`Proj: ${prediction.total.predictedTotal}`}
          />
        </div>

        {/* Best Bets - Compact list */}
        {prediction.bestBets && prediction.bestBets.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top Bets</p>
            <div className="space-y-2">
              {prediction.bestBets.slice(0, 3).map((bet, idx) => (
                <CompactBestBet key={idx} bet={bet} />
              ))}
            </div>
          </div>
        )}

        {/* Value Bets - Compact */}
        {prediction.valueBets && prediction.valueBets.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Value Bets</p>
            <div className="space-y-2">
              {prediction.valueBets.slice(0, 2).map((vb, idx) => (
                <CompactValueBet key={idx} valueBet={vb} />
              ))}
            </div>
          </div>
        )}

        {/* Key Factors & Risks - Collapsible style */}
        <div className="grid grid-cols-2 gap-3">
          <CompactInsights title="Key Factors" items={prediction.keyFactors} type="positive" />
          <CompactInsights title="Risks" items={prediction.risks} type="warning" />
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-600 text-center pt-2 border-t border-slate-700/50">
          Analysis generated {new Date(prediction.analyzedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Sub-components

function TeamDisplay({ team, sport, isPick, isHome }: { 
  team: string; 
  sport: string; 
  isPick: boolean;
  isHome?: boolean;
}) {
  const teamName = team.split(' ').pop() || team;
  
  return (
    <div className={`flex-1 flex items-center gap-2 ${isHome ? 'flex-row-reverse text-right' : ''}`}>
      <div className={`relative ${isPick ? 'ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-slate-900 rounded-full' : ''}`}>
        <TeamLogo 
          teamName={team} 
          sport={sport.toLowerCase() as 'nba' | 'nhl'} 
          size="md" 
        />
        {isPick && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white">✓</span>
          </span>
        )}
      </div>
      <div>
        <p className={`font-semibold ${isPick ? 'text-emerald-400' : 'text-white'}`}>{teamName}</p>
        {isHome && <p className="text-[10px] text-slate-600 uppercase">Home</p>}
      </div>
    </div>
  );
}

function ConfidenceCircle({ confidence }: { confidence: number }) {
  const getColor = (conf: number) => {
    if (conf >= 70) return { ring: 'text-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
    if (conf >= 60) return { ring: 'text-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400' };
    if (conf >= 55) return { ring: 'text-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' };
    return { ring: 'text-slate-500', bg: 'bg-slate-700', text: 'text-slate-400' };
  };

  const colors = getColor(confidence);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className={`relative w-14 h-14 ${colors.bg} rounded-full`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
        <circle
          cx="22" cy="22" r="18" fill="none" strokeWidth="3"
          className={colors.ring}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${colors.text}`}>{confidence}</span>
      </div>
    </div>
  );
}

function CompactBetCard({ label, pick, confidence, reasoning, subtitle }: {
  label: string;
  pick: string;
  confidence: number;
  reasoning: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
        <span className="text-xs text-slate-500">{confidence}%</span>
      </div>
      <p className="font-semibold text-white">{pick}</p>
      {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{reasoning}</p>
    </div>
  );
}

function CompactBestBet({ bet }: { bet: RankedBet }) {
  const valueColor = {
    HIGH: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    MEDIUM: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    LOW: 'bg-slate-700 text-slate-400 border border-slate-600',
  }[bet.value];

  return (
    <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
      <span className={`w-6 h-6 rounded-full ${valueColor} flex items-center justify-center text-xs font-bold`}>
        {bet.rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">{bet.pick}</p>
        <p className="text-[10px] text-slate-500">
          {bet.betType} • {bet.odds > 0 ? '+' : ''}{bet.odds} • {bet.confidence}% conf
        </p>
      </div>
    </div>
  );
}

function CompactValueBet({ valueBet }: { valueBet: ValueBet }) {
  const edgePercent = (valueBet.edge * 100).toFixed(1);

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-white text-sm">{valueBet.betType}: {valueBet.pick}</p>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
          +{edgePercent}% edge
        </span>
      </div>
      <p className="text-[10px] text-slate-500 mt-1">
        Book: {(valueBet.bookImpliedProb * 100).toFixed(0)}% → Est: {(valueBet.claudeEstimatedProb * 100).toFixed(0)}% • {valueBet.confidence}% conf
      </p>
    </div>
  );
}

function CompactInsights({ title, items, type }: { title: string; items: string[]; type: 'positive' | 'warning' }) {
  const styles = {
    positive: { icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    warning: { icon: '!', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  };
  const style = styles[type];

  return (
    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{title}</p>
      <ul className="space-y-1">
        {items.slice(0, 3).map((item, idx) => (
          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-400">
            <span className={`w-4 h-4 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <span className={`text-[8px] ${style.color}`}>{style.icon}</span>
            </span>
            <span className="line-clamp-2">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
