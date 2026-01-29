'use client';

import { formatAmericanOdds, formatProbability } from '@/lib/utils/odds';
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

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect?.(game.gameId)}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          {sport}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isToday ? 'Today' : gameTime.toLocaleDateString()} •{' '}
          {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      {/* Teams and Odds Grid */}
      <div className="space-y-2">
        {/* Header Row */}
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <div></div>
          <div className="text-center">ML</div>
          <div className="text-center">Spread</div>
          <div className="text-center">Total</div>
        </div>

        {/* Away Team Row */}
        <div className="grid grid-cols-4 gap-2 items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {game.awayTeam}
          </div>
          <OddsCell 
            odds={awayML?.americanOdds} 
            book={awayML?.bookmakerTitle}
          />
          <OddsCell 
            odds={awaySpread?.americanOdds} 
            point={awaySpread?.point}
            book={awaySpread?.bookmakerTitle}
          />
          <OddsCell 
            odds={over?.americanOdds} 
            point={over?.point}
            label="O"
            book={over?.bookmakerTitle}
          />
        </div>

        {/* Home Team Row */}
        <div className="grid grid-cols-4 gap-2 items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {game.homeTeam}
          </div>
          <OddsCell 
            odds={homeML?.americanOdds} 
            book={homeML?.bookmakerTitle}
          />
          <OddsCell 
            odds={homeSpread?.americanOdds} 
            point={homeSpread?.point}
            book={homeSpread?.bookmakerTitle}
          />
          <OddsCell 
            odds={under?.americanOdds} 
            point={under?.point}
            label="U"
            book={under?.bookmakerTitle}
          />
        </div>
      </div>

      {/* Implied Probabilities */}
      {homeML && awayML && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {game.awayTeam}: {formatProbability(awayML.impliedProbability)}
            </span>
            <span>
              {game.homeTeam}: {formatProbability(homeML.impliedProbability)}
            </span>
          </div>
        </div>
      )}

      {/* Goal Scorers Button (NHL only) */}
      {sport === 'NHL' && onPropsSelect && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPropsSelect(game.gameId);
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            🥅 Analyze Goal Scorers
          </button>
        </div>
      )}
    </div>
  );
}

interface OddsCellProps {
  odds?: number;
  point?: number;
  label?: string;
  book?: string;
}

function OddsCell({ odds, point, label, book }: OddsCellProps) {
  if (odds === undefined) {
    return <div className="text-center text-gray-400">—</div>;
  }

  const formattedOdds = formatAmericanOdds(odds);
  const isPositive = odds > 0;

  return (
    <div className="text-center" title={book ? `Best odds at ${book}` : undefined}>
      {point !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
          {label}{point > 0 ? `+${point}` : point}
        </span>
      )}
      <span className={`font-mono text-sm ${
        isPositive 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-gray-900 dark:text-white'
      }`}>
        {formattedOdds}
      </span>
    </div>
  );
}
