'use client';

import { useState } from 'react';
import Image from 'next/image';

export function FanDuelBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-[#1493FF] safe-area-top">
      <a
        href="https://fndl.co/kt63uos"
        target="_blank"
        rel="noopener noreferrer"
        className="block py-2 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 sm:gap-4 pr-8">
          <Image
            src="/FanDuel Logos/Sportsbook/Primary/fanduel_sportsbook_logo_hrz_white.svg"
            alt="FanDuel Sportsbook"
            width={100}
            height={20}
            className="h-4 sm:h-5 w-auto flex-shrink-0"
          />
          
          <span className="text-xs sm:text-sm text-white">
            Get <strong>$150</strong> in Bonus Bets
          </span>
          
          <span className="px-3 py-1 rounded bg-white text-[#0D1E33] text-xs font-semibold">
            Claim
          </span>
        </div>
      </a>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
