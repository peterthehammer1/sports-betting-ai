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
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-200">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5" />
        
        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14">
          {/* Matchup */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 lg:gap-16">
            {/* Seahawks */}
            <div className="text-center">
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <Image
                  src={SEAHAWKS.logo}
                  alt={SEAHAWKS.name}
                  width={100}
                  height={100}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto"
                  unoptimized
                />
              </div>
              <h2 className="mt-3 text-lg sm:text-xl font-bold text-white">{SEAHAWKS.shortName}</h2>
              <p className="text-xs text-slate-400">{SEAHAWKS.record}</p>
            </div>

            {/* Center Info */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-slate-400 mb-3">vs</div>
              <div className="space-y-1">
                <div className="text-xs text-slate-300">{GAME_INFO.date}</div>
                <div className="text-xs text-slate-400">{GAME_INFO.time}</div>
              </div>
            </div>

            {/* Patriots */}
            <div className="text-center">
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <Image
                  src={PATRIOTS.logo}
                  alt={PATRIOTS.name}
                  width={100}
                  height={100}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto"
                  unoptimized
                />
              </div>
              <h2 className="mt-3 text-lg sm:text-xl font-bold text-white">{PATRIOTS.shortName}</h2>
              <p className="text-xs text-slate-400">{PATRIOTS.record}</p>
            </div>
          </div>

          {/* Quick Lines */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-0.5">Spread</div>
                <div className="text-sm font-semibold text-white">{LINES.spread.team} {LINES.spread.value}</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-0.5">Total</div>
                <div className="text-sm font-semibold text-white">{LINES.total}</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-0.5">Moneyline</div>
                <div className="text-sm font-semibold text-white">
                  <span className="text-slate-300">SEA</span> {LINES.seahawksML}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            {/* Divider */}
            <div className="flex-1" />
            
            {/* Other Sports */}
            <div className="flex items-center gap-1 pl-4 border-l border-slate-200">
              {[
                { sport: 'NBA', label: 'NBA' },
                { sport: 'NHL', label: 'NHL' },
                { sport: 'MLB', label: 'MLB' },
              ].map((s) => (
                <button
                  key={s.sport}
                  onClick={() => {
                    onSportChange(s.sport);
                    onNavigate('games');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'ai-analysis' && <SuperBowlAIAnalysis />}
        {activeTab === 'td-scorers' && <SuperBowlTDScorers />}
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'experts' && <ExpertPredictions />}
        {activeTab === 'models' && <PredictionModels />}
        {activeTab === 'articles' && <SuperBowlArticles />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={() => onNavigate('tools')}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Betting Calculator
            </button>
            <button
              onClick={() => onNavigate('tracker')}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Pick Tracker
            </button>
          </div>
          <p className="text-center text-xs text-slate-500">
            For entertainment purposes only. Please gamble responsibly.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Overview Section Component
function OverviewSection() {
  return (
    <div className="space-y-8">
      {/* Context Banner */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-sm text-slate-700 text-center">
          <span className="text-amber-700 font-semibold">Super Bowl XLIX Rematch</span>
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
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Key Numbers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Spread" value="SEA -4.5" sublabel="Consensus line" />
          <StatCard label="Total" value="46.5" sublabel="O/U points" />
          <StatCard label="NE Road Record" value="8-0" sublabel="Perfect away" />
          <StatCard label="JSN Rec Yards" value="1,793" sublabel="NFL Leading" />
        </div>
      </div>

      {/* MVP Odds */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">MVP Odds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Sam Darnold', team: 'SEA', odds: '+175' },
            { name: 'Drake Maye', team: 'NE', odds: '+280' },
            { name: 'Jaxon Smith-Njigba', team: 'SEA', odds: '+1400' },
            { name: 'Kenneth Walker III', team: 'SEA', odds: '+2000' },
          ].map((player) => (
            <div key={player.name} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-slate-800">{player.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{player.team}</span>
                <span className="text-sm font-semibold text-emerald-600">{player.odds}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FanDuel Betting Widget */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Bet on FanDuel</h3>
        <SuperBowlOddsWidget />
      </div>
    </div>
  );
}

// Team Card Component
function TeamCard({ team, side }: { team: typeof SEAHAWKS; side: 'home' | 'away' }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Image src={team.logo} alt={team.name} width={40} height={40} unoptimized />
        <div>
          <h3 className="font-semibold text-slate-800">{team.name}</h3>
          <p className="text-xs text-slate-500">{team.record}</p>
        </div>
      </div>
      <div className="space-y-2">
        {team.players.map((player) => (
          <div key={player.name} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
            <div>
              <span className="text-sm text-slate-700">{player.name}</span>
              <span className="text-xs text-slate-400 ml-1.5">{player.pos}</span>
            </div>
            <span className="text-xs text-slate-500">{player.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>
    </div>
  );
}
