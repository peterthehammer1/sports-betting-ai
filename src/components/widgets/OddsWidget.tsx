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
    <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ backgroundColor: FANDUEL_NAVY }}>
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <h3 className="text-white font-semibold text-sm sm:text-base">Live Odds</h3>
          
          {/* Sport Toggle */}
          <div className="flex p-0.5 sm:p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setSelectedSport('icehockey_nhl')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all touch-manipulation ${
                selectedSport === 'icehockey_nhl'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={selectedSport === 'icehockey_nhl' ? { backgroundColor: FANDUEL_BLUE } : {}}
            >
              🏒 <span className="hidden xs:inline">NHL</span>
            </button>
            <button
              onClick={() => setSelectedSport('basketball_nba')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all touch-manipulation ${
                selectedSport === 'basketball_nba'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={selectedSport === 'basketball_nba' ? { backgroundColor: FANDUEL_BLUE } : {}}
            >
              🏀 <span className="hidden xs:inline">NBA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banner with FanDuel Logo */}
      <div className="mx-3 sm:mx-5 mt-3 sm:mt-5">
        <a 
          href="https://fndl.co/kt63uos"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 sm:p-4 rounded-xl border transition-all group active:scale-[0.99] sm:hover:scale-[1.01]"
          style={{ 
            backgroundColor: 'rgba(20, 147, 255, 0.15)', 
            borderColor: 'rgba(20, 147, 255, 0.4)' 
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {/* FanDuel Sportsbook Logo */}
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform p-1.5 sm:p-2"
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
              <p className="font-bold text-white text-base sm:text-lg">
                Get $150 in Bonus Bets!
              </p>
              <p className="text-xs sm:text-sm" style={{ color: 'rgba(20, 147, 255, 0.9)' }}>
                Sign up on FanDuel. <span className="hidden xs:inline">Terms apply.</span>
              </p>
            </div>
            {/* Always show claim button */}
            <div 
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-white font-bold text-xs sm:text-sm transition-all group-hover:brightness-110 flex-shrink-0"
              style={{ backgroundColor: FANDUEL_BLUE }}
            >
              <span className="hidden xs:inline">Claim</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      {/* Widget */}
      <div className="p-3 sm:p-5">
        <div className="rounded-lg overflow-hidden">
          <iframe
            title="FanDuel Odds"
            src={widgetUrl}
            className="w-full h-[280px] sm:h-[380px]"
            style={{ border: 'none', backgroundColor: '#fff' }}
          />
        </div>
        
        {/* Disclaimer */}
        <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] text-white/40 text-center leading-relaxed">
          Odds by The Odds API. Click to bet on FanDuel. 
          19+ | Ontario | <a href="https://www.connexontario.ca/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">Gambling help: 1-866-531-2600</a>
        </p>
      </div>
    </div>
  );
}
