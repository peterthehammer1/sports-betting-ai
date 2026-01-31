'use client';

import { useState, useEffect } from 'react';
import { getTeamLogo } from '@/lib/utils/teams';

interface PeriodMarket {
  moneyline?: {
    home: { bookmaker: string; odds: number }[];
    away: { bookmaker: string; odds: number }[];
  };
  spread?: {
    home: { bookmaker: string; odds: number; line: number }[];
    away: { bookmaker: string; odds: number; line: number }[];
  };
  total?: {
    over: { bookmaker: string; odds: number; line: number }[];
    under: { bookmaker: string; odds: number; line: number }[];
  };
}

interface PeriodMarketsData {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  periodMarkets: Record<string, PeriodMarket>;
  availablePeriods: string[];
  fromCache?: boolean;
}

interface PeriodMarketsCardProps {
  eventId: string;
  sport: 'nba' | 'nhl' | 'nfl' | 'mlb' | 'epl';
  homeTeam: string;
  awayTeam: string;
}

const PERIOD_LABELS: Record<string, string> = {
  'Q1': '1st Quarter',
  'Q2': '2nd Quarter',
  'Q3': '3rd Quarter',
  'Q4': '4th Quarter',
  '1H': '1st Half',
  '2H': '2nd Half',
  'P1': '1st Period',
  'P2': '2nd Period',
  'P3': '3rd Period',
  '1st5': 'First 5 Innings',
};

export function PeriodMarketsCard({ eventId, sport, homeTeam, awayTeam }: PeriodMarketsCardProps) {
  const [data, setData] = useState<PeriodMarketsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  useEffect(() => {
    const fetchPeriodMarkets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/odds/periods?sport=${sport}&eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch period markets');
        const result = await res.json();
        setData(result);
        // Set default period
        if (result.availablePeriods?.length > 0) {
          setSelectedPeriod(result.availablePeriods[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchPeriodMarkets();
    }
  }, [eventId, sport]);

  if (loading) {
    return (
      <div className="bg-[#151c28] rounded-xl p-6 border border-slate-800/60">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-48"></div>
          <div className="h-40 bg-slate-700/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.availablePeriods.length === 0) {
    return (
      <div className="bg-[#151c28] rounded-xl p-6 border border-slate-800/60">
        <p className="text-slate-400 text-sm">{error || 'No period markets available'}</p>
      </div>
    );
  }

  const currentPeriodData = data.periodMarkets[selectedPeriod];
  const sportForLogo = sport === 'epl' ? 'epl' : sport;

  return (
    <div className="bg-[#151c28] rounded-xl border border-slate-800/60 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/60 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">⏱️</span>
            <div>
              <h3 className="text-sm font-semibold text-white">Period Markets</h3>
              <p className="text-xs text-slate-400">Premium Feature • Quarter/Half/Period betting</p>
            </div>
          </div>
          {data.fromCache && (
            <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">Cached</span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-3 border-b border-slate-800/60 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {getTeamLogo(homeTeam, sportForLogo) && (
            <img src={getTeamLogo(homeTeam, sportForLogo)!} alt="" className="w-6 h-6" />
          )}
          <span className="text-sm text-slate-300">{homeTeam}</span>
        </div>
        <span className="text-xs text-slate-500">vs</span>
        <div className="flex items-center gap-2">
          {getTeamLogo(awayTeam, sportForLogo) && (
            <img src={getTeamLogo(awayTeam, sportForLogo)!} alt="" className="w-6 h-6" />
          )}
          <span className="text-sm text-slate-300">{awayTeam}</span>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 p-2 border-b border-slate-800/60 overflow-x-auto">
        {data.availablePeriods.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedPeriod === period
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {PERIOD_LABELS[period] || period}
          </button>
        ))}
      </div>

      {/* Period Content */}
      <div className="p-4 space-y-4">
        {/* Moneyline */}
        {currentPeriodData?.moneyline && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Moneyline</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{homeTeam}</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currentPeriodData.moneyline.home[0]?.odds > 0 ? '+' : ''}
                  {currentPeriodData.moneyline.home[0]?.odds || '-'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentPeriodData.moneyline.home[0]?.bookmaker || '-'}
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{awayTeam}</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currentPeriodData.moneyline.away[0]?.odds > 0 ? '+' : ''}
                  {currentPeriodData.moneyline.away[0]?.odds || '-'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentPeriodData.moneyline.away[0]?.bookmaker || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Spread */}
        {currentPeriodData?.spread && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Spread</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">
                  {homeTeam} {currentPeriodData.spread.home[0]?.line > 0 ? '+' : ''}
                  {currentPeriodData.spread.home[0]?.line}
                </p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currentPeriodData.spread.home[0]?.odds > 0 ? '+' : ''}
                  {currentPeriodData.spread.home[0]?.odds || '-'}
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">
                  {awayTeam} {currentPeriodData.spread.away[0]?.line > 0 ? '+' : ''}
                  {currentPeriodData.spread.away[0]?.line}
                </p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currentPeriodData.spread.away[0]?.odds > 0 ? '+' : ''}
                  {currentPeriodData.spread.away[0]?.odds || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        {currentPeriodData?.total && (
          <div>
            <p className="text-xs text-slate-400 mb-2">
              Total {currentPeriodData.total.over[0]?.line || currentPeriodData.total.under[0]?.line}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Over</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currentPeriodData.total.over[0]?.odds > 0 ? '+' : ''}
                  {currentPeriodData.total.over[0]?.odds || '-'}
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Under</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {currentPeriodData.total.under[0]?.odds > 0 ? '+' : ''}
                  {currentPeriodData.total.under[0]?.odds || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No data for period */}
        {!currentPeriodData?.moneyline && !currentPeriodData?.spread && !currentPeriodData?.total && (
          <p className="text-center text-slate-500 text-sm py-8">
            No odds available for {PERIOD_LABELS[selectedPeriod] || selectedPeriod}
          </p>
        )}
      </div>
    </div>
  );
}

export default PeriodMarketsCard;
