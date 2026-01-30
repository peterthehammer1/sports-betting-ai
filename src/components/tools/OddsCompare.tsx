'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { NormalizedOdds } from '@/types/odds';

interface OddsCompareProps {
  games: NormalizedOdds[];
  onClose?: () => void;
}

// Sportsbook logo/branding info
const SPORTSBOOK_LOGOS: Record<string, { logo: string; color: string; shortName: string }> = {
  'FanDuel': { 
    logo: '/FanDuel Logos/Sportsbook/Secondary/fanduel_sportsbook_logo_vert_blue.svg', 
    color: '#3a5070',
    shortName: 'FanDuel'
  },
  'DraftKings': { 
    logo: '',
    color: '#3a5a3a',
    shortName: 'DraftKings'
  },
  'BetMGM': { 
    logo: '',
    color: '#6a5a4a',
    shortName: 'BetMGM'
  },
  'Caesars': { 
    logo: '',
    color: '#2a3a4a',
    shortName: 'Caesars'
  },
  'PointsBet': { 
    logo: '',
    color: '#5a3a3a',
    shortName: 'PointsBet'
  },
  'BetRivers': { 
    logo: '',
    color: '#2a2a2a',
    shortName: 'BetRivers'
  },
  'Bet365': { 
    logo: '',
    color: '#2a4a4a',
    shortName: 'Bet365'
  },
  'Unibet': { 
    logo: '',
    color: '#2a4a3a',
    shortName: 'Unibet'
  },
};

function getSportsbookInfo(name: string) {
  const key = Object.keys(SPORTSBOOK_LOGOS).find(k => 
    name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? SPORTSBOOK_LOGOS[key] : null;
}

export function OddsCompare({ games }: OddsCompareProps) {
  const [selectedGame, setSelectedGame] = useState<NormalizedOdds | null>(games[0] || null);
  const [selectedMarket, setSelectedMarket] = useState<'moneyline' | 'spread' | 'total'>('moneyline');

  if (!selectedGame) {
    return (
      <div className="bg-[#161d29] border border-slate-700/40 rounded-lg p-6 text-center">
        <p className="text-slate-500">No games available for comparison</p>
      </div>
    );
  }

  const getBookmakerData = () => {
    switch (selectedMarket) {
      case 'moneyline':
        const homeML = selectedGame.moneyline.home;
        const awayML = selectedGame.moneyline.away;
        
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
    <div className="bg-[#161d29] border border-slate-700/40 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/40">
        <h3 className="text-slate-200 font-medium">Line Shopping</h3>
        <p className="text-xs text-slate-500 mt-0.5">Compare odds across sportsbooks</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Game Selector */}
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Select Game</label>
          <select
            value={selectedGame.gameId}
            onChange={(e) => {
              const game = games.find(g => g.gameId === e.target.value);
              if (game) setSelectedGame(game);
            }}
            className="w-full px-3 py-2 rounded-lg bg-[#0c1017] border border-slate-700/40 text-slate-200 text-sm focus:border-slate-600 outline-none"
          >
            {games.map(game => (
              <option key={game.gameId} value={game.gameId}>
                {game.awayTeam} @ {game.homeTeam}
              </option>
            ))}
          </select>
        </div>

        {/* Market Tabs */}
        <div className="flex bg-[#0c1017] rounded-lg p-0.5">
          {(['moneyline', 'spread', 'total'] as const).map(market => (
            <button
              key={market}
              onClick={() => setSelectedMarket(market)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedMarket === market
                  ? 'bg-[#2a3444] text-slate-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {market === 'moneyline' ? 'Moneyline' : market === 'spread' ? 'Spread' : 'Total'}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                  Sportsbook
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">
                  {selectedMarket === 'total' ? 'Over' : selectedGame.awayTeam.split(' ').pop()}
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">
                  {selectedMarket === 'total' ? 'Under' : selectedGame.homeTeam.split(' ').pop()}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {bookmakerData.map((row, idx) => {
                const sportsbookInfo = getSportsbookInfo(row.bookmaker);
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {sportsbookInfo?.logo ? (
                          <div className="w-6 h-6 rounded bg-slate-200 p-0.5 flex-shrink-0">
                            <Image
                              src={sportsbookInfo.logo}
                              alt={row.bookmaker}
                              width={20}
                              height={20}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[8px] font-bold text-slate-300"
                            style={{ backgroundColor: sportsbookInfo?.color || '#2a3444' }}
                          >
                            {row.bookmaker.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-slate-300 font-medium">
                          {sportsbookInfo?.shortName || row.bookmaker}
                        </span>
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 text-center font-mono text-sm ${
                      idx === bestAwayIdx ? 'text-[#5a9a7e] font-semibold' : 'text-slate-400'
                    }`}>
                      {selectedMarket === 'spread' && (row as { awayPoint?: number }).awayPoint !== undefined && (
                        <span className="text-slate-600 mr-1 text-xs">
                          {(row as { awayPoint?: number }).awayPoint! > 0 ? '+' : ''}{(row as { awayPoint?: number }).awayPoint}
                        </span>
                      )}
                      {selectedMarket === 'total' && (row as { line?: number }).line && (
                        <span className="text-slate-600 mr-1 text-xs">
                          O{(row as { line?: number }).line}
                        </span>
                      )}
                      {formatOdds(row.awayValue)}
                      {idx === bestAwayIdx && <span className="ml-1 text-[#a38f5c]">★</span>}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-mono text-sm ${
                      idx === bestHomeIdx ? 'text-[#5a9a7e] font-semibold' : 'text-slate-400'
                    }`}>
                      {selectedMarket === 'spread' && (row as { homePoint?: number }).homePoint !== undefined && (
                        <span className="text-slate-600 mr-1 text-xs">
                          {(row as { homePoint?: number }).homePoint! > 0 ? '+' : ''}{(row as { homePoint?: number }).homePoint}
                        </span>
                      )}
                      {selectedMarket === 'total' && (row as { line?: number }).line && (
                        <span className="text-slate-600 mr-1 text-xs">
                          U{(row as { line?: number }).line}
                        </span>
                      )}
                      {formatOdds(row.homeValue)}
                      {idx === bestHomeIdx && <span className="ml-1 text-[#a38f5c]">★</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Best Odds Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[#1e2836] border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-1">
              Best {selectedMarket === 'total' ? 'Over' : selectedGame.awayTeam.split(' ').pop()}
            </p>
            <p className="text-lg font-semibold text-[#5a9a7e] tabular-nums">
              {formatOdds(bookmakerData[bestAwayIdx]?.awayValue)}
            </p>
            <p className="text-xs text-slate-600">
              {bookmakerData[bestAwayIdx]?.bookmaker}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#1e2836] border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-1">
              Best {selectedMarket === 'total' ? 'Under' : selectedGame.homeTeam.split(' ').pop()}
            </p>
            <p className="text-lg font-semibold text-[#5a9a7e] tabular-nums">
              {formatOdds(bookmakerData[bestHomeIdx]?.homeValue)}
            </p>
            <p className="text-xs text-slate-600">
              {bookmakerData[bestHomeIdx]?.bookmaker}
            </p>
          </div>
        </div>

        {/* Tip */}
        <p className="text-xs text-slate-600 text-center">
          <span className="text-[#a38f5c]">★</span> indicates best available odds for each selection
        </p>
      </div>
    </div>
  );
}
