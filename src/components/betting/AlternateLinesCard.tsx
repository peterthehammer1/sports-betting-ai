'use client';

import { useState, useEffect } from 'react';
import { getTeamLogo } from '@/lib/utils/teams';

interface AlternateLine {
  line: number;
  odds: { bookmaker: string; price: number }[];
}

interface AlternateLinesData {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  alternateLines: {
    spreads: {
      home: AlternateLine[];
      away: AlternateLine[];
    };
    totals: {
      over: AlternateLine[];
      under: AlternateLine[];
    };
    teamTotals: {
      home: { line: number; overOdds: { bookmaker: string; price: number }[]; underOdds: { bookmaker: string; price: number }[] }[];
      away: { line: number; overOdds: { bookmaker: string; price: number }[]; underOdds: { bookmaker: string; price: number }[] }[];
    };
  };
  fromCache?: boolean;
}

interface AlternateLinesCardProps {
  eventId: string;
  sport: 'nba' | 'nhl' | 'nfl' | 'mlb' | 'epl';
  homeTeam: string;
  awayTeam: string;
}

export function AlternateLinesCard({ eventId, sport, homeTeam, awayTeam }: AlternateLinesCardProps) {
  const [data, setData] = useState<AlternateLinesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spreads' | 'totals' | 'team-totals'>('spreads');

  useEffect(() => {
    const fetchAlternateLines = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/odds/alternate?sport=${sport}&eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch alternate lines');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchAlternateLines();
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

  if (error || !data) {
    return (
      <div className="bg-[#151c28] rounded-xl p-6 border border-slate-800/60">
        <p className="text-slate-400 text-sm">{error || 'No alternate lines available'}</p>
      </div>
    );
  }

  const sportForLogo = sport === 'epl' ? 'epl' : sport;

  return (
    <div className="bg-[#151c28] rounded-xl border border-slate-800/60 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/60 bg-gradient-to-r from-emerald-900/20 to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <div>
              <h3 className="text-sm font-semibold text-white">Alternate Lines</h3>
              <p className="text-xs text-slate-400">Premium Feature • Shop for better odds</p>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800/60">
        {(['spreads', 'totals', 'team-totals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'spreads' ? 'Alt Spreads' : tab === 'totals' ? 'Alt Totals' : 'Team Totals'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === 'spreads' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Home spreads */}
              <div>
                <p className="text-xs text-slate-400 mb-2">{homeTeam} Spreads</p>
                <div className="space-y-1">
                  {data.alternateLines.spreads.home.slice(0, 8).map((line) => (
                    <div key={line.line} className="flex justify-between text-xs bg-slate-800/30 rounded px-2 py-1">
                      <span className="text-slate-300">{line.line > 0 ? '+' : ''}{line.line}</span>
                      <span className="text-emerald-400 font-medium">
                        {line.odds[0]?.price > 0 ? '+' : ''}{line.odds[0]?.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Away spreads */}
              <div>
                <p className="text-xs text-slate-400 mb-2">{awayTeam} Spreads</p>
                <div className="space-y-1">
                  {data.alternateLines.spreads.away.slice(0, 8).map((line) => (
                    <div key={line.line} className="flex justify-between text-xs bg-slate-800/30 rounded px-2 py-1">
                      <span className="text-slate-300">{line.line > 0 ? '+' : ''}{line.line}</span>
                      <span className="text-emerald-400 font-medium">
                        {line.odds[0]?.price > 0 ? '+' : ''}{line.odds[0]?.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'totals' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Over totals */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Over</p>
                <div className="space-y-1">
                  {data.alternateLines.totals.over.slice(0, 8).map((line) => (
                    <div key={line.line} className="flex justify-between text-xs bg-slate-800/30 rounded px-2 py-1">
                      <span className="text-slate-300">O {line.line}</span>
                      <span className="text-emerald-400 font-medium">
                        {line.odds[0]?.price > 0 ? '+' : ''}{line.odds[0]?.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Under totals */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Under</p>
                <div className="space-y-1">
                  {data.alternateLines.totals.under.slice(0, 8).map((line) => (
                    <div key={line.line} className="flex justify-between text-xs bg-slate-800/30 rounded px-2 py-1">
                      <span className="text-slate-300">U {line.line}</span>
                      <span className="text-emerald-400 font-medium">
                        {line.odds[0]?.price > 0 ? '+' : ''}{line.odds[0]?.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team-totals' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Home team totals */}
              <div>
                <p className="text-xs text-slate-400 mb-2">{homeTeam}</p>
                <div className="space-y-1">
                  {data.alternateLines.teamTotals.home.slice(0, 6).map((tt) => (
                    <div key={tt.line} className="flex justify-between text-xs bg-slate-800/30 rounded px-2 py-1">
                      <span className="text-slate-300">{tt.line}</span>
                      <span className="text-emerald-400 font-medium">
                        O: {tt.overOdds[0]?.price > 0 ? '+' : ''}{tt.overOdds[0]?.price || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Away team totals */}
              <div>
                <p className="text-xs text-slate-400 mb-2">{awayTeam}</p>
                <div className="space-y-1">
                  {data.alternateLines.teamTotals.away.slice(0, 6).map((tt) => (
                    <div key={tt.line} className="flex justify-between text-xs bg-slate-800/30 rounded px-2 py-1">
                      <span className="text-slate-300">{tt.line}</span>
                      <span className="text-emerald-400 font-medium">
                        O: {tt.overOdds[0]?.price > 0 ? '+' : ''}{tt.overOdds[0]?.price || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {((activeTab === 'spreads' && data.alternateLines.spreads.home.length === 0) ||
          (activeTab === 'totals' && data.alternateLines.totals.over.length === 0) ||
          (activeTab === 'team-totals' && data.alternateLines.teamTotals.home.length === 0)) && (
          <p className="text-center text-slate-500 text-sm py-8">
            No {activeTab.replace('-', ' ')} available for this game
          </p>
        )}
      </div>
    </div>
  );
}

export default AlternateLinesCard;
