'use client';

import type { NbaPlayerPropsAnalysis, NbaPlayerPropPick } from '@/types/prediction';
import type { NormalizedNbaPlayerProp } from '@/types/odds';

interface NbaPlayerPropsCardProps {
  analysis: NbaPlayerPropsAnalysis;
  playerProps: {
    points: NormalizedNbaPlayerProp[];
    rebounds: NormalizedNbaPlayerProp[];
    assists: NormalizedNbaPlayerProp[];
  };
  onClose?: () => void;
}

export function NbaPlayerPropsCard({ analysis, playerProps, onClose }: NbaPlayerPropsCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  NBA
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-orange-200 bg-orange-400/20 rounded-full uppercase tracking-wider">
                  Player Props
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {analysis.awayTeam}
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                @ {analysis.homeTeam}
              </p>
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
        {/* Top Value Bets - Hero Section */}
        {analysis.topValueBets && analysis.topValueBets.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-purple-500/10 border border-orange-500/20 p-5 sm:p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔥</span>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Top Value Picks</h3>
              </div>
              
              <div className="space-y-3">
                {analysis.topValueBets.map((pick, idx) => (
                  <TopValueCard key={idx} pick={pick} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Points Props */}
        <Section title="🏀 Points Props" icon="basketball">
          <p className="text-sm text-gray-400 mb-4">
            Best picks for player scoring totals
          </p>
          <div className="space-y-2">
            {analysis.pointsPicks.map((pick, idx) => (
              <PlayerPropPickCard key={idx} pick={pick} />
            ))}
          </div>
          <div className="mt-4">
            <OddsTable props={playerProps.points.slice(0, 6)} propType="points" />
          </div>
        </Section>

        {/* Rebounds Props */}
        <Section title="📊 Rebounds Props" icon="rebounds">
          <p className="text-sm text-gray-400 mb-4">
            Best picks for player rebound totals
          </p>
          <div className="space-y-2">
            {analysis.reboundsPicks.map((pick, idx) => (
              <PlayerPropPickCard key={idx} pick={pick} />
            ))}
          </div>
          <div className="mt-4">
            <OddsTable props={playerProps.rebounds.slice(0, 6)} propType="rebounds" />
          </div>
        </Section>

        {/* Assists Props */}
        <Section title="🎯 Assists Props" icon="assists">
          <p className="text-sm text-gray-400 mb-4">
            Best picks for player assist totals
          </p>
          <div className="space-y-2">
            {analysis.assistsPicks.map((pick, idx) => (
              <PlayerPropPickCard key={idx} pick={pick} />
            ))}
          </div>
          <div className="mt-4">
            <OddsTable props={playerProps.assists.slice(0, 6)} propType="assists" />
          </div>
        </Section>

        {/* Analysis Notes */}
        {analysis.analysisNotes && analysis.analysisNotes.length > 0 && (
          <Section title="📝 Analysis Notes" icon="notes">
            <ul className="space-y-2">
              {analysis.analysisNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-400 text-xs">•</span>
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center">
            Analysis generated {new Date(analysis.analyzedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function Section({ title, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
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
    <span className={`${getColor(confidence)} ${sizeClasses} rounded-full font-semibold border inline-flex items-center gap-1 whitespace-nowrap`}>
      <span className="stat-number">{confidence}%</span>
    </span>
  );
}

function TopValueCard({ pick }: { pick: NbaPlayerPropPick }) {
  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;
  const propLabels: Record<string, string> = {
    points: 'PTS',
    rebounds: 'REB',
    assists: 'AST',
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/25">
        <span className="text-white font-bold">#{pick.rank}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-white truncate">{pick.playerName}</p>
          <span className="px-1.5 py-0.5 text-[9px] font-bold text-orange-400 bg-orange-500/10 rounded uppercase">
            {propLabels[pick.propType] || pick.propType}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {pick.pick} {pick.line}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-xl font-bold text-white font-mono stat-number">
          {formatOdds(pick.bestOdds)}
        </p>
        <p className="text-xs text-green-400 font-semibold">
          +{(pick.edge * 100).toFixed(1)}% edge
        </p>
      </div>
    </div>
  );
}

function PlayerPropPickCard({ pick }: { pick: NbaPlayerPropPick }) {
  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;
  
  const pickColor = pick.pick === 'OVER' 
    ? 'text-green-400 bg-green-500/10' 
    : 'text-red-400 bg-red-500/10';

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      pick.valueBet 
        ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/30' 
        : 'bg-white/5 border-white/5 hover:border-white/10'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          pick.valueBet ? 'bg-green-500/20' : 'bg-white/10'
        }`}>
          <span className={`text-sm font-bold ${pick.valueBet ? 'text-green-400' : 'text-gray-400'}`}>
            #{pick.rank}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-white">{pick.playerName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${pickColor}`}>
                  {pick.pick} {pick.line}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`font-mono font-bold stat-number ${pick.bestOdds > 0 ? 'text-green-400' : 'text-white'}`}>
                {formatOdds(pick.bestOdds)}
              </p>
              {pick.valueBet && (
                <p className="text-[10px] text-green-400 font-semibold">
                  +{(pick.edge * 100).toFixed(1)}% edge
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <p className="text-sm text-gray-400 flex-1">{pick.reasoning}</p>
            <ConfidenceBadge confidence={pick.confidence} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OddsTable({ props, propType }: { props: NormalizedNbaPlayerProp[]; propType: string }) {
  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;

  if (props.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic py-4 text-center">
        No odds available
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0">
      <div className="overflow-hidden rounded-xl border border-white/5 min-w-[400px] mx-5 sm:mx-0">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Line
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Over
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Under
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {props.map((prop, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-2.5 text-sm text-white truncate max-w-[140px]">
                  {prop.playerName}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-center text-gray-300">
                  {prop.line}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-center stat-number">
                  {prop.bestOver ? (
                    <span className="text-green-400">
                      {formatOdds(prop.bestOver.americanOdds)}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-center stat-number">
                  {prop.bestUnder ? (
                    <span className="text-red-400">
                      {formatOdds(prop.bestUnder.americanOdds)}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
