'use client';

import { useState, useEffect } from 'react';
import type { NormalizedOdds } from '@/types/odds';

interface SuperBowlProps {
  game: NormalizedOdds | null;
  loading: boolean;
}

interface PropMarket {
  playerName: string;
  line?: number;
  name?: string;
  odds: Array<{
    bookmaker: string;
    americanOdds: number;
    price: number;
  }>;
}

interface PropsData {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  propsByMarket: Record<string, PropMarket[]>;
  availableMarkets: string[];
}

const MARKET_LABELS: Record<string, string> = {
  player_anytime_td: 'Anytime Touchdown',
  player_first_td: 'First Touchdown',
  player_last_td: 'Last Touchdown',
  player_pass_tds: 'Passing TDs',
  player_pass_yds: 'Passing Yards',
  player_pass_completions: 'Completions',
  player_rush_yds: 'Rushing Yards',
  player_rush_attempts: 'Rush Attempts',
  player_receptions: 'Receptions',
  player_reception_yds: 'Receiving Yards',
  player_kicking_points: 'Kicking Points',
};

export function SuperBowlCard({ game, loading }: SuperBowlProps) {
  const [propsData, setPropsData] = useState<PropsData | null>(null);
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<string>('player_anytime_td');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (game?.gameId) {
      fetchProps(game.gameId);
    }
  }, [game?.gameId]);

  const fetchProps = async (eventId: string) => {
    setLoadingProps(true);
    setError(null);
    try {
      const res = await fetch(`/api/odds/nfl/props?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setPropsData(data);
        // Set first available market as default
        if (data.availableMarkets?.length > 0) {
          setSelectedMarket(data.availableMarkets[0]);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Props not available yet');
      }
    } catch (err) {
      setError('Failed to load props');
    } finally {
      setLoadingProps(false);
    }
  };

  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-8 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-slate-400">Loading Super Bowl data...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🏈</div>
        <p className="text-white font-medium">Super Bowl</p>
        <p className="text-slate-400 text-sm mt-2">
          No Super Bowl odds available yet. Check back closer to game day!
        </p>
      </div>
    );
  }

  const gameDate = new Date(game.commenceTime);

  return (
    <div className="space-y-4">
      {/* Main Game Card */}
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white/80 text-xs font-medium">SUPER BOWL LIX</span>
              <h2 className="text-white font-semibold">
                {game.awayTeam} vs {game.homeTeam}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">
                {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-white text-sm font-medium">
                {gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Game Lines */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Moneyline */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-2">Moneyline</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">{game.awayTeam.split(' ').pop()}</span>
                  <span className={`text-sm font-mono font-medium ${game.moneyline.bestAway?.americanOdds && game.moneyline.bestAway.americanOdds > 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {game.moneyline.bestAway ? formatOdds(game.moneyline.bestAway.americanOdds) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">{game.homeTeam.split(' ').pop()}</span>
                  <span className={`text-sm font-mono font-medium ${game.moneyline.bestHome?.americanOdds && game.moneyline.bestHome.americanOdds > 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {game.moneyline.bestHome ? formatOdds(game.moneyline.bestHome.americanOdds) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Spread */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-2">Spread</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">{game.awayTeam.split(' ').pop()}</span>
                  <span className="text-sm font-mono text-white">
                    {game.spread.consensusLine ? (game.spread.consensusLine > 0 ? `+${game.spread.consensusLine}` : game.spread.consensusLine) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">{game.homeTeam.split(' ').pop()}</span>
                  <span className="text-sm font-mono text-white">
                    {game.spread.consensusLine ? (game.spread.consensusLine > 0 ? game.spread.consensusLine * -1 : `+${Math.abs(game.spread.consensusLine)}`) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-2">Total</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Over</span>
                  <span className="text-sm font-mono text-white">
                    {game.total.consensusLine || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Under</span>
                  <span className="text-sm font-mono text-white">
                    {game.total.consensusLine || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Props */}
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h3 className="text-white font-medium">Player Props</h3>
          <p className="text-xs text-slate-400">Super Bowl prop bets</p>
        </div>

        {loadingProps ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 mx-auto border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-slate-400">Loading props...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">{error}</p>
            <p className="text-slate-500 text-xs mt-1">Props usually become available closer to game day</p>
          </div>
        ) : propsData && propsData.availableMarkets.length > 0 ? (
          <div className="p-4">
            {/* Market Selector */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
              {propsData.availableMarkets.map(market => (
                <button
                  key={market}
                  onClick={() => setSelectedMarket(market)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedMarket === market
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {MARKET_LABELS[market] || market}
                </button>
              ))}
            </div>

            {/* Props Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Player</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Line</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Best Odds</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Book</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {propsData.propsByMarket[selectedMarket]?.slice(0, 20).map((prop, idx) => {
                    const bestOdds = prop.odds.reduce((best, curr) => 
                      curr.americanOdds > best.americanOdds ? curr : best
                    , prop.odds[0]);
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-700/20">
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-white">{prop.playerName}</span>
                          {prop.name && prop.name !== 'Yes' && (
                            <span className="text-xs text-slate-500 ml-2">{prop.name}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-sm text-slate-300 font-mono">
                            {prop.line !== undefined ? prop.line : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-sm font-mono font-medium ${bestOdds.americanOdds > 0 ? 'text-emerald-400' : 'text-white'}`}>
                            {formatOdds(bestOdds.americanOdds)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-xs text-slate-500">{bestOdds.bookmaker}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {propsData.propsByMarket[selectedMarket]?.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">
                  No props available for this market
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">No props available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
