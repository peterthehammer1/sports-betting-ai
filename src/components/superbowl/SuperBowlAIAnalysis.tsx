/**
 * Super Bowl AI Analysis Component
 * The crown jewel - comprehensive AI-powered predictions
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Analysis {
  gameWinner: {
    pick: string;
    confidence: number;
    spread: string;
    spreadConfidence: number;
    analysis: string;
    keyFactors: string[];
  };
  total: {
    pick: 'Over' | 'Under';
    line: number;
    confidence: number;
    projectedScore: string;
    analysis: string;
    keyFactors: string[];
  };
  playerProps: Array<{
    player: string;
    team: 'SEA' | 'NE';
    market: string;
    pick: string;
    line: string;
    odds: string;
    confidence: number;
    reasoning: string;
  }>;
  quarterProps: Array<{
    quarter: string;
    market: string;
    pick: string;
    odds: string;
    confidence: number;
    reasoning: string;
  }>;
  halfProps: Array<{
    half: string;
    market: string;
    pick: string;
    odds: string;
    confidence: number;
    reasoning: string;
  }>;
  parlays: Array<{
    name: string;
    legs: string[];
    totalOdds: string;
    payout: string;
    confidence: number;
    reasoning: string;
  }>;
  mvp: {
    pick: string;
    odds: string;
    confidence: number;
    reasoning: string;
    darkHorse: {
      pick: string;
      odds: string;
      reasoning: string;
    };
  };
  finalScore: {
    seahawks: number;
    patriots: number;
    reasoning: string;
  };
}

const SEAHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png';
const PATRIOTS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png';

export function SuperBowlAIAnalysis() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    gameWinner: true,
    total: true,
    playerProps: true,
    periodBets: false,
    parlays: true,
    mvp: true,
  });

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze/superbowl/comprehensive', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      } else {
        setError('Failed to generate analysis');
      }
    } catch (err) {
      setError('Failed to connect to AI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
    const color = confidence >= 75 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' :
                  confidence >= 60 ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' :
                  'text-slate-400 bg-slate-500/20 border-slate-500/30';
    return (
      <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${color}`}>
        {confidence}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
          <div>
            <p className="text-white font-medium">Generating AI Analysis...</p>
            <p className="text-xs text-slate-400 mt-0.5">Analyzing matchups, props, and betting value</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400 mb-4">{error || 'Analysis not available'}</p>
        <button
          onClick={fetchAnalysis}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
        >
          Generate AI Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
          <img 
            src="/Pete/PeterCartoon1.png" 
            alt="Pete" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-white">Pete&apos;s AI Analysis</h2>
            <p className="text-xs text-slate-500">Super Bowl LX Predictions</p>
          </div>
        </div>
        <button
          onClick={fetchAnalysis}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Final Score Prediction */}
      <div className="p-5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Predicted Final Score</h3>
          <span className="px-2 py-0.5 rounded text-xs font-semibold text-emerald-400 bg-emerald-500/20">
            {analysis.gameWinner.confidence}%
          </span>
        </div>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="bg-white/10 rounded-xl p-2">
              <Image src={SEAHAWKS_LOGO} alt="Seahawks" width={48} height={48} unoptimized />
            </div>
            <p className="text-3xl font-bold text-white mt-2">{analysis.finalScore.seahawks}</p>
            <p className="text-xs text-slate-400">Seahawks</p>
          </div>
          <div className="text-2xl text-slate-500">—</div>
          <div className="text-center">
            <div className="bg-white/10 rounded-xl p-2">
              <Image src={PATRIOTS_LOGO} alt="Patriots" width={48} height={48} unoptimized />
            </div>
            <p className="text-3xl font-bold text-white mt-2">{analysis.finalScore.patriots}</p>
            <p className="text-xs text-slate-400">Patriots</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 text-center mt-4">{analysis.finalScore.reasoning}</p>
      </div>

      {/* Game Winner & Spread */}
      <Section 
        title="Game Winner & Spread" 
        icon="🏆"
        expanded={expanded.gameWinner}
        onToggle={() => toggleSection('gameWinner')}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <PickCard
            title="Moneyline Pick"
            pick={analysis.gameWinner.pick}
            confidence={analysis.gameWinner.confidence}
            analysis={analysis.gameWinner.analysis}
            teamLogo={analysis.gameWinner.pick.includes('Seahawks') ? SEAHAWKS_LOGO : PATRIOTS_LOGO}
          />
          <PickCard
            title="Spread Pick"
            pick={analysis.gameWinner.spread}
            confidence={analysis.gameWinner.spreadConfidence}
            analysis={`Based on matchup analysis and historical trends.`}
            teamLogo={analysis.gameWinner.spread.includes('SEA') ? SEAHAWKS_LOGO : PATRIOTS_LOGO}
          />
        </div>
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Key Factors</p>
          <div className="flex flex-wrap gap-2">
            {analysis.gameWinner.keyFactors.map((factor, i) => (
              <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400">
                {factor}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Total */}
      <Section 
        title="Total Points" 
        icon="📊"
        expanded={expanded.total}
        onToggle={() => toggleSection('total')}
      >
        <div className="flex items-center gap-6 mb-4 pt-4">
          <div className="flex-1 p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
            <p className="text-2xl font-bold text-white">{analysis.total.pick} {analysis.total.line}</p>
            <p className="text-xs text-slate-500 mt-1">AI Pick</p>
          </div>
          <div className="flex-1 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-center">
            <p className="text-2xl font-bold text-emerald-400">{analysis.total.projectedScore}</p>
            <p className="text-xs text-slate-500 mt-1">Projected Score</p>
          </div>
          <div className="flex-1 p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
            <ConfidenceBadge confidence={analysis.total.confidence} />
            <p className="text-xs text-slate-500 mt-1">Confidence</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">{analysis.total.analysis}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.total.keyFactors.map((factor, i) => (
            <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
              {factor}
            </span>
          ))}
        </div>
      </Section>

      {/* Pete's A+ Picks - Featured Walker Props */}
      <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-5">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/Pete/PeterCartoon1.png" 
            alt="Pete" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-amber-400">Pete&apos;s A+ Picks</h3>
            <p className="text-xs text-slate-500">Highest confidence player props</p>
          </div>
          <span className="ml-auto px-3 py-1 bg-amber-500/20 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30">
            🔥 FEATURED
          </span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Walker Under Rushing */}
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Image src={SEAHAWKS_LOGO} alt="SEA" width={36} height={36} unoptimized />
              <div>
                <p className="font-semibold text-white">Kenneth Walker III</p>
                <p className="text-xs text-slate-500">Rushing Yards</p>
              </div>
              <span className="ml-auto px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs font-bold text-emerald-400">
                85%
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-red-400">UNDER</span>
              <span className="text-lg font-bold text-white">75.5</span>
              <span className="text-sm font-mono text-slate-500">-110</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Patriots boast the #4 run defense (95.2 YPG allowed). NE stuffed Broncos to 67 rush yards in AFC Championship. Seattle will lean on JSN in the passing game. <span className="text-amber-400 font-medium">Projection: 55-65 yards.</span>
            </p>
          </div>

          {/* Walker Over Receiving */}
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Image src={SEAHAWKS_LOGO} alt="SEA" width={36} height={36} unoptimized />
              <div>
                <p className="font-semibold text-white">Kenneth Walker III</p>
                <p className="text-xs text-slate-500">Receiving Yards</p>
              </div>
              <span className="ml-auto px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs font-bold text-emerald-400">
                88%
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-emerald-400">OVER</span>
              <span className="text-lg font-bold text-white">18.5</span>
              <span className="text-sm font-mono text-slate-500">-115</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              With Patriots stacking the box, Walker becomes the key outlet receiver. Averaging 3.2 receptions/game in playoffs. Seattle uses screens and check-downs under pressure. <span className="text-amber-400 font-medium">Projection: 4-5 catches, 25-35 yards.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Player Props */}
      <Section 
        title="More Player Props" 
        icon="🏈"
        expanded={expanded.playerProps}
        onToggle={() => toggleSection('playerProps')}
        badge={`${analysis.playerProps.length} picks`}
      >
        <div className="grid gap-3 pt-4">
          {analysis.playerProps.filter(p => !(p.player === 'Kenneth Walker III' && (p.market === 'Rushing Yards' || p.market === 'Receiving Yards'))).map((prop, i) => (
            <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-start gap-4">
              <Image 
                src={prop.team === 'SEA' ? SEAHAWKS_LOGO : PATRIOTS_LOGO} 
                alt={prop.team} 
                width={32} 
                height={32} 
                unoptimized 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-medium text-white">{prop.player}</span>
                    <span className="text-xs text-slate-500 ml-2">{prop.market}</span>
                  </div>
                  <ConfidenceBadge confidence={prop.confidence} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-emerald-400">{prop.pick}</span>
                  <span className="text-xs text-slate-500">{prop.line}</span>
                  <span className="text-xs font-mono text-slate-500">{prop.odds}</span>
                </div>
                <p className="text-xs text-slate-400">{prop.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Quarter & Half Bets */}
      <Section 
        title="Quarter & Half Bets" 
        icon="⏱️"
        expanded={expanded.periodBets}
        onToggle={() => toggleSection('periodBets')}
      >
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">First Half</p>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.halfProps.map((prop, i) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{prop.market}</span>
                    <ConfidenceBadge confidence={prop.confidence} />
                  </div>
                  <p className="text-emerald-400 font-semibold">{prop.pick}</p>
                  <p className="text-xs text-slate-500 mt-1">{prop.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Quarter Bets</p>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.quarterProps.map((prop, i) => (
                <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{prop.quarter}: {prop.market}</span>
                    <ConfidenceBadge confidence={prop.confidence} />
                  </div>
                  <p className="text-emerald-400 font-semibold">{prop.pick}</p>
                  <p className="text-xs text-slate-500 mt-1">{prop.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Parlays */}
      <Section 
        title="Suggested Parlays" 
        icon="💰"
        expanded={expanded.parlays}
        onToggle={() => toggleSection('parlays')}
      >
        <div className="grid gap-4 pt-4">
          {analysis.parlays.map((parlay, i) => (
            <div key={i} className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">🎯</span>
                  <span className="font-semibold text-white">{parlay.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ConfidenceBadge confidence={parlay.confidence} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {parlay.legs.map((leg, j) => (
                  <span key={j} className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-white border border-slate-700">
                    {leg}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
                <p className="text-xs text-slate-400">{parlay.reasoning}</p>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Odds: <span className="text-white font-mono">{parlay.totalOdds}</span></p>
                  <p className="text-sm font-bold text-emerald-400">${parlay.payout} payout</p>
                  <p className="text-[10px] text-slate-500">per $10 bet</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* MVP */}
      <Section 
        title="MVP Prediction" 
        icon="🏆"
        expanded={expanded.mvp}
        onToggle={() => toggleSection('mvp')}
      >
        <div className="grid md:grid-cols-2 gap-4 pt-4">
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">Top Pick</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-white">{analysis.mvp.pick}</span>
              <span className="text-emerald-400 font-mono">{analysis.mvp.odds}</span>
            </div>
            <ConfidenceBadge confidence={analysis.mvp.confidence} />
            <p className="text-sm text-slate-400 mt-3">{analysis.mvp.reasoning}</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Dark Horse</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-bold text-white">{analysis.mvp.darkHorse.pick}</span>
              <span className="text-emerald-400 font-mono">{analysis.mvp.darkHorse.odds}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">{analysis.mvp.darkHorse.reasoning}</p>
          </div>
        </div>
      </Section>

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 text-center pt-4">
        AI predictions are for entertainment purposes only. Past performance does not guarantee future results.
      </p>
    </div>
  );
}

// Section Component - Dark theme
function Section({ 
  title, 
  icon, 
  expanded, 
  onToggle, 
  badge,
  children 
}: { 
  title: string; 
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">{badge}</span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

// Pick Card Component - Dark theme
function PickCard({ 
  title, 
  pick, 
  confidence, 
  analysis, 
  teamLogo 
}: { 
  title: string; 
  pick: string; 
  confidence: number; 
  analysis: string;
  teamLogo: string;
}) {
  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-center gap-3 mb-2">
        <Image src={teamLogo} alt="Team" width={24} height={24} unoptimized />
        <span className="text-xl font-bold text-white">{pick}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-500">Confidence:</span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              confidence >= 75 ? 'bg-emerald-500' : 
              confidence >= 60 ? 'bg-amber-500' : 'bg-slate-500'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-300">{confidence}%</span>
      </div>
      <p className="text-xs text-slate-400">{analysis}</p>
    </div>
  );
}
