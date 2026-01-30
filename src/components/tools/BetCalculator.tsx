'use client';

import { useState, useEffect } from 'react';

interface BetCalculatorProps {
  onClose?: () => void;
}

type OddsFormat = 'american' | 'decimal' | 'fractional';

export function BetCalculator({ onClose }: BetCalculatorProps) {
  const [stake, setStake] = useState<string>('100');
  const [odds, setOdds] = useState<string>('-110');
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('american');
  const [results, setResults] = useState({
    payout: 0,
    profit: 0,
    impliedProb: 0,
    breakeven: 0,
  });

  useEffect(() => {
    calculateResults();
  }, [stake, odds, oddsFormat]);

  const calculateResults = () => {
    const stakeNum = parseFloat(stake) || 0;
    const oddsNum = parseFloat(odds) || 0;

    if (stakeNum <= 0 || oddsNum === 0) {
      setResults({ payout: 0, profit: 0, impliedProb: 0, breakeven: 0 });
      return;
    }

    let decimalOdds = 1;
    let impliedProb = 0;

    switch (oddsFormat) {
      case 'american':
        if (oddsNum > 0) {
          decimalOdds = (oddsNum / 100) + 1;
          impliedProb = 100 / (oddsNum + 100);
        } else {
          decimalOdds = (100 / Math.abs(oddsNum)) + 1;
          impliedProb = Math.abs(oddsNum) / (Math.abs(oddsNum) + 100);
        }
        break;
      case 'decimal':
        decimalOdds = oddsNum;
        impliedProb = 1 / oddsNum;
        break;
      case 'fractional':
        // Parse as fraction (e.g., "5/1" or just "5")
        const parts = odds.split('/');
        if (parts.length === 2) {
          const num = parseFloat(parts[0]) || 0;
          const den = parseFloat(parts[1]) || 1;
          decimalOdds = (num / den) + 1;
          impliedProb = den / (num + den);
        } else {
          decimalOdds = oddsNum + 1;
          impliedProb = 1 / (oddsNum + 1);
        }
        break;
    }

    const payout = stakeNum * decimalOdds;
    const profit = payout - stakeNum;
    const breakeven = impliedProb;

    setResults({
      payout: Math.round(payout * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      impliedProb: Math.round(impliedProb * 1000) / 10,
      breakeven: Math.round(breakeven * 1000) / 10,
    });
  };

  const convertOdds = (targetFormat: OddsFormat) => {
    const oddsNum = parseFloat(odds) || 0;
    if (oddsNum === 0) return '';

    let decimalOdds = 1;

    // First convert to decimal
    switch (oddsFormat) {
      case 'american':
        if (oddsNum > 0) {
          decimalOdds = (oddsNum / 100) + 1;
        } else {
          decimalOdds = (100 / Math.abs(oddsNum)) + 1;
        }
        break;
      case 'decimal':
        decimalOdds = oddsNum;
        break;
      case 'fractional':
        const parts = odds.split('/');
        if (parts.length === 2) {
          const num = parseFloat(parts[0]) || 0;
          const den = parseFloat(parts[1]) || 1;
          decimalOdds = (num / den) + 1;
        } else {
          decimalOdds = oddsNum + 1;
        }
        break;
    }

    // Then convert to target format
    switch (targetFormat) {
      case 'american':
        if (decimalOdds >= 2) {
          return `+${Math.round((decimalOdds - 1) * 100)}`;
        } else {
          return `${Math.round(-100 / (decimalOdds - 1))}`;
        }
      case 'decimal':
        return decimalOdds.toFixed(2);
      case 'fractional':
        const fraction = decimalOdds - 1;
        // Try to find a nice fraction
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        const d = 100;
        const n = Math.round(fraction * d);
        const g = gcd(n, d);
        return `${n / g}/${d / g}`;
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600" />
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  Tools
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-green-200 bg-green-400/20 rounded-full uppercase tracking-wider">
                  Calculator
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Bet Calculator
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                Calculate payouts & convert odds
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
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Stake */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Stake Amount ($)
            </label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              placeholder="100"
            />
          </div>

          {/* Odds */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Odds
            </label>
            <input
              type="text"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              placeholder="-110"
            />
          </div>
        </div>

        {/* Odds Format */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Odds Format
          </label>
          <div className="flex gap-2">
            {(['american', 'decimal', 'fractional'] as OddsFormat[]).map(format => (
              <button
                key={format}
                onClick={() => setOddsFormat(format)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                  oddsFormat === format
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-gray-400 mb-1">Total Payout</p>
            <p className="text-2xl font-bold text-green-400 stat-number">
              ${results.payout.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-gray-400 mb-1">Profit</p>
            <p className="text-2xl font-bold text-emerald-400 stat-number">
              ${results.profit.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <p className="text-xs text-gray-400 mb-1">Implied Probability</p>
            <p className="text-2xl font-bold text-cyan-400 stat-number">
              {results.impliedProb}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-gray-400 mb-1">Breakeven Win Rate</p>
            <p className="text-2xl font-bold text-blue-400 stat-number">
              {results.breakeven}%
            </p>
          </div>
        </div>

        {/* Odds Conversion */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Odds Conversion
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase mb-1">American</p>
              <p className="text-lg font-mono font-semibold text-white stat-number">
                {convertOdds('american')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Decimal</p>
              <p className="text-lg font-mono font-semibold text-white stat-number">
                {convertOdds('decimal')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase mb-1">Fractional</p>
              <p className="text-lg font-mono font-semibold text-white stat-number">
                {convertOdds('fractional')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Quick Presets
          </h3>
          <div className="flex flex-wrap gap-2">
            {['-110', '-150', '+150', '+200', '-200', '+300'].map(preset => (
              <button
                key={preset}
                onClick={() => {
                  setOdds(preset);
                  setOddsFormat('american');
                }}
                className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-mono hover:bg-white/10 hover:text-white transition-all"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
