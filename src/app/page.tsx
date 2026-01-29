'use client';

import { useEffect, useState } from 'react';
import { GameCard } from '@/components/games/GameCard';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { QuickPicks } from '@/components/predictions/QuickPicks';
import { PlayerPropsCard } from '@/components/predictions/PlayerPropsCard';
import type { NormalizedOdds, NormalizedPlayerProp } from '@/types/odds';
import type { GamePrediction, GoalScorerAnalysis } from '@/types/prediction';

interface OddsResponse {
  games: NormalizedOdds[];
  meta: {
    sport: string;
    gamesCount: number;
    fetchedAt: string;
    quota: {
      requestsRemaining: number;
      requestsUsed: number;
    };
  };
}

interface QuickPick {
  gameIndex: number;
  gameId?: string;
  homeTeam: string;
  awayTeam: string;
  winnerPick: string;
  winnerConfidence: number;
  bestBet: {
    type: string;
    pick: string;
    confidence: number;
  };
  quickTake: string;
  commenceTime?: string;
  odds?: {
    homeML?: number;
    awayML?: number;
    spread?: number;
    total?: number;
  };
}

type Sport = 'NHL' | 'NBA';
type View = 'games' | 'picks' | 'analysis' | 'props';

interface PlayerPropsData {
  analysis: GoalScorerAnalysis;
  playerProps: {
    firstGoalScorers: NormalizedPlayerProp[];
    anytimeGoalScorers: NormalizedPlayerProp[];
  };
}

export default function Dashboard() {
  const [sport, setSport] = useState<Sport>('NHL');
  const [view, setView] = useState<View>('games');
  const [games, setGames] = useState<NormalizedOdds[]>([]);
  const [quickPicks, setQuickPicks] = useState<QuickPick[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<GamePrediction | null>(null);
  const [selectedPropsAnalysis, setSelectedPropsAnalysis] = useState<PlayerPropsData | null>(null);
  
  const [loadingOdds, setLoadingOdds] = useState(true);
  const [loadingPicks, setLoadingPicks] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingProps, setLoadingProps] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [quota, setQuota] = useState<{ remaining: number; used: number } | null>(null);

  // Fetch odds
  const fetchOdds = async () => {
    setLoadingOdds(true);
    setError(null);

    try {
      const res = await fetch(`/api/odds/${sport.toLowerCase()}`);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch odds');
      }

      const data: OddsResponse = await res.json();
      setGames(data.games);
      setLastFetch(new Date(data.meta.fetchedAt));
      setQuota({
        remaining: data.meta.quota.requestsRemaining,
        used: data.meta.quota.requestsUsed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingOdds(false);
    }
  };

  // Fetch quick picks (batch analysis)
  const fetchQuickPicks = async () => {
    setLoadingPicks(true);
    setError(null);
    setQuickPicks([]);

    try {
      const res = await fetch('/api/analyze/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze games');
      }

      const data = await res.json();
      setQuickPicks(data.predictions);
      setView('picks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoadingPicks(false);
    }
  };

  // Fetch detailed analysis for a single game
  const fetchGameAnalysis = async (gameId: string) => {
    setLoadingAnalysis(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, sport }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze game');
      }

      const data = await res.json();
      setSelectedPrediction(data.prediction);
      setView('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Fetch player props analysis for a game (NHL only)
  const fetchPlayerPropsAnalysis = async (gameId: string) => {
    setLoadingProps(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze/props', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze player props');
      }

      const data = await res.json();
      setSelectedPropsAnalysis({
        analysis: data.analysis,
        playerProps: data.playerProps,
      });
      setView('props');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Player props analysis failed');
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    fetchOdds();
    setQuickPicks([]); // Clear picks when sport changes
    setSelectedPrediction(null);
    setSelectedPropsAnalysis(null);
    setView('games');
  }, [sport]);

  const handleGameSelect = (gameId: string) => {
    fetchGameAnalysis(gameId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎯 Sports Betting AI
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Sport Toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['NHL', 'NBA'] as Sport[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      sport === s
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* View Tabs */}
          <div className="mt-4 flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setView('games')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                view === 'games'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              📊 Games & Odds
            </button>
            <button
              onClick={() => setView('analysis')}
              disabled={!selectedPrediction}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors disabled:opacity-50 ${
                view === 'analysis'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              🔍 Deep Analysis
            </button>
            {sport === 'NHL' && (
              <button
                onClick={() => setView('props')}
                disabled={!selectedPropsAnalysis}
                className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors disabled:opacity-50 ${
                  view === 'props'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                🥅 Goal Scorers
              </button>
            )}
          </div>

          {/* Meta info */}
          <div className="mt-2 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            {lastFetch && (
              <span>Updated: {lastFetch.toLocaleTimeString()}</span>
            )}
            {quota && (
              <span>API: {quota.remaining} requests left</span>
            )}
            <button
              onClick={fetchOdds}
              disabled={loadingOdds}
              className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {loadingOdds ? 'Refreshing...' : 'Refresh Odds'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loadingOdds && games.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading {sport} games...
            </span>
          </div>
        )}

        {/* Analysis Loading Overlay */}
        {(loadingAnalysis || loadingProps) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${loadingProps ? 'border-amber-600' : 'border-blue-600'}`}></div>
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {loadingProps ? 'Analyzing goal scorers with Claude...' : 'Analyzing game with Claude...'}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This may take 10-20 seconds
              </p>
            </div>
          </div>
        )}

        {/* Games View */}
        {view === 'games' && games.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {sport} Games Today ({games.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click any game for detailed AI analysis
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard
                  key={game.gameId}
                  game={game}
                  sport={sport}
                  onSelect={handleGameSelect}
                  onPropsSelect={sport === 'NHL' ? fetchPlayerPropsAnalysis : undefined}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick Picks View */}
        {view === 'picks' && (
          <QuickPicks
            picks={quickPicks}
            sport={sport}
            loading={loadingPicks}
            onGameSelect={handleGameSelect}
          />
        )}

        {/* Deep Analysis View */}
        {view === 'analysis' && selectedPrediction && (
          <PredictionCard
            prediction={selectedPrediction}
            onClose={() => {
              setSelectedPrediction(null);
              setView('games');
            }}
          />
        )}

        {/* Player Props View (NHL only) */}
        {view === 'props' && selectedPropsAnalysis && (
          <PlayerPropsCard
            analysis={selectedPropsAnalysis.analysis}
            playerProps={selectedPropsAnalysis.playerProps}
            onClose={() => {
              setSelectedPropsAnalysis(null);
              setView('games');
            }}
          />
        )}

        {/* Empty State */}
        {!loadingOdds && games.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No {sport} games scheduled for today.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>⚠️ For entertainment purposes only. Please gamble responsibly.</p>
      </footer>
    </div>
  );
}
