'use client';

import { useState } from 'react';
import Image from 'next/image';

export function FanDuelBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#0D1E33] via-[#1493FF] to-[#0D1E33]">
      <a
        href="https://fndl.co/kt63uos"
        target="_blank"
        rel="noopener noreferrer"
        className="block py-2.5 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-4">
          {/* FanDuel Sportsbook Logo */}
          <Image
            src="/FanDuel Logos/Sportsbook/Primary/fanduel_sportsbook_logo_hrz_white.svg"
            alt="FanDuel Sportsbook"
            width={120}
            height={24}
            className="h-5 sm:h-6 w-auto flex-shrink-0"
          />
          
          {/* Divider */}
          <div className="w-px h-5 bg-white/30 hidden sm:block" />
          
          {/* Promo Text */}
          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <span className="text-sm sm:text-base font-bold">
              🎁 Get $150 in Bonus Bets
            </span>
          </div>
          
          {/* CTA Button */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-[#0D1E33] font-bold text-xs sm:text-sm hover:bg-white/90 transition-colors">
            Claim Now
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </a>
      
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
