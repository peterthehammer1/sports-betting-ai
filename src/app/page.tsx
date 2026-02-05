'use client';

import { useEffect, useState, useRef } from 'react';
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
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, sport }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze game');
      }

      const data = await res.json();
      
      // Validate the prediction data exists
      if (!data.prediction) {
        console.error('API response missing prediction:', data);
        throw new Error('Analysis response was incomplete. Please try again.');
      }
      
      setSelectedPrediction(data.prediction);
      setView('analysis');
    } catch (err) {
      console.error('Analysis fetch error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Analysis timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      }
      // Make sure we stay on games view if analysis fails
      setView('games');
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

  // Track previous sport to detect actual sport changes
  const prevSportRef = useRef(sport);
  
  useEffect(() => {
    // Only reset state when sport ACTUALLY changes (not on view changes)
    const sportChanged = prevSportRef.current !== sport;
    prevSportRef.current = sport;
    
    if (sportChanged) {
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
      // When sport changes, go to appropriate view
      if (sport === 'NFL') {
        setView('landing');
      } else {
        setView('games');
      }
    }
  }, [sport]);

  const handleGameSelect = (gameId: string) => {
    fetchGameAnalysis(gameId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] hero-gradient">
      {/* FanDuel Promo Banner - hide on landing */}
      {view !== 'landing' && <FanDuelBanner />}

      {/* Header - Clean professional design */}
      <header className={`sticky top-0 z-40 bg-[#0d1117] border-b border-slate-800 ${view === 'landing' ? 'py-2' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          {/* Top Row - Logo, Title and Sport Toggle */}
          <div className="flex items-center justify-between gap-3">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src="/Pete/PeterCartoon1.png" 
                alt="Pete" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
                  Pete&apos;s AI Sports Picks
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide uppercase">AI-Powered Predictions</p>
              </div>
            </div>
            
            {/* Sport Toggle - Clean professional style */}
            <div className="flex bg-slate-800/50 rounded-lg p-0.5 flex-shrink-0 overflow-x-auto">
              {(Object.keys(SPORTS_CONFIG) as Sport[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSport(s);
                    // NFL goes to Super Bowl landing, other sports go to games
                    if (s === 'NFL') {
                      setView('landing');
                    } else {
                      setView('games');
                    }
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    sport === s
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{SPORTS_CONFIG[s].emoji}</span>
                    <span className="hidden sm:inline">{SPORTS_CONFIG[s].label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs - Modern underline style */}
          <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <NavTab 
              active={view === 'landing'} 
              onClick={() => setView('landing')}
              label="🏈 Super Bowl LX"
            />
            {/* Hide Games tab for NFL since Super Bowl is the only game */}
            {sport !== 'NFL' && (
              <NavTab 
                active={view === 'games'} 
                onClick={() => setView('games')}
                label="Games"
              />
            )}
            {/* Analysis - hide for NFL since it's in Super Bowl landing */}
            {sport !== 'NFL' && (
              <NavTab 
                active={view === 'analysis'} 
                onClick={() => setView('analysis')}
                disabled={!selectedPrediction}
                label="Analysis"
              />
            )}
            {/* Player Props - Available for sports with props, hide for NFL */}
            {SPORTS_CONFIG[sport]?.hasProps && sport !== 'NFL' && (
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

          {/* Status bar - Clean and minimal */}
          <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 tracking-wide">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-emerald-500 font-medium uppercase">Live</span>
            </div>
            {lastFetch && (
              <span className="text-slate-600">
                Updated {lastFetch.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={view === 'landing' ? '' : 'max-w-6xl mx-auto px-4 py-6 sm:px-6'}>
        {/* Error State - Modern glass card */}
        {error && view !== 'landing' && (
          <div className="mb-6 glass-card p-4 rounded-xl animate-slide-up border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400">⚠️</span>
                </div>
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-slate-500 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State - Modern spinner */}
        {loadingOdds && games.length === 0 && view !== 'landing' && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
            </div>
            <span className="mt-4 text-slate-400 text-sm">
              Loading {sport} games...
            </span>
          </div>
        )}

        {/* Analysis Loading Overlay - Sleek modal */}
        {(loadingAnalysis || loadingProps) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-8 text-center max-w-sm w-full animate-scale-up">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
                <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}} />
              </div>
              <p className="font-semibold text-white text-lg">
                {loadingProps ? 'Analyzing Player Props' : 'Running AI Analysis'}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Crunching the numbers...
              </p>
              <div className="mt-4 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse" style={{width: '60%'}} />
              </div>
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
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{SPORTS_CONFIG[sport].emoji}</span>
                  {sport} Games
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {games.length} game{games.length !== 1 ? 's' : ''} with live odds
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
              <div className="mb-6 glass-card gradient-border p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white flex items-center gap-2">
                    <span className="text-lg">🏈</span> Super Bowl LX Analysis
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Expert picks, prediction models, and betting guides</p>
                </div>
                <button
                  onClick={() => setView('landing')}
                  className="btn-primary text-sm"
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
          <div className="animate-slide-up space-y-6">
            {/* Tool Selector - Modern pill style */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              {[
                { id: 'betnow', label: 'Bet Now', icon: '💰' },
                { id: 'compare', label: 'Line Shopping', icon: '📊' },
                { id: 'calculator', label: 'Calculator', icon: '🧮' },
                { id: 'parlay', label: 'Parlay Builder', icon: '🎯' },
                { id: 'guide', label: 'Guide', icon: '📚' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as typeof selectedTool)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedTool === tool.id
                      ? 'glass-card text-white glow-cyan'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tool.icon}</span>
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Selected Tool */}
            {selectedTool === 'betnow' && (
              <OddsWidget sport={sport === 'NFL' ? 'americanfootball_nfl' : sport === 'NHL' ? 'icehockey_nhl' : 'basketball_nba'} />
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
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg">
                  📊
                </span>
                Performance Tracker
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Track AI pick accuracy and ROI over time
              </p>
            </div>
            
            {/* Performance Dashboard */}
            <PerformanceDashboard />
            
            {/* Odds Movement for selected game */}
            {games.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
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
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🏈</span>
                Super Bowl LX
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Seahawks vs Patriots • February 8, 2026
              </p>
            </div>
            <SuperBowlCard game={superBowlGame} loading={loadingSuperBowl} />
            <div className="mt-8 text-center">
              <button
                onClick={() => setView('landing')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>📊</span>
                View Full Super Bowl Analysis Hub
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State - Modern design */}
        {!loadingOdds && games.length === 0 && !error && view !== 'landing' && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <span className="text-4xl">{SPORTS_CONFIG[sport].emoji}</span>
            </div>
            <p className="text-white font-semibold text-lg">
              No {sport} games available
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Check back later for upcoming matchups
            </p>
          </div>
        )}
      </main>

      {/* Footer - hide on landing page which has its own footer */}
      {view !== 'landing' && (
        <footer className="mt-auto py-8 border-t border-white/5 safe-area-bottom">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <span className="text-amber-500">⚠️</span>
                For entertainment purposes only. Please gamble responsibly.
              </p>
              <p className="flex items-center gap-1">
                © 2026 
                <span className="gradient-text font-medium">Pete&apos;s AI Sports Picks</span>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// Navigation Tab Component - Modern underline style
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
      className={`relative px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation ${
        active
          ? 'text-white tab-active'
          : 'text-slate-500 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
