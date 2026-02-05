/**
 * Super Bowl LX Landing Page Component
 * Clean, professional design for petesbets.com
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExpertPredictions } from './ExpertPredictions';
import { SuperBowlArticles } from './SuperBowlArticles';
import { PredictionModels } from './PredictionModels';
import { SuperBowlAIAnalysis } from './SuperBowlAIAnalysis';
import { SuperBowlTDScorers } from './SuperBowlTDScorers';
import { SuperBowlOddsWidget } from '@/components/widgets/OddsWidget';
import { PerformanceBanner } from '@/components/tracker/PerformanceBanner';

interface SuperBowlLandingProps {
  onNavigate: (view: string) => void;
  onSportChange: (sport: string) => void;
}

// Super Bowl LX Data
const GAME_INFO = {
  date: 'February 8, 2026',
  time: '6:30 PM ET',
  venue: "Levi's Stadium",
  location: 'Santa Clara, CA',
};

const SEAHAWKS = {
  name: 'Seattle Seahawks',
  shortName: 'Seahawks',
  abbrev: 'SEA',
  record: 'NFC Champions',
  logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  players: [
    { name: 'Sam Darnold', pos: 'QB', stat: '4,048 yds • 25 TD' },
    { name: 'Jaxon Smith-Njigba', pos: 'WR', stat: '1,793 yds • NFL #1' },
    { name: 'Kenneth Walker III', pos: 'RB', stat: '1,027 rush yds' },
  ],
};

const PATRIOTS = {
  name: 'New England Patriots',
  shortName: 'Patriots',
  abbrev: 'NE',
  record: 'AFC Champions • 13-3',
  logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  players: [
    { name: 'Drake Maye', pos: 'QB', stat: '4,203 yds • 30 TD' },
    { name: 'Stefon Diggs', pos: 'WR', stat: '970 yds • 8 TD' },
    { name: 'Hunter Henry', pos: 'TE', stat: '712 yds • 6 TD' },
  ],
};

const LINES = {
  spread: { team: 'SEA', value: -4.5 },
  total: 46.5,
  seahawksML: -230,
  patriotsML: +190,
};

type Tab = 'ai-analysis' | 'td-scorers' | 'overview' | 'experts' | 'models' | 'articles';

export function SuperBowlLanding({ onNavigate, onSportChange }: SuperBowlLandingProps) {
  const [activeTab, setActiveTab] = useState<Tab>('ai-analysis');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ai-analysis', label: 'AI Analysis' },
    { id: 'td-scorers', label: 'TD Scorers' },
    { id: 'overview', label: 'Matchup' },
    { id: 'experts', label: 'Expert Picks' },
    { id: 'models', label: 'Models' },
    { id: 'articles', label: 'Guides' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Compact Hero Section - Smaller matchup display */}
      <section className="relative bg-[rgba(15,20,30,0.9)] border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5" />
        
        <div className="relative max-w-5xl mx-auto px-4 py-4 sm:py-5">
          {/* Compact Matchup Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Seahawks */}
            <div className="flex items-center gap-3">
              <Image
                src={SEAHAWKS.logo}
                alt={SEAHAWKS.name}
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
                unoptimized
              />
              <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-white">{SEAHAWKS.shortName}</h2>
                <p className="text-[10px] text-slate-500">{SEAHAWKS.record}</p>
              </div>
            </div>

            {/* Center - Lines */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase">Spread</div>
                <div className="text-xs sm:text-sm font-bold text-white">{LINES.spread.team} {LINES.spread.value}</div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase">Total</div>
                <div className="text-xs sm:text-sm font-bold text-white">{LINES.total}</div>
              </div>
              <div className="w-px h-6 bg-white/10 hidden sm:block" />
              <div className="text-center hidden sm:block">
                <div className="text-[10px] text-slate-500 uppercase">ML</div>
                <div className="text-xs sm:text-sm font-bold text-emerald-400">{LINES.seahawksML}</div>
              </div>
            </div>

            {/* Patriots */}
            <div className="flex items-center gap-3 flex-row-reverse sm:flex-row">
              <div className="hidden sm:block text-right">
                <h2 className="text-sm font-bold text-white">{PATRIOTS.shortName}</h2>
                <p className="text-[10px] text-slate-500">{PATRIOTS.record}</p>
              </div>
              <Image
                src={PATRIOTS.logo}
                alt={PATRIOTS.name}
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
                unoptimized
              />
            </div>
          </div>

          {/* Game Info - Single line */}
          <div className="mt-2 text-center text-[10px] text-slate-500">
            Super Bowl LX • {GAME_INFO.date} • {GAME_INFO.time} • {GAME_INFO.venue}
          </div>
        </div>
      </section>

      {/* Performance Banner - Highlight win rate */}
      <PerformanceBanner onNavigateToTracker={() => onNavigate('tracker')} />

      {/* Navigation Tabs - Modern dark style */}
      <nav className="sticky top-[60px] z-30 bg-[rgba(10,14,20,0.95)] backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            {/* Divider */}
            <div className="flex-1" />
            
            {/* Other Sports */}
            <div className="flex items-center gap-1 pl-4 border-l border-white/10">
              {[
                { sport: 'NBA', label: '🏀', full: 'NBA' },
                { sport: 'NHL', label: '🏒', full: 'NHL' },
                { sport: 'MLB', label: '⚾', full: 'MLB' },
              ].map((s) => (
                <button
                  key={s.sport}
                  onClick={() => {
                    onSportChange(s.sport);
                    onNavigate('games');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title={s.full}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'ai-analysis' && <SuperBowlAIAnalysis />}
        {activeTab === 'td-scorers' && <SuperBowlTDScorers />}
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'experts' && <ExpertPredictions />}
        {activeTab === 'models' && <PredictionModels />}
        {activeTab === 'articles' && <SuperBowlArticles onNavigateToAnalysis={() => setActiveTab('ai-analysis')} />}
      </main>

      {/* Footer - Dark theme */}
      <footer className="border-t border-white/5 py-8 bg-[rgba(10,14,20,0.5)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={() => onNavigate('tools')}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              🧮 Betting Calculator
            </button>
            <button
              onClick={() => onNavigate('tracker')}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              📊 Pick Tracker
            </button>
          </div>
          <p className="text-center text-xs text-slate-600">
            For entertainment purposes only. Please gamble responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Overview Section Component - Dark theme
function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
        <p className="text-sm text-slate-300 text-center">
          <span className="text-amber-400 font-semibold">Super Bowl XLIX Rematch</span>
          {' '}— The Patriots won 28-24 on Malcolm Butler&apos;s goal-line interception. Seattle returns to the Super Bowl for the first time since 2014.
        </p>
      </div>

      {/* Team Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <TeamCard team={SEAHAWKS} side="home" />
        <TeamCard team={PATRIOTS} side="away" />
      </div>

      {/* Key Stats */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
          Key Numbers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Spread" value="SEA -4.5" sublabel="Consensus line" />
          <StatCard label="Total" value="46.5" sublabel="O/U points" />
          <StatCard label="NE Road Record" value="8-0" sublabel="Perfect away" />
          <StatCard label="JSN Rec Yards" value="1,793" sublabel="NFL Leading" />
        </div>
      </div>

      {/* MVP Odds */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
          MVP Odds
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Sam Darnold', team: 'SEA', odds: '+175' },
            { name: 'Drake Maye', team: 'NE', odds: '+280' },
            { name: 'Jaxon Smith-Njigba', team: 'SEA', odds: '+1400' },
            { name: 'Kenneth Walker III', team: 'SEA', odds: '+2000' },
          ].map((player) => (
            <div key={player.name} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="text-sm font-medium text-white">{player.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{player.team}</span>
                <span className="text-sm font-bold text-emerald-400">{player.odds}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FanDuel Betting Widget */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
          Bet on FanDuel
        </h3>
        <SuperBowlOddsWidget />
      </div>
    </div>
  );
}

// Team Card Component - Dark theme
function TeamCard({ team, side }: { team: typeof SEAHAWKS; side: 'home' | 'away' }) {
  return (
    <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <Image src={team.logo} alt={team.name} width={40} height={40} unoptimized />
        <div>
          <h3 className="font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-slate-500">{team.record}</p>
        </div>
      </div>
      <div className="space-y-2">
        {team.players.map((player) => (
          <div key={player.name} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
            <div>
              <span className="text-sm text-slate-300">{player.name}</span>
              <span className="text-xs text-slate-500 ml-1.5">{player.pos}</span>
            </div>
            <span className="text-xs text-slate-400">{player.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card Component - Dark theme
function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center hover:border-white/20 transition-all">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sublabel}</div>
    </div>
  );
}
