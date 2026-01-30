'use client';

import { useEffect, useState } from 'react';
import { GameCard } from '@/components/games/GameCard';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { QuickPicks } from '@/components/predictions/QuickPicks';
import { PlayerPropsCard } from '@/components/predictions/PlayerPropsCard';
import { NbaPlayerPropsCard } from '@/components/predictions/NbaPlayerPropsCard';
import { OddsCompare } from '@/components/tools/OddsCompare';
import { BetCalculator } from '@/components/tools/BetCalculator';
import { ParlayBuilder } from '@/components/tools/ParlayBuilder';
import { BettingGuide } from '@/components/education/BettingGuide';
import { OddsWidget } from '@/components/widgets/OddsWidget';
import { FanDuelBanner } from '@/components/promo/FanDuelBanner';
import type { NormalizedOdds, NormalizedPlayerProp, NormalizedNbaPlayerProp, NormalizedScore } from '@/types/odds';
import type { GamePrediction, GoalScorerAnalysis, NbaPlayerPropsAnalysis } from '@/types/prediction';

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
type View = 'games' | 'picks' | 'analysis' | 'props' | 'tools';

interface PlayerPropsData {
  analysis: GoalScorerAnalysis;
  playerProps: {
    firstGoalScorers: NormalizedPlayerProp[];
    anytimeGoalScorers: NormalizedPlayerProp[];
  };
}

interface NbaPlayerPropsData {
  analysis: NbaPlayerPropsAnalysis;
  playerProps: {
    points: NormalizedNbaPlayerProp[];
    rebounds: NormalizedNbaPlayerProp[];
    assists: NormalizedNbaPlayerProp[];
  };
}

export default function Dashboard() {
  const [sport, setSport] = useState<Sport>('NHL');
  const [view, setView] = useState<View>('games');
  const [games, setGames] = useState<NormalizedOdds[]>([]);
  const [scores, setScores] = useState<Record<string, NormalizedScore>>({});
  const [quickPicks, setQuickPicks] = useState<QuickPick[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<GamePrediction | null>(null);
  const [selectedPropsAnalysis, setSelectedPropsAnalysis] = useState<PlayerPropsData | null>(null);
  const [selectedNbaPropsAnalysis, setSelectedNbaPropsAnalysis] = useState<NbaPlayerPropsData | null>(null);
  
  const [loadingOdds, setLoadingOdds] = useState(true);
  const [loadingPicks, setLoadingPicks] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'compare' | 'calculator' | 'parlay' | 'guide' | 'betnow'>('betnow');
  
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch odds and scores
  const fetchOdds = async () => {
    setLoadingOdds(true);
    setError(null);

    try {
      // Fetch odds
      const oddsRes = await fetch(`/api/odds/${sport.toLowerCase()}`);
      
      if (!oddsRes.ok) {
        const data = await oddsRes.json();
        throw new Error(data.error || 'Failed to fetch odds');
      }

      const oddsData: OddsResponse = await oddsRes.json();
      setGames(oddsData.games);
      setLastFetch(new Date(oddsData.meta.fetchedAt));

      // Fetch scores (non-blocking)
      fetchScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingOdds(false);
    }
  };

  // Fetch live scores
  const fetchScores = async () => {
    try {
      const res = await fetch(`/api/scores?sport=${sport.toLowerCase()}`);
      if (res.ok) {
        const data = await res.json();
        setScores(data.scoresMap || {});
      }
    } catch (err) {
      // Silently fail - scores are supplementary
      console.error('Failed to fetch scores:', err);
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

  // Fetch player props analysis for NHL game (Goal Scorers)
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

  // Fetch NBA player props analysis (Points, Rebounds, Assists)
  const fetchNbaPlayerPropsAnalysis = async (gameId: string) => {
    setLoadingProps(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze/nba-props', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: gameId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze NBA player props');
      }

      const data = await res.json();
      
      // Also fetch raw props for display
      const propsRes = await fetch(`/api/odds/nba/props?eventId=${gameId}`);
      const propsData = propsRes.ok ? await propsRes.json() : null;
      
      setSelectedNbaPropsAnalysis({
        analysis: data.analysis,
        playerProps: propsData?.playerProps || { points: [], rebounds: [], assists: [] },
      });
      setView('props');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'NBA player props analysis failed');
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    fetchOdds();
    setQuickPicks([]); // Clear picks when sport changes
    setSelectedPrediction(null);
    setSelectedPropsAnalysis(null);
    setSelectedNbaPropsAnalysis(null);
    setScores({});
    setView('games');
  }, [sport]);

  const handleGameSelect = (gameId: string) => {
    fetchGameAnalysis(gameId);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* FanDuel Promo Banner */}
      <FanDuelBanner />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          {/* Top Row - Title and Sport Toggle */}
          <div className="flex items-center justify-between gap-3">
            {/* Title */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
                Pete&apos;s AI Sports Picks
              </h1>
            </div>
            
            {/* Sport Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 flex-shrink-0">
              {(['NHL', 'NBA'] as Sport[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    sport === s
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {s === 'NHL' ? '🏒' : '🏀'}
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-3 flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <NavTab 
              active={view === 'games'} 
              onClick={() => setView('games')}
              label="Games"
            />
            <NavTab 
              active={view === 'analysis'} 
              onClick={() => setView('analysis')}
              disabled={!selectedPrediction}
              label="Analysis"
            />
            {sport === 'NHL' && (
              <NavTab 
                active={view === 'props'} 
                onClick={() => setView('props')}
                disabled={!selectedPropsAnalysis}
                label="Goal Scorers"
              />
            )}
            {sport === 'NBA' && (
              <NavTab 
                active={view === 'props'} 
                onClick={() => setView('props')}
                disabled={!selectedNbaPropsAnalysis}
                label="Player Props"
              />
            )}
            <NavTab 
              active={view === 'tools'} 
              onClick={() => setView('tools')}
              label="Tools"
            />
          </div>

          {/* Status bar */}
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-glow" />
              <span>Live</span>
            </div>
            {lastFetch && (
              <span>
                Updated {lastFetch.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-red-400">⚠️</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingOdds && games.length === 0 && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            <span className="mt-4 text-slate-400 text-sm">
              Loading {sport} games...
            </span>
          </div>
        )}

        {/* Analysis Loading Overlay */}
        {(loadingAnalysis || loadingProps) && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center max-w-sm w-full animate-slide-up">
              <div className="w-10 h-10 mx-auto border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-4 font-medium text-white">
                {loadingProps ? 'Analyzing Player Props' : 'Running AI Analysis'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                This may take a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Games View */}
        {view === 'games' && games.length > 0 && (
          <div className="animate-slide-up">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {sport} Games
                </h2>
                <p className="text-sm text-slate-400">
                  {games.length} games with odds available
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard
                  key={game.gameId}
                  game={game}
                  sport={sport}
                  score={scores[game.gameId]}
                  onSelect={handleGameSelect}
                  onPropsSelect={sport === 'NHL' ? fetchPlayerPropsAnalysis : fetchNbaPlayerPropsAnalysis}
                />
              ))}
            </div>
          </div>
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
          <div className="animate-slide-up">
            <PredictionCard
              prediction={selectedPrediction}
              onClose={() => {
                setSelectedPrediction(null);
                setView('games');
              }}
            />
          </div>
        )}

        {/* Player Props View - NHL Goal Scorers */}
        {view === 'props' && sport === 'NHL' && selectedPropsAnalysis && (
          <div className="animate-slide-up">
            <PlayerPropsCard
              analysis={selectedPropsAnalysis.analysis}
              playerProps={selectedPropsAnalysis.playerProps}
              onClose={() => {
                setSelectedPropsAnalysis(null);
                setView('games');
              }}
            />
          </div>
        )}

        {/* Player Props View - NBA Points/Rebounds/Assists */}
        {view === 'props' && sport === 'NBA' && selectedNbaPropsAnalysis && (
          <div className="animate-slide-up">
            <NbaPlayerPropsCard
              analysis={selectedNbaPropsAnalysis.analysis}
              playerProps={selectedNbaPropsAnalysis.playerProps}
              onClose={() => {
                setSelectedNbaPropsAnalysis(null);
                setView('games');
              }}
            />
          </div>
        )}

        {/* Tools View */}
        {view === 'tools' && (
          <div className="animate-slide-up space-y-5">
            {/* Tool Selector */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { id: 'betnow', label: 'Bet Now' },
                { id: 'compare', label: 'Line Shopping' },
                { id: 'calculator', label: 'Calculator' },
                { id: 'parlay', label: 'Parlay Builder' },
                { id: 'guide', label: 'Guide' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as typeof selectedTool)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedTool === tool.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Selected Tool */}
            {selectedTool === 'betnow' && (
              <OddsWidget sport={sport === 'NHL' ? 'icehockey_nhl' : 'basketball_nba'} />
            )}
            {selectedTool === 'compare' && (
              <OddsCompare 
                games={games} 
                onClose={() => setView('games')} 
              />
            )}
            {selectedTool === 'calculator' && (
              <BetCalculator onClose={() => setView('games')} />
            )}
            {selectedTool === 'parlay' && (
              <ParlayBuilder 
                games={games} 
                onClose={() => setView('games')} 
              />
            )}
            {selectedTool === 'guide' && (
              <BettingGuide onClose={() => setView('games')} />
            )}
          </div>
        )}

        {/* Empty State */}
        {!loadingOdds && games.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">{sport === 'NHL' ? '🏒' : '🏀'}</div>
            <p className="text-slate-300 font-medium">
              No {sport} games available
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Check back later for upcoming matchups
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-800 safe-area-bottom">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              For entertainment purposes only. Please gamble responsibly.
            </p>
            <p>© 2026 Pete&apos;s AI Sports Picks</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Navigation Tab Component
function NavTab({ 
  active, 
  onClick, 
  disabled, 
  label
}: { 
  active: boolean; 
  onClick: () => void; 
  disabled?: boolean; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation border-b-2 -mb-[1px] ${
        active
          ? 'text-blue-400 border-blue-400'
          : 'text-slate-400 border-transparent hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}
