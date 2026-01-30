'use client';

import { useState } from 'react';
import type { NormalizedOdds } from '@/types/odds';

interface OddsCompareProps {
  games: NormalizedOdds[];
  onClose?: () => void;
}

export function OddsCompare({ games, onClose }: OddsCompareProps) {
  const [selectedGame, setSelectedGame] = useState<NormalizedOdds | null>(games[0] || null);
  const [selectedMarket, setSelectedMarket] = useState<'moneyline' | 'spread' | 'total'>('moneyline');

  if (!selectedGame) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-gray-400">No games available for comparison</p>
      </div>
    );
  }

  const getBookmakerData = () => {
    switch (selectedMarket) {
      case 'moneyline':
        const homeML = selectedGame.moneyline.home;
        const awayML = selectedGame.moneyline.away;
        
        // Combine bookmakers
        const mlBooks = new Set([
          ...homeML.map(o => o.bookmakerTitle),
          ...awayML.map(o => o.bookmakerTitle)
        ]);
        
        return Array.from(mlBooks).map(book => {
          const homeOdds = homeML.find(o => o.bookmakerTitle === book);
          const awayOdds = awayML.find(o => o.bookmakerTitle === book);
          return {
            bookmaker: book,
            homeValue: homeOdds?.americanOdds,
            awayValue: awayOdds?.americanOdds,
            homeProb: homeOdds?.impliedProbability,
            awayProb: awayOdds?.impliedProbability,
          };
        });
        
      case 'spread':
        const homeSpread = selectedGame.spread.home;
        const awaySpread = selectedGame.spread.away;
        
        const spreadBooks = new Set([
          ...homeSpread.map(o => o.bookmakerTitle),
          ...awaySpread.map(o => o.bookmakerTitle)
        ]);
        
        return Array.from(spreadBooks).map(book => {
          const homeOdds = homeSpread.find(o => o.bookmakerTitle === book);
          const awayOdds = awaySpread.find(o => o.bookmakerTitle === book);
          return {
            bookmaker: book,
            homeValue: homeOdds?.americanOdds,
            awayValue: awayOdds?.americanOdds,
            homePoint: homeOdds?.point,
            awayPoint: awayOdds?.point,
          };
        });
        
      case 'total':
        const over = selectedGame.total.over;
        const under = selectedGame.total.under;
        
        const totalBooks = new Set([
          ...over.map(o => o.bookmakerTitle),
          ...under.map(o => o.bookmakerTitle)
        ]);
        
        return Array.from(totalBooks).map(book => {
          const overOdds = over.find(o => o.bookmakerTitle === book);
          const underOdds = under.find(o => o.bookmakerTitle === book);
          return {
            bookmaker: book,
            homeValue: overOdds?.americanOdds,
            awayValue: underOdds?.americanOdds,
            line: overOdds?.point || underOdds?.point,
          };
        });
    }
  };

  const bookmakerData = getBookmakerData();
  
  // Find best odds
  const bestHomeIdx = bookmakerData.reduce((best, curr, idx) => 
    (curr.homeValue || -9999) > (bookmakerData[best]?.homeValue || -9999) ? idx : best
  , 0);
  
  const bestAwayIdx = bookmakerData.reduce((best, curr, idx) => 
    (curr.awayValue || -9999) > (bookmakerData[best]?.awayValue || -9999) ? idx : best
  , 0);

  const formatOdds = (value?: number) => {
    if (value === undefined) return '—';
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600" />
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  Tools
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-purple-200 bg-purple-400/20 rounded-full uppercase tracking-wider">
                  Odds Compare
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Line Shopping
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                Compare odds across sportsbooks
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
        {/* Game Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Select Game
          </label>
          <select
            value={selectedGame.gameId}
            onChange={(e) => {
              const game = games.find(g => g.gameId === e.target.value);
              if (game) setSelectedGame(game);
            }}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          >
            {games.map(game => (
              <option key={game.gameId} value={game.gameId} className="bg-gray-900">
                {game.awayTeam} @ {game.homeTeam}
              </option>
            ))}
          </select>
        </div>

        {/* Market Tabs */}
        <div className="flex gap-2">
          {(['moneyline', 'spread', 'total'] as const).map(market => (
            <button
              key={market}
              onClick={() => setSelectedMarket(market)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedMarket === market
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              {market === 'moneyline' ? 'Moneyline' : market === 'spread' ? 'Spread' : 'Total'}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <div className="min-w-[500px] mx-5 sm:mx-0">
            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Sportsbook
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {selectedMarket === 'total' ? 'Over' : selectedGame.awayTeam.split(' ').pop()}
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {selectedMarket === 'total' ? 'Under' : selectedGame.homeTeam.split(' ').pop()}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookmakerData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {row.bookmaker}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono text-sm stat-number ${
                        idx === bestAwayIdx ? 'text-green-400 font-bold' : 'text-gray-300'
                      }`}>
                        {selectedMarket === 'spread' && (row as { awayPoint?: number }).awayPoint !== undefined && (
                          <span className="text-gray-500 mr-1 text-xs">
                            {(row as { awayPoint?: number }).awayPoint! > 0 ? '+' : ''}{(row as { awayPoint?: number }).awayPoint}
                          </span>
                        )}
                        {selectedMarket === 'total' && (row as { line?: number }).line && (
                          <span className="text-gray-500 mr-1 text-xs">
                            O{(row as { line?: number }).line}
                          </span>
                        )}
                        {formatOdds(row.awayValue)}
                        {idx === bestAwayIdx && <span className="ml-1 text-[10px]">✓</span>}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono text-sm stat-number ${
                        idx === bestHomeIdx ? 'text-green-400 font-bold' : 'text-gray-300'
                      }`}>
                        {selectedMarket === 'spread' && (row as { homePoint?: number }).homePoint !== undefined && (
                          <span className="text-gray-500 mr-1 text-xs">
                            {(row as { homePoint?: number }).homePoint! > 0 ? '+' : ''}{(row as { homePoint?: number }).homePoint}
                          </span>
                        )}
                        {selectedMarket === 'total' && (row as { line?: number }).line && (
                          <span className="text-gray-500 mr-1 text-xs">
                            U{(row as { line?: number }).line}
                          </span>
                        )}
                        {formatOdds(row.homeValue)}
                        {idx === bestHomeIdx && <span className="ml-1 text-[10px]">✓</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Best Odds Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-gray-400 mb-1">
              Best {selectedMarket === 'total' ? 'Over' : selectedGame.awayTeam.split(' ').pop()}
            </p>
            <p className="text-xl font-bold text-green-400 stat-number">
              {formatOdds(bookmakerData[bestAwayIdx]?.awayValue)}
            </p>
            <p className="text-xs text-gray-500">
              {bookmakerData[bestAwayIdx]?.bookmaker}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-gray-400 mb-1">
              Best {selectedMarket === 'total' ? 'Under' : selectedGame.homeTeam.split(' ').pop()}
            </p>
            <p className="text-xl font-bold text-green-400 stat-number">
              {formatOdds(bookmakerData[bestHomeIdx]?.homeValue)}
            </p>
            <p className="text-xs text-gray-500">
              {bookmakerData[bestHomeIdx]?.bookmaker}
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <p className="text-sm text-purple-300">
            💡 <strong>Pro Tip:</strong> Always shop for the best odds. Even small differences can significantly impact your long-term profits.
          </p>
        </div>
      </div>
    </div>
  );
}
