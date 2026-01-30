'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OddsWidgetProps {
  sport?: 'icehockey_nhl' | 'basketball_nba';
}

export function OddsWidget({ sport = 'icehockey_nhl' }: OddsWidgetProps) {
  const [selectedSport, setSelectedSport] = useState(sport);
  
  const accessKey = 'wk_9d760740132f8b2d029be2522af76f66';
  const fanduelAffiliateUrl = encodeURIComponent('https://fndl.co/kt63uos');
  
  const widgetUrl = `https://widget.the-odds-api.com/v1/sports/${selectedSport}/events/?accessKey=${accessKey}&bookmakerKeys=fanduel&affiliateUrl_fanduel=${fanduelAffiliateUrl}&oddsFormat=american&markets=h2h%2Cspreads%2Ctotals&marketNames=h2h%3AMoneyline%2Cspreads%3ASpreads%2Ctotals%3AOver%2FUnder`;

  return (
    <div className="max-w-md">
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
        {/* Header with FanDuel branding */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white p-0.5 flex-shrink-0">
              <Image
                src="/FanDuel Logos/Sportsbook/Secondary/fanduel_sportsbook_logo_vert_blue.svg"
                alt="FanDuel"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-white font-medium text-sm">FanDuel Odds</h3>
          </div>
          
          <div className="flex bg-slate-900 rounded p-0.5">
            <button
              onClick={() => setSelectedSport('icehockey_nhl')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedSport === 'icehockey_nhl'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NHL
            </button>
            <button
              onClick={() => setSelectedSport('basketball_nba')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedSport === 'basketball_nba'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NBA
            </button>
          </div>
        </div>

        {/* Promo Banner - Compact */}
        <a 
          href="https://fndl.co/kt63uos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#1493FF]/10 border-b border-[#1493FF]/20 hover:bg-[#1493FF]/15 transition-colors"
        >
          <div>
            <p className="text-white text-sm font-medium">
              Get $150 in Bonus Bets
            </p>
            <p className="text-[#1493FF] text-xs">
              New users only. Terms apply.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded bg-[#1493FF] text-white text-xs font-medium flex-shrink-0">
            Claim
          </span>
        </a>

        {/* Widget - More compact */}
        <div className="p-3">
          <div className="rounded overflow-hidden">
            <iframe
              title="FanDuel Odds"
              src={widgetUrl}
              className="w-full h-[280px]"
              style={{ border: 'none', backgroundColor: '#fff' }}
            />
          </div>
          
          <p className="mt-2 text-[9px] text-slate-500 text-center">
            19+ | Ontario | <a href="https://www.connexontario.ca/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">Gambling help: 1-866-531-2600</a>
          </p>
        </div>
      </div>
    </div>
  );
}
