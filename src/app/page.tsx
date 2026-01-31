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
import { SuperBowlCard } from '@/components/superbowl/SuperBowlCard';
import { SuperBowlLanding } from '@/components/superbowl/SuperBowlLanding';
import { PerformanceDashboard } from '@/components/tracker/PerformanceDashboard';
import { OddsMovementChart } from '@/components/tracker/OddsMovementChart';
import { InjuryReport } from '@/components/injuries/InjuryReport';
import type { NormalizedOdds, NormalizedPlayerProp, NormalizedNbaPlayerProp, NormalizedScore } from '@/types/odds';
import type { GamePrediction, GoalScorerAnalysis, NbaPlayerPropsAnalysis } from '@/types/prediction';
import type { SportInjuries, TeamInjuries } from '@/types/injuries';

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

type Sport = 'NHL' | 'NBA' | 'MLB' | 'EPL' | 'NFL';
type View = 'landing' | 'games' | 'picks' | 'analysis' | 'props' | 'tools' | 'superbowl' | 'tracker';

// Sport configurations for the UI
const SPORTS_CONFIG: Record<Sport, { emoji: string; label: string; hasProps: boolean }> = {
  NHL: { emoji: '🏒', label: 'NHL', hasProps: true },
  NBA: { emoji: '🏀', label: 'NBA', hasProps: true },
  NFL: { emoji: '🏈', label: 'NFL', hasProps: true },
  MLB: { emoji: '⚾', label: 'MLB', hasProps: true },
  EPL: { emoji: '⚽', label: 'Soccer', hasProps: true },
};

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
  const [sport, setSport] = useState<Sport>('NFL');
  const [view, setView] = useState<View>('landing');
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
  
  // Super Bowl state
  const [superBowlGame, setSuperBowlGame] = useState<NormalizedOdds | null>(null);
  const [loadingSuperBowl, setLoadingSuperBowl] = useState(false);
  
  // Injuries state
  const [injuryCount, setInjuryCount] = useState<number>(0);
  const [injuries, setInjuries] = useState<SportInjuries | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch injuries for current sport
  const fetchInjuries = async () => {
    try {
      const res = await fetch(`/api/injuries?sport=${sport}`);
      if (res.ok) {
        const data = await res.json();
        setInjuries(data);
        setInjuryCount(data.totalInjuries || 0);
      }
    } catch (err) {
      console.error('Failed to fetch injuries:', err);
    }
  };

  // Helper to get injury info for a specific game
  const getGameInjuryInfo = (homeTeam: string, awayTeam: string) => {
    if (!injuries?.teams) return undefined;
    
    const findTeam = (teamName: string) => 
      injuries.teams.find((t: TeamInjuries) => 
        t.teamName.toLowerCase().includes(teamName.toLowerCase()) ||
        teamName.toLowerCase().includes(t.teamName.split(' ').pop()?.toLowerCase() || '')
      );
    
    const home = findTeam(homeTeam);
    const away = findTeam(awayTeam);
    
    const homeCount = home?.injuries.length || 0;
    const awayCount = away?.injuries.length || 0;
    const totalCount = homeCount + awayCount;
    
    const hasKeyPlayersOut = 
      (home?.injuries.some(i => i.severity === 'high' && (i.status === 'Out' || i.status === 'Injured Reserve')) || false) ||
      (away?.injuries.some(i => i.severity === 'high' && (i.status === 'Out' || i.status === 'Injured Reserve')) || false);
    
    if (totalCount === 0) return undefined;
    
    return { totalCount, homeCount, awayCount, hasKeyPlayersOut };
  };

  // Fetch odds and scores
  const fetchOdds = async () => {
    setLoadingOdds(true);
    setError(null);

    try {
      // Determine API endpoint based on sport
      let oddsUrl = `/api/odds/${sport.toLowerCase()}`;
      
      // Soccer uses a different route with league param
      if (sport === 'EPL') {
        oddsUrl = '/api/odds/soccer?league=epl';
      }
      
      // Fetch odds
      const oddsRes = await fetch(oddsUrl);
      
      if (!oddsRes.ok) {
        const data = await oddsRes.json();
        throw new Error(data.error || 'Failed to fetch odds');
      }

      const oddsData: OddsResponse = await oddsRes.json();
      setGames(oddsData.games);
      setLastFetch(new Date(oddsData.meta.fetchedAt));

      // Fetch scores (non-blocking) - skip for soccer for now
      if (sport !== 'EPL') {
        fetchScores();
      }
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

  // Fetch Super Bowl data
  const fetchSuperBowl = async () => {
    setLoadingSuperBowl(true);
    try {
      const res = await fetch('/api/odds/nfl');
      if (res.ok) {
        const data = await res.json();
        // Get the first NFL game (should be Super Bowl)
        if (data.games && data.games.length > 0) {
          setSuperBowlGame(data.games[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Super Bowl:', err);
    } finally {
      setLoadingSuperBowl(false);
    }
  };

  useEffect(() => {
    fetchOdds();
    fetchInjuries(); // Fetch injuries for the current sport
    setQuickPicks([]); // Clear picks when sport changes
    setSelectedPrediction(null);
    setSelectedPropsAnalysis(null);
    setSelectedNbaPropsAnalysis(null);
    setScores({});
    setInjuries(null);
    setInjuryCount(0);
    setError(null); // Clear any errors when sport changes
    // When sport changes, go to games view (unless we're on landing or tools which are sport-agnostic)
    if (view !== 'landing' && view !== 'tools' && view !== 'tracker') {
      setView('games');
    }
  }, [sport, view]);

  const handleGameSelect = (gameId: string) => {
    fetchGameAnalysis(gameId);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* FanDuel Promo Banner - hide on landing */}
      {view !== 'landing' && <FanDuelBanner />}

      {/* Header - Professional dark header on light background */}
      <header className={`sticky top-0 z-40 header-gradient shadow-lg ${view === 'landing' ? 'py-2' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          {/* Top Row - Logo, Title and Sport Toggle */}
          <div className="flex items-center justify-between gap-3">
            {/* Logo and Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src="/Pete/PeterCartoon1.png" 
                alt="Pete" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white/20"
              />
              <h1 className="text-base sm:text-lg font-semibold text-white truncate">
                Pete&apos;s AI Sports Picks
              </h1>
            </div>
            
            {/* Sport Toggle - Expanded with all sports */}
            <div className="flex bg-white/10 rounded-lg p-0.5 flex-shrink-0 overflow-x-auto backdrop-blur-sm">
              {(Object.keys(SPORTS_CONFIG) as Sport[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSport(s);
                    // NFL goes directly to Super Bowl landing page
                    if (s === 'NFL') {
                      setView('landing');
                    }
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    sport === s
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{SPORTS_CONFIG[s].emoji}</span>
                    <span className="hidden sm:inline">{SPORTS_CONFIG[s].label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-3 flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <NavTab 
              active={view === 'landing'} 
              onClick={() => setView('landing')}
              label="🏈 Super Bowl LX"
            />
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
            {/* Player Props - Available for sports with props */}
            {SPORTS_CONFIG[sport]?.hasProps && (
              <NavTab 
                active={view === 'props'} 
                onClick={() => setView('props')}
                disabled={sport === 'NHL' ? !selectedPropsAnalysis : !selectedNbaPropsAnalysis}
                label={sport === 'NHL' ? 'Goal Scorers' : sport === 'MLB' ? 'Player Props' : sport === 'EPL' ? 'Goal Scorers' : 'Player Props'}
              />
            )}
            <NavTab 
              active={view === 'tracker'} 
              onClick={() => setView('tracker')}
              label="📊 Tracker"
            />
            <NavTab 
              active={view === 'tools'} 
              onClick={() => setView('tools')}
              label="Tools"
            />
          </div>

          {/* Status bar */}
          <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-glow" />
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
      <main className={view === 'landing' ? '' : 'max-w-6xl mx-auto px-4 py-6 sm:px-6'}>
        {/* Error State - hide on landing page and when we have games */}
        {error && view !== 'landing' && games.length === 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State - hide on landing page */}
        {loadingOdds && games.length === 0 && view !== 'landing' && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="mt-4 text-slate-500 text-sm">
              Loading {sport} games...
            </span>
          </div>
        )}

        {/* Analysis Loading Overlay */}
        {(loadingAnalysis || loadingProps) && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center max-w-sm w-full shadow-xl animate-slide-up">
              <div className="w-10 h-10 mx-auto border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-4 font-medium text-slate-800">
                {loadingProps ? 'Analyzing Player Props' : 'Running AI Analysis'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This may take a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Super Bowl Landing View - Default landing page */}
        {view === 'landing' && (
          <SuperBowlLanding 
            onNavigate={(newView) => setView(newView as View)}
            onSportChange={(newSport) => setSport(newSport as Sport)}
          />
        )}

        {/* Games View */}
        {view === 'games' && games.length > 0 && (
          <div className="animate-slide-up">
            <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {sport} Games
                </h2>
                <p className="text-sm text-slate-400">
                  {games.length} game{games.length !== 1 ? 's' : ''} with odds available
                </p>
              </div>
              
              {/* Compact Injury Badge - click to expand */}
              <InjuryReport 
                sport={sport}
                filterTeams={games.flatMap(g => [g.homeTeam, g.awayTeam])}
                onInjuryCountChange={(count) => setInjuryCount(count)}
              />
            </div>

            {/* NFL Super Bowl Banner */}
            {sport === 'NFL' && (
              <div className="mb-6 p-4 bg-slate-900/60 rounded-lg border border-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Super Bowl LX Analysis</p>
                  <p className="text-xs text-slate-500">Expert picks, prediction models, and betting guides</p>
                </div>
                <button
                  onClick={() => setView('landing')}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  View Analysis
                </button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard
                  key={game.gameId}
                  game={game}
                  sport={sport}
                  score={scores[game.gameId]}
                  injuries={getGameInjuryInfo(game.homeTeam, game.awayTeam)}
                  onSelect={handleGameSelect}
                  onPropsSelect={
                    sport === 'NHL' ? fetchPlayerPropsAnalysis : 
                    sport === 'NBA' ? fetchNbaPlayerPropsAnalysis : 
                    undefined
                  }
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
                      ? 'bg-[#2a3444] text-slate-200'
                      : 'bg-[#161d29] text-slate-500 hover:text-slate-300'
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

        {/* Tracker View */}
        {view === 'tracker' && (
          <div className="animate-slide-up space-y-6">
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                📊 Performance Tracker
              </h2>
              <p className="text-sm text-slate-400">
                Track AI pick accuracy and ROI over time
              </p>
            </div>
            
            {/* Performance Dashboard */}
            <PerformanceDashboard />
            
            {/* Odds Movement for selected game */}
            {games.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Line Movement
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {games.slice(0, 2).map(game => (
                    <OddsMovementChart key={game.gameId} game={game} sport={sport} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Super Bowl View - Legacy props card (redirects to landing) */}
        {view === 'superbowl' && (
          <div className="animate-slide-up">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                🏈 Super Bowl LX
              </h2>
              <p className="text-sm text-slate-400">
                Seahawks vs Patriots • February 8, 2026
              </p>
            </div>
            <SuperBowlCard game={superBowlGame} loading={loadingSuperBowl} />
            <div className="mt-6 text-center">
              <button
                onClick={() => setView('landing')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
              >
                📊 View Full Super Bowl Analysis Hub →
              </button>
            </div>
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

      {/* Footer - hide on landing page which has its own footer */}
      {view !== 'landing' && (
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
      )}
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
          ? 'text-white border-white'
          : 'text-white/60 border-transparent hover:text-white/90'
      }`}
    >
      {label}
    </button>
  );
}
