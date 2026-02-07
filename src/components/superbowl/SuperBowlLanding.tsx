/**
 * Super Bowl LX Landing Page Component
 * Clean, professional design - fits within main page layout
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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
      {/* Super Bowl Matchup Card */}
      <div className="bg-[#161b22] rounded-xl border border-slate-800 overflow-hidden mb-6">
        <div className="p-6">
          {/* Matchup Header */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Seahawks */}
            <div className="flex items-center gap-3">
              <Image
                src={SEAHAWKS.logo}
                alt={SEAHAWKS.name}
                width={56}
                height={56}
                className="w-12 h-12 sm:w-14 sm:h-14"
                unoptimized
              />
              <div className="text-left hidden sm:block">
                <h2 className="text-base font-bold text-white">{SEAHAWKS.shortName}</h2>
                <p className="text-xs text-slate-500">{SEAHAWKS.record}</p>
              </div>
            </div>

            {/* Center - Lines */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 bg-slate-800/50 rounded-lg">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Spread</div>
                  <div className="text-sm font-bold text-white">{LINES.spread.team} {LINES.spread.value}</div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Total</div>
                  <div className="text-sm font-bold text-white">{LINES.total}</div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase">ML</div>
                  <div className="text-sm font-bold text-emerald-400">{LINES.seahawksML}</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {GAME_INFO.date} • {GAME_INFO.time} • {GAME_INFO.venue}
              </p>
            </div>

            {/* Patriots */}
            <div className="flex items-center gap-3 flex-row-reverse">
              <Image
                src={PATRIOTS.logo}
                alt={PATRIOTS.name}
                width={56}
                height={56}
                className="w-12 h-12 sm:w-14 sm:h-14"
                unoptimized
              />
              <div className="text-right hidden sm:block">
                <h2 className="text-base font-bold text-white">{PATRIOTS.shortName}</h2>
                <p className="text-xs text-slate-500">{PATRIOTS.record}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'ai-analysis' && <SuperBowlAIAnalysis />}
        {activeTab === 'td-scorers' && <SuperBowlTDScorers />}
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'experts' && <ExpertPredictions />}
        {activeTab === 'models' && <PredictionModels />}
        {activeTab === 'articles' && <SuperBowlArticles onNavigateToAnalysis={() => setActiveTab('ai-analysis')} />}
      </div>

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('tools')}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all"
          >
            🧮 Betting Calculator
          </button>
          <button
            onClick={() => onNavigate('tracker')}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all"
          >
            📊 Pick Tracker
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">
          For entertainment purposes only. Please gamble responsibly.
        </p>
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <p className="text-sm text-slate-300 text-center">
          <span className="text-amber-400 font-semibold">Super Bowl XLIX Rematch</span>
          {' '}— The Patriots won 28-24 on Malcolm Butler&apos;s goal-line interception. Seattle returns to the Super Bowl for the first time since 2014.
        </p>
      </div>

      {/* Team Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <TeamCard team={SEAHAWKS} />
        <TeamCard team={PATRIOTS} />
      </div>

      {/* Key Stats */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Key Numbers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Spread" value="SEA -4.5" sublabel="Consensus line" />
          <StatCard label="Total" value="46.5" sublabel="O/U points" />
          <StatCard label="NE Road Record" value="8-0" sublabel="Perfect away" />
          <StatCard label="JSN Rec Yards" value="1,793" sublabel="NFL Leading" />
        </div>
      </div>

      {/* MVP Odds */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">MVP Odds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Sam Darnold', team: 'SEA', odds: '+175' },
            { name: 'Drake Maye', team: 'NE', odds: '+280' },
            { name: 'Jaxon Smith-Njigba', team: 'SEA', odds: '+1400' },
            { name: 'Kenneth Walker III', team: 'SEA', odds: '+2000' },
          ].map((player) => (
            <div key={player.name} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
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
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Bet on FanDuel</h3>
        <SuperBowlOddsWidget />
      </div>
    </div>
  );
}

// Team Card Component
function TeamCard({ team }: { team: typeof SEAHAWKS }) {
  return (
    <div className="p-5 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <Image src={team.logo} alt={team.name} width={40} height={40} unoptimized />
        <div>
          <h3 className="font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-slate-500">{team.record}</p>
        </div>
      </div>
      <div className="space-y-2">
        {team.players.map((player) => (
          <div key={player.name} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
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

// Stat Card Component
function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sublabel}</div>
    </div>
  );
}
