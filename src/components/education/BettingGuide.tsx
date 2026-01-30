'use client';

import { useState } from 'react';

interface BettingGuideProps {
  onClose?: () => void;
}

const GUIDE_SECTIONS = [
  {
    id: 'basics',
    title: 'Betting Basics',
    icon: '📚',
    content: [
      {
        title: 'What are American Odds?',
        text: 'American odds show how much you need to bet to win $100 (negative odds) or how much you win on a $100 bet (positive odds). Example: -150 means bet $150 to win $100. +150 means bet $100 to win $150.',
      },
      {
        title: 'Moneyline Bets',
        text: 'The simplest bet type. Pick which team will win. No point spread involved. The favorite has negative odds, the underdog has positive odds.',
      },
      {
        title: 'Spread Betting',
        text: 'The favorite must win by more than the spread. The underdog can lose by less than the spread (or win outright). NHL typically uses a puck line of 1.5, while NBA spreads vary widely.',
      },
      {
        title: 'Totals (Over/Under)',
        text: 'Bet on whether the combined score of both teams will be over or under a set number. Not concerned with who wins, only the total points/goals scored.',
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Betting Strategy',
    icon: '🎯',
    content: [
      {
        title: 'Bankroll Management',
        text: 'Never bet more than 1-5% of your total bankroll on a single bet. This protects you from losing streaks and ensures longevity in betting.',
      },
      {
        title: 'Line Shopping',
        text: 'Different sportsbooks offer different odds. Always compare odds across multiple books to find the best value. Even small differences add up over time.',
      },
      {
        title: 'Value Betting',
        text: 'Look for situations where you believe the true probability of an outcome is higher than what the odds suggest. This is where long-term profit is made.',
      },
      {
        title: 'Avoid Parlays',
        text: 'While parlays offer exciting payouts, they are statistically harder to win. The sportsbook edge compounds with each leg. Stick to straight bets for better long-term results.',
      },
    ],
  },
  {
    id: 'props',
    title: 'Player Props',
    icon: '👤',
    content: [
      {
        title: 'What are Player Props?',
        text: 'Bets on individual player performance rather than game outcomes. Examples: points scored, rebounds, assists, goals, shots on goal.',
      },
      {
        title: 'First Goal Scorer (NHL)',
        text: 'Predict which player scores the first goal. High variance but can offer value on top-line players or those facing weak goaltending.',
      },
      {
        title: 'Anytime Goal Scorer (NHL)',
        text: 'Bet on a player to score at any point during the game. Less risky than first goal scorer but still offers good plus-money odds.',
      },
      {
        title: 'Points/Rebounds/Assists (NBA)',
        text: 'Over/under bets on specific stat categories. Research recent performance, matchups, and minutes to find edges.',
      },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis Tips',
    icon: '📊',
    content: [
      {
        title: 'Check Injury Reports',
        text: 'Key player injuries can dramatically shift odds and outcomes. Stay updated on injury news, especially for star players.',
      },
      {
        title: 'Consider Home/Away',
        text: 'Home teams generally have an advantage. In the NHL, home ice advantage is significant. The NBA has less home court impact but still matters.',
      },
      {
        title: 'Look at Recent Form',
        text: 'Teams on hot streaks or cold slumps often continue their trend. Check last 5-10 games for pattern recognition.',
      },
      {
        title: 'Head-to-Head History',
        text: 'Some teams match up well or poorly against specific opponents. Check historical results between the teams.',
      },
    ],
  },
  {
    id: 'responsible',
    title: 'Responsible Betting',
    icon: '⚠️',
    content: [
      {
        title: 'Set Limits',
        text: 'Before you start betting, set a budget you can afford to lose. Never chase losses by betting more than your predetermined limit.',
      },
      {
        title: 'Don\'t Bet Emotionally',
        text: 'Avoid betting on your favorite team if it clouds your judgment. Make decisions based on data, not feelings.',
      },
      {
        title: 'Take Breaks',
        text: 'If you\'re on a losing streak, step away. Clear your head before making more bets. Frustration leads to poor decisions.',
      },
      {
        title: 'It\'s Entertainment',
        text: 'Sports betting should be fun, not a way to make money. If it stops being enjoyable, it\'s time to stop.',
      },
    ],
  },
];

export function BettingGuide({ onClose }: BettingGuideProps) {
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);

  const currentSection = GUIDE_SECTIONS.find(s => s.id === activeSection) || GUIDE_SECTIONS[0];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  Learn
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-blue-200 bg-blue-400/20 rounded-full uppercase tracking-wider">
                  Free Guide
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Betting Guide
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                Learn the fundamentals of sports betting
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0">
          {GUIDE_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{section.icon}</span>
              <span className="hidden sm:inline">{section.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{currentSection.icon}</span>
            <h3 className="text-lg font-bold text-white">{currentSection.title}</h3>
          </div>
          
          <div className="space-y-4">
            {currentSection.content.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
            <p className="text-2xl font-bold text-blue-400">52.4%</p>
            <p className="text-xs text-gray-500 mt-1">Break-even at -110</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
            <p className="text-2xl font-bold text-green-400">1-5%</p>
            <p className="text-xs text-gray-500 mt-1">Recommended unit size</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
            <p className="text-2xl font-bold text-purple-400">3+</p>
            <p className="text-xs text-gray-500 mt-1">Books to compare</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-sm text-red-300">
            ⚠️ <strong>Important:</strong> Sports betting involves risk. Never bet more than you can afford to lose. If you or someone you know has a gambling problem, call 1-800-GAMBLER.
          </p>
        </div>
      </div>
    </div>
  );
}
