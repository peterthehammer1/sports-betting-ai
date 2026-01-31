/**
 * Super Bowl LX Landing Page Component
 * The main landing experience for petesbets.com featuring
 * expert predictions, articles, and analysis for Super Bowl LX
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExpertPredictions } from './ExpertPredictions';
import { SuperBowlArticles } from './SuperBowlArticles';
import { PredictionModels } from './PredictionModels';

interface SuperBowlLandingProps {
  onNavigate: (view: string) => void;
  onSportChange: (sport: string) => void;
}

// Super Bowl LX Key Stats - VERIFIED DATA
const GAME_INFO = {
  date: 'February 8, 2026',
  time: '6:30 PM ET',
  venue: "Levi's Stadium",
  location: 'Santa Clara, CA',
  halftime: 'Bad Bunny',
  broadcast: 'NBC, Peacock, Telemundo',
};

const SEAHAWKS_INFO = {
  name: 'Seattle Seahawks',
  record: 'NFC Champions',
  logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  color: '#69be28',
  keyPlayers: [
    { name: 'Sam Darnold', position: 'QB', stat: '4,048 yds, 25 TD' },
    { name: 'Jaxon Smith-Njigba', position: 'WR', stat: '1,793 yds (NFL #1)' },
    { name: 'Kenneth Walker III', position: 'RB', stat: '1,027 rush yds' },
    { name: 'Cooper Kupp', position: 'WR', stat: '593 yds' },
  ],
};

const PATRIOTS_INFO = {
  name: 'New England Patriots',
  record: 'AFC Champions (13-3)',
  logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  color: '#002244',
  keyPlayers: [
    { name: 'Drake Maye', position: 'QB', stat: '4,203 yds, 30 TD, 112.87 rtg' },
    { name: 'Stefon Diggs', position: 'WR', stat: '970 yds' },
    { name: 'Hunter Henry', position: 'TE', stat: '712 yds' },
    { name: 'Rhamondre Stevenson', position: 'RB', stat: '620 total yds' },
  ],
};

const BETTING_LINES = {
  spread: 'Seahawks -4.5',
  total: '46.5',
  seahawksML: '-230',
  patriotsML: '+190',
  mvpFavorite: 'Sam Darnold +175',
};

export function SuperBowlLanding({ onNavigate, onSportChange }: SuperBowlLandingProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'experts' | 'models' | 'articles'>('overview');

  return (
    <div className="min-h-screen bg-[#0c1017]">
      {/* Hero Section with Super Bowl Branding */}
      <section className="relative overflow-hidden">
        {/* Background with team colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#69be28]/20 via-[#0c1017] to-[#002244]/20" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#69be28]/10 to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#002244]/10 to-transparent" />
        </div>
        
        {/* NFL Shield watermark */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-5">
          <Image
            src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png"
            alt="NFL"
            width={200}
            height={200}
            unoptimized
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-12">
          {/* Super Bowl Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-600/20 via-amber-500/30 to-amber-600/20 rounded-full border border-amber-500/40 mb-4">
              <span className="text-amber-400 font-bold text-lg tracking-wider">🏈 SUPER BOWL LX</span>
            </div>
            <p className="text-slate-400 text-sm">
              {GAME_INFO.date} • {GAME_INFO.time} • {GAME_INFO.venue}, {GAME_INFO.location}
            </p>
            <p className="text-slate-500 text-xs mt-1">Halftime: {GAME_INFO.halftime} • {GAME_INFO.broadcast}</p>
          </div>

          {/* Matchup Display */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-16 mb-8">
            {/* Seahawks */}
            <div className="text-center flex-1 max-w-xs">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#69be28]/20 rounded-full blur-2xl" />
                <Image
                  src={SEAHAWKS_INFO.logo}
                  alt={SEAHAWKS_INFO.name}
                  width={120}
                  height={120}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40"
                  unoptimized
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-3 text-white">Seahawks</h2>
              <p className="text-sm text-[#69be28]">{SEAHAWKS_INFO.record}</p>
              <div className="mt-3 hidden sm:block">
                {SEAHAWKS_INFO.keyPlayers.slice(0, 2).map((player) => (
                  <div key={player.name} className="text-xs text-slate-400">
                    <span className="text-slate-300">{player.name}</span> - {player.stat}
                  </div>
                ))}
              </div>
            </div>

            {/* VS and Lines */}
            <div className="text-center px-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-500 mb-4">VS</div>
              <div className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Current Lines</div>
                <div className="space-y-1">
                  <div className="text-sm"><span className="text-slate-400">Spread:</span> <span className="text-white font-semibold">{BETTING_LINES.spread}</span></div>
                  <div className="text-sm"><span className="text-slate-400">Total:</span> <span className="text-white font-semibold">{BETTING_LINES.total}</span></div>
                  <div className="text-xs text-slate-500 mt-2">
                    SEA {BETTING_LINES.seahawksML} / NE {BETTING_LINES.patriotsML}
                  </div>
                </div>
              </div>
            </div>

            {/* Patriots */}
            <div className="text-center flex-1 max-w-xs">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#002244]/30 rounded-full blur-2xl" />
                <Image
                  src={PATRIOTS_INFO.logo}
                  alt={PATRIOTS_INFO.name}
                  width={120}
                  height={120}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40"
                  unoptimized
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-3 text-white">Patriots</h2>
              <p className="text-sm text-[#c8102e]">{PATRIOTS_INFO.record}</p>
              <div className="mt-3 hidden sm:block">
                {PATRIOTS_INFO.keyPlayers.slice(0, 2).map((player) => (
                  <div key={player.name} className="text-xs text-slate-400">
                    <span className="text-slate-300">{player.name}</span> - {player.stat}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Context Banner */}
          <div className="bg-gradient-to-r from-slate-800/50 via-slate-800/80 to-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
            <p className="text-center text-sm text-slate-300">
              <span className="text-amber-400 font-semibold">Super Bowl XLIX Rematch!</span> The Patriots won 28-24 on Malcolm Butler&apos;s iconic goal-line interception. 
              Seattle returns to the Super Bowl for the first time since 2014.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveSection('experts')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'experts'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              📊 Expert Picks
            </button>
            <button
              onClick={() => setActiveSection('models')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'models'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              🤖 Prediction Models
            </button>
            <button
              onClick={() => setActiveSection('articles')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'articles'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              📚 Betting Guides
            </button>
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'overview'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              🏈 Overview
            </button>
          </div>
        </div>
      </section>

      {/* Navigation to Other Sports */}
      <section className="bg-[#0a0e14] border-y border-slate-800 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Other Sports:</span>
            <div className="flex gap-2">
              {[
                { sport: 'NBA', emoji: '🏀', label: 'NBA' },
                { sport: 'NHL', emoji: '🏒', label: 'NHL' },
                { sport: 'MLB', emoji: '⚾', label: 'MLB' },
                { sport: 'EPL', emoji: '⚽', label: 'Soccer' },
              ].map((s) => (
                <button
                  key={s.sport}
                  onClick={() => {
                    onSportChange(s.sport);
                    onNavigate('games');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-1"
                >
                  <span>{s.emoji}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Section */}
      <section className="py-8">
        {activeSection === 'overview' && (
          <div className="max-w-6xl mx-auto px-4">
            {/* Key Stats Grid */}
            <h2 className="text-2xl font-bold text-center mb-8">Super Bowl LX at a Glance</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Seahawks Card */}
              <div className="bg-gradient-to-br from-[#69be28]/10 to-transparent rounded-xl border border-[#69be28]/30 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image src={SEAHAWKS_INFO.logo} alt="Seahawks" width={48} height={48} unoptimized />
                  <div>
                    <h3 className="text-lg font-bold text-white">Seattle Seahawks</h3>
                    <p className="text-sm text-[#69be28]">NFC Champions</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {SEAHAWKS_INFO.keyPlayers.map((player) => (
                    <div key={player.name} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <div>
                        <span className="text-white font-medium">{player.name}</span>
                        <span className="text-slate-500 text-xs ml-2">{player.position}</span>
                      </div>
                      <span className="text-slate-300 text-sm">{player.stat}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-[#69be28]/10 rounded-lg">
                  <p className="text-xs text-slate-400">
                    <span className="text-[#69be28] font-semibold">Path to Super Bowl:</span> Beat Rams 31-27 in NFC Championship. 
                    Darnold threw for 346 yards and 3 TDs.
                  </p>
                </div>
              </div>

              {/* Patriots Card */}
              <div className="bg-gradient-to-br from-[#002244]/20 to-transparent rounded-xl border border-[#002244]/40 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image src={PATRIOTS_INFO.logo} alt="Patriots" width={48} height={48} unoptimized />
                  <div>
                    <h3 className="text-lg font-bold text-white">New England Patriots</h3>
                    <p className="text-sm text-[#c8102e]">AFC Champions • 13-3 • 8-0 Road</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {PATRIOTS_INFO.keyPlayers.map((player) => (
                    <div key={player.name} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <div>
                        <span className="text-white font-medium">{player.name}</span>
                        <span className="text-slate-500 text-xs ml-2">{player.position}</span>
                      </div>
                      <span className="text-slate-300 text-sm">{player.stat}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-[#002244]/20 rounded-lg">
                  <p className="text-xs text-slate-400">
                    <span className="text-[#c8102e] font-semibold">Path to Super Bowl:</span> Beat Broncos 10-7 in AFC Championship (snow game). 
                    First Super Bowl since 2018. Coach Mike Vrabel.
                  </p>
                </div>
              </div>
            </div>

            {/* Betting Insights */}
            <div className="bg-[#151c28] rounded-xl border border-slate-800 p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 text-center">Key Betting Insights</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">-4.5</div>
                  <div className="text-sm text-slate-400">Seahawks Spread</div>
                  <div className="text-xs text-slate-500 mt-1">BetMGM has -5</div>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400">46.5</div>
                  <div className="text-sm text-slate-400">Total Points</div>
                  <div className="text-xs text-slate-500 mt-1">Sharp money split</div>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">8-0</div>
                  <div className="text-sm text-slate-400">Patriots Road Record</div>
                  <div className="text-xs text-slate-500 mt-1">Perfect on the road</div>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">1,793</div>
                  <div className="text-sm text-slate-400">JSN Receiving Yards</div>
                  <div className="text-xs text-slate-500 mt-1">NFL Leading, record pace</div>
                </div>
              </div>
            </div>

            {/* MVP Odds */}
            <div className="bg-[#151c28] rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-bold mb-4 text-center">Super Bowl MVP Odds</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Sam Darnold', team: 'SEA', odds: '+175', logo: SEAHAWKS_INFO.logo },
                  { name: 'Drake Maye', team: 'NE', odds: '+280', logo: PATRIOTS_INFO.logo },
                  { name: 'Jaxon Smith-Njigba', team: 'SEA', odds: '+1400', logo: SEAHAWKS_INFO.logo },
                  { name: 'Kenneth Walker III', team: 'SEA', odds: '+2000', logo: SEAHAWKS_INFO.logo },
                ].map((player) => (
                  <div key={player.name} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                    <Image src={player.logo} alt={player.team} width={32} height={32} unoptimized />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{player.name}</div>
                      <div className="text-xs text-slate-500">{player.team}</div>
                    </div>
                    <div className="text-emerald-400 font-bold">{player.odds}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'experts' && <ExpertPredictions />}
        {activeSection === 'models' && <PredictionModels />}
        {activeSection === 'articles' && <SuperBowlArticles />}
      </section>

      {/* Bottom Navigation */}
      <section className="bg-[#0a0e14] border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Explore More</h3>
            <p className="text-sm text-slate-500">Check out other sports and betting tools</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                onSportChange('NBA');
                onNavigate('games');
              }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors"
            >
              🏀 NBA Games
            </button>
            <button
              onClick={() => {
                onSportChange('NHL');
                onNavigate('games');
              }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors"
            >
              🏒 NHL Games
            </button>
            <button
              onClick={() => onNavigate('tools')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors"
            >
              🧮 Betting Tools
            </button>
            <button
              onClick={() => onNavigate('tracker')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors"
            >
              📈 Pick Tracker
            </button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="py-6 px-4 border-t border-slate-800">
        <p className="text-center text-xs text-slate-500 max-w-2xl mx-auto">
          Predictions and analysis are for informational purposes only. Betting involves risk. 
          Please gamble responsibly and only wager what you can afford to lose.
        </p>
      </footer>
    </div>
  );
}
