'use client';

import Image from 'next/image';
import type { NbaPlayerPropsAnalysis, NbaPlayerPropPick } from '@/types/prediction';
import type { NormalizedNbaPlayerProp } from '@/types/odds';
import { getNbaTeam, getPlayerInitials, getPlayerNumber } from '@/lib/utils/teams';

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
  const homeTeam = getNbaTeam(analysis.homeTeam);
  const awayTeam = getNbaTeam(analysis.awayTeam);

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header with Team Colors */}
      <div className="relative overflow-hidden">
        {/* Team gradient background (muted) */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, ${awayTeam.primary} 0%, ${homeTeam.primary} 100%)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        
        <div className="relative px-4 sm:px-5 py-4 sm:py-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Team Logos */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {awayTeam.logo && (
                  <Image
                    src={awayTeam.logo}
                    alt={analysis.awayTeam}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                    unoptimized
                  />
                )}
                <span className="text-slate-500 text-sm font-medium">@</span>
                {homeTeam.logo && (
                  <Image
                    src={homeTeam.logo}
                    alt={analysis.homeTeam}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                    unoptimized
                  />
                )}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-700/50 rounded uppercase tracking-wider">
                    NBA
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-blue-400 bg-blue-500/10 rounded uppercase tracking-wider">
                    Player Props
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                  {analysis.awayTeam.split(' ').pop()} @ {analysis.homeTeam.split(' ').pop()}
                </h2>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Top Value Bets */}
        {analysis.topValueBets && analysis.topValueBets.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-400">★</span>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Value Picks</h3>
            </div>
            
            <div className="space-y-3">
              {analysis.topValueBets.map((pick, idx) => (
                <TopValueCard 
                  key={idx} 
                  pick={pick} 
                  homeTeam={analysis.homeTeam}
                  awayTeam={analysis.awayTeam}
                />
              ))}
            </div>
          </div>
        )}

        {/* Points Props */}
        <Section title="Points Props">
          <p className="text-sm text-slate-500 mb-4">
            Scoring totals analysis
          </p>
          <div className="space-y-2">
            {analysis.pointsPicks.map((pick, idx) => (
              <PlayerPropPickCard 
                key={idx} 
                pick={pick}
                homeTeam={analysis.homeTeam}
                awayTeam={analysis.awayTeam}
              />
            ))}
          </div>
          <div className="mt-4">
            <OddsTable props={playerProps.points.slice(0, 6)} propType="points" />
          </div>
        </Section>

        {/* Rebounds Props */}
        <Section title="Rebounds Props">
          <p className="text-sm text-slate-500 mb-4">
            Rebound totals analysis
          </p>
          <div className="space-y-2">
            {analysis.reboundsPicks.map((pick, idx) => (
              <PlayerPropPickCard 
                key={idx} 
                pick={pick}
                homeTeam={analysis.homeTeam}
                awayTeam={analysis.awayTeam}
              />
            ))}
          </div>
          <div className="mt-4">
            <OddsTable props={playerProps.rebounds.slice(0, 6)} propType="rebounds" />
          </div>
        </Section>

        {/* Assists Props */}
        <Section title="Assists Props">
          <p className="text-sm text-slate-500 mb-4">
            Assist totals analysis
          </p>
          <div className="space-y-2">
            {analysis.assistsPicks.map((pick, idx) => (
              <PlayerPropPickCard 
                key={idx} 
                pick={pick}
                homeTeam={analysis.homeTeam}
                awayTeam={analysis.awayTeam}
              />
            ))}
          </div>
          <div className="mt-4">
            <OddsTable props={playerProps.assists.slice(0, 6)} propType="assists" />
          </div>
        </Section>

        {/* Analysis Notes */}
        {analysis.analysisNotes && analysis.analysisNotes.length > 0 && (
          <Section title="Analysis Notes">
            <ul className="space-y-2">
              {analysis.analysisNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-700/30">
          <p className="text-xs text-slate-600 text-center">
            Analysis generated {new Date(analysis.analyzedAt).toLocaleString()}
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
      <h3 className="text-sm font-semibold text-slate-300 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ConfidenceBadge({ confidence, size = 'md' }: { confidence: number; size?: 'sm' | 'md' }) {
  const getColor = (conf: number) => {
    if (conf >= 70) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (conf >= 60) return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    if (conf >= 55) return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-slate-600/20 text-slate-400 border-slate-600/20';
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`${getColor(confidence)} ${sizeClasses} rounded font-semibold border inline-flex items-center whitespace-nowrap`}>
      {confidence}%
    </span>
  );
}

function PlayerAvatar({ playerName, teamName }: { playerName: string; teamName: string }) {
  const team = getNbaTeam(teamName);
  const initials = getPlayerInitials(playerName);
  const number = getPlayerNumber(playerName);

  return (
    <div className="relative flex-shrink-0">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${team.primary}20` }}
      >
        <span 
          className="text-sm font-bold"
          style={{ color: team.primary }}
        >
          {initials}
        </span>
      </div>
      {number && (
        <div 
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ backgroundColor: team.primary }}
        >
          {number}
        </div>
      )}
    </div>
  );
}

function TopValueCard({ pick, homeTeam, awayTeam }: { pick: NbaPlayerPropPick; homeTeam: string; awayTeam: string }) {
  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;
  const propLabels: Record<string, string> = {
    points: 'PTS',
    rebounds: 'REB',
    assists: 'AST',
  };
  
  // Determine player's team (simplified - in real app would need actual data)
  const playerTeam = homeTeam; // Would need actual team data

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
      <PlayerAvatar playerName={pick.playerName} teamName={playerTeam} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-white truncate">{pick.playerName}</p>
          <span className="px-1.5 py-0.5 text-[9px] font-semibold text-blue-400 bg-blue-500/10 rounded uppercase">
            {propLabels[pick.propType] || pick.propType}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {pick.pick} {pick.line}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-lg font-bold font-mono ${pick.bestOdds > 0 ? 'text-emerald-400' : 'text-white'}`}>
          {formatOdds(pick.bestOdds)}
        </p>
        <p className="text-[10px] text-emerald-400 font-medium">
          +{(pick.edge * 100).toFixed(1)}% edge
        </p>
      </div>
    </div>
  );
}

function PlayerPropPickCard({ pick, homeTeam, awayTeam }: { pick: NbaPlayerPropPick; homeTeam: string; awayTeam: string }) {
  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;
  const playerTeam = homeTeam; // Would need actual team data
  
  const pickColor = pick.pick === 'OVER' 
    ? 'text-emerald-400 bg-emerald-500/10' 
    : 'text-rose-400 bg-rose-500/10';

  return (
    <div className={`p-3 rounded-lg border transition-colors ${
      pick.valueBet 
        ? 'bg-emerald-500/5 border-emerald-500/20' 
        : 'bg-slate-900/30 border-slate-700/30'
    }`}>
      <div className="flex items-start gap-3">
        <PlayerAvatar playerName={pick.playerName} teamName={playerTeam} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-white">{pick.playerName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${pickColor}`}>
                  {pick.pick} {pick.line}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`font-mono font-bold ${pick.bestOdds > 0 ? 'text-emerald-400' : 'text-white'}`}>
                {formatOdds(pick.bestOdds)}
              </p>
              {pick.valueBet && (
                <p className="text-[10px] text-emerald-400 font-medium">
                  +{(pick.edge * 100).toFixed(1)}% edge
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <p className="text-sm text-slate-400 flex-1">{pick.reasoning}</p>
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
      <p className="text-sm text-slate-600 italic py-4 text-center">
        No odds available
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="overflow-hidden rounded-lg border border-slate-700/30 min-w-[360px] mx-4 sm:mx-0">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Line
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Over
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Under
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {props.map((prop, idx) => (
              <tr key={idx} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-3 py-2.5 text-sm text-white truncate max-w-[140px]">
                  {prop.playerName}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-center text-slate-400">
                  {prop.line}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-center">
                  {prop.bestOver ? (
                    <span className="text-emerald-400">
                      {formatOdds(prop.bestOver.americanOdds)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono text-center">
                  {prop.bestUnder ? (
                    <span className="text-rose-400">
                      {formatOdds(prop.bestUnder.americanOdds)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
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
