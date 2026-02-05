'use client';

import { useState } from 'react';
import Image from 'next/image';

type SportKey = 'americanfootball_nfl' | 'icehockey_nhl' | 'basketball_nba';

interface OddsWidgetProps {
  sport?: SportKey;
  showSportToggle?: boolean;
}

const REFERRAL_URL = 'https://fndl.co/kt63uos';

export function OddsWidget({ sport = 'americanfootball_nfl', showSportToggle = true }: OddsWidgetProps) {
  const [selectedSport, setSelectedSport] = useState<SportKey>(sport);
  
  const accessKey = 'wk_9d760740132f8b2d029be2522af76f66';
  const fanduelAffiliateUrl = encodeURIComponent(REFERRAL_URL);
  
  const widgetUrl = `https://widget.the-odds-api.com/v1/sports/${selectedSport}/events/?accessKey=${accessKey}&bookmakerKeys=fanduel&affiliateUrl_fanduel=${fanduelAffiliateUrl}&oddsFormat=american&markets=h2h%2Cspreads%2Ctotals&marketNames=h2h%3AMoneyline%2Cspreads%3ASpreads%2Ctotals%3AOver%2FUnder`;

  const sportLabels: Record<SportKey, string> = {
    americanfootball_nfl: '🏈 Super Bowl',
    icehockey_nhl: '🏒 NHL',
    basketball_nba: '🏀 NBA',
  };

  return (
    <div className="max-w-md">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header with FanDuel branding - Large prominent logo */}
        <a 
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3 bg-[#1493FF] hover:bg-[#0D7FE8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/FanDuel Logos/Sportsbook/Secondary/fanduel_sportsbook_logo_vert_white.svg"
              alt="FanDuel Sportsbook"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
            <span className="text-white font-bold text-base">FanDuel Sportsbook</span>
          </div>
          
          {showSportToggle && (
            <div className="flex bg-white/20 rounded-lg p-0.5">
              {(Object.keys(sportLabels) as SportKey[]).map((key) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSport(key);
                  }}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedSport === key
                      ? 'bg-white text-[#1493FF] shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {key === 'americanfootball_nfl' ? 'NFL' : key === 'icehockey_nhl' ? 'NHL' : 'NBA'}
                </button>
              ))}
            </div>
          )}
        </a>

        {/* Promo Banner */}
        <a 
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#1493FF] to-[#0D7FE8] hover:from-[#0D7FE8] hover:to-[#0A6BC4] transition-all"
        >
          <div>
            <p className="text-white text-sm font-semibold">
              🎁 Get $150 in Bonus Bets
            </p>
            <p className="text-white/70 text-xs">
              New users only. Bet $5, Get $150!
            </p>
          </div>
          <span className="px-4 py-2 rounded-lg bg-white text-[#1493FF] text-sm font-bold flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
            Claim Now
          </span>
        </a>

        {/* Current Sport Label */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <p className="text-xs text-slate-600 font-medium">
            {sportLabels[selectedSport]} Odds
          </p>
        </div>

        {/* Widget */}
        <div className="p-3 bg-white">
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <iframe
              title="FanDuel Odds"
              src={widgetUrl}
              className="w-full h-[300px]"
              style={{ border: 'none', backgroundColor: '#fff' }}
            />
          </div>
          
          <p className="mt-3 text-[10px] text-slate-500 text-center">
            21+ | Where legal | <a href={REFERRAL_URL} target="_blank" rel="noopener noreferrer" className="text-[#1493FF] hover:underline">FanDuel.com</a> | Gambling Problem? <a href="https://www.ncpgambling.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">1-800-522-4700</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Dedicated Super Bowl widget for the landing page
export function SuperBowlOddsWidget() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
        {/* Header - Large prominent FanDuel branding */}
        <a 
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-5 py-4 bg-[#1493FF] hover:bg-[#0D7FE8] transition-colors"
        >
          <div className="flex items-center gap-4">
            <Image
              src="/FanDuel Logos/Sportsbook/Secondary/fanduel_sportsbook_logo_vert_white.svg"
              alt="FanDuel Sportsbook"
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
            <div>
              <h3 className="text-white font-bold text-base">Super Bowl LX Odds</h3>
              <p className="text-white/70 text-xs">Powered by FanDuel Sportsbook</p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-lg bg-white text-[#1493FF] text-sm font-bold shadow-sm">
            Bet Now
          </span>
        </a>

        {/* Promo */}
        <a 
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all"
        >
          <div>
            <p className="text-white text-base font-bold">
              🏈 Super Bowl Special: Bet $5, Get $150!
            </p>
            <p className="text-white/80 text-sm">
              New customers only. Limited time offer.
            </p>
          </div>
          <span className="px-5 py-2.5 rounded-lg bg-white text-emerald-600 text-sm font-bold flex-shrink-0 shadow-md">
            Claim Bonus
          </span>
        </a>

        {/* Odds Display - Custom Super Bowl layout */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Seahawks */}
            <a 
              href={REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#1493FF] hover:shadow-md transition-all text-center group"
            >
              <Image
                src="https://a.espncdn.com/i/teamlogos/nfl/500/sea.png"
                alt="Seahawks"
                width={48}
                height={48}
                className="mx-auto mb-2"
                unoptimized
              />
              <p className="font-bold text-slate-800">Seahawks</p>
              <p className="text-2xl font-bold text-[#1493FF] group-hover:scale-105 transition-transform">-230</p>
              <p className="text-xs text-slate-500">Spread: -4.5</p>
            </a>
            
            {/* Patriots */}
            <a 
              href={REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#1493FF] hover:shadow-md transition-all text-center group"
            >
              <Image
                src="https://a.espncdn.com/i/teamlogos/nfl/500/ne.png"
                alt="Patriots"
                width={48}
                height={48}
                className="mx-auto mb-2"
                unoptimized
              />
              <p className="font-bold text-slate-800">Patriots</p>
              <p className="text-2xl font-bold text-[#1493FF] group-hover:scale-105 transition-transform">+190</p>
              <p className="text-xs text-slate-500">Spread: +4.5</p>
            </a>
          </div>
          
          {/* Total */}
          <a 
            href={REFERRAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-slate-800 rounded-xl text-center hover:bg-slate-700 transition-colors"
          >
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Points</p>
            <p className="text-white text-xl font-bold">Over/Under 46.5</p>
          </a>
          
          <p className="mt-4 text-[10px] text-slate-500 text-center">
            21+ | Where legal | <a href={REFERRAL_URL} target="_blank" rel="noopener noreferrer" className="text-[#1493FF] hover:underline">FanDuel.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
