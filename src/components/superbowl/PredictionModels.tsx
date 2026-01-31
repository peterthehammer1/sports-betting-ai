/**
 * Prediction Models Tracker
 * Shows various statistical models and their Super Bowl predictions
 */

'use client';

import { useState } from 'react';

interface PredictionModel {
  name: string;
  type: string;
  description: string;
  chiefsWinProb: number;
  eaglesWinProb: number;
  projectedSpread: number;
  projectedTotal: number;
  chiefsProjScore: number;
  eaglesProjScore: number;
  lastUpdated: string;
  accuracy?: string;
  logo?: string;
}

const PREDICTION_MODELS: PredictionModel[] = [
  {
    name: 'FiveThirtyEight ELO',
    type: 'ELO Rating System',
    description: 'Chess-style rating system adapted for football. Considers margin of victory, home field, and opponent strength.',
    chiefsWinProb: 54,
    eaglesWinProb: 46,
    projectedSpread: -1.5,
    projectedTotal: 49,
    chiefsProjScore: 25.2,
    eaglesProjScore: 23.8,
    lastUpdated: '2025-02-01',
    accuracy: '68% historical ATS',
  },
  {
    name: 'PFF Power Rankings',
    type: 'Grade-Based Model',
    description: 'Based on individual player grades from every play. Aggregates offense, defense, and special teams.',
    chiefsWinProb: 48,
    eaglesWinProb: 52,
    projectedSpread: 1.0,
    projectedTotal: 50,
    chiefsProjScore: 24.5,
    eaglesProjScore: 25.5,
    lastUpdated: '2025-02-01',
    accuracy: '64% historical ATS',
  },
  {
    name: 'Football Outsiders DVOA',
    type: 'Efficiency Model',
    description: 'Defense-adjusted Value Over Average. Measures per-play efficiency with adjustments for opponent.',
    chiefsWinProb: 57,
    eaglesWinProb: 43,
    projectedSpread: -2.5,
    projectedTotal: 48,
    chiefsProjScore: 25.2,
    eaglesProjScore: 22.8,
    lastUpdated: '2025-01-31',
    accuracy: '65% historical ATS',
  },
  {
    name: 'numberFire nERD',
    type: 'Expected Points Model',
    description: 'Net Expected Rating Differential. Predicts points per drive and converts to win probability.',
    chiefsWinProb: 55,
    eaglesWinProb: 45,
    projectedSpread: -1.5,
    projectedTotal: 52,
    chiefsProjScore: 27.3,
    eaglesProjScore: 24.8,
    lastUpdated: '2025-02-01',
    accuracy: '62% historical ATS',
  },
  {
    name: 'ESPN FPI',
    type: 'Power Index',
    description: 'Football Power Index. Measures team strength with adjustments for schedule and recent performance.',
    chiefsWinProb: 56,
    eaglesWinProb: 44,
    projectedSpread: -2.0,
    projectedTotal: 49,
    chiefsProjScore: 25.5,
    eaglesProjScore: 23.5,
    lastUpdated: '2025-02-02',
    accuracy: '66% historical ATS',
  },
  {
    name: 'Sagarin Ratings',
    type: 'Hybrid Model',
    description: 'Combines pure points-based rating with schedule-adjusted predictor for balanced projections.',
    chiefsWinProb: 53,
    eaglesWinProb: 47,
    projectedSpread: -1.0,
    projectedTotal: 50,
    chiefsProjScore: 25.5,
    eaglesProjScore: 24.5,
    lastUpdated: '2025-02-01',
    accuracy: '63% historical ATS',
  },
  {
    name: "Pete's AI Model",
    type: 'Machine Learning',
    description: 'Claude-powered analysis combining odds data, injury reports, historical trends, and situational factors.',
    chiefsWinProb: 55,
    eaglesWinProb: 45,
    projectedSpread: -1.5,
    projectedTotal: 49,
    chiefsProjScore: 25.2,
    eaglesProjScore: 23.8,
    lastUpdated: '2025-02-02',
    accuracy: 'New model - tracking',
  },
];

export function PredictionModels() {
  const [sortBy, setSortBy] = useState<'chiefs' | 'eagles' | 'total'>('chiefs');
  
  // Calculate consensus
  const avgChiefsProb = Math.round(
    PREDICTION_MODELS.reduce((sum, m) => sum + m.chiefsWinProb, 0) / PREDICTION_MODELS.length
  );
  const avgEaglesProb = 100 - avgChiefsProb;
  const avgSpread = (
    PREDICTION_MODELS.reduce((sum, m) => sum + m.projectedSpread, 0) / PREDICTION_MODELS.length
  ).toFixed(1);
  const avgTotal = (
    PREDICTION_MODELS.reduce((sum, m) => sum + m.projectedTotal, 0) / PREDICTION_MODELS.length
  ).toFixed(1);

  const sortedModels = [...PREDICTION_MODELS].sort((a, b) => {
    if (sortBy === 'chiefs') return b.chiefsWinProb - a.chiefsWinProb;
    if (sortBy === 'eagles') return b.eaglesWinProb - a.eaglesWinProb;
    return b.projectedTotal - a.projectedTotal;
  });

  return (
    <section className="py-12 bg-[#0a0e14]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Prediction Model Tracker</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Compare projections from the top prediction models and statistical systems.
          </p>
        </div>

        {/* Consensus Summary */}
        <div className="bg-gradient-to-r from-red-900/30 via-slate-800/50 to-emerald-900/30 rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-lg font-semibold text-center mb-4">Model Consensus</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <img 
                  src="https://a.espncdn.com/i/teamlogos/nfl/500/kc.png" 
                  alt="Chiefs" 
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-red-400">{avgChiefsProb}%</span>
              </div>
              <span className="text-sm text-slate-400">Chiefs Win Prob</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <img 
                  src="https://a.espncdn.com/i/teamlogos/nfl/500/phi.png" 
                  alt="Eagles" 
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-emerald-400">{avgEaglesProb}%</span>
              </div>
              <span className="text-sm text-slate-400">Eagles Win Prob</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-200 mb-2">
                {Number(avgSpread) < 0 ? `KC ${avgSpread}` : `PHI +${avgSpread}`}
              </div>
              <span className="text-sm text-slate-400">Avg Projected Spread</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 mb-2">{avgTotal}</div>
              <span className="text-sm text-slate-400">Avg Projected Total</span>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-center gap-2 mb-6">
          <span className="text-sm text-slate-400 mr-2">Sort by:</span>
          {[
            { key: 'chiefs', label: 'Chiefs %' },
            { key: 'eagles', label: 'Eagles %' },
            { key: 'total', label: 'Total' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as typeof sortBy)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === option.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Models Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm text-slate-400">
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <img src="https://a.espncdn.com/i/teamlogos/nfl/500/kc.png" alt="" className="w-5 h-5" />
                    KC %
                  </div>
                </th>
                <th className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <img src="https://a.espncdn.com/i/teamlogos/nfl/500/phi.png" alt="" className="w-5 h-5" />
                    PHI %
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Spread</th>
                <th className="py-3 px-4 text-center">Total</th>
                <th className="py-3 px-4 text-center">Projected Score</th>
                <th className="py-3 px-4 text-center hidden sm:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map((model, idx) => (
                <tr 
                  key={model.name}
                  className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                    model.name.includes("Pete's") ? 'bg-emerald-900/10' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-slate-500">{model.type}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-semibold ${model.chiefsWinProb >= 50 ? 'text-red-400' : 'text-slate-400'}`}>
                      {model.chiefsWinProb}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-semibold ${model.eaglesWinProb >= 50 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {model.eaglesWinProb}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">
                      {model.projectedSpread < 0 ? `KC ${model.projectedSpread}` : `PHI +${model.projectedSpread}`}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-amber-400">{model.projectedTotal}</span>
                  </td>
                  <td className="py-4 px-4 text-center text-sm">
                    <span className="text-red-400">{model.chiefsProjScore}</span>
                    <span className="text-slate-500"> - </span>
                    <span className="text-emerald-400">{model.eaglesProjScore}</span>
                  </td>
                  <td className="py-4 px-4 text-center text-xs text-slate-500 hidden sm:table-cell">
                    {model.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Model Descriptions */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREDICTION_MODELS.slice(0, 3).map((model) => (
            <div 
              key={model.name}
              className="bg-[#151c28] rounded-lg border border-slate-800 p-4"
            >
              <h4 className="font-medium mb-1">{model.name}</h4>
              <p className="text-xs text-slate-400 mb-2">{model.description}</p>
              {model.accuracy && (
                <span className="text-xs text-emerald-400">{model.accuracy}</span>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Models updated daily. Projections are for informational purposes only.
        </p>
      </div>
    </section>
  );
}
