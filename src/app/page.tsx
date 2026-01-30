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
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* FanDuel Promo Banner */}
      <FanDuelBanner />

      {/* Ambient background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0f1a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8">
          {/* Top Row - Title and Sport Toggle */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Title */}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl font-bold text-white tracking-tight truncate">
                Pete&apos;s AI Sports Picks
              </h1>
              <p className="text-[9px] sm:text-xs text-cyan-400 font-medium tracking-wider uppercase">
                Powered by AI
              </p>
            </div>
            
            {/* Sport Toggle */}
            <div className="flex p-0.5 sm:p-1 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 flex-shrink-0">
              {(['NHL', 'NBA'] as Sport[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`relative px-3 sm:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                    sport === s
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {sport === s && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md sm:rounded-lg shadow-lg shadow-cyan-500/25" />
                  )}
                  <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                    {s === 'NHL' ? '🏒' : '🏀'}
                    <span className="hidden xs:inline">{s}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-3 sm:mt-4 flex gap-1 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
            <NavTab 
              active={view === 'games'} 
              onClick={() => setView('games')}
              icon="📊"
              label="Games"
            />
            <NavTab 
              active={view === 'analysis'} 
              onClick={() => setView('analysis')}
              disabled={!selectedPrediction}
              icon="🎯"
              label="Analysis"
            />
            {sport === 'NHL' && (
              <NavTab 
                active={view === 'props'} 
                onClick={() => setView('props')}
                disabled={!selectedPropsAnalysis}
                icon="🥅"
                label="Goals"
                accent
              />
            )}
            {sport === 'NBA' && (
              <NavTab 
                active={view === 'props'} 
                onClick={() => setView('props')}
                disabled={!selectedNbaPropsAnalysis}
                icon="📊"
                label="Props"
                accent
              />
            )}
            <NavTab 
              active={view === 'tools'} 
              onClick={() => setView('tools')}
              icon="🧮"
              label="Tools"
            />
          </div>

          {/* Live indicator */}
          <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full pulse-glow" />
              <span>Live Odds</span>
            </div>
            {lastFetch && (
              <span className="text-gray-500">
                Updated {lastFetch.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 glass-card rounded-xl border-red-500/30 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400">⚠️</span>
              </div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingOdds && games.length === 0 && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <span className="mt-6 text-gray-400 font-medium">
              Loading {sport} games...
            </span>
          </div>
        )}

        {/* Analysis Loading Overlay */}
        {(loadingAnalysis || loadingProps) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-8 text-center max-w-sm w-full animate-slide-up">
              <div className="relative mx-auto w-20 h-20">
                <div className={`absolute inset-0 rounded-full border-2 ${loadingProps ? 'border-amber-500/30 border-t-amber-400' : 'border-cyan-500/30 border-t-cyan-400'} animate-spin`} />
                <div className={`absolute inset-3 rounded-full border-2 ${loadingProps ? 'border-orange-500/30 border-b-orange-400' : 'border-blue-500/30 border-b-blue-400'} animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{loadingProps ? '🥅' : '🎯'}</span>
                </div>
              </div>
              <p className="mt-6 text-lg font-semibold text-white">
                {loadingProps ? 'Analyzing Goal Scorers' : 'Running AI Analysis'}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Our AI is crunching the numbers...
              </p>
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${loadingProps ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'} shimmer`} style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Games View */}
        {view === 'games' && games.length > 0 && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {sport} Games
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {games.length} games available • Tap for AI insights
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full pulse-glow" />
                  <span className="text-xs font-medium text-cyan-400">LIVE</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game, index) => (
                <div key={game.gameId} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <GameCard
                    game={game}
                    sport={sport}
                    score={scores[game.gameId]}
                    onSelect={handleGameSelect}
                    onPropsSelect={sport === 'NHL' ? fetchPlayerPropsAnalysis : fetchNbaPlayerPropsAnalysis}
                  />
                </div>
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
          <div className="animate-slide-up space-y-4 sm:space-y-6">
            {/* Tool Selector */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
              <button
                onClick={() => setSelectedTool('betnow')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all touch-manipulation ${
                  selectedTool === 'betnow'
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10 active:bg-white/15'
                }`}
              >
                🎁 <span className="hidden xs:inline">Bet Now -</span> $150
              </button>
              <button
                onClick={() => setSelectedTool('compare')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all touch-manipulation ${
                  selectedTool === 'compare'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10 active:bg-white/15'
                }`}
              >
                📈 <span className="hidden xs:inline">Line</span> Shop
              </button>
              <button
                onClick={() => setSelectedTool('calculator')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all touch-manipulation ${
                  selectedTool === 'calculator'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10 active:bg-white/15'
                }`}
              >
                🧮 Calc
              </button>
              <button
                onClick={() => setSelectedTool('parlay')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all touch-manipulation ${
                  selectedTool === 'parlay'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10 active:bg-white/15'
                }`}
              >
                🎰 Parlay
              </button>
              <button
                onClick={() => setSelectedTool('guide')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all touch-manipulation ${
                  selectedTool === 'guide'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10 active:bg-white/15'
                }`}
              >
                📚 Guide
              </button>
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
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <span className="text-4xl">{sport === 'NHL' ? '🏒' : '🏀'}</span>
            </div>
            <p className="text-gray-400 text-lg">
              No {sport} games scheduled for today
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later for upcoming matchups
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-4 sm:py-6 border-t border-white/5 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <p className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
              ⚠️ For entertainment only. Gamble responsibly.
            </p>
            <div className="flex items-center gap-4 text-[10px] sm:text-xs text-gray-500">
              <span>© 2026 Pete&apos;s AI Sports Picks</span>
            </div>
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
  icon, 
  label, 
  accent 
}: { 
  active: boolean; 
  onClick: () => void; 
  disabled?: boolean; 
  icon: string; 
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation ${
        active
          ? accent 
            ? 'text-amber-400' 
            : 'text-cyan-400'
          : 'text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10'
      }`}
    >
      {active && (
        <div className={`absolute inset-0 rounded-lg sm:rounded-xl ${accent ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-cyan-500/10 border border-cyan-500/20'}`} />
      )}
      <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
        <span className="text-sm sm:text-base">{icon}</span>
        <span>{label}</span>
      </span>
    </button>
  );
}
