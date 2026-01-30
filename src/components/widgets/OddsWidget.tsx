'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OddsWidgetProps {
  sport?: 'icehockey_nhl' | 'basketball_nba';
}

// FanDuel brand colors
const FANDUEL_NAVY = '#0D1E33';
const FANDUEL_BLUE = '#1493FF';

export function OddsWidget({ sport = 'icehockey_nhl' }: OddsWidgetProps) {
  const [selectedSport, setSelectedSport] = useState(sport);
  
  const accessKey = 'wk_9d760740132f8b2d029be2522af76f66';
  const fanduelAffiliateUrl = encodeURIComponent('https://fndl.co/kt63uos');
  
  const widgetUrl = `https://widget.the-odds-api.com/v1/sports/${selectedSport}/events/?accessKey=${accessKey}&bookmakerKeys=fanduel&affiliateUrl_fanduel=${fanduelAffiliateUrl}&oddsFormat=american&markets=h2h%2Cspreads%2Ctotals&marketNames=h2h%3AMoneyline%2Cspreads%3ASpreads%2Ctotals%3AOver%2FUnder`;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: FANDUEL_NAVY }}>
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-white font-semibold">Live Betting Odds</h3>
          
          {/* Sport Toggle */}
          <div className="flex p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setSelectedSport('icehockey_nhl')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                selectedSport === 'icehockey_nhl'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={selectedSport === 'icehockey_nhl' ? { backgroundColor: FANDUEL_BLUE } : {}}
            >
              🏒 NHL
            </button>
            <button
              onClick={() => setSelectedSport('basketball_nba')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                selectedSport === 'basketball_nba'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={selectedSport === 'basketball_nba' ? { backgroundColor: FANDUEL_BLUE } : {}}
            >
              🏀 NBA
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banner with FanDuel Logo */}
      <div className="mx-4 sm:mx-5 mt-4 sm:mt-5">
        <a 
          href="https://fndl.co/kt63uos"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl border transition-all group hover:scale-[1.01]"
          style={{ 
            backgroundColor: 'rgba(20, 147, 255, 0.15)', 
            borderColor: 'rgba(20, 147, 255, 0.4)' 
          }}
        >
          <div className="flex items-center gap-4">
            {/* FanDuel Sportsbook Logo */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform p-2"
              style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(20, 147, 255, 0.3)' }}
            >
              <Image
                src="/FanDuel Logos/Sportsbook/Secondary/fanduel_sportsbook_logo_vert_blue.svg"
                alt="FanDuel Sportsbook"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-lg">
                Get $150 in Bonus Bets!
              </p>
              <p className="text-sm" style={{ color: 'rgba(20, 147, 255, 0.9)' }}>
                Sign up on FanDuel Sportsbook. Terms apply.
              </p>
            </div>
            <div 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold text-sm transition-all group-hover:brightness-110"
              style={{ backgroundColor: FANDUEL_BLUE }}
            >
              Claim Offer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Widget - Compact */}
      <div className="p-4 sm:p-5">
        <div className="rounded-lg overflow-hidden">
          <iframe
            title="FanDuel Odds"
            src={widgetUrl}
            className="w-full h-[320px] sm:h-[380px]"
            style={{ border: 'none', backgroundColor: '#fff' }}
          />
        </div>
        
        {/* Disclaimer */}
        <p className="mt-3 text-[10px] text-white/40 text-center leading-relaxed">
          Odds by The Odds API. Click odds to bet on FanDuel. 
          19+ | Ontario only | <a href="https://www.connexontario.ca/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">Gambling problem? Call 1-866-531-2600</a>
        </p>
      </div>
    </div>
  );
}
