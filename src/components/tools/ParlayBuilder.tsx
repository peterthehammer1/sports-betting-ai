'use client';

import { useState } from 'react';
import type { NormalizedOdds } from '@/types/odds';

interface ParlayLeg {
  id: string;
  gameId: string;
  team: string;
  betType: 'moneyline' | 'spread' | 'total';
  pick: string;
  odds: number;
  decimalOdds: number;
}

interface ParlayBuilderProps {
  games: NormalizedOdds[];
  onClose?: () => void;
}

export function ParlayBuilder({ games, onClose }: ParlayBuilderProps) {
  const [legs, setLegs] = useState<ParlayLeg[]>([]);
  const [stake, setStake] = useState<string>('10');

  const addLeg = (game: NormalizedOdds, betType: 'moneyline' | 'spread' | 'total', isHome: boolean, isOver?: boolean) => {
    let odds = 0;
    let pick = '';
    let team = '';

    switch (betType) {
      case 'moneyline':
        if (isHome) {
          odds = game.moneyline.bestHome?.americanOdds || 0;
          team = game.homeTeam;
          pick = `${game.homeTeam} ML`;
        } else {
          odds = game.moneyline.bestAway?.americanOdds || 0;
          team = game.awayTeam;
          pick = `${game.awayTeam} ML`;
        }
        break;
      case 'spread':
        const homeSpread = game.spread.home.find(s => s.point === game.spread.consensusLine);
        const awaySpread = game.spread.away.find(s => Math.abs(s.point) === Math.abs(game.spread.consensusLine || 0));
        if (isHome) {
          odds = homeSpread?.americanOdds || -110;
          team = game.homeTeam;
          pick = `${game.homeTeam} ${(game.spread.consensusLine || 0) > 0 ? '+' : ''}${game.spread.consensusLine}`;
        } else {
          odds = awaySpread?.americanOdds || -110;
          team = game.awayTeam;
          const awayLine = -(game.spread.consensusLine || 0);
          pick = `${game.awayTeam} ${awayLine > 0 ? '+' : ''}${awayLine}`;
        }
        break;
      case 'total':
        const over = game.total.over.find(t => t.point === game.total.consensusLine);
        const under = game.total.under.find(t => t.point === game.total.consensusLine);
        if (isOver) {
          odds = over?.americanOdds || -110;
          pick = `Over ${game.total.consensusLine}`;
          team = 'Total';
        } else {
          odds = under?.americanOdds || -110;
          pick = `Under ${game.total.consensusLine}`;
          team = 'Total';
        }
        break;
    }

    // Convert to decimal
    const decimalOdds = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;

    const newLeg: ParlayLeg = {
      id: `${game.gameId}-${betType}-${isHome ? 'home' : isOver ? 'over' : 'away'}`,
      gameId: game.gameId,
      team,
      betType,
      pick,
      odds,
      decimalOdds,
    };

    // Don't add duplicate legs
    if (legs.some(l => l.id === newLeg.id)) return;

    setLegs([...legs, newLeg]);
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter(l => l.id !== id));
  };

  const clearParlay = () => {
    setLegs([]);
  };

  // Calculate parlay odds
  const totalDecimalOdds = legs.reduce((acc, leg) => acc * leg.decimalOdds, 1);
  const parlayAmericanOdds = totalDecimalOdds >= 2 
    ? Math.round((totalDecimalOdds - 1) * 100)
    : Math.round(-100 / (totalDecimalOdds - 1));
  
  const stakeNum = parseFloat(stake) || 0;
  const potentialPayout = stakeNum * totalDecimalOdds;
  const potentialProfit = potentialPayout - stakeNum;

  // Calculate implied probability
  const impliedProb = legs.length > 0 ? (1 / totalDecimalOdds) * 100 : 0;

  const formatOdds = (value: number) => value > 0 ? `+${value}` : `${value}`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500" />
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  Tools
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-yellow-200 bg-yellow-400/20 rounded-full uppercase tracking-wider">
                  Builder
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Parlay Builder
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                Build and calculate multi-leg parlays
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
        {/* Current Parlay */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Your Parlay ({legs.length} leg{legs.length !== 1 ? 's' : ''})
            </h3>
            {legs.length > 0 && (
              <button
                onClick={clearParlay}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {legs.length === 0 ? (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 border-dashed text-center">
              <p className="text-gray-500 text-sm">
                No legs added yet. Select bets from games below.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {legs.map((leg, idx) => (
                <div
                  key={leg.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{leg.pick}</p>
                      <p className="text-xs text-gray-500">{leg.team !== 'Total' ? leg.team : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-300 stat-number">
                      {formatOdds(leg.odds)}
                    </span>
                    <button
                      onClick={() => removeLeg(leg.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stake & Payout */}
        {legs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] text-gray-500 uppercase mb-1">Stake ($)</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:border-orange-500 outline-none"
              />
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-[10px] text-gray-500 uppercase">Parlay Odds</p>
              <p className="text-lg font-bold text-orange-400 stat-number">
                {formatOdds(parlayAmericanOdds)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-[10px] text-gray-500 uppercase">Payout</p>
              <p className="text-lg font-bold text-green-400 stat-number">
                ${potentialPayout.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-[10px] text-gray-500 uppercase">Win Prob</p>
              <p className="text-lg font-bold text-cyan-400 stat-number">
                {impliedProb.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Games to Add */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Add Bets
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {games.map(game => (
              <div key={game.gameId} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white mb-2">
                  {game.awayTeam} @ {game.homeTeam}
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Moneyline */}
                  <button
                    onClick={() => addLeg(game, 'moneyline', false)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    disabled={legs.some(l => l.id === `${game.gameId}-moneyline-away`)}
                  >
                    {game.awayTeam.split(' ').pop()} ML
                  </button>
                  <button
                    onClick={() => addLeg(game, 'moneyline', true)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    disabled={legs.some(l => l.id === `${game.gameId}-moneyline-home`)}
                  >
                    {game.homeTeam.split(' ').pop()} ML
                  </button>
                  {/* Spread */}
                  <button
                    onClick={() => addLeg(game, 'spread', false)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    disabled={legs.some(l => l.id === `${game.gameId}-spread-away`)}
                  >
                    {game.awayTeam.split(' ').pop()} {(-(game.spread.consensusLine || 0)) > 0 ? '+' : ''}{-(game.spread.consensusLine || 0)}
                  </button>
                  <button
                    onClick={() => addLeg(game, 'spread', true)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    disabled={legs.some(l => l.id === `${game.gameId}-spread-home`)}
                  >
                    {game.homeTeam.split(' ').pop()} {(game.spread.consensusLine || 0) > 0 ? '+' : ''}{game.spread.consensusLine}
                  </button>
                  {/* Totals */}
                  <button
                    onClick={() => addLeg(game, 'total', false, true)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    disabled={legs.some(l => l.id === `${game.gameId}-total-over`)}
                  >
                    O {game.total.consensusLine}
                  </button>
                  <button
                    onClick={() => addLeg(game, 'total', false, false)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    disabled={legs.some(l => l.id === `${game.gameId}-total-away`)}
                  >
                    U {game.total.consensusLine}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-sm text-yellow-300">
            ⚠️ <strong>Remember:</strong> While parlays offer higher payouts, they are inherently riskier. All legs must win for the parlay to pay out.
          </p>
        </div>
      </div>
    </div>
  );
}
