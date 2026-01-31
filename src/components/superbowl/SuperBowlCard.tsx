'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { NormalizedOdds } from '@/types/odds';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
// TeamLogo imported but using local NflTeamLogo for NFL-specific logo handling

interface SuperBowlProps {
  game: NormalizedOdds | null;
  loading: boolean;
}

interface PropMarket {
  playerName: string;
  line?: number;
  name?: string;
  odds: Array<{
    bookmaker: string;
    americanOdds: number;
    price: number;
  }>;
}

interface PropsData {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  propsByMarket: Record<string, PropMarket[]>;
  availableMarkets: string[];
}

interface Analysis {
  gamePreview: {
    summary: string;
    keyFactors: string[];
    weatherImpact: string;
  };
  topPicks: Array<{
    type: string;
    player: string;
    pick: string;
    odds: string;
    confidence: number;
    reasoning: string;
  }>;
  valueProps: Array<{
    player: string;
    market: string;
    pick: string;
    odds: string;
    reasoning: string;
  }>;
  avoidProps: Array<{
    player: string;
    market: string;
    reasoning: string;
  }>;
  parlayIdeas: Array<{
    legs: string[];
    reasoning: string;
  }>;
  mvpPrediction: {
    player: string;
    reasoning: string;
  };
}

// NFL Team logos from ESPN CDN
const NFL_TEAM_LOGOS: Record<string, string> = {
  'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
  'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
  'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
  'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
  'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
  'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
  'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
  'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
  'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
  'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
  'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
  'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
  'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
  'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
  'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
  'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
  'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
  'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
  'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
  'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
  'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
  'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
  'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
};

const MARKET_LABELS: Record<string, string> = {
  player_anytime_td: 'Anytime TD',
  player_1st_td: 'First TD',
  player_last_td: 'Last TD',
  player_pass_tds: 'Pass TDs',
  player_pass_yds: 'Pass Yards',
  player_pass_completions: 'Completions',
  player_pass_attempts: 'Pass Attempts',
  player_pass_interceptions: 'Interceptions',
  player_pass_longest_completion: 'Longest Pass',
  player_rush_yds: 'Rush Yards',
  player_rush_attempts: 'Rush Attempts',
  player_rush_longest: 'Longest Rush',
  player_rush_tds: 'Rush TDs',
  player_receptions: 'Receptions',
  player_reception_yds: 'Rec Yards',
  player_reception_longest: 'Longest Rec',
  player_reception_tds: 'Rec TDs',
  player_pass_rush_yds: 'Pass+Rush Yds',
  player_rush_reception_yds: 'Rush+Rec Yds',
  player_rush_reception_tds: 'Rush+Rec TDs',
  player_kicking_points: 'Kicking Pts',
  player_field_goals: 'Field Goals',
  player_sacks: 'Sacks',
  player_tackles_assists: 'Tackles+Ast',
  player_defensive_interceptions: 'Def INTs',
};

const MARKET_CATEGORIES = {
  'Touchdowns': ['player_anytime_td', 'player_1st_td', 'player_last_td'],
  'Passing': ['player_pass_yds', 'player_pass_tds', 'player_pass_completions', 'player_pass_attempts', 'player_pass_interceptions'],
  'Rushing': ['player_rush_yds', 'player_rush_attempts', 'player_rush_tds', 'player_rush_longest'],
  'Receiving': ['player_receptions', 'player_reception_yds', 'player_reception_tds', 'player_reception_longest'],
  'Combined': ['player_pass_rush_yds', 'player_rush_reception_yds', 'player_rush_reception_tds'],
  'Kicking': ['player_kicking_points', 'player_field_goals'],
  'Defense': ['player_sacks', 'player_tackles_assists', 'player_defensive_interceptions'],
};

function NflTeamLogo({ team, size = 'md' }: { team: string; size?: 'sm' | 'md' | 'lg' }) {
  const logoUrl = NFL_TEAM_LOGOS[team];
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  if (!logoUrl) {
    return (
      <div className={`${sizeClasses[size]} bg-slate-700 rounded-full flex items-center justify-center`}>
        <span className="text-white font-bold text-xs">
          {team.split(' ').map(w => w[0]).join('').slice(0, 3)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={team}
      width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      className={sizeClasses[size]}
      unoptimized
    />
  );
}

export function SuperBowlCard({ game, loading }: SuperBowlProps) {
  const [propsData, setPropsData] = useState<PropsData | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loadingProps, setLoadingProps] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Touchdowns');
  const [selectedMarket, setSelectedMarket] = useState<string>('player_anytime_td');
  const [activeTab, setActiveTab] = useState<'props' | 'analysis'>('props');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (game?.gameId) {
      fetchProps(game.gameId);
    }
  }, [game?.gameId]);

  const fetchProps = async (eventId: string) => {
    setLoadingProps(true);
    setError(null);
    try {
      const res = await fetch(`/api/odds/nfl/props?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setPropsData(data);
        // Set first available market as default
        if (data.availableMarkets?.length > 0) {
          const firstMarket = data.availableMarkets[0];
          setSelectedMarket(firstMarket);
          // Find category for this market
          for (const [cat, markets] of Object.entries(MARKET_CATEGORIES)) {
            if (markets.includes(firstMarket)) {
              setSelectedCategory(cat);
              break;
            }
          }
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Props not available yet');
      }
    } catch (err) {
      setError('Failed to load props');
    } finally {
      setLoadingProps(false);
    }
  };

  const fetchAnalysis = async () => {
    if (!game || !propsData) return;
    
    setLoadingAnalysis(true);
    try {
      const res = await fetch('/api/analyze/superbowl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          propsByMarket: propsData.propsByMarket,
          gameLines: {
            spread: game.spread.consensusLine,
            total: game.total.consensusLine,
            homeML: game.moneyline.bestHome?.americanOdds,
            awayML: game.moneyline.bestAway?.americanOdds,
          },
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const formatOdds = (american: number) => american > 0 ? `+${american}` : `${american}`;

  const availableMarketsInCategory = MARKET_CATEGORIES[selectedCategory as keyof typeof MARKET_CATEGORIES]?.filter(
    m => propsData?.availableMarkets.includes(m)
  ) || [];

  if (loading) {
    return (
      <div className="bg-[#161d29] border border-slate-700/40 rounded-lg p-8 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
        <p className="mt-4 text-slate-500">Loading Super Bowl data...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-[#161d29] border border-slate-700/40 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🏈</div>
        <p className="text-slate-200 font-semibold text-lg">Super Bowl LX</p>
        <p className="text-slate-500 text-sm mt-2">
          No Super Bowl odds available yet. Check back closer to game day!
        </p>
      </div>
    );
  }

  const gameDate = new Date(game.commenceTime);

  return (
    <div className="space-y-4">
      {/* Super Bowl Header */}
      <div className="relative bg-[#161d29] border border-slate-700/40 rounded-xl overflow-hidden">
        {/* NFL Logo watermark */}
        <div className="absolute top-4 right-4 opacity-10">
          <Image
            src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png"
            alt="NFL"
            width={80}
            height={80}
            unoptimized
          />
        </div>
        
        {/* Super Bowl Badge */}
        <div className="bg-gradient-to-r from-[#7a6a4a] via-[#a38f5c] to-[#7a6a4a] px-4 py-2 text-center">
          <span className="text-slate-900 font-bold text-sm tracking-wider">SUPER BOWL LX</span>
        </div>

        <div className="p-6">
          {/* Teams */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <NflTeamLogo team={game.awayTeam} size="lg" />
              <p className="mt-2 text-white font-semibold">{game.awayTeam.split(' ').pop()}</p>
              <p className="text-xs text-slate-400">{game.awayTeam.split(' ').slice(0, -1).join(' ')}</p>
            </div>
            
            <div className="text-center px-4">
              <span className="text-2xl font-bold text-slate-500">VS</span>
              <div className="mt-1 text-xs text-slate-500">
                {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-slate-500">
                {gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="text-center">
              <NflTeamLogo team={game.homeTeam} size="lg" />
              <p className="mt-2 text-white font-semibold">{game.homeTeam.split(' ').pop()}</p>
              <p className="text-xs text-slate-400">{game.homeTeam.split(' ').slice(0, -1).join(' ')}</p>
            </div>
          </div>

          {/* Game Lines */}
          <div className="grid grid-cols-3 gap-3">
            {/* Moneyline */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Moneyline</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{game.awayTeam.split(' ').pop()}</span>
                  <span className={`text-sm font-mono font-semibold ${game.moneyline.bestAway?.americanOdds && game.moneyline.bestAway.americanOdds > 0 ? 'text-[#5a9a7e]' : 'text-slate-200'}`}>
                    {game.moneyline.bestAway ? formatOdds(game.moneyline.bestAway.americanOdds) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{game.homeTeam.split(' ').pop()}</span>
                  <span className={`text-sm font-mono font-semibold ${game.moneyline.bestHome?.americanOdds && game.moneyline.bestHome.americanOdds > 0 ? 'text-[#5a9a7e]' : 'text-slate-200'}`}>
                    {game.moneyline.bestHome ? formatOdds(game.moneyline.bestHome.americanOdds) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Spread */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Spread</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{game.awayTeam.split(' ').pop()}</span>
                  <span className="text-sm font-mono text-white">
                    {game.spread.consensusLine ? (game.spread.consensusLine > 0 ? `+${game.spread.consensusLine}` : game.spread.consensusLine) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{game.homeTeam.split(' ').pop()}</span>
                  <span className="text-sm font-mono text-white">
                    {game.spread.consensusLine ? (game.spread.consensusLine > 0 ? `-${game.spread.consensusLine}` : `+${Math.abs(game.spread.consensusLine)}`) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Total</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Over</span>
                  <span className="text-sm font-mono text-white">{game.total.consensusLine || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Under</span>
                  <span className="text-sm font-mono text-white">{game.total.consensusLine || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'props'
              ? 'bg-[#2a3444] text-slate-200'
              : 'bg-[#161d29] text-slate-500 hover:text-slate-300 border border-slate-700/40'
          }`}
        >
          Player Props
        </button>
        <button
          onClick={() => {
            setActiveTab('analysis');
            if (!analysis && propsData) fetchAnalysis();
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'analysis'
              ? 'bg-[#2a3444] text-slate-200'
              : 'bg-[#161d29] text-slate-500 hover:text-slate-300 border border-slate-700/40'
          }`}
        >
          AI Analysis
        </button>
      </div>

      {/* Props Tab */}
      {activeTab === 'props' && (
        <div className="bg-[#161d29] border border-slate-700/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between">
            <div>
              <h3 className="text-slate-200 font-medium">Player Props</h3>
              <p className="text-xs text-slate-500">
                {propsData?.availableMarkets.length || 0} markets available
              </p>
            </div>
            <Image
              src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png"
              alt="NFL"
              width={32}
              height={32}
              className="opacity-60"
              unoptimized
            />
          </div>

          {loadingProps ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 mx-auto border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
              <p className="mt-3 text-sm text-slate-500">Loading props...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              {/* Fallback content when live props aren't available */}
              <div className="text-center mb-6">
                <p className="text-slate-400 text-sm mb-4">
                  Live props data is currently unavailable. Check out our comprehensive Super Bowl analysis hub:
                </p>
                <a 
                  href="/nfl/super-bowl"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  📊 Expert Picks & Analysis Hub →
                </a>
              </div>
              
              {/* Featured Props Preview */}
              <div className="border-t border-slate-700/40 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Featured Super Bowl Props</h4>
                <div className="space-y-2">
                  {[
                    { player: 'Patrick Mahomes', market: 'Pass Yards O/U', line: '270.5', bestOdds: '-115' },
                    { player: 'Saquon Barkley', market: 'Rush Yards O/U', line: '85.5', bestOdds: '-110' },
                    { player: 'Travis Kelce', market: 'Rec Yards O/U', line: '65.5', bestOdds: '-115' },
                    { player: 'DeVonta Smith', market: 'Anytime TD', line: '', bestOdds: '+175' },
                  ].map((prop, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-slate-200">{prop.player}</span>
                        <span className="text-xs text-slate-500 ml-2">{prop.market} {prop.line}</span>
                      </div>
                      <span className="text-sm font-mono text-emerald-400">{prop.bestOdds}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  * Sample lines shown. Visit the analysis hub for live odds comparison.
                </p>
              </div>
            </div>
          ) : propsData && propsData.availableMarkets.length > 0 ? (
            <div className="p-4">
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 -mx-4 px-4">
                {Object.keys(MARKET_CATEGORIES).map(cat => {
                  const hasProps = MARKET_CATEGORIES[cat as keyof typeof MARKET_CATEGORIES].some(
                    m => propsData.availableMarkets.includes(m)
                  );
                  if (!hasProps) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        const firstMarket = MARKET_CATEGORIES[cat as keyof typeof MARKET_CATEGORIES].find(
                          m => propsData.availableMarkets.includes(m)
                        );
                        if (firstMarket) setSelectedMarket(firstMarket);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#a38f5c] text-slate-900'
                          : 'bg-[#1e2836] text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Market Sub-tabs */}
              {availableMarketsInCategory.length > 1 && (
                <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
                  {availableMarketsInCategory.map(market => (
                    <button
                      key={market}
                      onClick={() => setSelectedMarket(market)}
                      className={`px-2.5 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                        selectedMarket === market
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {MARKET_LABELS[market] || market}
                    </button>
                  ))}
                </div>
              )}

              {/* Props Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Player</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Line</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">Best Odds</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Book</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {propsData.propsByMarket[selectedMarket]?.slice(0, 25).map((prop, idx) => {
                      const bestOdds = prop.odds.reduce((best, curr) => 
                        curr.americanOdds > best.americanOdds ? curr : best
                      , prop.odds[0]);
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-700/20">
                          <td className="px-3 py-2.5">
                            <span className="text-sm text-white">{prop.playerName}</span>
                            {prop.name && prop.name !== 'Yes' && prop.name !== 'Over' && prop.name !== 'Under' && (
                              <span className="text-xs text-slate-500 ml-2">({prop.name})</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-sm text-slate-300 font-mono">
                              {prop.line !== undefined ? prop.line : '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-sm font-mono font-semibold ${bestOdds.americanOdds > 0 ? 'text-[#5a9a7e]' : 'text-slate-200'}`}>
                              {formatOdds(bestOdds.americanOdds)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-xs text-slate-500">{bestOdds.bookmaker}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {(!propsData.propsByMarket[selectedMarket] || propsData.propsByMarket[selectedMarket].length === 0) && (
                  <p className="text-center py-6 text-slate-400 text-sm">
                    No props available for this market
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm">No props available yet</p>
              <p className="text-slate-500 text-xs mt-1">Props typically release 1-2 weeks before the Super Bowl</p>
            </div>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2a3444] rounded-lg flex items-center justify-center">
              <span className="text-slate-300 text-sm font-medium">AI</span>
            </div>
            <div>
              <h3 className="text-white font-medium">AI Analysis</h3>
              <p className="text-xs text-slate-400">Powered by Claude</p>
            </div>
          </div>

          {loadingAnalysis ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-4 text-slate-400">Analyzing Super Bowl props...</p>
              <p className="text-xs text-slate-500 mt-1">This may take a moment</p>
            </div>
          ) : analysis ? (
            <div className="p-4 space-y-6">
              {/* Game Preview */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Game Preview</h4>
                <p className="text-sm text-slate-300">{analysis.gamePreview.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.gamePreview.keyFactors.map((factor, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Picks */}
              {analysis.topPicks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-amber-400">★</span> Top Picks
                  </h4>
                  <div className="space-y-3">
                    {analysis.topPicks.map((pick, i) => (
                      <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <PlayerAvatar playerName={pick.player} sport="nfl" size="sm" />
                            <div>
                              <span className="text-white font-medium">{pick.player}</span>
                              <span className="text-slate-500 text-xs ml-2">{pick.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#5a9a7e] font-mono text-sm">{pick.odds}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              pick.confidence >= 80 ? 'bg-[#4a8a6e]/20 text-[#5a9a7e]' :
                              pick.confidence >= 60 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-600/20 text-slate-400'
                            }`}>
                              {pick.confidence}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mb-1">{pick.pick}</p>
                        <p className="text-xs text-slate-400">{pick.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Value Props */}
              {analysis.valueProps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Value Props</h4>
                  <div className="grid gap-2">
                    {analysis.valueProps.map((prop, i) => (
                      <div key={i} className="bg-slate-900/30 rounded p-2.5 border border-slate-700/20">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <PlayerAvatar playerName={prop.player} sport="nfl" size="xs" />
                            <span className="text-sm text-white">{prop.player}</span>
                          </div>
                          <span className="text-xs text-[#5a9a7e] font-mono">{prop.odds}</span>
                        </div>
                        <p className="text-xs text-slate-400">{prop.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Props to Avoid */}
              {analysis.avoidProps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-[#9e7a7a]">⚠</span> Props to Avoid
                  </h4>
                  <div className="space-y-2">
                    {analysis.avoidProps.map((prop, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <PlayerAvatar playerName={prop.player} sport="nfl" size="xs" />
                        <div>
                          <span className="text-slate-300">{prop.player}</span>
                          <span className="text-slate-500 text-xs ml-1">({prop.market})</span>
                          <p className="text-xs text-slate-500">{prop.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parlay Ideas */}
              {analysis.parlayIdeas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Parlay Ideas</h4>
                  {analysis.parlayIdeas.map((parlay, i) => (
                    <div key={i} className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-lg p-3 border border-amber-500/20 mb-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {parlay.legs.map((leg, j) => (
                          <span key={j} className="px-2 py-1 bg-slate-800 rounded text-xs text-white">
                            {leg}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">{parlay.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* MVP Prediction */}
              {analysis.mvpPrediction && (
                <div className="bg-gradient-to-r from-amber-500/20 to-transparent rounded-lg p-4 border border-amber-500/30">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3">🏆 MVP Prediction</h4>
                  <div className="flex items-center gap-3">
                    <PlayerAvatar playerName={analysis.mvpPrediction.player} sport="nfl" size="lg" />
                    <div>
                      <p className="text-white font-medium text-lg">{analysis.mvpPrediction.player}</p>
                      <p className="text-xs text-slate-400 mt-1">{analysis.mvpPrediction.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <button
                onClick={fetchAnalysis}
                disabled={!propsData}
                className="px-6 py-3 bg-[#2a3444] hover:bg-[#3a4454] disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
              >
                {propsData ? 'Generate Analysis' : 'Load Props First'}
              </button>
              <p className="text-xs text-slate-500 mt-3">
                AI will analyze available props and provide recommendations
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
