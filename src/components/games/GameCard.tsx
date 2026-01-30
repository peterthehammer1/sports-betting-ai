'use client';

import Image from 'next/image';
import { formatAmericanOdds, formatProbability } from '@/lib/utils/odds';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';
import type { NormalizedOdds } from '@/types/odds';

interface GameCardProps {
  game: NormalizedOdds;
  sport: 'NHL' | 'NBA';
  onSelect?: (gameId: string) => void;
  onPropsSelect?: (gameId: string) => void;
}

export function GameCard({ game, sport, onSelect, onPropsSelect }: GameCardProps) {
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
      className="group relative glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 active:scale-[0.98] touch-manipulation"
      onClick={() => onSelect?.(game.gameId)}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/50 via-blue-500/50 to-purple-500/50" />
      </div>

      {/* Card Content */}
      <div className="relative p-4 sm:p-5">
        {/* Header - Time and Live indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
              {sport}
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="text-xs text-gray-400">
              {isToday ? 'Today' : gameTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full pulse-glow" />
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Matchup with Logos */}
        <div className="mb-4">
          {/* Away Team */}
          <div className="flex items-center gap-3 py-2">
            <TeamLogo url={awayLogoUrl} teamName={game.awayTeam} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-base font-semibold ${homeFavorite === false ? 'text-white' : 'text-gray-300'}`}>
                  {game.awayTeam}
                </span>
                {homeFavorite === false && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 rounded uppercase">
                    Fav
                  </span>
                )}
              </div>
              {awayML && (
                <span className="text-xs text-gray-500">
                  {formatProbability(awayML.impliedProbability)} implied
                </span>
              )}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] font-bold text-gray-600">@</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-3 py-2">
            <TeamLogo url={homeLogoUrl} teamName={game.homeTeam} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-base font-semibold ${homeFavorite === true ? 'text-white' : 'text-gray-300'}`}>
                  {game.homeTeam}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-gray-500 bg-white/5 rounded uppercase">
                  Home
                </span>
                {homeFavorite === true && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 rounded uppercase">
                    Fav
                  </span>
                )}
              </div>
              {homeML && (
                <span className="text-xs text-gray-500">
                  {formatProbability(homeML.impliedProbability)} implied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Odds Table */}
        <div className="bg-white/5 rounded-xl overflow-hidden mb-4">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2 bg-white/5 border-b border-white/5">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Team</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">ML</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Spread</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Total</div>
          </div>
          
          {/* Away Team Row */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2.5 border-b border-white/5 items-center">
            <div className="flex items-center gap-2">
              <TeamLogo url={awayLogoUrl} teamName={game.awayTeam} size="sm" />
              <span className="text-sm text-gray-300 font-medium">
                {getShortName(game.awayTeam)}
              </span>
            </div>
            <OddsCell value={awayML?.americanOdds} />
            <OddsCell value={awaySpread?.americanOdds} point={awaySpread?.point} />
            <OddsCell value={over?.americanOdds} point={over?.point} prefix="O" />
          </div>
          
          {/* Home Team Row */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2.5 items-center">
            <div className="flex items-center gap-2">
              <TeamLogo url={homeLogoUrl} teamName={game.homeTeam} size="sm" />
              <span className="text-sm text-gray-300 font-medium">
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
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analysis
            </span>
          </button>
          
          {sport === 'NHL' && onPropsSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPropsSelect(game.gameId);
              }}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              🥅
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Team Logo Component
function TeamLogo({ url, teamName, size = 'md' }: { url: string | null; teamName: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-10 h-10';
  
  if (!url) {
    // Fallback to initials
    const initials = teamName.split(' ').map(w => w[0]).join('').substring(0, 2);
    return (
      <div className={`${sizeClasses} rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
        <span className={`font-bold text-gray-400 ${size === 'sm' ? 'text-[8px]' : 'text-xs'}`}>
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
    return <div className="text-center text-sm text-gray-600">—</div>;
  }

  const formattedOdds = formatAmericanOdds(value);
  const isPositive = value > 0;

  return (
    <div className="text-center">
      {point !== undefined && (
        <span className="text-[10px] text-gray-400 mr-0.5">
          {prefix}{point > 0 ? `+${point}` : point}
        </span>
      )}
      <span className={`font-mono text-sm font-semibold stat-number ${isPositive ? 'text-green-400' : 'text-white'}`}>
        {formattedOdds}
      </span>
    </div>
  );
}
