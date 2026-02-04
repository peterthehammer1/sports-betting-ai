'use client';

import Image from 'next/image';
import { formatAmericanOdds, formatProbability } from '@/lib/utils/odds';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';
import type { NormalizedOdds, NormalizedScore } from '@/types/odds';

interface InjuryInfo {
  totalCount: number;
  homeCount: number;
  awayCount: number;
  hasKeyPlayersOut: boolean;
}

interface GameCardProps {
  game: NormalizedOdds;
  sport: 'NHL' | 'NBA' | 'MLB' | 'EPL' | 'NFL';
  score?: NormalizedScore;
  injuries?: InjuryInfo;
  onSelect?: (gameId: string) => void;
  onPropsSelect?: (gameId: string) => void;
  onAlternateLinesSelect?: (gameId: string) => void;
  onPeriodMarketsSelect?: (gameId: string) => void;
}

export function GameCard({ game, sport, score, injuries, onSelect, onPropsSelect, onAlternateLinesSelect, onPeriodMarketsSelect }: GameCardProps) {
  const gameTime = new Date(game.commenceTime);
  const isToday = gameTime.toDateString() === new Date().toDateString();
  
  const homeML = game.moneyline.bestHome;
  const awayML = game.moneyline.bestAway;
  
  // Find home team spread at consensus line
  const homeSpread = game.spread.home.find(
    (s) => s.point === game.spread.consensusLine
  );
  const awaySpread = game.spread.away.find(
    (s) => Math.abs(s.point) === Math.abs(game.spread.consensusLine || 0)
  );
  
  // Find over/under at consensus line
  const over = game.total.over.find((t) => t.point === game.total.consensusLine);
  const under = game.total.under.find((t) => t.point === game.total.consensusLine);

  // Determine favorite
  const homeFavorite = homeML && awayML ? homeML.americanOdds < awayML.americanOdds : undefined;

  // Get team logos
  const awayLogoUrl = getTeamLogoUrl(game.awayTeam, sport);
  const homeLogoUrl = getTeamLogoUrl(game.homeTeam, sport);

  return (
    <div 
      className="glass-card rounded-xl overflow-hidden cursor-pointer hover-lift active:scale-[0.98] touch-manipulation"
      onClick={() => onSelect?.(game.gameId)}
    >
      {/* Card Content */}
      <div className="p-4">
        {/* Header - Time and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {isToday ? 'Today' : gameTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            {/* Injury Badge */}
            {injuries && injuries.totalCount > 0 && (
              <span 
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  injuries.hasKeyPlayersOut 
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                    : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                }`}
                title={`${injuries.totalCount} injured players (${injuries.awayCount} away, ${injuries.homeCount} home)`}
              >
                🏥 {injuries.totalCount}
              </span>
            )}
          </div>
          {score?.isLive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/20 text-xs font-medium text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Live
            </span>
          ) : score?.isCompleted ? (
            <span className="text-xs font-medium text-slate-500 px-2.5 py-1 rounded-full bg-slate-500/10">Final</span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Open
            </span>
          )}
        </div>

        {/* Matchup */}
        <div className="mb-4 space-y-2">
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <TeamLogo url={awayLogoUrl} teamName={game.awayTeam} />
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className={`text-sm font-medium ${homeFavorite === false ? 'text-white' : 'text-slate-300'}`}>
                {game.awayTeam}
              </span>
              {injuries && injuries.awayCount > 0 && (
                <span className="text-[10px] text-yellow-500/70" title={`${injuries.awayCount} injured`}>
                  🏥{injuries.awayCount}
                </span>
              )}
            </div>
            {score && score.awayScore !== null && (
              <span className={`text-lg font-semibold tabular-nums ${score.isLive ? 'text-white' : 'text-slate-400'}`}>
                {score.awayScore}
              </span>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-3">
            <TeamLogo url={homeLogoUrl} teamName={game.homeTeam} />
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className={`text-sm font-medium ${homeFavorite === true ? 'text-white' : 'text-slate-300'}`}>
                {game.homeTeam}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Home</span>
              {injuries && injuries.homeCount > 0 && (
                <span className="text-[10px] text-yellow-500/70" title={`${injuries.homeCount} injured`}>
                  🏥{injuries.homeCount}
                </span>
              )}
            </div>
            {score && score.homeScore !== null && (
              <span className={`text-lg font-semibold tabular-nums ${score.isLive ? 'text-white' : 'text-slate-400'}`}>
                {score.homeScore}
              </span>
            )}
          </div>
        </div>

        {/* Odds Table - Modern style */}
        <div className="bg-white/5 rounded-xl overflow-hidden mb-4 border border-white/5">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Team</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">ML</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">Spread</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">Total</div>
          </div>
          
          {/* Away Team Row */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2.5 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo url={awayLogoUrl} teamName={game.awayTeam} size="sm" />
              <span className="text-xs text-slate-300 font-medium truncate">
                {getShortName(game.awayTeam)}
              </span>
            </div>
            <OddsCell value={awayML?.americanOdds} />
            <OddsCell value={awaySpread?.americanOdds} point={awaySpread?.point} />
            <OddsCell value={over?.americanOdds} point={over?.point} prefix="O" />
          </div>
          
          {/* Home Team Row */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2.5 items-center hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo url={homeLogoUrl} teamName={game.homeTeam} size="sm" />
              <span className="text-xs text-slate-300 font-medium truncate">
                {getShortName(game.homeTeam)}
              </span>
            </div>
            <OddsCell value={homeML?.americanOdds} />
            <OddsCell value={homeSpread?.americanOdds} point={homeSpread?.point} />
            <OddsCell value={under?.americanOdds} point={under?.point} prefix="U" />
          </div>
        </div>

        {/* Action Buttons - Modern gradient style */}
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(game.gameId);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/20 text-white text-sm font-medium transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🤖</span>
              AI Analysis
            </span>
          </button>
          
          {onPropsSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPropsSelect(game.gameId);
              }}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all"
              title={sport === 'NHL' ? 'Goal Scorer Props' : 'Player Props'}
            >
              {sport === 'NHL' ? '🎯 Goals' : '🎯 Props'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Team Logo Component - Modern with subtle glow
function TeamLogo({ url, teamName, size = 'md' }: { url: string | null; teamName: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-9 h-9';
  const roundingClass = size === 'sm' ? 'rounded' : 'rounded-lg';
  
  if (!url) {
    const initials = teamName.split(' ').map(w => w[0]).join('').substring(0, 2);
    return (
      <div className={`${sizeClasses} ${roundingClass} bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5`}>
        <span className={`font-semibold text-slate-400 ${size === 'sm' ? 'text-[8px]' : 'text-xs'}`}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} ${roundingClass} relative flex-shrink-0 bg-white/5 p-1`}>
      <Image
        src={url}
        alt={teamName}
        fill
        className="object-contain p-0.5"
        unoptimized
      />
    </div>
  );
}

// Get short team name (last word, usually the team name)
function getShortName(fullName: string): string {
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

// Odds Cell Component - Modern with color coding
function OddsCell({ 
  value, 
  point, 
  prefix
}: { 
  value?: number;
  point?: number;
  prefix?: string;
}) {
  if (value === undefined) {
    return <div className="text-center text-xs text-slate-600">—</div>;
  }

  const formattedOdds = formatAmericanOdds(value);
  const isPositive = value > 0;

  return (
    <div className="text-center">
      {point !== undefined && (
        <span className="text-[10px] text-slate-500 mr-0.5">
          {prefix}{point > 0 ? `+${point}` : point}
        </span>
      )}
      <span className={`font-mono text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-slate-300'}`}>
        {formattedOdds}
      </span>
    </div>
  );
}
