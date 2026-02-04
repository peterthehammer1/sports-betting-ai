'use client';

import { useState } from 'react';
import Image from 'next/image';

export function FanDuelBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#0a7fd4] via-[#1493FF] to-[#0a7fd4] safe-area-top overflow-hidden">
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
      
      <a
        href="https://fndl.co/kt63uos"
        target="_blank"
        rel="noopener noreferrer"
        className="block py-2.5 px-4 sm:px-6 relative"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 sm:gap-4 pr-8">
          <Image
            src="/FanDuel Logos/Sportsbook/Primary/fanduel_sportsbook_logo_hrz_white.svg"
            alt="FanDuel Sportsbook"
            width={100}
            height={20}
            className="h-4 sm:h-5 w-auto flex-shrink-0"
          />
          
          <span className="text-xs sm:text-sm text-white/90">
            Get <strong className="text-white">$150</strong> in Bonus Bets
          </span>
          
          <span className="px-4 py-1.5 rounded-full bg-white text-[#0D1E33] text-xs font-bold shadow-lg hover:shadow-xl transition-shadow">
            Claim Now →
          </span>
        </div>
      </a>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
