'use client';

import Image from 'next/image';
import { formatAmericanOdds, formatProbability } from '@/lib/utils/odds';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';
import type { NormalizedOdds, NormalizedScore } from '@/types/odds';

interface GameCardProps {
  game: NormalizedOdds;
  sport: 'NHL' | 'NBA';
  score?: NormalizedScore;
  onSelect?: (gameId: string) => void;
  onPropsSelect?: (gameId: string) => void;
}

export function GameCard({ game, sport, score, onSelect, onPropsSelect }: GameCardProps) {
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
      className="bg-[#161d29] border border-slate-700/40 rounded-lg overflow-hidden cursor-pointer transition-all hover:border-slate-600/60 active:scale-[0.99] touch-manipulation"
      onClick={() => onSelect?.(game.gameId)}
    >
      {/* Card Content */}
      <div className="p-4">
        {/* Header - Time and Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400">
            {isToday ? 'Today' : gameTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
          {score?.isLive ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#9e7a7a]">
              <span className="w-1.5 h-1.5 bg-[#9e5a5a] rounded-full animate-pulse" />
              Live
            </span>
          ) : score?.isCompleted ? (
            <span className="text-xs font-medium text-slate-500">Final</span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#5a9a7e]">
              <span className="w-1.5 h-1.5 bg-[#4a8a6e] rounded-full" />
              Open
            </span>
          )}
        </div>

        {/* Matchup */}
        <div className="mb-4 space-y-2">
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <TeamLogo url={awayLogoUrl} teamName={game.awayTeam} />
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${homeFavorite === false ? 'text-white' : 'text-slate-300'}`}>
                {game.awayTeam}
              </span>
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
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${homeFavorite === true ? 'text-white' : 'text-slate-300'}`}>
                {game.homeTeam}
              </span>
              <span className="ml-2 text-[10px] text-slate-500 uppercase">Home</span>
            </div>
            {score && score.homeScore !== null && (
              <span className={`text-lg font-semibold tabular-nums ${score.isLive ? 'text-white' : 'text-slate-400'}`}>
                {score.homeScore}
              </span>
            )}
          </div>
        </div>

        {/* Odds Table */}
        <div className="bg-slate-900/50 rounded-lg overflow-hidden mb-4">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b border-slate-700/50">
            <div className="text-[10px] font-medium text-slate-500 uppercase">Team</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase text-center">ML</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase text-center">Spread</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase text-center">Total</div>
          </div>
          
          {/* Away Team Row */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b border-slate-700/30 items-center">
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
          <div className="grid grid-cols-4 gap-1 px-3 py-2 items-center">
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(game.gameId);
            }}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#2a3444] hover:bg-[#3a4454] text-slate-200 text-sm font-medium transition-colors"
          >
            AI Analysis
          </button>
          
          {onPropsSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPropsSelect(game.gameId);
              }}
              className="py-2.5 px-4 rounded-lg bg-[#1e2836] hover:bg-[#2a3444] text-slate-300 text-sm font-medium transition-colors"
              title={sport === 'NHL' ? 'Goal Scorer Props' : 'Player Props'}
            >
              {sport === 'NHL' ? 'Goals' : 'Props'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Team Logo Component
function TeamLogo({ url, teamName, size = 'md' }: { url: string | null; teamName: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  
  if (!url) {
    const initials = teamName.split(' ').map(w => w[0]).join('').substring(0, 2);
    return (
      <div className={`${sizeClasses} rounded bg-slate-700 flex items-center justify-center flex-shrink-0`}>
        <span className={`font-medium text-slate-400 ${size === 'sm' ? 'text-[8px]' : 'text-xs'}`}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} relative flex-shrink-0`}>
      <Image
        src={url}
        alt={teamName}
        fill
        className="object-contain"
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

// Odds Cell Component
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
      <span className={`font-mono text-xs font-medium ${isPositive ? 'text-[#5a9a7e]' : 'text-slate-300'}`}>
        {formattedOdds}
      </span>
    </div>
  );
}
