'use client';

import { useState } from 'react';

interface OddsWidgetProps {
  sport?: 'icehockey_nhl' | 'basketball_nba';
}

export function OddsWidget({ sport = 'icehockey_nhl' }: OddsWidgetProps) {
  const [selectedSport, setSelectedSport] = useState(sport);
  
  const accessKey = 'wk_9d760740132f8b2d029be2522af76f66';
  const fanduelAffiliateUrl = encodeURIComponent('https://fndl.co/kt63uos');
  
  const widgetUrl = `https://widget.the-odds-api.com/v1/sports/${selectedSport}/events/?accessKey=${accessKey}&bookmakerKeys=fanduel&affiliateUrl_fanduel=${fanduelAffiliateUrl}&oddsFormat=american&markets=h2h%2Cspreads%2Ctotals&marketNames=h2h%3AMoneyline%2Cspreads%3ASpreads%2Ctotals%3AOver%2FUnder`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
        <div className="relative px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-[10px] font-bold text-white/80 bg-white/10 rounded-full uppercase tracking-wider">
                  Partner
                </span>
                <span className="px-2 py-1 text-[10px] font-bold text-green-200 bg-green-400/20 rounded-full uppercase tracking-wider">
                  Special Offer
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Live Betting Odds
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                Real-time odds from FanDuel Sportsbook
              </p>
            </div>
            
            {/* Sport Toggle */}
            <div className="flex p-1 bg-white/10 rounded-xl">
              <button
                onClick={() => setSelectedSport('icehockey_nhl')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedSport === 'icehockey_nhl'
                    ? 'bg-white text-indigo-600'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🏒 NHL
              </button>
              <button
                onClick={() => setSelectedSport('basketball_nba')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedSport === 'basketball_nba'
                    ? 'bg-white text-indigo-600'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🏀 NBA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="mx-5 sm:mx-6 mt-5 sm:mt-6">
        <a 
          href="https://fndl.co/kt63uos"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎁</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-lg">
                Get $150 in Bonus Bets!
              </p>
              <p className="text-sm text-blue-300">
                Sign up on FanDuel Sportsbook Canada with our link. Terms apply.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm group-hover:bg-blue-400 transition-colors">
              Claim Offer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Widget */}
      <div className="p-5 sm:p-6">
        <div className="rounded-xl overflow-hidden bg-white">
          <iframe
            title="Sports Odds Widget"
            src={widgetUrl}
            className="w-full h-[500px] sm:h-[600px]"
            style={{ border: 'none' }}
          />
        </div>
        
        {/* Disclaimer */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Odds provided by The Odds API. Click on odds to visit FanDuel Sportsbook. 
          Must be 19+ and located in Ontario. Gambling problem? Call 1-866-531-2600.
        </p>
      </div>
    </div>
  );
}
